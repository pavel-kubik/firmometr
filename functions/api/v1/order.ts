// @ts-ignore
import { EmailMessage } from 'cloudflare:email';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  SEND_EMAIL: { send(msg: unknown): Promise<void> };
  ORDER_FROM: string;
  ORDER_TO: string;
}

function buildMime(from: string, to: string, replyTo: string, subject: string, html: string): string {
  const enc = new TextEncoder();
  const b64 = (s: string) => {
    const bytes = enc.encode(s);
    let bin = '';
    bytes.forEach(b => (bin += String.fromCharCode(b)));
    return btoa(bin);
  };

  return [
    `From: Firmometr <${from}>`,
    `To: ${to}`,
    `Reply-To: ${replyTo}`,
    `Subject: =?UTF-8?B?${b64(subject)}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    b64(html),
  ].join('\r\n');
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  let body: Record<string, string>;
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    body = await request.json();
  } else {
    body = Object.fromEntries(new URLSearchParams(await request.text()));
  }

  const { plan, billing, jmeno, ico, dic, adresa, email, telefon } = body;
  if (!plan || !billing || !jmeno || !ico || !adresa || !email || !telefon) {
    return Response.json({ error: 'missing_fields' }, { status: 400 });
  }

  // Store in Supabase
  const supaRes = await fetch(`${env.SUPABASE_URL}/rest/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ plan, billing, jmeno, ico, dic: dic || null, adresa, email, telefon }),
  });

  if (!supaRes.ok) {
    console.error('[order] supabase error', await supaRes.text());
    return Response.json({ error: 'db_error' }, { status: 500 });
  }

  // Build email
  const planLabel   = plan === 'enterprise' ? 'ENTERPRISE' : 'BASIC';
  const billingLabel = billing === 'annual' ? 'Ročně (1 měsíc zdarma)' : 'Měsíčně';
  const monthlyPrice = plan === 'enterprise' ? (billing === 'annual' ? 799 : 899) : (billing === 'annual' ? 299 : 349);
  const priceNote   = billing === 'annual'
    ? `${monthlyPrice} Kč/měs — fakturováno ročně (${plan === 'enterprise' ? '8 789' : '3 289'} Kč)`
    : `${monthlyPrice} Kč/měs`;

  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f3f4f6;font-weight:600;white-space:nowrap">${label}</td>` +
    `<td style="padding:8px;border:1px solid #e5e7eb">${value}</td></tr>`;

  const html = `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"></head><body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222">
<h2 style="color:#059669">Firmometr — Nová objednávka</h2>
<table style="border-collapse:collapse;width:100%">
  ${row('Plán', planLabel)}
  ${row('Fakturace', billingLabel)}
  ${row('Cena', priceNote)}
  ${row('Jméno / firma', jmeno)}
  ${row('IČO', ico)}
  ${dic ? row('DIČ', dic) : ''}
  ${row('Adresa', adresa)}
  ${row('E-mail', email)}
  ${row('Telefon', telefon)}
</table>
</body></html>`;

  const subject = `Nová objednávka: ${planLabel} — ${jmeno}`;
  const mime = buildMime(env.ORDER_FROM, env.ORDER_TO, email, subject, html);

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(mime));
      controller.close();
    },
  });

  try {
    const message = new EmailMessage(env.ORDER_FROM, env.ORDER_TO, stream);
    await env.SEND_EMAIL.send(message);
  } catch (err) {
    // Order is saved in Supabase; log email failure but don't fail the request
    console.error('[order] email error', err);
  }

  return Response.json({ ok: true });
};
