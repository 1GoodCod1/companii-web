import { useState } from 'react';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/AppModal';
import {
  PageHero,
  Panel,
  PanelHeader,
  EmptyState,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetLabelClass,
} from '@/components/cabinet/cabinet-ui';
import { CompanyManagementGate } from '@/features/companies/CompanyManagementGate';
import {
  useCompanyServicesQuery,
  useCreateCompanyServiceMutation,
  useDeleteCompanyServiceMutation,
  useUpdateCompanyServiceMutation,
} from '@/features/fsm/api/useFsm';
import type { CompanyServiceDto } from '@/features/fsm/types';

export function CompanyServicesPage() {
  const { data: services, isLoading } = useCompanyServicesQuery();
  const createService = useCreateCompanyServiceMutation();
  const updateService = useUpdateCompanyServiceMutation();
  const deleteService = useDeleteCompanyServiceMutation();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CompanyServiceDto | null>(null);
  const [name, setName] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('');
  const [materialsCost, setMaterialsCost] = useState('');
  const [vatRate, setVatRate] = useState('20');

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDefaultPrice('');
    setMaterialsCost('');
    setVatRate('20');
    setShowModal(true);
  };

  const openEdit = (service: CompanyServiceDto) => {
    setEditing(service);
    setName(service.name);
    setDefaultPrice(String(service.defaultPrice));
    setMaterialsCost(service.materialsCost != null ? String(service.materialsCost) : '');
    setVatRate(service.vatRate != null ? String(service.vatRate) : '20');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !defaultPrice) {
      toast.error('Completați numele și prețul.');
      return;
    }
    const payload = {
      name: name.trim(),
      defaultPrice: Number(defaultPrice),
      materialsCost: materialsCost ? Number(materialsCost) : undefined,
      vatRate: vatRate ? Number(vatRate) : undefined,
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
          title="Catalog servicii & prețuri"
          description="Păstrați tarifele companiei — folosite la devize și ca referință pentru smete."
          action={
            <button type="button" onClick={openCreate} className={cabinetBtnPrimary}>
              + Serviciu nou
            </button>
          }
        />

        <Panel>
          <PanelHeader title="Servicii companie" />
          {isLoading ? (
            <p className="text-sm text-gray-400 p-4">Se încarcă...</p>
          ) : !services?.length ? (
            <EmptyState message="Niciun serviciu în catalog." action={<button type="button" onClick={openCreate} className="text-violet-600 font-semibold text-xs">Adaugă primul serviciu</button>} />
          ) : (
            <div className="divide-y divide-gray-100">
              {(services ?? []).map((service: CompanyServiceDto) => (
                <div key={service.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{service.name}</p>
                    <p className="text-sm text-violet-700 font-bold mt-0.5">
                      {Number(service.defaultPrice).toLocaleString('ro-MD')} MDL
                      {service.vatRate != null ? ` · TVA ${service.vatRate}%` : ''}
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

      <AppModal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editează serviciu' : 'Serviciu nou'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className={cabinetLabelClass}>
            Denumire
            <input value={name} onChange={(e) => setName(e.target.value)} className={cabinetFieldClass} required />
          </label>
          <label className={cabinetLabelClass}>
            Preț (MDL)
            <input type="number" min={0} step="0.01" value={defaultPrice} onChange={(e) => setDefaultPrice(e.target.value)} className={cabinetFieldClass} required />
          </label>
          <label className={cabinetLabelClass}>
            Cost materiale (opțional)
            <input type="number" min={0} step="0.01" value={materialsCost} onChange={(e) => setMaterialsCost(e.target.value)} className={cabinetFieldClass} />
          </label>
          <label className={cabinetLabelClass}>
            TVA %
            <input type="number" min={0} max={100} value={vatRate} onChange={(e) => setVatRate(e.target.value)} className={cabinetFieldClass} />
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" className={cabinetBtnPrimary}>{editing ? 'Salvează' : 'Adaugă'}</button>
            <button type="button" onClick={() => setShowModal(false)} className={cabinetBtnSecondary}>Anulează</button>
          </div>
        </form>
      </AppModal>
    </CompanyManagementGate>
  );
}
