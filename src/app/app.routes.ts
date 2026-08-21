import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.page').then((module) => module.LoginPage),
  },
  {
    path: 'app/home/overview',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/overview/overview.page').then((module) => module.OverviewPage),
  },
  {
    path: 'app/home/currency/:scenario',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/currency/currency.page').then((module) => module.CurrencyPage),
  },
  {
    path: 'app/home/analytics',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/analytics/analytics.page').then((module) => module.AnalyticsPage),
  },
  {
    path: 'app/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/coming-soon/coming-soon.page').then((module) => module.ComingSoonPage),
    data: { title: 'Create a plan', icon: 'add-circle-outline' },
  },
  {
    path: 'app/security',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/coming-soon/coming-soon.page').then((module) => module.ComingSoonPage),
    data: { title: 'Security', icon: 'shield-checkmark-outline' },
  },
  {
    path: 'app/settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/coming-soon/coming-soon.page').then((module) => module.ComingSoonPage),
    data: { title: 'Settings', icon: 'settings-outline' },
  },
  { path: 'app', pathMatch: 'full', redirectTo: 'app/home/overview' },
  { path: '', pathMatch: 'full', redirectTo: 'app/home/overview' },
  { path: '**', redirectTo: 'app/home/overview' },
];
