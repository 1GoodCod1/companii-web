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
  useCompleteLeadMutation,
} from '@/features/fsm/api/useFsm';
import type { CompanyLeadDto, CompanyLeadStatus } from '@/features/fsm/types';

const STATUS_FILTERS: Array<{ value?: CompanyLeadStatus; label: string }> = [
  { label: 'Toate' },
  { value: 'NEW', label: 'Noi' },
  { value: 'CONTACTED', label: 'Contactate' },
  { value: 'QUALIFIED', label: 'Calificate' },
  { value: 'IN_PROGRESS', label: 'În lucru' },
  { value: 'CONVERTED', label: 'Finalizate' },
  { value: 'LOST', label: 'Pierdute' },
];

const LEAD_STATUS_LABELS: Record<CompanyLeadStatus, string> = {
  NEW: 'Nouă',
  CONTACTED: 'Contactată',
  QUALIFIED: 'Calificată',
  IN_PROGRESS: 'În lucru',
  CONVERTED: 'Finalizată',
  LOST: 'Pierdută',
};

const LEAD_STATUS_TONES: Record<
  CompanyLeadStatus,
  'gray' | 'amber' | 'blue' | 'emerald' | 'violet'
> = {
  NEW: 'amber',
  CONTACTED: 'blue',
  QUALIFIED: 'violet',
  IN_PROGRESS: 'blue',
  CONVERTED: 'emerald',
  LOST: 'gray',
};

const LEAD_SOURCE_LABELS: Record<CompanyLeadDto['source'], string> = {
  SERVICE_REQUEST: 'Cerere serviciu',
  PROJECT_REQUEST: 'Cerere proiect',
  MANUAL: 'Manual',
  PHONE: 'Telefon',
  WEBSITE: 'Site',
};

export function CompanyLeadsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<CompanyLeadStatus | undefined>('NEW');
  const { data: leads, isLoading } = useLeadsQuery(statusFilter);
  const { data: categories } = useCategoriesQuery();
  const updateLead = useUpdateLeadMutation();
  const convertLead = useConvertLeadMutation();
  const completeLead = useCompleteLeadMutation();

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
      const result = await convertLead.mutateAsync({ id: leadId, mode: 'intervention' });
      const keptOpen = (result as { keptOpen?: boolean })?.keptOpen;
      toast.success(
        keptOpen ? 'Lucrare creată — cererea rămâne deschisă.' : 'Cerere preluată ca lucrare.',
      );
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Nu s-a putut converti cererea.');
    }
  };

  const handleCompleteLead = async (leadId: string) => {
    try {
      await completeLead.mutateAsync(leadId);
      toast.success('Cerere finalizată.');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Nu s-a putut finaliza cererea.');
    }
  };

  const handleConvertCustomer = async (leadId: string) => {
    try {
      await convertLead.mutateAsync({ id: leadId, mode: 'customer' });
      toast.success('Client salvat în CRM.');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Nu s-a putut salva clientul.');
    }
  };

  const openEstimateConvert = (lead: CompanyLeadDto) => {
    setEstimateLead(lead);
    setCategoryId(lead.categoryId ?? lead.category?.id ?? categories?.[0]?.id ?? '');
    setEstimateTitle(lead.serviceTitle ?? `Smetă ${lead.contactName}`);
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
          description="Cereri din servicii publice, proiecte sau introduse manual — calificați, convertiți în smete sau lucrări și finalizați când fluxul e complet."
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
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">{lead.contactName}</h3>
                        <SoftBadge tone={LEAD_STATUS_TONES[lead.status]}>{LEAD_STATUS_LABELS[lead.status]}</SoftBadge>
                        {lead.source === 'SERVICE_REQUEST' ? (
                          <SoftBadge tone="violet">
                            🔧 Serviciu: {lead.serviceTitle || 'Nespecificat'}
                          </SoftBadge>
                        ) : lead.source === 'PROJECT_REQUEST' ? (
                          <SoftBadge tone="blue">
                            🏗️ Proiect Complex
                          </SoftBadge>
                        ) : (
                          <SoftBadge tone="gray">
                            {LEAD_SOURCE_LABELS[lead.source] ?? lead.source}
                          </SoftBadge>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-500 font-medium">
                        📞 {lead.contactPhone}
                        {lead.contactEmail ? ` · ✉️ ${lead.contactEmail}` : ''}
                      </p>

                      {lead.message ? (
                        <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-3.5 text-xs text-slate-600 leading-relaxed max-w-2xl font-medium">
                          {lead.message}
                        </div>
                      ) : null}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                        {lead.estimatedBudget != null && Number(lead.estimatedBudget) > 0 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                            💰 Buget: {Number(lead.estimatedBudget).toLocaleString('ro-MD')} MDL
                          </span>
                        ) : null}

                        {lead.address ? (
                          <span className="text-xs text-slate-500 font-semibold">
                            📍 {lead.address}
                          </span>
                        ) : null}
                      </div>

                      {lead.estimateProject ? (
                        <p className="text-xs pt-1">
                          <Link
                            to={`/company/smete/${lead.estimateProject.id}`}
                            className="inline-flex items-center gap-1 rounded-xl bg-violet-50 border border-violet-100/50 px-3 py-1 text-xs font-bold text-violet-700 hover:bg-violet-100 transition-colors"
                          >
                            📝 Smetă {lead.estimateProject.number} — {lead.estimateProject.title}
                          </Link>
                        </p>
                      ) : null}
                      
                      <p className="text-[10px] text-slate-400 font-medium">
                        Adăugat la: {new Date(lead.createdAt).toLocaleString('ro-MD')}
                      </p>
                    </div>
                    {lead.status !== 'CONVERTED' && lead.status !== 'LOST' ? (
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead, e.target.value as CompanyLeadStatus)}
                        className={cabinetSelectClass}
                      >
                        {(['NEW', 'CONTACTED', 'QUALIFIED', 'IN_PROGRESS', 'LOST'] as CompanyLeadStatus[]).map(
                          (status) => (
                            <option key={status} value={status}>
                              {LEAD_STATUS_LABELS[status]}
                            </option>
                          ),
                        )}
                      </select>
                    ) : null}
                  </div>

                  {lead.status !== 'CONVERTED' && lead.status !== 'LOST' ? (
                    <div className="flex flex-wrap gap-2">
                      {!lead.customerId ? (
                        <button
                          type="button"
                          onClick={() => handleConvertCustomer(lead.id)}
                          disabled={convertLead.isPending}
                          className={cabinetBtnSecondary}
                        >
                          Salvează în CRM
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleConvertIntervention(lead.id)}
                        disabled={convertLead.isPending}
                        className={cabinetBtnPrimary}
                      >
                        Preia → Lucrare
                      </button>
                      {!lead.estimateProjectId ? (
                        <button
                          type="button"
                          onClick={() => openEstimateConvert(lead)}
                          disabled={convertLead.isPending}
                          className={cabinetBtnSecondary}
                        >
                          → Smetă
                        </button>
                      ) : null}
                      {lead.status === 'IN_PROGRESS' ? (
                        <button
                          type="button"
                          onClick={() => handleCompleteLead(lead.id)}
                          disabled={completeLead.isPending}
                          className={cabinetBtnSecondary}
                        >
                          Finalizează cererea
                        </button>
                      ) : null}
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
                      Finalizată
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
