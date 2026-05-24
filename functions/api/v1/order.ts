interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY: string;
  BREVO_API_KEY: string;
  ORDER_FROM_NAME: string;
  ORDER_FROM_EMAIL: string;
  ORDER_TO: string;
}

async function getUserId(env: Env, authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { 'Authorization': authHeader, 'apikey': env.SUPABASE_ANON_KEY },
  });
  if (!res.ok) return null;
  const data = await res.json() as { id?: string };
  return data.id ?? null;
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const userId = await getUserId(env, request.headers.get('authorization'));
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 });

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
  if (!/^\d{8}$/.test(ico)) {
    return Response.json({ error: 'invalid_ico' }, { status: 400 });
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
    body: JSON.stringify({ user_id: userId, plan, billing, jmeno, ico, dic: dic || null, adresa, email, telefon }),
  });

  if (!supaRes.ok) {
    console.error('[order] supabase error', await supaRes.text());
    return Response.json({ error: 'db_error' }, { status: 500 });
  }

  // Build email content
  const planLabel    = plan === 'enterprise' ? 'ENTERPRISE' : 'BASIC';
  const billingLabel = billing === 'annual' ? 'Ročně (1 měsíc zdarma)' : 'Měsíčně';
  const monthlyPrice = plan === 'enterprise' ? (billing === 'annual' ? 799 : 899) : (billing === 'annual' ? 299 : 349);
  const priceNote    = billing === 'annual'
    ? `${monthlyPrice} Kč/měs — fakturováno ročně (${plan === 'enterprise' ? '8 789' : '3 289'} Kč)`
    : `${monthlyPrice} Kč/měs`;

  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f3f4f6;font-weight:600;white-space:nowrap">${label}</td>` +
    `<td style="padding:8px;border:1px solid #e5e7eb">${value}</td></tr>`;

  const htmlContent = `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222">
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

  // Send via Brevo
  const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender:      { name: env.ORDER_FROM_NAME, email: env.ORDER_FROM_EMAIL },
      to:          [{ email: env.ORDER_TO }],
      replyTo:     { email },
      subject:     `Nová objednávka: ${planLabel} — ${jmeno}`,
      htmlContent,
    }),
  });

  if (!emailRes.ok) {
    console.error('[order] brevo error', await emailRes.text());
  }

  // Send confirmation to customer
  const customerHtmlContent = `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222">
  <h2 style="color:#059669">Děkujeme za vaši objednávku!</h2>
  <p>Vaše objednávka byla přijata. Ozveme se vám do 1 pracovního dne s proforma fakturou.</p>
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
  <p style="margin-top:24px;color:#6b7280;font-size:14px">Firmometr s.r.o.</p>
</body></html>`;

  const customerEmailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender:      { name: env.ORDER_FROM_NAME, email: env.ORDER_FROM_EMAIL },
      to:          [{ email }],
      subject:     `Potvrzení objednávky Firmometr — ${planLabel}`,
      htmlContent: customerHtmlContent,
    }),
  });

  if (!customerEmailRes.ok) {
    console.error('[order] brevo customer email error', await customerEmailRes.text());
  }

  return Response.json({ ok: true });
};
