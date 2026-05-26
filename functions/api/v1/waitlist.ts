function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
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

  const { email } = body;
  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ error: 'invalid_email' }, { status: 400 });
  }

  const dbRes = await fetch(`${env.SUPABASE_URL}/rest/v1/waitlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ email }),
  });

  if (!dbRes.ok && dbRes.status !== 409) {
    console.error('[waitlist] supabase error', dbRes.status, await dbRes.text());
    return Response.json({ error: 'db_failed' }, { status: 500 });
  }

  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': env.BREVO_API_KEY },
    body: JSON.stringify({
      sender:      { name: env.ORDER_FROM_NAME, email: env.ORDER_FROM_EMAIL },
      to:          [{ email: env.ORDER_TO }],
      subject:     `Firmometr — nový zájemce na waitlist: ${escapeHtml(email)}`,
      htmlContent: `<p>Nový e-mail na waitlistu: <strong>${escapeHtml(email)}</strong></p>`,
    }),
  }).catch(err => console.error('[waitlist] brevo error', err));

  return Response.json({ ok: true });
};
