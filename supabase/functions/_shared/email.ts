type BookingEmail = {
  recipient: string;
  recipientName?: string | null;
  opportunityTitle: string;
  providerName?: string | null;
  status?: 'pending' | 'accepted' | 'rejected';
};

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]!));

function template(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f8f9ff;font-family:Arial,sans-serif;color:#121c2a"><main style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #d9e3f6;border-radius:16px;overflow:hidden"><header style="padding:24px;background:#00647c;color:#fff"><strong style="font-size:20px">TakeUForward</strong></header><section style="padding:28px"><h1 style="margin:0 0 16px;font-size:22px">${title}</h1>${body}<p style="margin:24px 0 0;color:#6e797e;font-size:13px">This is an automated update from TakeUForward.</p></section></main></body></html>`;
}

async function send(to: string, subject: string, html: string) {
  const key = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM_EMAIL');
  if (!key || !from) return { sent: false, reason: 'Email is not configured' };
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!response.ok) throw new Error(`Resend delivery failed (${response.status})`);
  return { sent: true };
}

export async function sendBookingRequestEmails(input: BookingEmail & { providerEmail?: string | null }) {
  const opportunity = escapeHtml(input.opportunityTitle);
  const learner = escapeHtml(input.recipientName || 'there');
  const learnerEmail = send(input.recipient, `Enrollment request received — ${input.opportunityTitle}`, template(
    'Your request was sent',
    `<p>Hi ${learner},</p><p>Your enrollment request for <strong>${opportunity}</strong> has been sent to the provider. You can follow its status in <strong>My Bookings</strong>.</p>`,
  ));
  const providerEmail = input.providerEmail
    ? send(input.providerEmail, `New enrollment request — ${input.opportunityTitle}`, template(
      'New enrollment request',
      `<p>A learner has requested to enroll in <strong>${opportunity}</strong>.</p><p>Review the request from your Provider dashboard.</p>`,
    ))
    : Promise.resolve({ sent: false, reason: 'Provider email unavailable' });
  return Promise.allSettled([learnerEmail, providerEmail]);
}

export async function sendBookingDecisionEmail(input: BookingEmail) {
  const accepted = input.status === 'accepted';
  const opportunity = escapeHtml(input.opportunityTitle);
  const learner = escapeHtml(input.recipientName || 'there');
  return send(input.recipient, `${accepted ? 'Enrollment accepted' : 'Enrollment update'} — ${input.opportunityTitle}`, template(
    accepted ? 'You are enrolled' : 'Enrollment request update',
    `<p>Hi ${learner},</p><p>Your request for <strong>${opportunity}</strong> was <strong>${accepted ? 'accepted' : 'not accepted'}</strong>${input.providerName ? ` by ${escapeHtml(input.providerName)}` : ''}.</p><p>Open <strong>My Bookings</strong> for the latest details.</p>`,
  ));
}
