import { admin, body, cors, fail, ok, user } from '../_shared/http.ts';
import { sendBookingRequestEmails } from '../_shared/email.ts';

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const actor = await user(req), input = await body(req);
  if (!actor) return fail('unauthorized', 'Authentication is required', 401);
  if (!input || typeof input.opportunity_id !== 'string') return fail('validation_error', 'opportunity_id is required');
  const db = admin();
  const { data: opportunity } = await db.from('opportunities').select('id,title,status,provider_id').eq('id', input.opportunity_id).single();
  if (!opportunity || opportunity.status !== 'active') return fail('not_found', 'Active opportunity not found', 404);
  const { data, error } = await db.from('bookings').insert({ learner_id: actor.id, opportunity_id: input.opportunity_id }).select('id,status').single();
  if (error) return fail('internal_error', error.message, 500);
  const { data: provider } = await db.from('users').select('email,full_name').eq('id', opportunity.provider_id).single();
  // Notifications are intentionally best-effort; the booking has already committed.
  try { await sendBookingRequestEmails({ recipient: actor.email ?? '', recipientName: actor.user_metadata?.full_name, providerEmail: provider?.email, providerName: provider?.full_name, opportunityTitle: opportunity.title }); }
  catch (emailError) { console.error('Booking notification failed', emailError); }
  return ok({ booking_id: data.id, status: data.status });
});
