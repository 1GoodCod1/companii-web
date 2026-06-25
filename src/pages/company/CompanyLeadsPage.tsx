import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CompanyManagementGate } from '@/features/companies';
import { LoadingStatus } from '@/shared/ui/LoadingStatus';
import { Panel, PanelHeader, EmptyState, SkeletonList } from '@/widgets/cabinet/cabinet-ui';
import { LeadInboxItem } from '@/features/fsm';
import { LeadsStatusFilter } from '@/features/fsm';
import { ConvertLeadToEstimateModal } from '@/features/fsm';
import { useLeadInbox } from '@/features/fsm';
import {
  leadPanelHeaderClass,
  leadPanelListClass,
  leadPanelShellClass,
  leadPanelRowClass,
} from '@/features/fsm/components/leads/leadPanelUi';

export function CompanyLeadsPage() {
  const { t } = useTranslation();
  const inbox = useLeadInbox(undefined);

  const leadsMeta = useMemo(
    () => (
      <span className="text-xs font-semibold text-gray-500">
        {t('cabinet.common.records', { count: inbox.sortedLeads.length })}
      </span>
    ),
    [inbox.sortedLeads.length, t],
  );

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <LeadsStatusFilter value={inbox.statusFilter} onChange={inbox.setStatusFilter} />

        <Panel className={leadPanelShellClass}>
          <div className={leadPanelHeaderClass}>
            <PanelHeader
              className="mb-0"
              title={t('company.leadsPage.inboxTitle')}
              meta={leadsMeta}
            />
          </div>

          {inbox.isLoading ? (
            <div className={leadPanelRowClass}>
              <LoadingStatus label={t('cabinet.common.loading')}>
                <SkeletonList rows={5} />
              </LoadingStatus>
            </div>
          ) : !inbox.sortedLeads.length ? (
            <div className={leadPanelRowClass}>
              <EmptyState message={t('company.leadsPage.empty')} />
            </div>
          ) : (
            <div className={leadPanelListClass}>
              {inbox.sortedLeads.map((lead) => (
                <LeadInboxItem
                  key={lead.id}
                  lead={lead}
                  convertPending={inbox.convertPending}
                  completePending={inbox.completePending}
                  onStatusChange={inbox.handleStatusChange}
                  onNotesChange={inbox.handleNotesChange}
                  onConvertCustomer={inbox.handleConvertCustomer}
                  onConvertIntervention={inbox.handleConvertIntervention}
                  onConvertEstimate={inbox.openEstimateConvert}
                  onComplete={inbox.handleCompleteLead}
                />
              ))}
            </div>
          )}
        </Panel>
      </div>

      <ConvertLeadToEstimateModal
        lead={inbox.estimateLead}
        categories={inbox.categories}
        categoryId={inbox.categoryId}
        estimateTitle={inbox.estimateTitle}
        pending={inbox.convertPending}
        onCategoryChange={inbox.setCategoryId}
        onTitleChange={inbox.setEstimateTitle}
        onClose={() => inbox.setEstimateLead(null)}
        onSubmit={inbox.handleConvertEstimate}
      />
    </CompanyManagementGate>
  );
}
