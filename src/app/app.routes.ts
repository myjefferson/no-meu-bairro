import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'ocorrencias' },
  { path: 'entrar', canActivate: [guestGuard], loadComponent: () => import('./features/auth/auth.page').then(m => m.AuthPage) },
  { path: 'ocorrencias', canActivate: [authGuard], loadComponent: () => import('./features/occurrences/list.page').then(m => m.ListPage) },
  { path: 'ocorrencias/nova', canActivate: [authGuard], loadComponent: () => import('./features/occurrences/create.page').then(m => m.CreatePage) },
  { path: 'ocorrencias/:id', canActivate: [authGuard], loadComponent: () => import('./features/occurrences/detail.page').then(m => m.DetailPage) },
  { path: '**', redirectTo: 'ocorrencias' },
];
