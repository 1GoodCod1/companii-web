import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  PageHero,
  Panel,
  cabinetFieldClass,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import { EntityListDetailLayout } from '@/components/cabinet/EntityListDetailLayout';
import type { CustomerDto } from '@/types/fsm';
import { useCustomersQuery, useDeleteCustomerMutation } from '@/features/fsm/api/useCustomers';
import { CompanyManagementGate } from '@/features/companies/CompanyManagementGate';
import { CustomerImportModal } from '@/features/fsm/components/CustomerImportModal';
import { CustomersListTable } from '@/features/fsm/components/customers/CustomersListTable';
import { CustomerDetailPanel } from '@/features/fsm/components/customers/CustomerDetailPanel';
import { CustomerFormModal } from '@/features/fsm/components/customers/CustomerFormModal';
import { useEntityModal } from '@/hooks/useEntityModal';

export function CompanyCustomersPage() {
  const { t } = useTranslation();
  const { data: customers, isLoading } = useCustomersQuery();
  const deleteCustomer = useDeleteCustomerMutation();

  const [search, setSearch] = useState('');
  const formModal = useEntityModal<CustomerDto>();
  const importModal = useEntityModal();
  const [viewCustomer, setViewCustomer] = useState<CustomerDto | null>(null);

  const filtered = useMemo(
    () =>
      customers?.filter(
        (c: CustomerDto) =>
          c.fullName.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search) ||
          (c.email && c.email.toLowerCase().includes(search.toLowerCase())),
      ) ?? [],
    [customers, search],
  );

  const handleDelete = async (id: string) => {
    if (!confirm(t('company.customersPage.confirmDelete'))) return;
    try {
      await deleteCustomer.mutateAsync(id);
      toast.success(t('company.customersPage.toastDeleted'));
      if (viewCustomer?.id === id) setViewCustomer(null);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || t('company.customersPage.toastDeleteFailed'));
    }
  };

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <PageHero
          title={t('company.customersPage.title')}
          description={t('company.customersPage.description')}
          action={
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={importModal.openCreate} className={cabinetBtnSecondary}>
                {t('company.customersPage.importBtn')}
              </button>
              <button type="button" onClick={formModal.openCreate} className={cabinetBtnPrimary}>
                {t('company.customersPage.addBtn')}
              </button>
            </div>
          }
        />

        <Panel className="p-4">
          <input
            type="text"
            placeholder={t('company.customersPage.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cabinetFieldClass}
          />
        </Panel>

        <EntityListDetailLayout
          list={
            <CustomersListTable
              customers={filtered}
              isLoading={isLoading}
              selectedId={viewCustomer?.id ?? null}
              onSelect={setViewCustomer}
              onEdit={formModal.openEdit}
              onDelete={handleDelete}
            />
          }
          detail={<CustomerDetailPanel customer={viewCustomer} />}
        />

        <CustomerFormModal
          open={formModal.open}
          onClose={formModal.closeModal}
          editingCustomer={formModal.entity}
        />
        <CustomerImportModal open={importModal.open} onClose={importModal.closeModal} />
      </div>
    </CompanyManagementGate>
  );
}
