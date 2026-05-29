import { sendEmail } from '../../_shared/_email';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface Env {
  BREVO_API_KEY: string;
  ORDER_FROM_NAME: string;
  ORDER_FROM_EMAIL: string;
  ORDER_TO: string;
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  let body: Record<string, string>;
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    body = await request.json();
  } else {
    body = Object.fromEntries(new URLSearchParams(await request.text()));
  }

  const { name, email, message } = body;
  if (!email || !message) {
    return Response.json({ error: 'missing_fields' }, { status: 400 });
  }

  const emailRes = await sendEmail({
    env,
    to: { email: env.ORDER_TO },
    replyTo: { name: name || email, email },
    subject: `Firmometr — kontaktní formulář od ${name || email}`,
    htmlContent: `<p><strong>Jméno:</strong> ${escapeHtml(name || '—')}</p><p><strong>E-mail:</strong> ${escapeHtml(email)}</p><p><strong>Zpráva:</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
  });

  if (!emailRes.ok) {
    console.error('[contact] brevo error', await emailRes.text());
    return Response.json({ error: 'send_failed' }, { status: 500 });
  }

  return Response.json({ ok: true });
};
