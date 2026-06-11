import { useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { cabinetBtnPrimary, cabinetBtnSecondary } from '@/widgets/cabinet/cabinet-ui';
import { EntityListDetailLayout } from '@/widgets/cabinet/EntityListDetailLayout';
import type { CustomerDto } from '@/entities/fsm/model/types';
import { useCustomersQuery, useDeleteCustomerMutation } from '@/features/fsm';
import { CompanyManagementGate } from '@/features/companies';
import { CustomerImportModal } from '@/features/fsm';
import { CustomersListTable, CUSTOMERS_LIST_PAGE_SIZE } from '@/features/fsm';
import { CustomerDetailPanel } from '@/features/fsm';
import { CustomerFormModal } from '@/features/fsm';
import { useEntityModal } from '@/shared/hooks/useEntityModal';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';

export function CompanyCustomersPage() {
  const { t } = useTranslation();
  const { data: customers, isLoading } = useCustomersQuery();
  const deleteCustomer = useDeleteCustomerMutation();
  const { ask, dialog } = useCabinetConfirmDialog();

  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [page, setPage] = useState(1);
  const formModal = useEntityModal<CustomerDto>();
  const importModal = useEntityModal();
  const [viewCustomer, setViewCustomer] = useState<CustomerDto | null>(null);

  const selectedCustomer = useMemo(() => {
    if (!viewCustomer) return null;
    return customers?.find((c: CustomerDto) => c.id === viewCustomer.id) ?? viewCustomer;
  }, [customers, viewCustomer]);

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

  const pageCount = Math.max(1, Math.ceil(filtered.length / CUSTOMERS_LIST_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  const paginatedCustomers = useMemo(
    () =>
      filtered.slice(
        (safePage - 1) * CUSTOMERS_LIST_PAGE_SIZE,
        safePage * CUSTOMERS_LIST_PAGE_SIZE,
      ),
    [filtered, safePage],
  );

  const handleDelete = useCallback((id: string) => {
    ask({
      title: t('cabinet.common.delete'),
      message: (
        <p className="text-sm text-gray-600 leading-relaxed">
          {t('company.customersPage.confirmDelete')}
        </p>
      ),
      onConfirm: async () => {
        try {
          await deleteCustomer.mutateAsync(id);
          toast.success(t('company.customersPage.toastDeleted'));
          if (viewCustomer?.id === id) setViewCustomer(null);
        } catch (err: unknown) {
          const error = err as Error;
          toast.error(error.message || t('company.customersPage.toastDeleteFailed'));
        }
      },
    });
  }, [ask, t, deleteCustomer, viewCustomer]);

  const detailPanel = useMemo(
    () => (
      <CustomerDetailPanel
        customer={selectedCustomer}
        onEdit={formModal.openEdit}
        onDelete={handleDelete}
      />
    ),
    [selectedCustomer, formModal.openEdit, handleDelete],
  );

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative min-w-[220px] flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('company.customersPage.searchPlaceholder')}
              aria-label={t('company.customersPage.searchPlaceholder')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <button type="button" onClick={importModal.openCreate} className={cabinetBtnSecondary}>
            {t('company.customersPage.importBtn')}
          </button>
          <button type="button" onClick={formModal.openCreate} className={cabinetBtnPrimary}>
            {t('company.customersPage.addBtn')}
          </button>
        </div>

        <EntityListDetailLayout
          list={
            <CustomersListTable
              customers={paginatedCustomers}
              isLoading={isLoading}
              isEmpty={filtered.length === 0}
              selectedId={selectedCustomer?.id ?? null}
              onSelect={setViewCustomer}
              page={safePage}
              totalCount={filtered.length}
              onPageChange={setPage}
            />
          }
          detail={detailPanel}
        />

        <CustomerFormModal
          open={formModal.open}
          onClose={formModal.closeModal}
          editingCustomer={formModal.entity}
        />
        <CustomerImportModal open={importModal.open} onClose={importModal.closeModal} />
        {dialog}
      </div>
    </CompanyManagementGate>
  );
}
