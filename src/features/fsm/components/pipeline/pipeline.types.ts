export type PipelineEntity = 'leads' | 'interventions' | 'quotes' | 'invoices';

export type KanbanTone =
  | 'violet'
  | 'emerald'
  | 'amber'
  | 'blue'
  | 'gray'
  | 'red'
  | 'indigo';

export interface BoardCard {
  id: string;
  status: string;
  title: string;
  subtitle: string | null;
  amount: number | null;
  meta: string | null;
}

export interface BoardColumn {
  status: string;
  total: number;
  cards: BoardCard[];
  nextCursor: string | null;
}

export interface BoardResponse {
  entity: PipelineEntity;
  columns: BoardColumn[];
}

export interface ColumnPage {
  status: string;
  cards: BoardCard[];
  nextCursor: string | null;
}
