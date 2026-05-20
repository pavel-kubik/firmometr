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

  it('html body mentions ISIR status', () => {
    const email = buildEmail(base);
    expect(email.html).toContain('ACTIVE_DEBTOR');
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
