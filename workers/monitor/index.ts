import { runDiff } from './diff';
import { runNotify } from './notify';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  FROM_ADDRESS: string;
  API_URL: string;
  MAX_CACHE_AGE_SECS: string;
  SEND_EMAIL: { send(message: EmailMessage): Promise<void> };
  /** Redirect all outgoing emails to this address instead of the real recipient. */
  TEST_EMAIL?: string;
  /** When set, skip DB state updates and email sends — only log what would happen. */
  DRY_RUN?: string;
}

export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    console.log('[monitor] Starting diff...');
    await runDiff(env);
    console.log('[monitor] Starting notify...');
    await runNotify(env);
    console.log('[monitor] Done.');
  },
};
