import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { WatchedEntity, WatchRequest } from '../models/watch.model';
import { AuthService } from './auth.service';
import { isWatchLimitReached } from '../models/profile.model';

export class WatchLimitError extends Error {
  constructor() { super('watch_limit_exceeded'); }
}

@Injectable({ providedIn: 'root' })
export class WatchService {
  private auth = inject(AuthService);

  private get db() {
    return this.auth.client.from('watchlist');
  }

  listAll(): Observable<WatchedEntity[]> {
    return from(this.db.select('*').order('added_at', { ascending: false })).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data ?? []).map(row => this.toEntity(row));
      })
    );
  }

  watch(req: WatchRequest): Observable<WatchedEntity> {
    const userId = this.auth.currentUserId;
    if (!userId) return throwError(() => new Error('Not authenticated'));

    return from(
      this.db.select('id', { count: 'exact', head: true })
    ).pipe(
      switchMap(({ count, error: countError }) => {
        if (countError) throw countError;
        if (isWatchLimitReached(count ?? 0, this.auth.currentUserTier)) {
          return throwError(() => new WatchLimitError());
        }
        return from(
          this.db.upsert({
            user_id: userId,
            ico: req.ico,
            display_name: req.displayName,
            isir_clarity: req.isirClarity ?? null,
            ares_stav_kod: req.aresStavKod ?? null,
            dph_nespolehlivy: req.dphNespolehlivy ?? null,
          }, { onConflict: 'user_id,ico' }).select().single()
        ).pipe(
          map(({ data, error }) => {
            if (error) {
              if (error.message?.includes('watch_limit_exceeded')) throw new WatchLimitError();
              throw error;
            }
            return this.toEntity(data!);
          })
        );
      })
    );
  }

  unwatch(id: string): Observable<void> {
    return from(this.db.delete().eq('id', id)).pipe(
      map(({ error }) => { if (error) throw error; })
    );
  }

  unwatchByIco(ico: string): Observable<void> {
    return from(this.db.delete().eq('ico', ico)).pipe(
      map(({ error }) => { if (error) throw error; })
    );
  }

  isWatchedByIco(ico: string): Observable<boolean> {
    return from(this.db.select('id').eq('ico', ico).maybeSingle()).pipe(
      map(({ data }) => data !== null)
    );
  }

  private toEntity(row: Record<string, unknown>): WatchedEntity {
    return {
      id:              row['id'] as string,
      ico:             row['ico'] as string,
      displayName:     row['display_name'] as string,
      addedAt:         row['added_at'] as string,
      lastCheckedAt:   row['last_checked_at'] as string | null,
      isirClarity:     row['isir_clarity'] as WatchedEntity['isirClarity'],
      aresStavKod:     row['ares_stav_kod'] as string | null,
      dphNespolehlivy: row['dph_nespolehlivy'] as boolean | null,
    };
  }
}
