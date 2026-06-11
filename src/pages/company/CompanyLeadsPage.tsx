import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CompanyManagementGate } from '@/features/companies';
import { LoadingStatus } from '@/shared/ui/LoadingStatus';
import { Panel, PanelHeader, EmptyState, SkeletonList } from '@/widgets/cabinet/cabinet-ui';
import { LeadInboxItem } from '@/features/fsm';
import { LeadsStatusFilter } from '@/features/fsm';
import { ConvertLeadToEstimateModal } from '@/features/fsm';
import { useLeadInbox } from '@/features/fsm';

export function CompanyLeadsPage() {
  const { t } = useTranslation();
  const inbox = useLeadInbox(undefined);

  const leadsMeta = useMemo(
    () => (
      <span className="text-xs text-gray-400">
        {t('cabinet.common.records', { count: inbox.sortedLeads.length })}
      </span>
    ),
    [inbox.sortedLeads.length, t],
  );

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <LeadsStatusFilter value={inbox.statusFilter} onChange={inbox.setStatusFilter} />

        <Panel>
          <PanelHeader
            title={t('company.leadsPage.inboxTitle')}
            meta={leadsMeta}
          />
          {inbox.isLoading ? (
            <LoadingStatus label={t('cabinet.common.loading')}>
              <SkeletonList rows={5} />
            </LoadingStatus>
          ) : !inbox.sortedLeads.length ? (
            <EmptyState message={t('company.leadsPage.empty')} />
          ) : (
            <div className="divide-y divide-gray-100">
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
