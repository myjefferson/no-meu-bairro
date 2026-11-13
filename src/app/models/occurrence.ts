export type OccurrenceStatus = 'registrada' | 'em_analise' | 'concluida';
export interface Category { id: string; nome: string; descricao: string | null; }
export interface StatusHistory { id: string; status: OccurrenceStatus; observacao: string | null; created_at: string; }
export interface Occurrence {
  id: string; user_id: string; category_id: string; descricao: string; endereco: string;
  photo_url: string | null; status: OccurrenceStatus; created_at: string;
  categories: { nome: string } | null; occurrence_status_history?: StatusHistory[];
}
export const STATUS_LABEL: Record<OccurrenceStatus, string> = {
  registrada: 'Registrada', em_analise: 'Em análise', concluida: 'Concluída',
};
export const STATUS_ICON: Record<OccurrenceStatus, string> = {
  registrada: '●', em_analise: '◐', concluida: '✓',
};
