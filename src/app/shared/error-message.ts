export function friendlyError(error: unknown): string {
  if (error instanceof Error && error.message.includes('Configure a URL')) return error.message;
  return 'Não foi possível concluir a operação. Verifique sua conexão e tente novamente.';
}
