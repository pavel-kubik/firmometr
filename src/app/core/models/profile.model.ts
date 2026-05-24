export type UserTier = 'free' | 'basic' | 'enterprise';

export interface UserProfile {
  id: string;
  email: string;
  user_tier: UserTier;
  created_at: string;
}

export const TIER_LIMITS: Record<UserTier, number> = {
  free: 3,
  basic: 50,
  enterprise: Infinity,
};

export function isWatchLimitReached(count: number, tier: UserTier): boolean {
  return count >= TIER_LIMITS[tier];
}
