import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { CreatePage } from './create.page';
import { OccurrencesService } from './occurrences.service';

describe('CreatePage', () => {
  function setup() {
    const service = {
      categories: vi.fn().mockResolvedValue([{ id: 'cat-1', nome: 'Buraco na via', descricao: null }]),
      create: vi.fn().mockResolvedValue('occ-1'),
    };
    const router = { navigate: vi.fn().mockResolvedValue(true) };
    TestBed.configureTestingModule({ providers: [
      { provide: OccurrencesService, useValue: service }, { provide: Router, useValue: router },
    ] });
    const page = TestBed.runInInjectionContext(() => new CreatePage());
    return { page, service, router };
  }
  it('exige categoria, descrição e local', async () => {
    const { page, service } = setup();
    await Promise.resolve();
    await page.submit();
    expect(page.form.invalid).toBe(true);
    expect(service.create).not.toHaveBeenCalled();
  });
  it('recusa descrição curta', async () => {
    const { page } = setup();
    await Promise.resolve();
    page.form.setValue({ category_id: 'cat-1', descricao: 'curta', endereco: 'Rua Principal' });
    expect(page.form.controls.descricao.invalid).toBe(true);
  });
  it('cria e navega para detalhes', async () => {
    const { page, service, router } = setup();
    await Promise.resolve();
    page.form.setValue({ category_id: 'cat-1', descricao: 'Buraco grande na rua', endereco: 'Rua Principal' });
    await page.submit();
    expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ photo: null }));
    expect(router.navigate).toHaveBeenCalledWith(['/ocorrencias', 'occ-1'], { state: { created: true } });
  });
  it('bloqueia envio duplicado enquanto salva', async () => {
    const { page, service } = setup();
    await Promise.resolve();
    page.form.setValue({ category_id: 'cat-1', descricao: 'Buraco grande na rua', endereco: 'Rua Principal' });
    let finish!: (id: string) => void;
    service.create.mockReturnValue(new Promise<string>(resolve => { finish = resolve; }));
    const pending = page.submit();
    await page.submit();
    expect(service.create).toHaveBeenCalledOnce();
    finish('occ-1');
    await pending;
  });
});
