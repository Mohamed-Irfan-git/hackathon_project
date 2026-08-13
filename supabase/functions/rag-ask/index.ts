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
    if (!actor) return fail('unauthorized', 'Authentication is required', 401);
    if (actor.id !== input.learner_id) return fail('forbidden', 'Invalid learner_id', 403);
    actorId = actor.id;
  }

  const normalizedQuestion = input.question.trim().replace(/\s+/g, ' ').toLowerCase();
  const questionHash = await contentHash(normalizedQuestion);
  const db = admin();
  const { data: cached } = await db.from('rag_cache').select('answer,sources').eq('question_hash', questionHash).gt('expires_at', new Date().toISOString()).maybeSingle();
  if (cached) return ok({ answer: cached.answer, sources: cached.sources, cached: true });

  const scopeHash = await contentHash(requestIdentity(req, actorId));
  const limit = actorId ? AUTHENTICATED_HOURLY_LIMIT : ANONYMOUS_HOURLY_LIMIT;
  const { data: allowed, error: quotaError } = await db.rpc('consume_rag_quota', { p_scope_hash: scopeHash, p_maximum_requests: limit });
  if (quotaError) return fail('internal_error', quotaError.message, 500);
  if (!allowed) return fail('rate_limited', 'RAG request limit reached. Try again later or use a previously asked question.', 429);

  try {
    const embedding = await generateEmbedding(input.question);
    const { data, error } = await db.rpc('match_knowledge_base', { query_embedding: `[${embedding.join(',')}]`, match_count: 5 });
    if (error) throw error;
    const hits = (data ?? []).filter((row: { similarity: number }) => row.similarity >= 0.55);
    const result = !hits.length
      ? {
          answer: `### 🔍 Student Situation & Problem Analysis\nThe student is asking: "${input.question}". The query indicates a request for specific educational, financial, or opportunity guidance.\n\n### 📚 Knowledge Base Answer & Solutions\nNo matching opportunities or information were found in our verified knowledge base for this query.\n\n### 🛡️ Knowledge Base Verification Check\nUnverified or missing information. Our verified knowledge base currently lacks data on this specific topic. Please adjust your search query or check back as new verified entries are published.`,
          sources: [],
        }
      : {
          answer: await generateAnswer(
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
${hits.map((row: { title: string; category: string; content: string }) => `[Category: ${row.category}] Title: ${row.title}\nContent: ${row.content}`).join('\n\n')}

Student Question: ${input.question}`
          ),
          sources: hits.map((row: { id: string; title: string; category: string; source_url: string | null }) => ({ id: row.id, title: row.title, category: row.category, source_url: row.source_url })),
        };
    await db.from('rag_cache').upsert({ question_hash: questionHash, answer: result.answer, sources: result.sources, expires_at: new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString() });
    return ok({ ...result, cached: false });
  } catch (error) {
    return fail('llm_error', error instanceof Error ? error.message : 'RAG request failed', 502);
  }
});
