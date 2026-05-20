import type { IsirClarity } from './registry';

interface EmailInput {
  ico: string;
  displayName: string;
  isirClarity: IsirClarity | string | null;
  dphNespolehlivy: boolean | null;
  aresStavKod: string | null;
}

const SITE = 'https://firmometr.cz';

function isirLabel(clarity: string | null): string {
  switch (clarity) {
    case 'ACTIVE_DEBTOR': return 'Aktivní insolvenční řízení (dlužník)';
    case 'ACTIVE_CO_DEBTOR': return 'Aktivní insolvenční řízení (spoludlužník)';
    case 'PAST_DEBTOR': return 'Minulé insolvenční řízení';
    case 'CLEAR': return 'Bez insolvencí';
    default: return clarity ?? 'Neznámý';
  }
}

function dphLabel(nespolehlivy: boolean | null): string {
  if (nespolehlivy === true) return '⚠️ Nespolehlivý plátce DPH';
  if (nespolehlivy === false) return 'Spolehlivý plátce';
  return 'Není plátce DPH';
}

export function buildEmail(input: EmailInput): { subject: string; html: string; text: string } {
  const { ico, displayName, isirClarity, dphNespolehlivy, aresStavKod } = input;
  const detailUrl = `${SITE}/firma/${ico}`;
  const subject = `Změna stavu firmy: ${displayName} (IČO ${ico})`;

  const html = `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222">
  <h2 style="color:#059669">Firmometr — Upozornění na změnu</h2>
  <p>U sledované firmy <strong>${displayName}</strong> (IČO: ${ico}) došlo ke změně stavu.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr>
      <th style="text-align:left;padding:8px;background:#f3f4f6;border:1px solid #e5e7eb">Registr</th>
      <th style="text-align:left;padding:8px;background:#f3f4f6;border:1px solid #e5e7eb">Aktuální stav</th>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb">ISIR (ACTIVE_DEBTOR)</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${isirLabel(isirClarity as string | null)}</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb">DPH</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${dphLabel(dphNespolehlivy)}</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb">ARES stav</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${aresStavKod ?? '—'}</td>
    </tr>
  </table>
  <p>
    <a href="${detailUrl}" style="background:#059669;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;display:inline-block">
      Zobrazit detail firmy
    </a>
  </p>
  <p style="color:#6b7280;font-size:13px">
    Upozornění odesláno automaticky systémem Firmometr.
    Notifikaci vypnete na stránce sledovaných subjektů.
  </p>
</body>
</html>`;

  const text = [
    `Firmometr — Upozornění na změnu`,
    ``,
    `Firma: ${displayName} (IČO: ${ico})`,
    ``,
    `Aktuální stav:`,
    `  ISIR: ${isirLabel(isirClarity as string | null)}`,
    `  DPH: ${dphLabel(dphNespolehlivy)}`,
    `  ARES: ${aresStavKod ?? '—'}`,
    ``,
    `Detail: ${detailUrl}`,
    ``,
    `Notifikaci vypnete na stránce sledovaných subjektů.`,
  ].join('\n');

  return { subject, html, text };
}
