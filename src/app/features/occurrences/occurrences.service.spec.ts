import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../../core/supabase.service';
import { OccurrencesService } from './occurrences.service';

describe('OccurrencesService', () => {
  function setup() {
    const single = vi.fn().mockResolvedValue({ data: { id: 'occ-1' }, error: null });
    const insert = vi.fn().mockReturnValue({ select: () => ({ single }) });
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const select = vi.fn().mockReturnValue({ order });
    const upload = vi.fn().mockResolvedValue({ error: null });
    const remove = vi.fn().mockResolvedValue({ error: null });
    const client = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }) },
      from: vi.fn().mockReturnValue({ insert, select }),
      storage: { from: vi.fn().mockReturnValue({ upload, remove }) },
    };
    TestBed.configureTestingModule({ providers: [{ provide: SupabaseService, useValue: { requireClient: () => client } }] });
    return { service: TestBed.inject(OccurrencesService), insert, upload, remove, single, order };
  }
  it('retorna lista vazia', async () => {
    const { service } = setup();
    expect(await service.list()).toEqual([]);
  });
  it('retorna dados da lista', async () => {
    const { service, order } = setup();
    order.mockResolvedValue({ data: [{ id: 'occ-1', status: 'registrada' }], error: null });
    expect((await service.list())[0].id).toBe('occ-1');
  });
  it('propaga erro da lista', async () => {
    const { service, order } = setup();
    order.mockResolvedValue({ data: null, error: new Error('network') });
    await expect(service.list()).rejects.toThrow('network');
  });
  it('cria ocorrência sem foto', async () => {
    const { service, insert, upload } = setup();
    expect(await service.create({ category_id: 'cat-1', descricao: 'Buraco grande', endereco: 'Rua Principal, 10', photo: null })).toBe('occ-1');
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1', category_id: 'cat-1' }));
    expect(upload).not.toHaveBeenCalled();
  });
  it('envia foto antes de criar ocorrência', async () => {
    const { service, insert, upload } = setup();
    const photo = new File(['foto'], 'foto.jpg', { type: 'image/jpeg' });
    await service.create({ category_id: 'cat-1', descricao: 'Buraco grande', endereco: 'Rua Principal, 10', photo });
    expect(upload).toHaveBeenCalledOnce();
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ photo_url: expect.stringMatching(/^user-1\/.+\.jpg$/) }));
  });
  it('não grava ocorrência se upload falhar', async () => {
    const { service, insert, upload } = setup();
    upload.mockResolvedValue({ error: new Error('upload') });
    await expect(service.create({ category_id: 'cat-1', descricao: 'Buraco grande', endereco: 'Rua Principal, 10', photo: new File(['x'], 'x.jpg', { type: 'image/jpeg' }) })).rejects.toThrow('upload');
    expect(insert).not.toHaveBeenCalled();
  });
  it('remove foto se banco falhar', async () => {
    const { service, single, remove } = setup();
    single.mockResolvedValue({ data: null, error: new Error('db') });
    await expect(service.create({ category_id: 'cat-1', descricao: 'Buraco grande', endereco: 'Rua Principal, 10', photo: new File(['x'], 'x.jpg', { type: 'image/jpeg' }) })).rejects.toThrow('db');
    expect(remove).toHaveBeenCalledOnce();
  });
});
