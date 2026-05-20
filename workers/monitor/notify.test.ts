import { describe, it, expect } from 'vitest';
import { runNotify } from './notify';

const env = {
  SUPABASE_URL: 'http://localhost',
  SUPABASE_SERVICE_KEY: 'test-key',
  FROM_ADDRESS: 'noreply@test.com',
  API_URL: 'http://localhost',
  MAX_CACHE_AGE_SECS: '86400',
  SEND_EMAIL: { send: async () => {} },
};

describe('runNotify', () => {
  it('resolves without error (notifications are sent inline by runDiff)', async () => {
    await expect(runNotify(env)).resolves.toBeUndefined();
  });
});
