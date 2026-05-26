import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { subscriptionsGuard } from './core/guards/subscriptions.guard';

const childRoutes: Routes = [
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
  { path: 'objednat', canActivate: [authGuard, subscriptionsGuard], loadComponent: () => import('./public/order/order.component').then(m => m.OrderComponent) },
];

export const routes: Routes = [
  ...childRoutes,
  { path: 'en', children: childRoutes },
];
