import { admin, cors, fail, ok, requireAdmin, user } from '../_shared/http.ts';

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const actor = await user(req);
  if (!actor) return fail('unauthorized', 'Authentication is required', 401);
  if (!(await requireAdmin(actor.id))) return fail('forbidden', 'Admin role required', 403);
  const { data, error } = await admin().from('opportunities').select('*').order('created_at', { ascending: false });
  return error ? fail('internal_error', error.message, 500) : ok(data ?? []);
});
