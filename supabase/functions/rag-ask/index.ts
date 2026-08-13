import { admin, body, cors, fail, ok, user } from '../_shared/http.ts';
import { contentHash, generateAnswer, generateEmbedding } from '../_shared/gemini.ts';

const CACHE_TTL_HOURS = 24;
const ANONYMOUS_HOURLY_LIMIT = 8;
const AUTHENTICATED_HOURLY_LIMIT = 20;

function requestIdentity(req: Request, userId?: string) {
  if (userId) return `user:${userId}`;
  const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  return `ip:${ip}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const input = await body(req);
  if (!input || typeof input.question !== 'string' || !input.question.trim() || input.question.length > 1000) {
    return fail('validation_error', 'question is required and must be under 1000 characters');
  }

  let actorId: string | undefined;
  if (input.learner_id) {
    const actor = await user(req);
    if (actor && actor.id === input.learner_id) {
      actorId = actor.id;
    }
  }

  const normalizedQuestion = input.question.trim().replace(/\s+/g, ' ').toLowerCase();
  const questionHash = await contentHash(normalizedQuestion);
  const db = admin();
  try {
    const { data: cached } = await db.from('rag_cache').select('answer,sources').eq('question_hash', questionHash).gt('expires_at', new Date().toISOString()).maybeSingle();
    if (cached) return ok({ answer: cached.answer, sources: cached.sources, cached: true });
  } catch (_e) {
    // Ignore cache lookup failures
  }

  const scopeHash = await contentHash(requestIdentity(req, actorId));
  const limit = actorId ? AUTHENTICATED_HOURLY_LIMIT : ANONYMOUS_HOURLY_LIMIT;
  try {
    const { data: allowed } = await db.rpc('consume_rag_quota', { p_scope_hash: scopeHash, p_maximum_requests: limit });
    if (allowed === false) return fail('rate_limited', 'RAG request limit reached. Try again later or use a previously asked question.', 429);
  } catch (_e) {
    // Ignore quota table errors if uninitialized
  }

  try {
    interface KBHit { id: string; title: string; category: string; content: string; source_url: string | null; similarity?: number }
    let hits: KBHit[] = [];

    // 1. Vector similarity search via Gemini embeddings
    try {
      const embedding = await generateEmbedding(input.question);
      const { data } = await db.rpc('match_knowledge_base', { query_embedding: `[${embedding.join(',')}]`, match_count: 5 });
      if (data && Array.isArray(data)) {
        hits = data.filter((row: { similarity: number }) => row.similarity >= 0.45);
      }
    } catch (e) {
      console.warn('Vector embedding search failed, falling back to text keyword matching:', e);
    }

    // 2. Keyword fallback if vector search returns no hits
    if (!hits.length) {
      const words = normalizedQuestion.split(/\s+/).map((w: string) => w.replace(/[^a-z0-9]/g, '')).filter((w: string) => w.length > 2);
      if (words.length > 0) {
        const filters = words.map((w: string) => `title.ilike.%${w}%,content.ilike.%${w}%,category.ilike.%${w}%`).join(',');
        const { data: textHits } = await db.from('knowledge_base').select('id, title, category, content, source_url').eq('status', 'verified').or(filters).limit(5);
        if (textHits && textHits.length > 0) {
          hits = textHits as KBHit[];
        }
      }
    }

    // 3. Fallback to full verified list if prompt is very broad (e.g. "scholarship", "course", "opportunity")
    if (!hits.length && (normalizedQuestion.includes('scholarship') || normalizedQuestion.includes('course') || normalizedQuestion.includes('opportunity'))) {
      const categoryFilter = normalizedQuestion.includes('scholarship') ? 'scholarship' : normalizedQuestion.includes('course') ? 'course' : null;
      let query = db.from('knowledge_base').select('id, title, category, content, source_url').eq('status', 'verified');
      if (categoryFilter) query = query.eq('category', categoryFilter);
      const { data: catHits } = await query.limit(5);
      if (catHits && catHits.length > 0) {
        hits = catHits as KBHit[];
      }
    }

    if (!hits.length) {
      return ok({
        answer: `### 🔍 Student Situation & Problem Analysis\nThe student is asking: "${input.question}". The query indicates a request for specific educational, financial, or opportunity guidance.\n\n### 📚 Knowledge Base Answer & Solutions\nNo matching opportunities or information were found in our verified knowledge base for this query.\n\n### 🛡️ Knowledge Base Verification Check\nUnverified or missing information. Our verified knowledge base currently lacks data on this specific topic. Please adjust your search query or check back as new verified entries are published.`,
        sources: [],
        cached: false,
      });
    }

    // 4. Answer generation with LLM, falling back to direct synthesis if LLM is unavailable
    let answerText = '';
    try {
      answerText = await generateAnswer(
        `You are the AI Opportunity RAG Assistant for Sri Lankan learners. Your primary role is to help students by analyzing their specific situation or problem, and then providing answers strictly grounded in our verified Knowledge Base.

STRICT RULES:
1. Grounding: Answer ONLY using the provided Context. Do NOT invent, assume, or hallucinate scholarships, deadlines, fees, or eligibility criteria.
2. Structure your answer using the following exact Markdown headers:
   - ### 🔍 Student Situation & Problem Analysis
     Provide a clear analysis of the student's question, identifying their primary problem, background, constraints (such as budget, education level, or career goal), and what assistance they need.
   - ### 📚 Knowledge Base Answer & Solutions
     Provide direct, actionable solutions and options derived strictly from the verified context below.
   - ### 🛡️ Knowledge Base Verification Check
     Confirm that all provided details are sourced strictly from verified knowledge base entries. If the context is missing specific details (e.g. deadlines, exact fees), state that clearly as a knowledge base gap.

Context:
${hits.map((row) => `[Category: ${row.category}] Title: ${row.title}\nContent: ${row.content}`).join('\n\n')}

Student Question: ${input.question}`
      );
    } catch (llmErr) {
      answerText = `### 🔍 Student Situation & Problem Analysis\nThe student is seeking guidance regarding "${input.question}". Based on our database records, we identified ${hits.length} relevant verified entry/entries matching this request.\n\n### 📚 Knowledge Base Answer & Solutions\n${hits.map((h) => `**[${h.category.toUpperCase()}] ${h.title}**\n${h.content}`).join('\n\n')}\n\n### 🛡️ Knowledge Base Verification Check\nVerified directly from database records. All details above are retrieved from our verified Knowledge Base.`;
    }

    const result = {
      answer: answerText,
      sources: hits.map((row) => ({ id: row.id, title: row.title, category: row.category, source_url: row.source_url })),
    };

    try {
      await db.from('rag_cache').upsert({ question_hash: questionHash, answer: result.answer, sources: result.sources, expires_at: new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString() });
    } catch (_cacheErr) {
      // Ignore cache upsert errors
    }

    return ok({ ...result, cached: false });
  } catch (error) {
    const errorDetails = error instanceof Error ? error.message : 'Knowledge base query notice';
    return ok({
      answer: `### 🔍 Student Situation & Problem Analysis\nThe student submitted the question: "${input.question}".\n\n### 📚 Knowledge Base Answer & Solutions\n${errorDetails}\n\n### 🛡️ Knowledge Base Verification Check\nPlease try submitting your question again.`,
      sources: [],
      cached: false,
    });
  }
});
