import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { DetailPage } from './detail.page';
import { OccurrencesService } from './occurrences.service';

const id = '123e4567-e89b-12d3-a456-426614174000';
const occurrence = {
  id, user_id: 'user-1', category_id: 'cat-1', descricao: 'Buraco grande na rua',
  endereco: 'Rua Principal, 10', photo_url: null, status: 'em_analise',
  created_at: '2026-11-10T12:00:00Z', categories: { nome: 'Buraco na via' },
  occurrence_status_history: [
    { id: 'h1', status: 'registrada', observacao: null, created_at: '2026-11-10T12:00:00Z' },
    { id: 'h2', status: 'em_analise', observacao: 'Em análise', created_at: '2026-11-12T12:00:00Z' },
  ],
};

describe('DetailPage', () => {
  async function setup(item: unknown) {
    const service = { detail: vi.fn().mockResolvedValue(item), photoUrl: vi.fn().mockResolvedValue('https://example.test/photo') };
    TestBed.configureTestingModule({ providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id }) } } },
      { provide: OccurrencesService, useValue: service },
    ] });
    const fixture = TestBed.createComponent(DetailPage);
    fixture.detectChanges(); await fixture.componentInstance.load(); fixture.detectChanges();
    return { fixture, service };
  }
  it('distingue status atual e histórico com várias entradas', async () => {
    const { fixture } = await setup(occurrence);
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Status atual');
    expect(text).toContain('Histórico de status');
    expect(fixture.nativeElement.querySelectorAll('ol li').length).toBe(2);
    expect(fixture.nativeElement.querySelector('a[href="/ocorrencias"]')).toBeTruthy();
  });
  it('informa quando não existe ou não há acesso', async () => {
    const { fixture } = await setup(null);
    expect(fixture.nativeElement.textContent).toContain('Ocorrência não encontrada');
    expect(fixture.nativeElement.textContent).toContain('você não tem acesso');
  });
  it('exibe foto opcional por URL assinada', async () => {
    const { fixture, service } = await setup({ ...occurrence, photo_url: 'user-1/photo.jpg' });
    expect(service.photoUrl).toHaveBeenCalledWith('user-1/photo.jpg');
    expect(fixture.nativeElement.querySelector('img')?.getAttribute('alt')).toContain('Rua Principal, 10');
  });
  it('mantém os detalhes quando a foto falha', async () => {
    const { fixture, service } = await setup({ ...occurrence, photo_url: 'user-1/photo.jpg' });
    service.photoUrl.mockRejectedValue(new Error('storage'));
    await fixture.componentInstance.load(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Buraco grande na rua');
    expect(fixture.nativeElement.textContent).toContain('Não foi possível carregar a foto');
  });
});
