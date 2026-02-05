import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component'),
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component'),
    canActivate: [authGuard]
  },
  {
    path: 'attendances/:group',
    loadComponent: () => import('./features/attendances/attendances.component'),
    canActivate: [authGuard]
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/reports.component'),
    canActivate: [authGuard]
  },
  {
    path: 'stats',
    loadComponent: () => import('./features/stats/stats.component'),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
