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
      ? { answer: 'No matching opportunities found in the verified knowledge base.', sources: [] }
      : {
          answer: await generateAnswer(`Answer ONLY from the provided context. If it is insufficient, say so honestly. Never invent scholarships, deadlines, eligibility criteria, or facts.\n\nContext:\n${hits.map((row: { title: string; category: string; content: string }) => `[${row.category}] ${row.title}: ${row.content}`).join('\n\n')}\n\nQuestion: ${input.question}`),
          sources: hits.map((row: { id: string; title: string; category: string; source_url: string | null }) => ({ id: row.id, title: row.title, category: row.category, source_url: row.source_url })),
        };
    await db.from('rag_cache').upsert({ question_hash: questionHash, answer: result.answer, sources: result.sources, expires_at: new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString() });
    return ok({ ...result, cached: false });
  } catch (error) {
    return fail('llm_error', error instanceof Error ? error.message : 'RAG request failed', 502);
  }
});
