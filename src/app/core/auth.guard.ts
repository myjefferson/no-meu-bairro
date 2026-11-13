import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  try { await auth.ready(); } catch { return router.createUrlTree(['/entrar']); }
  return auth.user() ? true : router.createUrlTree(['/entrar'], { queryParams: { retorno: state.url } });
};

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  try { await auth.ready(); } catch { return true; }
  return auth.user() ? router.createUrlTree(['/ocorrencias']) : true;
};
