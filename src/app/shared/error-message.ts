export function friendlyError(error: unknown): string {
  if (error instanceof Error && error.message.includes('Configure a URL')) return error.message;
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  if (code === 'invalid_credentials') return 'E-mail ou senha inválidos. Confira os dados e tente novamente.';
  if (code === 'email_not_confirmed') return 'Confirme seu e-mail antes de entrar.';
  if (code === 'user_already_exists') return 'Este e-mail já possui uma conta. Tente entrar.';
  if (code === 'over_email_send_rate_limit') return 'O limite temporário de envio de e-mails foi atingido. Aguarde e tente novamente mais tarde.';
  if (code === '23503') return 'Categoria indisponível. Atualize a página e tente novamente.';
  if (code === '42501') return 'Você não tem permissão para esta operação. Entre novamente.';
  return 'Não foi possível concluir a operação. Verifique sua conexão e tente novamente.';
}
