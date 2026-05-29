import { describe, it, expect } from 'vitest';
import { randomToken, sha256Hex, generateOtp } from './_tokens';

describe('randomToken', () => {
  it('uses the given prefix', () => {
    const t = randomToken('sk');
    expect(t.startsWith('sk_')).toBe(true);
  });

  it('produces unique tokens', () => {
    const a = randomToken('reg');
    const b = randomToken('reg');
    expect(a).not.toBe(b);
  });

  it('uses base64url characters only after the prefix', () => {
    const t = randomToken('clm');
    expect(t.slice(4)).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe('sha256Hex', () => {
  it('matches the known SHA-256 of empty string', async () => {
    expect(await sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('is deterministic', async () => {
    const a = await sha256Hex('hello');
    const b = await sha256Hex('hello');
    expect(a).toBe(b);
  });

  it('differs for different inputs', async () => {
    expect(await sha256Hex('a')).not.toBe(await sha256Hex('b'));
  });
});

describe('generateOtp', () => {
  it('returns a 6-digit numeric string', () => {
    const otp = generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
  });
});
