import { admin, cors, fail, ok, requireAdmin, user } from '../_shared/http.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const actor = await user(req);
  if (!actor) return fail('unauthorized', 'Authentication is required', 401);
  if (!(await requireAdmin(actor.id))) return fail('forbidden', 'Admin role required', 403);

  const db = admin();
  const [providers, learners, bookings, sponsorships, opportunities] = await Promise.all([
    db.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
    db.from('bookings').select('learner_id'),
    db.from('bookings').select('*', { count: 'exact', head: true }),
    db.from('sponsorships').select('learner_id,amount').in('status', ['active', 'completed']),
    db.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  const sponsored = new Set(
    (sponsorships.data ?? []).map((row: { learner_id: string | null }) => row.learner_id),
  ).size;
  const amount = (sponsorships.data ?? []).reduce(
    (total: number, row: { amount: number }) => total + Number(row.amount),
    0,
  );

  return ok({
    active_providers: providers.count ?? 0,
    learners_supported: new Set((learners.data ?? []).map((row: { learner_id: string }) => row.learner_id)).size,
    total_bookings: bookings.count ?? 0,
    sponsored_learners: sponsored,
    sponsorship_amount: amount,
    opportunities_count: opportunities.count ?? 0,
  });
});
