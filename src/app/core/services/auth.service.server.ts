import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Server-side stub: no Supabase client, no timers, no network calls.
 * Provided in app.config.server.ts to replace AuthService during SSG prerender.
 */
@Injectable()
export class ServerAuthService {
  readonly user$ = of(null);
  readonly currentUserId: string | null = null;

  signUp(..._args: Parameters<AuthService['signUp']>) {
    return Promise.resolve({ data: { user: null, session: null }, error: null } as any);
  }
  signInWithPassword(..._args: Parameters<AuthService['signInWithPassword']>) {
    return Promise.resolve({ data: { user: null, session: null }, error: null } as any);
  }
  signInWithOtp(..._args: Parameters<AuthService['signInWithOtp']>) {
    return Promise.resolve({ data: {}, error: null } as any);
  }
  signOut() {
    return Promise.resolve({ error: null });
  }
  get client(): any { return null; }
}
