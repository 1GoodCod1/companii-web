import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Panel, PanelHeader, cabinetBtnPrimary } from '@/widgets/cabinet/cabinet-ui';
import { CompanyManagementGate } from '@/features/companies';
import { useCategoriesQuery } from '@/features/companies/api/useCompanies';
import { resolveActiveCompany } from '@/features/companies/resolveActiveCompany';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { useMySubscriptionQuery } from '@/entities/subscription/api/useSubscriptions';
import { hasMinPlan } from '@/entities/subscription/model/planEntitlements';
import { SUBSCRIPTION_PLAN } from '@/entities/subscription/model/subscriptions.constants';
import {
  useCompanyServicesQuery,
  useCreateCompanyServiceMutation,
  useDeleteCompanyServiceMutation,
  useUpdateCompanyServiceMutation,
} from '@/features/fsm';
import type { CompanyServiceDto } from '@/entities/fsm/model/types';
import { CompanyServiceFormModal } from '@/features/fsm';
import { ServicesCatalogPanel } from '@/features/fsm';
import { getErrorMessage } from '@/shared/utils/errors';
import { EMPTY_SERVICE_FORM } from '@/entities/fsm/model/serviceForm.constants';
import type { ServiceFormState } from '@/entities/fsm/model/serviceForm.types';
import {
  buildServicePayload,
  serviceToForm,
} from '@/entities/fsm/model/serviceForm';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';

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
        <Panel>
          <PanelHeader
            title={t('company.servicesPage.catalogTitle')}
            action={
              <button type="button" onClick={openCreate} className={cabinetBtnPrimary}>
                {t('company.servicesPage.createBtn')}
              </button>
            }
          />
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
