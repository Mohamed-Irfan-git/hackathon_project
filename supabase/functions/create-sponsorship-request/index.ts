import { admin, body, cors, fail, ok, user } from '../_shared/http.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const actor = await user(req); const input = await body(req);
  if (!actor) return fail('unauthorized', 'Authentication is required', 401);
  const db = admin(); const { data: appUser } = await db.from('users').select('role').eq('id', actor.id).single();
  if (appUser?.role !== 'learner') return fail('forbidden', 'Only learner accounts can create sponsorship requests', 403);
  if (!input || typeof input.title !== 'string' || !input.title.trim() || typeof input.reason !== 'string' || !input.reason.trim() || !Number.isFinite(input.amount_needed) || Number(input.amount_needed) <= 0 || (input.opportunity_id !== undefined && input.opportunity_id !== null && typeof input.opportunity_id !== 'string')) return fail('validation_error', 'title, reason, and a positive amount_needed are required');
  const { data, error } = await db.from('sponsorship_requests').insert({ learner_id: actor.id, opportunity_id: input.opportunity_id ?? null, title: input.title.trim(), reason: input.reason.trim(), amount_needed: input.amount_needed }).select('id,status').single();
  return error ? fail('internal_error', error.message, 500) : ok({ request_id: data.id, status: data.status });
});
