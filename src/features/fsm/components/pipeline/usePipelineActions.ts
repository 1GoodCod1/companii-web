import { useUpdateLeadMutation } from '../../api/useLeads';
import { useUpdateInterventionStatusMutation } from '../../api/useInterventions';
import { useUpdateQuoteMutation } from '../../api/useQuotes';
import type {
  CompanyLeadStatus,
  InterventionStatus,
  QuoteStatus,
} from '@/entities/fsm/model/types';
import type { BoardCard, PipelineEntity } from './pipeline.types';

/**
 * Wires the board's drag-drop moves to the existing per-entity status mutations.
 * Invoices are view-only (money side effects live in the invoice detail).
 */
export function usePipelineActions() {
  const updateLead = useUpdateLeadMutation();
  const updateInterventionStatus = useUpdateInterventionStatusMutation();
  const updateQuote = useUpdateQuoteMutation();

  return {
    move: async (entity: PipelineEntity, card: BoardCard, to: string): Promise<void> => {
      switch (entity) {
        case 'leads':
          await updateLead.mutateAsync({ id: card.id, status: to as CompanyLeadStatus });
          return;
        case 'interventions':
          await updateInterventionStatus.mutateAsync({ id: card.id, status: to as InterventionStatus });
          return;
        case 'quotes':
          await updateQuote.mutateAsync({ id: card.id, status: to as QuoteStatus });
          return;
        case 'invoices':
          return;
      }
    },
  };
}
