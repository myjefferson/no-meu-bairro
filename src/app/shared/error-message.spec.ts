import { describe, expect, it } from 'vitest';
import { friendlyError } from './error-message';

describe('friendlyError', () => {
  it('explica credenciais inválidas sem expor o erro do provedor', () => {
    expect(friendlyError({ code: 'invalid_credentials', message: 'Invalid login credentials' }))
      .toContain('E-mail ou senha inválidos');
  });
  it('orienta sobre e-mail não confirmado', () => {
    expect(friendlyError({ code: 'email_not_confirmed' })).toContain('Confirme seu e-mail');
  });
  it('usa mensagem genérica para erro desconhecido', () => {
    expect(friendlyError(new Error('internal'))).toContain('Verifique sua conexão');
  });
});
