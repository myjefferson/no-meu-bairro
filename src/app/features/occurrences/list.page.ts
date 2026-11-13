import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth.service';
import { Occurrence } from '../../models/occurrence';
import { StatusComponent } from '../../shared/status.component';
import { friendlyError } from '../../shared/error-message';
import { OccurrencesService } from './occurrences.service';

@Component({ selector: 'app-list-page', standalone: true,
  imports: [DatePipe, RouterLink, MatButtonModule, MatCardModule, MatProgressSpinnerModule, StatusComponent],
  template: `
    <header class="site-header"><div class="container header-inner"><a routerLink="/ocorrencias" class="brand"><span aria-hidden="true">⌂</span> No Meu Bairro</a>
      <button mat-button type="button" (click)="logout()">Sair</button></div></header>
    <main id="conteudo" class="container page">
      <div class="page-heading"><div><p class="eyebrow">MINHAS OCORRÊNCIAS</p><h1>O que acontece no seu bairro</h1>
        <p class="muted">Registre e acompanhe as situações que precisam de atenção.</p></div>
        <a mat-flat-button routerLink="/ocorrencias/nova" class="cta">Registrar ocorrência</a></div>
      @if (success()) { <p class="notice" role="status">Ocorrência registrada com sucesso.</p> }
      @if (loading()) { <div class="state" role="status"><mat-spinner diameter="36" aria-label="Carregando ocorrências" /> <p>Carregando ocorrências...</p></div> }
      @else if (error()) { <div class="state error" role="alert"><p>{{ error() }}</p><button mat-stroked-button (click)="load()">Tentar novamente</button></div> }
      @else if (!occurrences().length) { <div class="state empty"><span aria-hidden="true">⌂</span><h2>Nenhuma ocorrência registrada ainda.</h2>
        <p>Comece informando uma situação do seu bairro.</p><a mat-flat-button routerLink="/ocorrencias/nova" class="cta">Registrar primeira ocorrência</a></div> }
      @else { <section aria-label="Lista de ocorrências" class="list">
        @for (item of occurrences(); track item.id) {
          <mat-card class="occurrence-card"><mat-card-content>
            <div class="card-top"><span class="category">{{ item.categories?.nome || 'Categoria' }}</span><app-status [status]="item.status" /></div>
            <h2>{{ item.descricao }}</h2><p class="muted">{{ item.endereco }}</p>
            <div class="card-bottom"><time [attr.datetime]="item.created_at">{{ item.created_at | date:'dd/MM/yyyy' }}</time>
              <a mat-button [routerLink]="['/ocorrencias', item.id]" [attr.aria-label]="'Ver detalhes da ocorrência em ' + item.endereco">Ver detalhes →</a></div>
          </mat-card-content></mat-card>
        }
      </section> }
    </main>`,
  styles: [`.page-heading { display:flex; justify-content:space-between; align-items:end; gap:1.5rem; margin-bottom:2rem }
    .page-heading h1 { max-width:16ch } .list { display:grid; gap:1rem } .occurrence-card { border:1px solid #d9e0eb; box-shadow:none }
    mat-card-content { padding:1.3rem !important } .card-top,.card-bottom { display:flex; align-items:center; justify-content:space-between; gap:1rem }
    .card-top { flex-wrap:wrap } h2 { font-size:1.15rem; line-height:1.4; margin:1rem 0 .3rem; overflow-wrap:anywhere }
    .category { font-weight:700; color:#17478e } .card-bottom { border-top:1px solid #e5eaf1; margin-top:1rem; padding-top:.6rem }
    .state { min-height:280px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2rem; border:1px dashed #bbc7d8; border-radius:16px; background:white }
    .empty span { font-size:2rem; color:#17478e } .state h2 { margin:.4rem 0 } @media(max-width:640px) { .page-heading { align-items:stretch; flex-direction:column } .page-heading .cta { width:100% } }`],
})
export class ListPage {
  private readonly service = inject(OccurrencesService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly occurrences = signal<Occurrence[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal(Boolean(history.state?.created));
  constructor() { void this.load(); }
  async load(): Promise<void> {
    this.loading.set(true); this.error.set('');
    try { this.occurrences.set(await this.service.list()); }
    catch (error) { this.error.set(friendlyError(error)); }
    finally { this.loading.set(false); }
  }
  async logout(): Promise<void> {
    try { await this.auth.logout(); await this.router.navigateByUrl('/entrar'); }
    catch (error) { this.error.set(friendlyError(error)); }
  }
}
