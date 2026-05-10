import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SearchResult, SubjectDetail } from '../models/subject.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);

  searchByIco(ico: string): Observable<SubjectDetail> {
    return this.http.get<SubjectDetail>(`/api/v1/search/ico/${ico}`);
  }

  searchByName(query: string, start = 0): Observable<SearchResult> {
    const params = new HttpParams().set('q', query).set('start', start);
    return this.http.get<SearchResult>('/api/v1/search', { params });
  }
}
