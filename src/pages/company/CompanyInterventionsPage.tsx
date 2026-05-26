import { useMemo, useState } from 'react';
import { useInterventionsQuery } from '@/features/fsm/api/useInterventions';
import { useCustomersQuery } from '@/features/fsm/api/useCustomers';
import { useCompanyMembersQuery } from '@/features/companies/api/useCompanies';
import { PageHero, cabinetBtnPrimary } from '@/components/cabinet/cabinet-ui';
import { EntityListDetailLayout } from '@/components/cabinet/EntityListDetailLayout';
import type { InterventionStatus, InterventionDto } from '@/types/fsm';
import { filterAssignableTechnicians } from '@/utils/teamMembers';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';
import {
  InterventionsListTable,
  InterventionsStatusFilter,
} from '@/features/fsm/components/interventions/InterventionsListTable';
import { InterventionDetailPanel } from '@/features/fsm/components/interventions/InterventionDetailPanel';
import { CreateInterventionModal } from '@/features/fsm/components/interventions/CreateInterventionModal';
import { useEntityModal } from '@/hooks/useEntityModal';
import { useEntitySelection } from '@/hooks/useEntitySelection';

export function CompanyInterventionsPage() {
  const {
    isManagement,
    role,
    memberId,
    canEditAssignedInterventionFields,
    canDeleteAnyNote,
    canDeleteOwnNotes,
  } = useCompanyPermissions();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const createModal = useEntityModal();
  const { selectedId, select, clear } = useEntitySelection();

  const { data: interventions, isLoading } = useInterventionsQuery(
    (statusFilter || undefined) as InterventionStatus | undefined,
  );
  const { data: customers } = useCustomersQuery({ enabled: isManagement });
  const { data: members } = useCompanyMembersQuery({ enabled: isManagement });
  const assignableTechnicians = useMemo(() => filterAssignableTechnicians(members), [members]);

  const handleOpenDetail = (item: InterventionDto) => {
    select(item.id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        title="Lucrări"
        description={
          isManagement
            ? 'Gestionează comenzile de lucru, programările, tehnicienii alocați și stadiul execuției.'
            : 'Lucrările alocate ție — actualizează statusul și adaugă note după execuție.'
        }
        action={
          isManagement ? (
            <button type="button" onClick={createModal.openCreate} className={cabinetBtnPrimary}>
              + Creează lucrare
            </button>
          ) : undefined
        }
      />

      <InterventionsStatusFilter value={statusFilter} onChange={(value) => setStatusFilter(value)} />

      <EntityListDetailLayout
        list={
          <InterventionsListTable
            interventions={interventions}
            isLoading={isLoading}
            selectedId={selectedId}
            onSelect={handleOpenDetail}
          />
        }
        detail={
          <InterventionDetailPanel
            selectedId={selectedId}
            onClearSelection={clear}
            isManagement={isManagement}
            role={role}
            memberId={memberId}
            canEditAssignedInterventionFields={canEditAssignedInterventionFields}
            canDeleteAnyNote={canDeleteAnyNote}
            canDeleteOwnNotes={canDeleteOwnNotes}
            assignableTechnicians={assignableTechnicians}
          />
        }
      />

      {isManagement && (
        <CreateInterventionModal
          open={createModal.open}
          onClose={createModal.closeModal}
          customers={customers}
          assignableTechnicians={assignableTechnicians}
        />
      )}
    </div>
  );
}
