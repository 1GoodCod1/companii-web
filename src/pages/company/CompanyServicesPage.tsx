import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageHero, Panel, PanelHeader, cabinetBtnPrimary } from '@/components/cabinet/cabinet-ui';
import { CompanyManagementGate } from '@/features/companies/CompanyManagementGate';
import { useCategoriesQuery } from '@/features/companies/api/useCompanies';
import { resolveActiveCompany } from '@/features/companies/resolveActiveCompany';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';
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

export function CompanyServicesPage() {
  const { data: services, isLoading } = useCompanyServicesQuery();
  const { data: categories } = useCategoriesQuery();
  const { data: subscription } = useMySubscriptionQuery();
  const { activeCompanyId, companyMe } = useCompanyPermissions();
  const { company: activeCompany } = resolveActiveCompany(companyMe, activeCompanyId);
  const defaultCategoryId = activeCompany?.categoryId ?? '';
  const defaultCategoryName =
    categories?.find((category) => category.id === defaultCategoryId)?.name ?? '— nesetată —';
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
      toast.error('Completați numele și prețul.');
      return;
    }
    if (!defaultCategoryId) {
      toast.error('Setați categoria companiei în profil înainte de a adăuga servicii.');
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
        toast.success('Serviciu actualizat.');
      } else {
        const { materialsCost, durationMinutes, ...rest } = payload;
        await createService.mutateAsync({
          ...rest,
          ...(durationMinutes != null ? { durationMinutes } : {}),
          ...(typeof materialsCost === 'number' ? { materialsCost } : {}),
        });
        toast.success('Serviciu adăugat.');
      }
      setShowModal(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Eroare.'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ștergeți acest serviciu din catalog?')) return;
    try {
      await deleteService.mutateAsync(id);
      toast.success('Serviciu șters.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Eroare.'));
    }
  };

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <PageHero
          title="Servicii & prețuri"
          description="Catalog public pe profilul companiei + tarife interne pentru devize (Pro+)."
          action={
            <button type="button" onClick={openCreate} className={cabinetBtnPrimary}>
              + Serviciu nou
            </button>
          }
        />

        <Panel>
          <PanelHeader title="Catalog servicii" />
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
    </CompanyManagementGate>
  );
}
