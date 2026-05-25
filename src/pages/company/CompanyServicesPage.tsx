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
import { CompanyManagementGate } from '@/features/companies/CompanyManagementGate';
import { useCategoriesQuery } from '@/features/companies/api/useCompanies';
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
  categoryId: '',
  defaultPrice: '',
  durationMinutes: '60',
  isPublished: true,
  materialsCost: '',
  vatRate: '20',
};

export function CompanyServicesPage() {
  const { data: services, isLoading } = useCompanyServicesQuery();
  const { data: categories } = useCategoriesQuery();
  const { data: subscription } = useMySubscriptionQuery();
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
    setEditing(service);
    setForm({
      name: service.name,
      description: service.description ?? '',
      categoryId: service.category?.id ?? service.categoryId ?? '',
      defaultPrice: String(service.defaultPrice),
      durationMinutes: service.durationMinutes != null ? String(service.durationMinutes) : '60',
      isPublished: service.isPublished ?? false,
      materialsCost: service.materialsCost != null ? String(service.materialsCost) : '',
      vatRate: service.vatRate != null ? String(service.vatRate) : '20',
    });
    setShowModal(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.defaultPrice) {
      toast.error('Completați numele și prețul.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      categoryId: form.categoryId || undefined,
      defaultPrice: Number(form.defaultPrice),
      durationMinutes: Number(form.durationMinutes || 60),
      isPublished: form.isPublished,
      ...(canUseInternalPricing
        ? {
            materialsCost: form.materialsCost ? Number(form.materialsCost) : undefined,
            vatRate: form.vatRate ? Number(form.vatRate) : undefined,
          }
        : {}),
    };

    try {
      if (editing) {
        await updateService.mutateAsync({ id: editing.id, ...payload });
        toast.success('Serviciu actualizat.');
      } else {
        await createService.mutateAsync(payload);
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
              {(services ?? []).map((service) => (
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
                      {service.durationMinutes ? ` · ${service.durationMinutes} min` : ''}
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
              ))}
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
            Denumire
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={cabinetFieldClass}
              required
            />
          </label>
          <label className={cabinetLabelClass}>
            Descriere
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={cabinetFieldClass}
              rows={3}
            />
          </label>
          <label className={cabinetLabelClass}>
            Categorie
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className={cabinetSelectClass}
            >
              <option value="">— opțional —</option>
              {(categories ?? []).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
          <label className={cabinetLabelClass}>
            Preț (MDL)
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
          <label className={cabinetLabelClass}>
            Durată (minute)
            <input
              type="number"
              min={15}
              step={15}
              value={form.durationMinutes}
              onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
              className={cabinetFieldClass}
            />
          </label>
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
            <>
              <label className={cabinetLabelClass}>
                Cost materiale (opțional, Pro+)
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.materialsCost}
                  onChange={(e) => setForm((f) => ({ ...f, materialsCost: e.target.value }))}
                  className={cabinetFieldClass}
                />
              </label>
              <label className={cabinetLabelClass}>
                TVA % (Pro+)
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.vatRate}
                  onChange={(e) => setForm((f) => ({ ...f, vatRate: e.target.value }))}
                  className={cabinetFieldClass}
                />
              </label>
            </>
          ) : (
            <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
              Cost materiale și TVA pentru devize — disponibile din planul Pro.
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
