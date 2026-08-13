import { admin, body, cors, fail, ok, user } from '../_shared/http.ts';
import { sendBookingDecisionEmail } from '../_shared/email.ts';

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const actor = await user(req), input = await body(req);
  if (!actor) return fail('unauthorized', 'Authentication is required', 401);
  if (!input || typeof input.booking_id !== 'string' || !['accepted', 'rejected'].includes(String(input.decision))) return fail('validation_error', 'booking_id and accepted/rejected decision are required');
  const db = admin();
  const { data: booking } = await db.from('bookings').select('opportunity_id,learner_id').eq('id', input.booking_id).single();
  if (!booking) return fail('not_found', 'Booking not found', 404);
  const { data: opportunity } = await db.from('opportunities').select('provider_id,title').eq('id', booking.opportunity_id).single();
  if (opportunity?.provider_id !== actor.id) return fail('forbidden', 'Not the opportunity provider', 403);
  const { data, error } = await db.from('bookings').update({ status: input.decision, responded_at: new Date().toISOString() }).eq('id', input.booking_id).select('id,status').single();
  if (error) return fail('internal_error', error.message, 500);
  const { data: learner } = await db.from('users').select('email,full_name').eq('id', booking.learner_id).single();
  try { if (learner?.email) await sendBookingDecisionEmail({ recipient: learner.email, recipientName: learner.full_name, opportunityTitle: opportunity.title, providerName: actor.user_metadata?.full_name, status: input.decision as 'accepted' | 'rejected' }); }
  catch (emailError) { console.error('Booking decision notification failed', emailError); }
  return ok({ booking_id: data.id, status: data.status });
});
