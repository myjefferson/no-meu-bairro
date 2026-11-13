import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../core/supabase.service';
import { Category, Occurrence } from '../../models/occurrence';

export interface NewOccurrence { category_id: string; descricao: string; endereco: string; photo: File | null; }

@Injectable({ providedIn: 'root' })
export class OccurrencesService {
  private readonly supabase = inject(SupabaseService);

  async categories(): Promise<Category[]> {
    const { data, error } = await this.supabase.requireClient().from('categories')
      .select('id,nome,descricao').eq('ativo', true).order('nome');
    if (error) throw error;
    return (data ?? []) as Category[];
  }

  async list(): Promise<Occurrence[]> {
    const { data, error } = await this.supabase.requireClient().from('occurrences')
      .select('id,user_id,category_id,descricao,endereco,photo_url,status,created_at,categories(nome)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Occurrence[];
  }

  async detail(id: string): Promise<Occurrence | null> {
    const { data, error } = await this.supabase.requireClient().from('occurrences')
      .select('id,user_id,category_id,descricao,endereco,photo_url,status,created_at,categories(nome),occurrence_status_history(id,status,observacao,created_at)')
      .eq('id', id).maybeSingle();
    if (error) throw error;
    const occurrence = data as unknown as Occurrence | null;
    occurrence?.occurrence_status_history?.sort((a, b) => a.created_at.localeCompare(b.created_at));
    return occurrence;
  }

  async photoUrl(path: string): Promise<string> {
    const { data, error } = await this.supabase.requireClient().storage.from('occurrence-photos')
      .createSignedUrl(path, 3600);
    if (error) throw error;
    return data.signedUrl;
  }

  async create(input: NewOccurrence): Promise<string> {
    const client = this.supabase.requireClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) throw userError ?? new Error('Sessão expirada. Entre novamente.');
    const userId = userData.user.id;
    let photoPath: string | null = null;
    if (input.photo) {
      const extension = input.photo.type === 'image/png' ? 'png' : input.photo.type === 'image/webp' ? 'webp' : 'jpg';
      photoPath = `${userId}/${crypto.randomUUID()}.${extension}`;
      const { error } = await client.storage.from('occurrence-photos').upload(photoPath, input.photo, {
        contentType: input.photo.type, upsert: false,
      });
      if (error) throw error;
    }
    const { data, error } = await client.from('occurrences').insert({
      user_id: userId, category_id: input.category_id, descricao: input.descricao.trim(),
      endereco: input.endereco.trim(), photo_url: photoPath,
    }).select('id').single();
    if (error) {
      if (photoPath) await client.storage.from('occurrence-photos').remove([photoPath]);
      throw error;
    }
    return data.id as string;
  }
}
