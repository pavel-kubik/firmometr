import { describe, it, expect } from 'vitest';
import { buildEmail } from './email-template';

describe('buildEmail', () => {
  const base = {
    ico: '12345678',
    displayName: 'Test s.r.o.',
    isirClarity: 'ACTIVE_DEBTOR' as const,
    dphNespolehlivy: false,
    aresStavKod: 'AKTIVNI',
  };

  it('subject includes company name and ICO', () => {
    const email = buildEmail(base);
    expect(email.subject).toContain('Test s.r.o.');
    expect(email.subject).toContain('12345678');
  });

  it('html body shows Czech ISIR label for ACTIVE_DEBTOR', () => {
    const email = buildEmail(base);
    expect(email.html).toContain('Aktivní insolvenční řízení (dlužník)');
  });

  it('html ISIR row label changes per clarity value', () => {
    const clear = buildEmail({ ...base, isirClarity: 'CLEAR' });
    expect(clear.html).toContain('Bez insolvencí');

    const coDeb = buildEmail({ ...base, isirClarity: 'ACTIVE_CO_DEBTOR' });
    expect(coDeb.html).toContain('Aktivní insolvenční řízení (spoludlužník)');

    const past = buildEmail({ ...base, isirClarity: 'PAST_DEBTOR' });
    expect(past.html).toContain('Minulé insolvenční řízení');
  });

  it('html body includes link to company detail', () => {
    const email = buildEmail(base);
    expect(email.html).toContain('/firma/12345678');
  });

  it('text body is non-empty and contains ICO', () => {
    const email = buildEmail(base);
    expect(email.text.length).toBeGreaterThan(20);
    expect(email.text).toContain('12345678');
  });

  it('includes DPH warning when nespolehlivy is true', () => {
    const email = buildEmail({ ...base, dphNespolehlivy: true });
    expect(email.html).toContain('DPH');
    expect(email.html).toContain('Nespolehlivý');
  });
});
