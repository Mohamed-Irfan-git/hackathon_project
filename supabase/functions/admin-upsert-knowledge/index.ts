import { admin, body, cors, fail, ok, requireAdmin, user, vector } from '../_shared/http.ts';
import { contentHash, generateEmbedding } from '../_shared/gemini.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const actor = await user(req); const input = await body(req);
  if (!actor) return fail('unauthorized', 'Authentication is required', 401);
  if (!(await requireAdmin(actor.id))) return fail('forbidden', 'Admin role required', 403);
  if (!input || typeof input.category !== 'string' || typeof input.title !== 'string' || typeof input.content !== 'string' || !['draft', 'verified'].includes(String(input.status))) return fail('validation_error', 'category, title, content and status are required');
  const db = admin(); const text = `${input.title}\n${input.content}`; const hash = await contentHash(text);
  try {
    let cached = false;
    if (input.id) { const { data } = await db.from('knowledge_base').select('embedding,embedding_input_hash').eq('id', input.id).single(); cached = Boolean(data?.embedding && data.embedding_input_hash === hash); }
    const row: Record<string, unknown> = { ...input, embedding_input_hash: hash, verified_by: input.status === 'verified' ? actor.id : null, updated_at: new Date().toISOString() };
    delete row.id; if (!cached) row.embedding = vector(await generateEmbedding(text));
    const { data, error } = input.id ? await db.from('knowledge_base').update(row).eq('id', input.id).select('id').single() : await db.from('knowledge_base').insert(row).select('id').single();
    if (error) throw error; return ok({ id: data.id, embedded: true, cached });
  } catch (error) { return fail('embedding_failed', error instanceof Error ? error.message : 'Embedding failed', 502); }
});
