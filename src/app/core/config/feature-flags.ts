import { UserTier } from '../models/profile.model';

/**
 * Access ladder for gating features. Higher = more privileged.
 * Maps to auth state: (anonymous) → PUBLIC, and logged-in tiers
 * free → REGISTERED, basic → BASIC, enterprise → ENTERPRISE.
 */
export type AccessLevel = 'PUBLIC' | 'REGISTERED' | 'BASIC' | 'ENTERPRISE';

const RANK: Record<AccessLevel, number> = {
  PUBLIC: 0,
  REGISTERED: 1,
  BASIC: 2,
  ENTERPRISE: 3,
};

/** Minimum access level required to use each gated feature. */
export const FEATURES = {
  /** Účetní závěrky (financial-statement years) section on the company detail page. */
  financialStatements: 'REGISTERED' as AccessLevel,
};

/** The access level a user currently has, from their auth/tier state. */
export function userAccessLevel(loggedIn: boolean, tier: UserTier): AccessLevel {
  if (!loggedIn) return 'PUBLIC';
  return tier === 'enterprise' ? 'ENTERPRISE' : tier === 'basic' ? 'BASIC' : 'REGISTERED';
}

/** Whether `user` meets (>=) the `required` access level. */
export function meetsAccess(user: AccessLevel, required: AccessLevel): boolean {
  return RANK[user] >= RANK[required];
}
