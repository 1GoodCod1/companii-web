import { useTranslation } from 'react-i18next';
import { PageHero, cabinetBtnPrimary } from '@/widgets/cabinet/cabinet-ui';
import { EntityListDetailLayout } from '@/widgets/cabinet/EntityListDetailLayout';
import { useQuotesQuery } from '@/features/fsm';
import { CompanyManagementGate } from '@/features/companies';
import { QuotesListTable } from '@/features/fsm';
import { QuoteDetailPanel } from '@/features/fsm';
import { CreateQuoteModal } from '@/features/fsm';
import { useEntityModal } from '@/shared/hooks/useEntityModal';
import { useEntitySelection } from '@/shared/hooks/useEntitySelection';

export function CompanyQuotesPage() {
  const { t } = useTranslation();
  const { data: quotes, isLoading } = useQuotesQuery();
  const createModal = useEntityModal();
  const { selectedId, select, clear } = useEntitySelection();

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <PageHero
          title={t('company.quotesPage.title')}
          description={t('company.quotesPage.description')}
          action={
            <button type="button" onClick={createModal.openCreate} className={cabinetBtnPrimary}>
              {t('company.quotesPage.createBtn')}
            </button>
          }
        />

        <EntityListDetailLayout
          list={
            <QuotesListTable
              quotes={quotes}
              isLoading={isLoading}
              selectedId={selectedId}
              onSelect={select}
            />
          }
          detail={<QuoteDetailPanel selectedId={selectedId} onClearSelection={clear} />}
        />

        <CreateQuoteModal open={createModal.open} onClose={createModal.closeModal} />
      </div>
    </CompanyManagementGate>
  );
}
