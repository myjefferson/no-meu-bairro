import { Injectable, inject, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);
  readonly user = signal<User | null>(null);
  private initializing: Promise<void> | null = null;

  ready(): Promise<void> {
    if (!this.initializing) this.initializing = (async () => {
      if (!this.supabase.client) return;
      const { data, error } = await this.supabase.client.auth.getSession();
      if (error) throw error;
      this.user.set(data.session?.user ?? null);
      this.supabase.client.auth.onAuthStateChange((_event, session) => this.user.set(session?.user ?? null));
    })();
    return this.initializing;
  }

  async login(email: string, password: string): Promise<void> {
    const { data, error } = await this.supabase.requireClient().auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.user.set(data.user);
  }

  async register(name: string, email: string, password: string): Promise<boolean> {
    const { data, error } = await this.supabase.requireClient().auth.signUp({
      email, password, options: { data: { nome: name.trim() } },
    });
    if (error) throw error;
    this.user.set(data.session?.user ?? null);
    return Boolean(data.session);
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.requireClient().auth.signOut();
    if (error) throw error;
    this.user.set(null);
  }
}
