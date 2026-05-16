import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./public/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'ceny', loadComponent: () => import('./public/pricing/pricing.component').then(m => m.PricingComponent) },
  { path: 'kontakt', loadComponent: () => import('./public/contact/contact.component').then(m => m.ContactComponent) },
  { path: 'obchodni-podminky', loadComponent: () => import('./public/legal-terms/legal-terms.component').then(m => m.LegalTermsComponent) },
  { path: 'gdpr', loadComponent: () => import('./public/legal-gdpr/legal-gdpr.component').then(m => m.LegalGdprComponent) },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'search', loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent) },
  { path: 'search/:ico', loadComponent: () => import('./features/search/subject-detail/subject-detail.component').then(m => m.SubjectDetailComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
];
