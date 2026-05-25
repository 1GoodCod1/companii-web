import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import {
  useLeadsQuery,
  useUpdateLeadMutation,
  useConvertLeadMutation,
} from '@/features/fsm/api/useFsm';
import type { CompanyLeadDto, CompanyLeadStatus } from '@/features/fsm/types';

const STATUS_FILTERS: Array<{ value?: CompanyLeadStatus; label: string }> = [
  { label: 'Toate' },
  { value: 'NEW', label: 'Noi' },
  { value: 'CONTACTED', label: 'Contactate' },
  { value: 'QUALIFIED', label: 'Calificate' },
  { value: 'CONVERTED', label: 'Convertite' },
  { value: 'LOST', label: 'Pierdute' },
];

const LEAD_STATUS_LABELS: Record<CompanyLeadStatus, string> = {
  NEW: 'Nouă',
  CONTACTED: 'Contactată',
  QUALIFIED: 'Calificată',
  CONVERTED: 'Convertită',
  LOST: 'Pierdută',
};

const LEAD_STATUS_TONES: Record<CompanyLeadStatus, 'gray' | 'amber' | 'blue' | 'emerald' | 'violet'> = {
  NEW: 'amber',
  CONTACTED: 'blue',
  QUALIFIED: 'violet',
  CONVERTED: 'emerald',
  LOST: 'gray',
};

export function CompanyLeadsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<CompanyLeadStatus | undefined>('NEW');
  const { data: leads, isLoading } = useLeadsQuery(statusFilter);
  const { data: categories } = useCategoriesQuery();
  const updateLead = useUpdateLeadMutation();
  const convertLead = useConvertLeadMutation();

  const [estimateLead, setEstimateLead] = useState<CompanyLeadDto | null>(null);
  const [categoryId, setCategoryId] = useState('');
  const [estimateTitle, setEstimateTitle] = useState('');

  const sortedLeads = useMemo(
    () => [...(leads ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [leads],
  );

  const handleStatusChange = async (lead: CompanyLeadDto, status: CompanyLeadStatus) => {
    try {
      await updateLead.mutateAsync({ id: lead.id, status });
      toast.success('Status actualizat.');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Eroare la actualizare.');
    }
  };

  const handleConvertIntervention = async (leadId: string) => {
    try {
      await convertLead.mutateAsync({ id: leadId, mode: 'intervention' });
      toast.success('Cerere preluată ca lucrare.');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Nu s-a putut converti cererea.');
    }
  };

  const openEstimateConvert = (lead: CompanyLeadDto) => {
    setEstimateLead(lead);
    setCategoryId(lead.categoryId ?? lead.category?.id ?? categories?.[0]?.id ?? '');
    setEstimateTitle(lead.packageTitle ?? `Smetă ${lead.contactName}`);
  };

  const handleConvertEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estimateLead || !categoryId) {
      toast.error('Selectați categoria pentru smetă.');
      return;
    }
    try {
      const result = await convertLead.mutateAsync({
        id: estimateLead.id,
        mode: 'estimate',
        categoryId,
        title: estimateTitle.trim() || undefined,
      });
      toast.success('Cerere convertită în smetă.');
      setEstimateLead(null);
      const projectId = (result as { project?: { id?: string } })?.project?.id;
      if (projectId) navigate(`/company/smete/${projectId}`);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Nu s-a putut crea smeta.');
    }
  };

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <PageHero
          title="Cereri & lead-uri"
          description="Cereri din pachete, site sau introduse manual — calificați și convertiți în clienți, lucrări sau smete."
        />

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                statusFilter === filter.value
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <Panel>
          <PanelHeader
            title="Inbox cereri"
            meta={<span className="text-xs text-gray-400">{sortedLeads.length} înregistrări</span>}
          />
          {isLoading ? (
            <p className="text-sm text-gray-400 p-4">Se încarcă...</p>
          ) : !sortedLeads.length ? (
            <EmptyState message="Nicio cerere pentru filtrul selectat." />
          ) : (
            <div className="divide-y divide-gray-100">
              {sortedLeads.map((lead) => (
                <article key={lead.id} className="px-4 py-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{lead.contactName}</h3>
                        <SoftBadge tone={LEAD_STATUS_TONES[lead.status]}>{LEAD_STATUS_LABELS[lead.status]}</SoftBadge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {lead.contactPhone}
                        {lead.contactEmail ? ` · ${lead.contactEmail}` : ''}
                      </p>
                      {lead.packageTitle ? (
                        <p className="text-xs font-semibold text-violet-600">{lead.packageTitle}</p>
                      ) : null}
                      {lead.message ? <p className="text-xs text-gray-400">{lead.message}</p> : null}
                      <p className="text-[10px] text-gray-400">
                        {new Date(lead.createdAt).toLocaleString('ro-MD')} · {lead.source}
                      </p>
                    </div>
                    {lead.status !== 'CONVERTED' && lead.status !== 'LOST' ? (
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead, e.target.value as CompanyLeadStatus)}
                        className={cabinetSelectClass}
                      >
                        {(['NEW', 'CONTACTED', 'QUALIFIED', 'LOST'] as CompanyLeadStatus[]).map((status) => (
                          <option key={status} value={status}>
                            {LEAD_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>

                  {lead.status !== 'CONVERTED' && lead.status !== 'LOST' ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleConvertIntervention(lead.id)}
                        disabled={convertLead.isPending}
                        className={cabinetBtnPrimary}
                      >
                        Preia → Lucrare
                      </button>
                      <button
                        type="button"
                        onClick={() => openEstimateConvert(lead)}
                        disabled={convertLead.isPending}
                        className={cabinetBtnSecondary}
                      >
                        → Smetă
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(lead, 'LOST')}
                        className={cabinetBtnSecondary}
                      >
                        Marchează pierdut
                      </button>
                    </div>
                  ) : lead.status === 'CONVERTED' ? (
                    <p className="text-xs text-emerald-600 font-semibold">
                      Convertită
                      {lead.convertedAt
                        ? ` · ${new Date(lead.convertedAt).toLocaleDateString('ro-MD')}`
                        : ''}
                      {lead.customerId ? (
                        <>
                          {' '}
                          · <Link to="/company/clienti" className="underline">Vezi client</Link>
                        </>
                      ) : null}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <AppModal
        open={!!estimateLead}
        onClose={() => setEstimateLead(null)}
        title="Convertire în smetă"
      >
        <form onSubmit={handleConvertEstimate} className="space-y-4">
          <p className="text-sm text-gray-600">
            Cerere de la <strong>{estimateLead?.contactName}</strong>
          </p>
          <label className={cabinetLabelClass}>
            Categorie smetă *
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={cabinetSelectClass}
              required
            >
              <option value="">Selectați categoria...</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className={cabinetLabelClass}>
            Titlu proiect
            <input
              value={estimateTitle}
              onChange={(e) => setEstimateTitle(e.target.value)}
              className={cabinetFieldClass}
            />
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={convertLead.isPending} className={cabinetBtnPrimary}>
              Creează smeta
            </button>
            <button type="button" onClick={() => setEstimateLead(null)} className={cabinetBtnSecondary}>
              Anulează
            </button>
          </div>
        </form>
      </AppModal>
    </CompanyManagementGate>
  );
}
