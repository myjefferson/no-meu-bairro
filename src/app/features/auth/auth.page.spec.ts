import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../core/auth.service';
import { AuthPage } from './auth.page';

describe('AuthPage', () => {
  function setup() {
    const auth = {
      login: vi.fn().mockResolvedValue(undefined),
      register: vi.fn().mockResolvedValue(true),
    };
    const router = { navigateByUrl: vi.fn().mockResolvedValue(true) };
    TestBed.configureTestingModule({ providers: [
      { provide: AuthService, useValue: auth },
      { provide: Router, useValue: router },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
    ] });
    return { page: TestBed.runInInjectionContext(() => new AuthPage()), auth, router };
  }
  it('não envia login inválido', async () => {
    const { page, auth } = setup();
    await page.submit();
    expect(auth.login).not.toHaveBeenCalled();
    expect(page.form.controls.email.touched).toBe(true);
  });
  it('faz login e navega para a lista', async () => {
    const { page, auth, router } = setup();
    page.form.patchValue({ email: 'ana@example.com', password: '12345678' });
    await page.submit();
    expect(auth.login).toHaveBeenCalledWith('ana@example.com', '12345678');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/ocorrencias');
  });
  it('explica login recusado', async () => {
    const { page, auth, router } = setup();
    auth.login.mockRejectedValue({ code: 'invalid_credentials' });
    page.form.patchValue({ email: 'ana@example.com', password: '12345678' });
    await page.submit();
    expect(page.error()).toContain('E-mail ou senha inválidos');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
  it('cadastra e orienta confirmação por e-mail', async () => {
    const { page, auth, router } = setup();
    auth.register.mockResolvedValue(false);
    page.toggle();
    page.form.setValue({ name: 'Ana', email: 'ana@example.com', password: '12345678' });
    await page.submit();
    expect(auth.register).toHaveBeenCalledWith('Ana', 'ana@example.com', '12345678');
    expect(page.message()).toContain('Confirme seu e-mail');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
