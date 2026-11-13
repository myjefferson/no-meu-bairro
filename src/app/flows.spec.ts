import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it, vi } from 'vitest';
import { routes } from './app.routes';
import { AuthService } from './core/auth.service';
import { OccurrencesService } from './features/occurrences/occurrences.service';
import { AuthPage } from './features/auth/auth.page';

const id = '123e4567-e89b-12d3-a456-426614174000';
const item = {
  id, user_id: 'user-1', category_id: 'cat-1', descricao: 'Buraco grande na rua',
  endereco: 'Rua Principal, 10', photo_url: null, status: 'registrada',
  created_at: '2026-11-10T12:00:00Z', categories: { nome: 'Buraco na via' },
  occurrence_status_history: [{ id: 'h1', status: 'registrada', observacao: null, created_at: '2026-11-10T12:00:00Z' }],
};

describe('fluxo entre rotas', () => {
  it('login → lista → clique nos detalhes', async () => {
    const user = signal<{ id: string } | null>(null);
    const auth = {
      user,
      ready: vi.fn().mockResolvedValue(undefined),
      login: vi.fn().mockImplementation(async () => { user.set({ id: 'user-1' }); }),
      logout: vi.fn(),
    };
    const occurrences = {
      list: vi.fn().mockResolvedValue([item]),
      detail: vi.fn().mockResolvedValue(item),
      photoUrl: vi.fn(),
    };
    TestBed.configureTestingModule({ providers: [
      provideRouter(routes),
      { provide: AuthService, useValue: auth },
      { provide: OccurrencesService, useValue: occurrences },
    ] });
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/entrar', AuthPage);
    page.form.patchValue({ email: 'ana@example.com', password: '12345678' });
    await page.submit();
    await harness.fixture.whenStable(); harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/ocorrencias');
    expect(occurrences.list).toHaveBeenCalledOnce();
    expect(harness.routeNativeElement?.textContent).toContain('Buraco grande na rua');
    (harness.routeNativeElement?.querySelector(`a[href="/ocorrencias/${id}"]`) as HTMLAnchorElement).click();
    await harness.fixture.whenStable(); harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe(`/ocorrencias/${id}`);
    expect(harness.routeNativeElement?.textContent).toContain('Histórico de status');
  });
});
