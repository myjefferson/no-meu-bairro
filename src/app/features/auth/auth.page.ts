import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth.service';
import { friendlyError } from '../../shared/error-message';

@Component({
  selector: 'app-auth-page', standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  template: `
    <main id="conteudo" class="auth-wrap">
      <div class="brand"><span class="brand-mark" aria-hidden="true">⌂</span><span>No Meu Bairro</span></div>
      <mat-card><mat-card-content>
        <h1>{{ registering() ? 'Criar conta' : 'Entrar' }}</h1>
        <p class="muted">Acompanhe as ocorrências que você registrou no seu bairro.</p>
        @if (message()) { <p class="notice" role="status">{{ message() }}</p> }
        @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
        <form [formGroup]="form" (ngSubmit)="submit()">
          @if (registering()) {
            <mat-form-field appearance="outline"><mat-label>Nome</mat-label><input matInput formControlName="name" autocomplete="name" />
              @if (form.controls.name.invalid && form.controls.name.touched) { <mat-error>Informe seu nome.</mat-error> }
            </mat-form-field>
          }
          <mat-form-field appearance="outline"><mat-label>E-mail</mat-label><input matInput type="email" formControlName="email" autocomplete="email" />
            @if (form.controls.email.invalid && form.controls.email.touched) { <mat-error>Informe um e-mail válido.</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Senha</mat-label><input matInput type="password" formControlName="password" [attr.autocomplete]="registering() ? 'new-password' : 'current-password'" />
            @if (form.controls.password.invalid && form.controls.password.touched) { <mat-error>Use pelo menos 8 caracteres.</mat-error> }
          </mat-form-field>
          <button mat-flat-button class="primary-button" type="submit" [disabled]="busy()">{{ registering() ? 'Criar conta' : 'Entrar' }}</button>
        </form>
        <button mat-button type="button" (click)="toggle()">{{ registering() ? 'Já tenho conta' : 'Criar uma conta' }}</button>
      </mat-card-content></mat-card>
    </main>
  `,
  styles: [`:host { display:block; flex:1; background:#f4f6fb } .auth-wrap { max-width:480px; margin:auto; padding:clamp(1rem, 3dvh, 2rem) 1rem }
    .brand { display:flex; align-items:center; gap:.75rem; color:#17478e; font-size:1.5rem; font-weight:800; margin-bottom:1.25rem }
    .brand-mark { display:grid; place-items:center; width:2.7rem; height:2.7rem; border-radius:12px; background:#17478e; color:white }
    mat-card-content { padding:1.5rem !important } h1 { margin:.2rem 0 .4rem } form { display:grid; gap:.45rem; margin-top:1.5rem }
    mat-form-field { width:100% } .primary-button { min-height:48px } .muted { color:#4d5c6b }`],
})
export class AuthPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly registering = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly message = signal('');
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  toggle(): void { this.registering.update(value => !value); this.error.set(''); this.message.set(''); }
  async submit(): Promise<void> {
    if (this.busy()) return;
    const { name, email, password } = this.form.getRawValue();
    if (this.form.controls.email.invalid || this.form.controls.password.invalid || (this.registering() && this.form.controls.name.invalid)) {
      this.form.markAllAsTouched(); return;
    }
    this.busy.set(true); this.error.set(''); this.message.set('');
    try {
      if (this.registering()) {
        const active = await this.auth.register(name, email, password);
        if (!active) { this.message.set('Conta criada. Confirme seu e-mail para entrar.'); this.registering.set(false); return; }
      } else await this.auth.login(email, password);
      const returnTo = this.route.snapshot.queryParamMap.get('retorno');
      await this.router.navigateByUrl(returnTo?.startsWith('/ocorrencias') ? returnTo : '/ocorrencias');
    } catch (error) { this.error.set(friendlyError(error)); }
    finally { this.busy.set(false); }
  }
}
