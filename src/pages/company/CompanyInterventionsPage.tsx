import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInterventionsQuery } from '@/features/fsm/api/useInterventions';
import { useCustomersQuery } from '@/features/fsm/api/useCustomers';
import { useCompanyMembersQuery } from '@/features/companies/api/useCompanies';
import { PageHero, cabinetBtnPrimary } from '@/components/cabinet/cabinet-ui';
import { EntityListDetailLayout } from '@/components/cabinet/EntityListDetailLayout';
import type { InterventionStatus, InterventionDto } from '@/types/fsm';
import { filterAssignableTechnicians } from '@/utils/teamMembers';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import {
  InterventionsListTable,
} from '@/features/fsm/components/interventions/InterventionsListTable';
import {
  InterventionsStatusFilter,
} from '@/features/fsm/components/interventions/components/InterventionsStatusFilter';
import { InterventionDetailPanel } from '@/features/fsm/components/interventions/InterventionDetailPanel';
import { CreateInterventionModal } from '@/features/fsm/components/interventions/CreateInterventionModal';
import { useEntityModal } from '@/hooks/useEntityModal';
import { useEntitySelection } from '@/hooks/useEntitySelection';

export function CompanyInterventionsPage() {
  const { t } = useTranslation();
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
        title={t('company.interventionsPage.title')}
        description={
          isManagement
            ? t('company.interventionsPage.descriptionManagement')
            : t('company.interventionsPage.descriptionTechnician')
        }
        action={
          isManagement ? (
            <button type="button" onClick={createModal.openCreate} className={cabinetBtnPrimary}>
              {t('company.interventionsPage.createBtn')}
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
