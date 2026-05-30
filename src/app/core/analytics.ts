/**
 * Typed wrapper around GTM's dataLayer for Firmometr custom events.
 *
 * GTM is loaded in src/index.html (production hostname only). This module
 * only pushes plain objects onto window.dataLayer — GTM tags pick them up.
 * All comments/identifiers in English; UI copy stays Czech elsewhere.
 */

// --- Parameter types (no `any`) ---

export type SearchType = 'ico' | 'name';
export type UserStatus = 'anonymous' | 'free' | 'paid';
export type Plan = 'free' | 'basic' | 'enterprise';
export type BillingPeriod = 'monthly' | 'annual';
export type SignupSource =
  | 'pricing_page'
  | 'landing'
  | 'watch_cta'
  | 'login'
  | 'auth_required'
  | 'direct';

/** Map of every Firmometr event name to its required parameters. */
interface EventMap {
  search_performed: {
    search_type: SearchType;
    user_status: UserStatus;
    search_count: number;
  };
  search_limit_hit: {
    search_count: number;
  };
  signup_started: {
    source: SignupSource;
  };
  signup_completed: {
    plan: Plan;
  };
  plan_viewed: {
    plan: Plan;
  };
  checkout_started: {
    plan: Plan;
    billing_period: BillingPeriod;
  };
  subscription_activated: {
    plan: Plan;
    value: number;
    currency: 'CZK';
  };
}

type EventName = keyof EventMap;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Generic, type-safe push to the GTM dataLayer.
 * Guards against SSR (no window during Angular server render).
 */
function trackEvent<E extends EventName>(event: E, params: EventMap[E]): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

/** Named event helpers — call these from components/services. */
export const analytics = {
  searchPerformed(params: EventMap['search_performed']): void {
    trackEvent('search_performed', params);
  },
  searchLimitHit(params: EventMap['search_limit_hit']): void {
    trackEvent('search_limit_hit', params);
  },
  signupStarted(params: EventMap['signup_started']): void {
    trackEvent('signup_started', params);
  },
  signupCompleted(params: EventMap['signup_completed']): void {
    trackEvent('signup_completed', params);
  },
  planViewed(params: EventMap['plan_viewed']): void {
    trackEvent('plan_viewed', params);
  },
  checkoutStarted(params: EventMap['checkout_started']): void {
    trackEvent('checkout_started', params);
  },
  subscriptionActivated(params: EventMap['subscription_activated']): void {
    trackEvent('subscription_activated', params);
  },
} as const;

/**
 * Returns the running count of searches performed this browser session
 * (1-based). Backed by sessionStorage so it survives page reloads within
 * the tab. SSR-safe.
 */
export function nextSearchCount(): number {
  if (typeof window === 'undefined') return 0;
  const key = 'fm_search_count';
  const next = Number(window.sessionStorage.getItem(key) ?? '0') + 1;
  window.sessionStorage.setItem(key, String(next));
  return next;
}

/** Current session search count without incrementing. SSR-safe. */
export function currentSearchCount(): number {
  if (typeof window === 'undefined') return 0;
  return Number(window.sessionStorage.getItem('fm_search_count') ?? '0');
}
