import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { PageHero, Panel, PanelHeader, cabinetBtnPrimary } from '@/components/cabinet/cabinet-ui';
import { CompanyManagementGate } from '@/features/companies/CompanyManagementGate';
import { useCategoriesQuery } from '@/features/companies/api/useCompanies';
import { resolveActiveCompany } from '@/features/companies/resolveActiveCompany';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { useMySubscriptionQuery } from '@/features/subscriptions/api/useSubscriptions';
import { hasMinPlan } from '@/config/planEntitlements';
import { SUBSCRIPTION_PLAN } from '@/constants/subscriptions.constants';
import {
  useCompanyServicesQuery,
  useCreateCompanyServiceMutation,
  useDeleteCompanyServiceMutation,
  useUpdateCompanyServiceMutation,
} from '@/features/fsm/api/useCompanyServices';
import type { CompanyServiceDto } from '@/types/fsm';
import { CompanyServiceFormModal } from '@/features/fsm/components/services/CompanyServiceFormModal';
import { ServicesCatalogPanel } from '@/features/fsm/components/services/ServicesCatalogPanel';
import { getErrorMessage } from '@/utils/errors';
import { EMPTY_SERVICE_FORM } from '@/constants/serviceForm.constants';
import type { ServiceFormState } from '@/types/serviceForm';
import {
  buildServicePayload,
  serviceToForm,
} from '@/utils/serviceForm';
import { useCabinetConfirmDialog } from '@/hooks/useCabinetConfirmDialog';

export function CompanyServicesPage() {
  const { t } = useTranslation();
  const { data: services, isLoading } = useCompanyServicesQuery();
  const { ask, dialog } = useCabinetConfirmDialog();
  const { data: categories } = useCategoriesQuery();
  const { data: subscription } = useMySubscriptionQuery();
  const { activeCompanyId, companyMe } = useCompanyPermissions();
  const { company: activeCompany } = resolveActiveCompany(companyMe, activeCompanyId);
  const defaultCategoryId = activeCompany?.categoryId ?? '';
  const defaultCategoryName =
    categories?.find((category) => category.id === defaultCategoryId)?.name ??
    t('company.servicesPage.categoryUnset');
  const createService = useCreateCompanyServiceMutation();
  const updateService = useUpdateCompanyServiceMutation();
  const deleteService = useDeleteCompanyServiceMutation();

  const planCode = subscription?.plan?.code;
  const canUseInternalPricing = hasMinPlan(planCode, SUBSCRIPTION_PLAN.PRO);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CompanyServiceDto | null>(null);
  const [form, setForm] = useState<ServiceFormState>(EMPTY_SERVICE_FORM);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_SERVICE_FORM);
    setShowModal(true);
  };

  const openEdit = (service: CompanyServiceDto) => {
    setEditing(service);
    setForm(serviceToForm(service));
    setShowModal(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.defaultPrice) {
      toast.error(t('company.servicesPage.toastNamePriceRequired'));
      return;
    }
    if (!defaultCategoryId) {
      toast.error(t('company.servicesPage.toastCategoryRequired'));
      return;
    }

    const payload = buildServicePayload(form, canUseInternalPricing);

    try {
      if (editing) {
        await updateService.mutateAsync({
          id: editing.id,
          ...payload,
          durationMinutes: payload.durationMinutes ?? null,
        });
        toast.success(t('company.servicesPage.toastUpdated'));
      } else {
        const { materialsCost, durationMinutes, ...rest } = payload;
        await createService.mutateAsync({
          ...rest,
          ...(durationMinutes != null ? { durationMinutes } : {}),
          ...(typeof materialsCost === 'number' ? { materialsCost } : {}),
        });
        toast.success(t('company.servicesPage.toastCreated'));
      }
      setShowModal(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('cabinet.common.operationFailed')));
    }
  };

  const handleDelete = (id: string) => {
    ask({
      title: t('cabinet.common.delete'),
      message: (
        <p className="text-sm text-gray-600 leading-relaxed">
          {t('company.servicesPage.confirmDelete')}
        </p>
      ),
      onConfirm: async () => {
        try {
          await deleteService.mutateAsync(id);
          toast.success(t('company.servicesPage.toastDeleted'));
        } catch (err: unknown) {
          toast.error(getErrorMessage(err, t('cabinet.common.operationFailed')));
        }
      },
    });
  };

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <PageHero
          title={t('company.servicesPage.title')}
          description={t('company.servicesPage.description')}
          action={
            <button type="button" onClick={openCreate} className={cabinetBtnPrimary}>
              {t('company.servicesPage.createBtn')}
            </button>
          }
        />

        <Panel>
          <PanelHeader title={t('company.servicesPage.catalogTitle')} />
          <ServicesCatalogPanel
            services={services}
            isLoading={isLoading}
            onEdit={openEdit}
            onDelete={handleDelete}
            onCreate={openCreate}
          />
        </Panel>
      </div>

      <CompanyServiceFormModal
        open={showModal}
        editing={!!editing}
        form={form}
        defaultCategoryName={defaultCategoryName}
        canUseInternalPricing={canUseInternalPricing}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        onFormChange={setForm}
      />
      {dialog}
    </CompanyManagementGate>
  );
}
