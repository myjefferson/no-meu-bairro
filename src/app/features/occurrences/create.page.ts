import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Category } from '../../models/occurrence';
import { friendlyError } from '../../shared/error-message';
import { OccurrencesService } from './occurrences.service';

@Component({ selector: 'app-create-page', standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <header class="site-header"><div class="container header-inner"><a routerLink="/ocorrencias" class="brand"><span aria-hidden="true">⌂</span> No Meu Bairro</a></div></header>
    <main id="conteudo" class="container page narrow">
      <a routerLink="/ocorrencias" class="back-link">← Voltar para ocorrências</a>
      <p class="eyebrow">NOVA OCORRÊNCIA</p><h1>Registrar ocorrência</h1>
      <p class="muted">Descreva o que aconteceu e onde. Uma foto pode ajudar, mas é opcional.</p>
      @if (error()) { <p role="alert" class="error">{{ error() }}</p> }
      <mat-card><mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline"><mat-label>Categoria</mat-label>
            <mat-select formControlName="category_id"><mat-option value="">Selecione</mat-option>
              @for (category of categories(); track category.id) { <mat-option [value]="category.id">{{ category.nome }}</mat-option> }
            </mat-select>
            @if (form.controls.category_id.invalid && form.controls.category_id.touched) { <mat-error>Selecione uma categoria.</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Descrição</mat-label><textarea matInput formControlName="descricao" rows="5" maxlength="1000"></textarea>
            <mat-hint>De 10 a 1000 caracteres.</mat-hint>
            @if (form.controls.descricao.invalid && form.controls.descricao.touched) { <mat-error>Descreva a situação com pelo menos 10 caracteres.</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Endereço ou ponto de referência</mat-label><input matInput formControlName="endereco" maxlength="300" />
            <mat-hint>Informe um local que permita identificar a ocorrência.</mat-hint>
            @if (form.controls.endereco.invalid && form.controls.endereco.touched) { <mat-error>Informe um local com pelo menos 5 caracteres.</mat-error> }
          </mat-form-field>
          <div class="file-field"><label for="photo">Foto (opcional)</label><input id="photo" type="file" accept="image/jpeg,image/png,image/webp" (change)="selectPhoto($event)" />
            <p class="muted">JPG, PNG ou WebP. Até 5 MB.</p></div>
          <div class="actions"><a mat-button routerLink="/ocorrencias">Cancelar</a><button mat-flat-button class="cta" type="submit" [disabled]="busy() || categoriesLoading()">
            {{ busy() ? 'Registrando...' : 'Registrar ocorrência' }}</button></div>
        </form>
      </mat-card-content></mat-card>
    </main>`,
  styles: [`mat-card { margin-top:1.5rem; box-shadow:none; border:1px solid #d9e0eb } mat-card-content { padding:1.5rem !important }
    form { display:grid; gap:1.2rem } mat-form-field { width:100% } .file-field { display:grid; gap:.4rem } .file-field label { font-weight:700 }
    input[type=file] { width:100%; padding:.8rem; border:1px solid #71829b; border-radius:8px } .file-field p { margin:0 }
    .actions { display:flex; justify-content:flex-end; align-items:center; gap:1rem; flex-wrap:wrap }
    @media(max-width:500px) { .actions>* { width:100% } }`],
})
export class CreatePage {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(OccurrencesService);
  private readonly router = inject(Router);
  readonly categories = signal<Category[]>([]);
  readonly categoriesLoading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly photo = signal<File | null>(null);
  readonly form = this.fb.nonNullable.group({
    category_id: ['', Validators.required],
    descricao: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    endereco: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
  });
  constructor() { void this.loadCategories(); }
  async loadCategories(): Promise<void> {
    try { this.categories.set(await this.service.categories()); }
    catch (error) { this.error.set(friendlyError(error)); }
    finally { this.categoriesLoading.set(false); }
  }
  selectPhoto(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) { this.photo.set(null); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.error.set('Escolha uma foto JPG, PNG ou WebP de até 5 MB.'); this.photo.set(null);
      (event.target as HTMLInputElement).value = ''; return;
    }
    this.error.set(''); this.photo.set(file);
  }
  async submit(): Promise<void> {
    if (this.busy()) return;
    if (this.form.invalid || !this.categories().some(c => c.id === this.form.controls.category_id.value)) {
      this.form.markAllAsTouched(); this.error.set('Revise os campos obrigatórios antes de continuar.'); return;
    }
    this.busy.set(true); this.error.set('');
    try {
      const id = await this.service.create({ ...this.form.getRawValue(), photo: this.photo() });
      await this.router.navigate(['/ocorrencias', id], { state: { created: true } });
    } catch (error) { this.error.set(friendlyError(error)); }
    finally { this.busy.set(false); }
  }
}
