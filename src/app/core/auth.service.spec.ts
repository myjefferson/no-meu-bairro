import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

describe('AuthService', () => {
  function setup() {
    const user = { id: 'user-1' };
    const auth = {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user } }, error: null }),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { session: { user } }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    };
    TestBed.configureTestingModule({ providers: [{ provide: SupabaseService, useValue: { client: { auth }, requireClient: () => ({ auth }) } }] });
    return { service: TestBed.inject(AuthService), auth };
  }
  it('recupera a sessão após iniciar novamente', async () => {
    const { service } = setup();
    await service.ready();
    expect(service.user()?.id).toBe('user-1');
  });
  it('faz login e logout', async () => {
    const { service, auth } = setup();
    await service.login('a@b.com', '12345678');
    expect(auth.signInWithPassword).toHaveBeenCalled();
    expect(service.user()?.id).toBe('user-1');
    await service.logout();
    expect(service.user()).toBeNull();
  });
  it('propaga falha no login', async () => {
    const { service, auth } = setup();
    auth.signInWithPassword.mockResolvedValue({ data: {}, error: new Error('invalid') });
    await expect(service.login('a@b.com', 'errada')).rejects.toThrow('invalid');
  });
  it('cadastra novo usuário', async () => {
    const { service, auth } = setup();
    expect(await service.register('Ana', 'a@b.com', '12345678')).toBe(true);
    expect(auth.signUp).toHaveBeenCalledWith({ email: 'a@b.com', password: '12345678', options: { data: { nome: 'Ana' } } });
  });
});
