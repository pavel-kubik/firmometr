import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SearchService } from '../../core/services/search.service';
import { SubjectSummary } from '../../core/models/subject.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatTableModule, MatProgressBarModule, MatChipsModule, MatIconModule,
    MatPaginatorModule
  ],
  template: `
    <div class="search-page">
      <h1>Vyhledat subjekt</h1>

      <div class="search-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>IČO nebo název firmy</mat-label>
          <input matInput [(ngModel)]="query" (keyup.enter)="search()" placeholder="Např. 27082440 nebo Avast">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <button mat-raised-button color="primary" (click)="search()" [disabled]="loading">
          Hledat
        </button>
      </div>

      <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

      <div *ngIf="error" class="error-msg">{{ error }}</div>
      <div *ngIf="limitReached" class="error-msg limit-msg">
        Dosáhli jste limitu 5 bezplatných vyhledávání za 24 hodin.
        <a routerLink="/login" class="login-link">Přihlaste se pro neomezený přístup →</a>
      </div>

      <div *ngIf="results.length > 0" class="results">
        <p class="result-count">Nalezeno: {{ total }} subjektů</p>
        <table mat-table [dataSource]="results" class="results-table">
          <ng-container matColumnDef="ico">
            <th mat-header-cell *matHeaderCellDef>IČO</th>
            <td mat-cell *matCellDef="let r">{{ r.ico }}</td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Název</th>
            <td mat-cell *matCellDef="let r">{{ r.obchodniFirma }}</td>
          </ng-container>
          <ng-container matColumnDef="address">
            <th mat-header-cell *matHeaderCellDef>Sídlo</th>
            <td mat-cell *matCellDef="let r">{{ r.sidloText }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Stav</th>
            <td mat-cell *matCellDef="let r">
              <mat-chip-listbox>
                <mat-chip [class]="r.stavNazev === 'Aktivní' ? 'chip-active' : 'chip-inactive'">
                  {{ r.stavNazev }}
                </mat-chip>
              </mat-chip-listbox>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let r">
              <button mat-button color="primary" (click)="goToDetail(r.ico)">Detail</button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;" class="clickable-row" (click)="goToDetail(row.ico)"></tr>
        </table>
        <mat-paginator
          [length]="total"
          [pageSize]="pageSize"
          [pageIndex]="pageIndex"
          [hidePageSize]="true"
          (page)="onPage($event)">
        </mat-paginator>
      </div>

      <div *ngIf="!loading && searched && results.length === 0 && !error" class="empty-state">
        <mat-icon>search_off</mat-icon>
        <p>Žádné výsledky pro "{{ query }}"</p>
      </div>
    </div>
  `,
  styles: [`
    .search-page { padding: 24px; max-width: 1000px; margin: 0 auto; }
    h1 { margin-bottom: 24px; }
    .search-bar { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; }
    .search-field { flex: 1; }
    .results-table { width: 100%; }
    .clickable-row { cursor: pointer; }
    .clickable-row:hover { background: #f5f5f5; }
    .result-count { color: #666; margin-bottom: 8px; }
    .error-msg { color: #f44336; margin: 16px 0; }
    .limit-msg { color: #555; }
    .login-link { color: #1565c0; margin-left: 8px; }
    .empty-state { text-align: center; padding: 48px; color: #999; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .chip-active { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-inactive { background: #fce4ec !important; color: #c62828 !important; }
  `]
})
export class SearchComponent {
  private searchService = inject(SearchService);
  private router = inject(Router);

  query = '';
  results: SubjectSummary[] = [];
  total = 0;
  loading = false;
  searched = false;
  error = '';
  limitReached = false;
  columns = ['ico', 'name', 'address', 'status', 'actions'];
  readonly pageSize = 20;
  pageIndex = 0;

  search() {
    if (!this.query.trim()) return;
    this.pageIndex = 0;
    this.fetchPage(0);
  }

  onPage(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.fetchPage(event.pageIndex * this.pageSize);
  }

  private fetchPage(start: number) {
    const isIco = /^\d{8}$/.test(this.query.trim());
    if (isIco) {
      this.router.navigate(['/search', this.query.trim()]);
      return;
    }

    this.loading = true;
    this.error = '';
    this.limitReached = false;
    this.results = [];
    this.searched = false;

    this.searchService.searchByName(this.query, start).subscribe({
      next: (res) => {
        this.results = res.items;
        this.total = res.total;
        this.loading = false;
        this.searched = true;
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 429) {
          this.limitReached = true;
        } else {
          this.error = 'Chyba při vyhledávání. Zkuste to prosím znovu.';
        }
        this.loading = false;
        this.searched = true;
      }
    });
  }

  goToDetail(ico: string) {
    this.router.navigate(['/search', ico]);
  }
}
