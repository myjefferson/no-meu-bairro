import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../core/auth.service';
import { ListPage } from './list.page';
import { OccurrencesService } from './occurrences.service';

const occurrence = {
  id: '123e4567-e89b-12d3-a456-426614174000', user_id: 'user-1', category_id: 'cat-1',
  descricao: 'Buraco grande na rua', endereco: 'Rua Principal, 10', photo_url: null,
  status: 'registrada', created_at: '2026-11-10T12:00:00Z', categories: { nome: 'Buraco na via' },
};

describe('ListPage', () => {
  async function setup(result: Promise<unknown>) {
    const service = { list: vi.fn().mockReturnValue(result) };
    TestBed.configureTestingModule({ providers: [
      provideRouter([]),
      { provide: OccurrencesService, useValue: service },
      { provide: AuthService, useValue: { logout: vi.fn() } },
    ] });
    const fixture = TestBed.createComponent(ListPage);
    fixture.detectChanges();
    return { fixture, page: fixture.componentInstance, service };
  }
  it('mostra loading enquanto busca dados', async () => {
    const { fixture, page } = await setup(new Promise(() => {}));
    expect(page.loading()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Carregando ocorrências');
  });
  it('mostra estado vazio e CTA', async () => {
    const { fixture } = await setup(Promise.resolve([]));
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nenhuma ocorrência registrada ainda.');
    expect(fixture.nativeElement.textContent).toContain('Registrar primeira ocorrência');
    expect(fixture.nativeElement.querySelector('a[href="/ocorrencias/nova"]')).toBeTruthy();
  });
  it('mostra dados, status textual e link dos detalhes', async () => {
    const { fixture } = await setup(Promise.resolve([occurrence]));
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Buraco na via');
    expect(fixture.nativeElement.textContent).toContain('Registrada');
    expect(fixture.nativeElement.querySelector(`a[href="/ocorrencias/${occurrence.id}"]`)).toBeTruthy();
  });
  it('mostra erro e opção de repetir', async () => {
    const { fixture } = await setup(Promise.reject(new Error('network')));
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Tentar novamente');
  });
});
