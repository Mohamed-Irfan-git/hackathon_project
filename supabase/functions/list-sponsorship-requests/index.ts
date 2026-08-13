import { admin, cors, fail, ok, requireAdmin, user } from '../_shared/http.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const actor = await user(req); if (!actor) return fail('unauthorized', 'Authentication is required', 401);
  const db = admin(); const { data: appUser } = await db.from('users').select('role').eq('id', actor.id).single();
  if (appUser?.role !== 'sponsor' && appUser?.role !== 'learner' && !(await requireAdmin(actor.id))) return fail('forbidden', 'Sponsor, learner or admin role required', 403);
  const { data, error } = await db.from('sponsorship_requests').select('*, learner_profiles(education_level), users!sponsorship_requests_learner_id_fkey(full_name)').order('created_at', { ascending: false });
  if (error) return fail('internal_error', error.message, 500);
  return ok((data ?? []).map((row: Record<string, unknown>) => ({ ...row, learner_name: (row.users as { full_name?: string } | null)?.full_name ?? 'Learner', education_level: (row.learner_profiles as { education_level?: string } | null)?.education_level ?? 'Not specified' })));
});
