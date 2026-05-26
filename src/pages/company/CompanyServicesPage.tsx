import { useState } from 'react';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/AppModal';
import {
  PageHero,
  Panel,
  PanelHeader,
  EmptyState,
  SoftBadge,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetLabelClass,
  cabinetSelectClass,
} from '@/components/cabinet/cabinet-ui';
import {
  DURATION_UNIT_OPTIONS,
  durationFormToMinutes,
  formatServiceDuration,
  minutesToDurationForm,
  type DurationUnit,
} from '@/utils/serviceDuration';
import { CompanyManagementGate } from '@/features/companies/CompanyManagementGate';
import { useCategoriesQuery } from '@/features/companies/api/useCompanies';
import { resolveActiveCompany } from '@/features/companies/resolveActiveCompany';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';
import { useMySubscriptionQuery } from '@/features/subscriptions/api/useSubscriptions';
import { hasMinPlan } from '@/config/planEntitlements';
import type { CompanySubscriptionPlanCode } from '@/features/subscriptions/types';
import {
  useCompanyServicesQuery,
  useCreateCompanyServiceMutation,
  useDeleteCompanyServiceMutation,
  useUpdateCompanyServiceMutation,
} from '@/features/fsm/api/useFsm';
import type { CompanyServiceDto } from '@/features/fsm/types';

const emptyForm = {
  name: '',
  description: '',
  defaultPrice: '',
  durationValue: '',
  durationUnit: 'hours' as DurationUnit,
  isPublished: true,
  materialsCost: '',
};

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

  const planCode = subscription?.plan?.code as CompanySubscriptionPlanCode | undefined;
  const canUseInternalPricing = hasMinPlan(planCode, 'PRO');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CompanyServiceDto | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (service: CompanyServiceDto) => {
    const duration = minutesToDurationForm(service.durationMinutes);
    setEditing(service);
    setForm({
      name: service.name,
      description: service.description ?? '',
      defaultPrice: String(service.defaultPrice),
      durationValue: duration.value,
      durationUnit: duration.unit,
      isPublished: service.isPublished ?? false,
      materialsCost: service.materialsCost != null ? String(service.materialsCost) : '',
    });
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

    const durationMinutes = form.durationValue.trim()
      ? durationFormToMinutes(form.durationValue, form.durationUnit) ?? undefined
      : undefined;

    try {
      if (editing) {
        await updateService.mutateAsync({
          id: editing.id,
          name: form.name.trim(),
          description: form.description.trim(),
          defaultPrice: Number(form.defaultPrice),
          isPublished: form.isPublished,
          durationMinutes: durationMinutes ?? null,
          ...(canUseInternalPricing
            ? {
                materialsCost: form.materialsCost.trim() ? Number(form.materialsCost) : null,
              }
            : {}),
        });
        toast.success('Serviciu actualizat.');
      } else {
        await createService.mutateAsync({
          name: form.name.trim(),
          description: form.description.trim(),
          defaultPrice: Number(form.defaultPrice),
          isPublished: form.isPublished,
          ...(durationMinutes != null ? { durationMinutes } : {}),
          ...(canUseInternalPricing && form.materialsCost.trim()
            ? { materialsCost: Number(form.materialsCost) }
            : {}),
        });
        toast.success('Serviciu adăugat.');
      }
      setShowModal(false);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Eroare.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ștergeți acest serviciu din catalog?')) return;
    try {
      await deleteService.mutateAsync(id);
      toast.success('Serviciu șters.');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Eroare.');
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
          {isLoading ? (
            <p className="text-sm text-gray-400 p-4">Se încarcă...</p>
          ) : !services?.length ? (
            <EmptyState
              message="Niciun serviciu în catalog."
              action={
                <button type="button" onClick={openCreate} className="text-violet-600 font-semibold text-xs">
                  Adaugă primul serviciu
                </button>
              }
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {(services ?? []).map((service) => {
                const durationLabel = formatServiceDuration(service.durationMinutes);
                return (
                <div key={service.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{service.name}</p>
                      {service.isPublished ? (
                        <SoftBadge tone="emerald">Public</SoftBadge>
                      ) : (
                        <SoftBadge tone="gray">Draft</SoftBadge>
                      )}
                    </div>
                    {service.description ? (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                    ) : null}
                    <p className="text-sm text-violet-700 font-bold mt-1">
                      {Number(service.defaultPrice).toLocaleString('ro-MD')} {service.currency ?? 'MDL'}
                      {durationLabel ? ` · ${durationLabel}` : ''}
                      {service.category?.name ? ` · ${service.category.name}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEdit(service)} className={cabinetBtnSecondary}>
                      Editează
                    </button>
                    <button type="button" onClick={() => handleDelete(service.id)} className={cabinetBtnSecondary}>
                      Șterge
                    </button>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </Panel>
      </div>

      <AppModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Editează serviciu' : 'Serviciu nou'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className={cabinetLabelClass}>
            Denumire *
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={cabinetFieldClass}
              required
            />
          </label>
          <label className={cabinetLabelClass}>
            Descriere (opțional)
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={cabinetFieldClass}
              rows={3}
            />
          </label>
          <div className={cabinetLabelClass}>
            Categorie
            <input
              value={defaultCategoryName}
              className={`${cabinetFieldClass} bg-gray-50 text-gray-600 cursor-not-allowed`}
              readOnly
              tabIndex={-1}
            />
            <p className="text-[11px] font-medium text-gray-400 mt-1">
              Moștenită din profilul companiei — se modifică doar acolo.
            </p>
          </div>
          <label className={cabinetLabelClass}>
            Preț (MDL) *
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.defaultPrice}
              onChange={(e) => setForm((f) => ({ ...f, defaultPrice: e.target.value }))}
              className={cabinetFieldClass}
              required
            />
          </label>
          <div className={cabinetLabelClass}>
            Durată (opțional)
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                type="number"
                min={1}
                step={1}
                value={form.durationValue}
                onChange={(e) => setForm((f) => ({ ...f, durationValue: e.target.value }))}
                className={cabinetFieldClass}
                placeholder="Ex: 2"
              />
              <select
                value={form.durationUnit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, durationUnit: e.target.value as DurationUnit }))
                }
                className={cabinetSelectClass}
              >
                {DURATION_UNIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              className="rounded border-gray-300"
            />
            Public pe profilul companiei
          </label>
          {canUseInternalPricing ? (
            <label className={cabinetLabelClass}>
              Cost materiale (opțional)
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.materialsCost}
                onChange={(e) => setForm((f) => ({ ...f, materialsCost: e.target.value }))}
                className={cabinetFieldClass}
              />
            </label>
          ) : (
            <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
              Cost materiale pentru devize — disponibil din planul Pro.
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" className={cabinetBtnPrimary}>
              {editing ? 'Salvează' : 'Adaugă'}
            </button>
            <button type="button" onClick={() => setShowModal(false)} className={cabinetBtnSecondary}>
              Anulează
            </button>
          </div>
        </form>
      </AppModal>
    </CompanyManagementGate>
  );
}
