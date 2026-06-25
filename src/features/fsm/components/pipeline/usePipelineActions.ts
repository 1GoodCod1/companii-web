import { useUpdateInterventionStatusMutation } from '../../api/useInterventions';
import { useUpdateLeadMutation, useCompleteLeadMutation } from '../../api/useLeads';
import { useUpdateQuoteMutation } from '../../api/useQuotes';
import type {
  CompanyLeadStatus,
  InterventionStatus,
  QuoteStatus,
} from '@/entities/fsm/model/types';
import type { BoardCard, PipelineEntity } from './pipeline.types';
import { LEAD_STATUS } from '@/entities/fsm/model/leadStatus.constants';

export function usePipelineActions() {
  const updateLead = useUpdateLeadMutation();
  const completeLead = useCompleteLeadMutation();
  const updateInterventionStatus = useUpdateInterventionStatusMutation();
  const updateQuote = useUpdateQuoteMutation();

  return {
    move: async (entity: PipelineEntity, card: BoardCard, to: string): Promise<void> => {
      switch (entity) {
        case 'leads':
          if (to === LEAD_STATUS.CONVERTED) {
            await completeLead.mutateAsync(card.id);
          } else {
            await updateLead.mutateAsync({ id: card.id, status: to as CompanyLeadStatus });
          }
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
