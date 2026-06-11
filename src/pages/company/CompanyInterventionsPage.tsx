import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInterventionsQuery } from '@/features/fsm';
import { useCustomersQuery } from '@/features/fsm';
import { useCompanyMembersQuery } from '@/features/companies/api/useCompanies';
import { cabinetBtnPrimary } from '@/widgets/cabinet/cabinet-ui';
import { EntityListDetailLayout } from '@/widgets/cabinet/EntityListDetailLayout';
import type { InterventionStatus, InterventionDto } from '@/entities/fsm/model/types';
import { filterAssignableTechnicians } from '@/entities/company/model/teamMembers';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import {
  InterventionsListTable,
} from '@/features/fsm';
import {
  InterventionsStatusFilter,
} from '@/features/fsm';
import { InterventionDetailPanel } from '@/features/fsm';
import { CreateInterventionModal } from '@/features/fsm';
import { useEntityModal } from '@/shared/hooks/useEntityModal';
import { useEntitySelection } from '@/shared/hooks/useEntitySelection';

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

  const detailPanel = useMemo(
    () => (
      <InterventionDetailPanel
        selectedId={selectedId}
        onClearSelection={clear}
        permissions={{
          isManagement,
          canEditAssignedInterventionFields,
          canDeleteAnyNote,
          canDeleteOwnNotes,
        }}
        role={role}
        memberId={memberId}
        assignableTechnicians={assignableTechnicians}
      />
    ),
    [selectedId, clear, isManagement, canEditAssignedInterventionFields, canDeleteAnyNote, canDeleteOwnNotes, role, memberId, assignableTechnicians],
  );

  const handleOpenDetail = (item: InterventionDto) => {
    select(item.id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <InterventionsStatusFilter
        value={statusFilter}
        onChange={(value) => setStatusFilter(value)}
        action={
          isManagement ? (
            <button type="button" onClick={createModal.openCreate} className={cabinetBtnPrimary}>
              {t('company.interventionsPage.createBtn')}
            </button>
          ) : undefined
        }
      />

      <EntityListDetailLayout
        list={
          <InterventionsListTable
            interventions={interventions}
            isLoading={isLoading}
            selectedId={selectedId}
            onSelect={handleOpenDetail}
          />
        }
        detail={detailPanel}
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
