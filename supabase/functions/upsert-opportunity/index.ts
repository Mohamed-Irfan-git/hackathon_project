import { admin, body, cors, fail, ok, user, vector } from '../_shared/http.ts';
import { contentHash, generateEmbedding } from '../_shared/gemini.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const actor = await user(req); const input = await body(req);
  if (!actor) return fail('unauthorized', 'Authentication is required', 401);
  const types = ['TUITION', 'COURSE', 'WORKSHOP', 'MENTORSHIP', 'MOCK_INTERVIEW'];
  if (!input || typeof input.title !== 'string' || !types.includes(String(input.type)) || typeof input.description !== 'string' || !['draft', 'active'].includes(String(input.status))) return fail('validation_error', 'title, type, description and draft/active status are required');
  const db = admin();
  const text = `${input.title}\n${input.description}\n${input.subject ?? ''}\n${input.target_level ?? ''}`;
  const hash = await contentHash(text);
  let existing: { provider_id: string; embedding: string | null; embedding_input_hash: string | null } | null = null;
  if (input.id) {
    const { data } = await db.from('opportunities').select('provider_id,embedding,embedding_input_hash').eq('id', input.id).single();
    if (!data) return fail('not_found', 'Opportunity not found', 404);
    if (data.provider_id !== actor.id) return fail('forbidden', 'Not your opportunity', 403);
    existing = data;
  }
  try {
    const isCached = Boolean(existing?.embedding && existing.embedding_input_hash === hash);
    const row: Record<string, unknown> = { ...input, provider_id: actor.id, embedding_input_hash: hash, updated_at: new Date().toISOString() };
    delete row.id;
    if (!isCached) row.embedding = vector(await generateEmbedding(text));
    const query = input.id ? db.from('opportunities').update(row).eq('id', input.id).select('id').single() : db.from('opportunities').insert(row).select('id').single();
    const { data, error } = await query; if (error) throw error;
    return ok({ id: data.id, embedded: true, cached: isCached });
  } catch (error) { return fail('embedding_failed', error instanceof Error ? error.message : 'Embedding failed', 502); }
});
