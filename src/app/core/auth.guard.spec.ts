import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  function setup(signedIn: boolean) {
    const auth = { ready: vi.fn().mockResolvedValue(undefined), user: vi.fn().mockReturnValue(signedIn ? { id: 'user-1' } : null) };
    const router = { createUrlTree: vi.fn().mockReturnValue({ redirect: true }) };
    TestBed.configureTestingModule({ providers: [{ provide: AuthService, useValue: auth }, { provide: Router, useValue: router }] });
    return { auth, router };
  }
  it('redireciona a rota protegida sem sessão', async () => {
    const { router } = setup(false);
    const result = await TestBed.runInInjectionContext(() => authGuard({} as never, { url: '/ocorrencias' } as never));
    expect(result).toEqual({ redirect: true });
    expect(router.createUrlTree).toHaveBeenCalledWith(['/entrar'], { queryParams: { retorno: '/ocorrencias' } });
  });
  it('libera a rota protegida com sessão', async () => {
    setup(true);
    expect(await TestBed.runInInjectionContext(() => authGuard({} as never, { url: '/ocorrencias' } as never))).toBe(true);
  });
});
