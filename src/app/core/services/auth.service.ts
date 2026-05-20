import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile, UserTier, TIER_LIMITS } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey
  );

  private userSubject    = new BehaviorSubject<User | null>(null);
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);

  readonly user$:    Observable<User | null>        = this.userSubject.asObservable();
  readonly profile$: Observable<UserProfile | null> = this.profileSubject.asObservable();

  constructor() {
    this.supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user ?? null;
      this.userSubject.next(user);
      if (user) this.loadProfile(user.id);
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      this.userSubject.next(user);
      if (user) this.loadProfile(user.id);
      else this.profileSubject.next(null);
    });
  }

  private async loadProfile(userId: string): Promise<void> {
    const { data } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    this.profileSubject.next(data as UserProfile | null);
  }

  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  signInWithPassword(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  signInWithOtp(email: string) {
    return this.supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  get currentUserId(): string | null {
    return this.userSubject.value?.id ?? null;
  }

  get currentUserEmail(): string | null {
    return this.userSubject.value?.email ?? null;
  }

  get currentProfile(): UserProfile | null {
    return this.profileSubject.value;
  }

  get currentUserTier(): UserTier {
    return this.profileSubject.value?.user_tier ?? 'free';
  }

  get currentTierLimit(): number {
    return TIER_LIMITS[this.currentUserTier];
  }
}
