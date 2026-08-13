import { admin, body, cors, fail, ok, user, vector } from '../_shared/http.ts';
import { contentHash, generateEmbedding } from '../_shared/gemini.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const actor = await user(req); const input = await body(req);
  if (!actor) return fail('unauthorized', 'Authentication is required', 401);
  const types = ['TUITION', 'COURSE', 'WORKSHOP', 'MENTORSHIP', 'MOCK_INTERVIEW'];
  if (!input || typeof input.title !== 'string' || !types.includes(String(input.type)) || typeof input.description !== 'string' || !['draft', 'active'].includes(String(input.status))) return fail('validation_error', 'title, type, description and draft/active status are required');
  const db = admin();
  let { data: provider } = await db.from('provider_profiles').select('status').eq('user_id', actor.id).maybeSingle();
  if (!provider) {
    const { data: newProv, error: provErr } = await db.from('provider_profiles').insert({ user_id: actor.id, status: 'pending' }).select('status').single();
    if (provErr) return fail('internal_error', 'Failed to initialize provider profile', 500);
    provider = newProv;
  }
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
    // Only an admin-verified provider can make an opportunity public. Pending providers prepare a draft.
    const row: Record<string, unknown> = {
      provider_id: actor.id,
      title: String(input.title).trim(),
      type: input.type,
      description: input.description,
      subject: input.subject ?? null,
      target_level: input.target_level ?? null,
      price: Number(input.price ?? 0),
      delivery_mode: input.delivery_mode ?? null,
      location: input.location ?? null,
      duration: input.duration ?? null,
      status: provider.status === 'verified' && input.status === 'active' ? 'active' : 'draft',
      embedding_input_hash: hash,
      updated_at: new Date().toISOString(),
    };
    if (!isCached) row.embedding = vector(await generateEmbedding(text));
    const query = input.id ? db.from('opportunities').update(row).eq('id', input.id).select('id').single() : db.from('opportunities').insert(row).select('id').single();
    const { data, error } = await query; if (error) throw error;
    return ok({ id: data.id, embedded: true, cached: isCached, status: row.status });
  } catch (error) { return fail('embedding_failed', error instanceof Error ? error.message : 'Opportunity save failed', 502); }
});
