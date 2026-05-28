import { useTranslation } from 'react-i18next';
import { CompanyManagementGate } from '@/features/companies/CompanyManagementGate';
import { PageHero, Panel, PanelHeader, EmptyState } from '@/components/cabinet/cabinet-ui';
import { LeadInboxItem } from '@/features/fsm/components/leads/LeadInboxItem';
import { LeadsStatusFilter } from '@/features/fsm/components/leads/LeadsStatusFilter';
import { ConvertLeadToEstimateModal } from '@/features/fsm/components/leads/ConvertLeadToEstimateModal';
import { LEAD_STATUS } from '@/constants/leadStatus.constants';
import { useLeadInbox } from '@/features/fsm/hooks/useLeadInbox';

export function CompanyLeadsPage() {
  const { t } = useTranslation();
  const inbox = useLeadInbox(LEAD_STATUS.NEW);

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <PageHero
          title={t('company.leadsPage.title')}
          description={t('company.leadsPage.description')}
        />

        <LeadsStatusFilter value={inbox.statusFilter} onChange={inbox.setStatusFilter} />

        <Panel>
          <PanelHeader
            title={t('company.leadsPage.inboxTitle')}
            meta={
              <span className="text-xs text-gray-400">
                {t('cabinet.common.records', { count: inbox.sortedLeads.length })}
              </span>
            }
          />
          {inbox.isLoading ? (
            <p className="text-sm text-gray-400 p-4">{t('cabinet.common.loading')}</p>
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
