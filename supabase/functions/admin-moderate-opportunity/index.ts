import { admin, body, cors, fail, ok, requireAdmin, user } from '../_shared/http.ts';

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const actor = await user(req), input = await body(req);
  if (!actor) return fail('unauthorized', 'Authentication is required', 401);
  if (!(await requireAdmin(actor.id))) return fail('forbidden', 'Admin role required', 403);
  if (!input || typeof input.opportunity_id !== 'string' || !['draft', 'active', 'closed'].includes(String(input.status))) return fail('validation_error', 'opportunity_id and a valid status are required');
  const { data, error } = await admin().from('opportunities').update({ status: input.status, updated_at: new Date().toISOString() }).eq('id', input.opportunity_id).select('id,status').single();
  return error ? fail('not_found', error.message, 404) : ok({ id: data.id, status: data.status });
});
