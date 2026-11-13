import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Occurrence } from '../../models/occurrence';
import { StatusComponent } from '../../shared/status.component';
import { friendlyError } from '../../shared/error-message';
import { OccurrencesService } from './occurrences.service';

@Component({ selector: 'app-detail-page', standalone: true,
  imports: [DatePipe, RouterLink, MatButtonModule, MatCardModule, MatProgressSpinnerModule, StatusComponent],
  template: `
    <header class="site-header"><div class="container header-inner"><a routerLink="/ocorrencias" class="brand"><span aria-hidden="true">⌂</span> No Meu Bairro</a></div></header>
    <main id="conteudo" class="container page narrow">
      <a routerLink="/ocorrencias" class="back-link">← Voltar para ocorrências</a>
      @if (created()) { <p class="notice" role="status">Ocorrência registrada com sucesso.</p> }
      @if (loading()) { <div class="state" role="status"><mat-spinner diameter="36" aria-label="Carregando detalhes" /><p>Carregando detalhes...</p></div> }
      @else if (error()) { <div class="state error" role="alert"><p>{{ error() }}</p><button mat-stroked-button (click)="load()">Tentar novamente</button></div> }
      @else if (!occurrence()) { <div class="state"><h1>Ocorrência não encontrada</h1><p>Ela pode não existir ou você não tem acesso.</p></div> }
      @else { @let item = occurrence()!;
        <p class="eyebrow">DETALHES DA OCORRÊNCIA</p><h1>{{ item.categories?.nome || 'Ocorrência' }}</h1>
        <p class="muted">Registrada em <time [attr.datetime]="item.created_at">{{ item.created_at | date:'dd/MM/yyyy, HH:mm' }}</time></p>
        <mat-card class="detail-card"><mat-card-content>
          <section aria-labelledby="status-heading" class="current-status"><h2 id="status-heading">Status atual</h2><app-status [status]="item.status" /></section>
          <section aria-labelledby="description-heading"><h2 id="description-heading">Descrição</h2><p class="body-text">{{ item.descricao }}</p></section>
          <section aria-labelledby="address-heading"><h2 id="address-heading">Localização</h2><p>{{ item.endereco }}</p></section>
          @if (photoUrl()) { <section aria-labelledby="photo-heading"><h2 id="photo-heading">Foto</h2><img [src]="photoUrl()" [alt]="'Foto da ocorrência em ' + item.endereco" /></section> }
        </mat-card-content></mat-card>
        <section class="history" aria-labelledby="history-heading"><h2 id="history-heading">Histórico de status</h2>
          <ol>@for (entry of item.occurrence_status_history ?? []; track entry.id) {
            <li><app-status [status]="entry.status" /><time [attr.datetime]="entry.created_at">{{ entry.created_at | date:'dd/MM/yyyy, HH:mm' }}</time>
              @if (entry.observacao) { <p>{{ entry.observacao }}</p> }</li>
          }</ol>
        </section>
      }
    </main>`,
  styles: [`.detail-card { margin-top:1.5rem; border:1px solid #d9e0eb; box-shadow:none } mat-card-content { padding:1.5rem !important }
    mat-card section + section { border-top:1px solid #e5eaf1; margin-top:1.5rem; padding-top:1.5rem } h2 { font-size:1.1rem; margin:0 0 .7rem }
    .current-status { display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap } .current-status h2 { margin:0 }
    .body-text { white-space:pre-wrap; overflow-wrap:anywhere } img { max-width:100%; max-height:440px; border-radius:10px; object-fit:contain }
    .history { margin-top:2rem } ol { list-style:none; margin:0; padding:0 0 0 1.2rem; border-left:2px solid #b8c9df }
    li { position:relative; padding:0 0 1.7rem 1.2rem } li::before { content:''; position:absolute; left:-1.55rem; top:.5rem; width:.65rem; height:.65rem; border-radius:50%; background:#17478e }
    li time { display:block; margin-top:.4rem; color:#4d5c6b }`],
})
export class DetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(OccurrencesService);
  readonly occurrence = signal<Occurrence | null>(null);
  readonly photoUrl = signal('');
  readonly loading = signal(true);
  readonly error = signal('');
  readonly created = signal(Boolean(history.state?.created));
  constructor() { void this.load(); }
  async load(): Promise<void> {
    this.loading.set(true); this.error.set(''); this.photoUrl.set('');
    try {
      const id = this.route.snapshot.paramMap.get('id') ?? '';
      if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id)) { this.occurrence.set(null); return; }
      const item = await this.service.detail(id);
      this.occurrence.set(item);
      if (item?.photo_url) this.photoUrl.set(await this.service.photoUrl(item.photo_url));
    } catch (error) { this.error.set(friendlyError(error)); }
    finally { this.loading.set(false); }
  }
}
