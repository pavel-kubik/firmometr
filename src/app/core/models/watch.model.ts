export interface WatchedEntity {
  id: string;
  ico: string;
  displayName: string;
  addedAt: string;
  lastCheckedAt: string | null;
  notifyEmail: string | null;
  isirClarity: 'CLEAR' | 'PAST_DEBTOR' | 'ACTIVE_DEBTOR' | 'ACTIVE_CO_DEBTOR' | null;
  aresStavKod: string | null;
  dphNespolehlivy: boolean | null;
}

export interface WatchRequest {
  ico: string;
  displayName: string;
  isirClarity?: string;
  aresStavKod?: string;
  dphNespolehlivy?: boolean;
}
