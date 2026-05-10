import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WatchedEntity, WatchRequest } from '../models/watch.model';

@Injectable({ providedIn: 'root' })
export class WatchService {
  private readonly KEY = 'proklepni_watched';

  listAll(): Observable<WatchedEntity[]> {
    return of(this.load());
  }

  watch(req: WatchRequest): Observable<WatchedEntity> {
    const all = this.load();
    const existing = all.find(e => e.ico === req.ico);
    if (existing) return of(existing);
    const entity: WatchedEntity = {
      id: Date.now(),
      ico: req.ico,
      displayName: req.displayName,
      addedAt: new Date().toISOString(),
      lastCheckedAt: null,
      notifyEmail: null,
      isirClarity: (req.isirClarity as WatchedEntity['isirClarity']) ?? null,
      aresStavKod: req.aresStavKod ?? null,
    };
    this.save([...all, entity]);
    return of(entity);
  }

  unwatch(id: number): Observable<void> {
    this.save(this.load().filter(e => e.id !== id));
    return of(undefined as void);
  }

  isWatchedByIco(ico: string): boolean {
    return this.load().some(e => e.ico === ico);
  }

  getByIco(ico: string): WatchedEntity | undefined {
    return this.load().find(e => e.ico === ico);
  }

  private load(): WatchedEntity[] {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private save(entities: WatchedEntity[]): void {
    localStorage.setItem(this.KEY, JSON.stringify(entities));
  }
}
