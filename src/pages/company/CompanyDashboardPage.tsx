import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  PageHero,
  Panel,
  PanelHeader,
  EmptyState,
  SoftBadge,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import {
  useCustomersQuery,
  useInterventionsQuery,
  useInvoicesQuery,
  useLeadsQuery,
  useConvertLeadMutation,
} from '@/features/fsm/api/useFsm';
import { useCompanyMeQuery } from '@/features/companies/api/useCompanies';
import { useMySubscriptionQuery } from '@/features/subscriptions/api/useSubscriptions';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';
import { needsCompanyOnboarding } from '@/features/companies/companyHomeRoute';
import { useAuthStore } from '@/stores/authStore';
import type { CompanyLeadDto, InterventionDto, InvoiceDto } from '@/features/fsm/types';

const KPI_ACCENTS = [
  { icon: '👥', tone: 'from-blue-500/10 to-cyan-500/5', iconBg: 'bg-blue-500/10 text-blue-600' },
  { icon: '🔧', tone: 'from-amber-500/10 to-orange-500/5', iconBg: 'bg-amber-500/10 text-amber-600' },
  { icon: '📊', tone: 'from-violet-500/10 to-indigo-500/5', iconBg: 'bg-violet-500/10 text-violet-600' },
  { icon: '💰', tone: 'from-emerald-500/10 to-teal-500/5', iconBg: 'bg-emerald-500/10 text-emerald-600' },
] as const;

function paymentStatusClass(status: string): string {
  if (status === 'PAID') return 'bg-emerald-50 text-emerald-700';
  if (status === 'OVERDUE') return 'bg-red-50 text-red-700';
  return 'bg-amber-50 text-amber-700';
}

export function CompanyDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { isManagement, isOwner, activeCompanyId } = useCompanyPermissions();
  const { data: meData } = useCompanyMeQuery();
  const { data: subData } = useMySubscriptionQuery();
  const { data: customers } = useCustomersQuery({ enabled: isManagement });
  const { data: interventions } = useInterventionsQuery();
  const { data: invoices } = useInvoicesQuery({ enabled: isManagement });
  const { data: newLeads } = useLeadsQuery('NEW');
  const convertLead = useConvertLeadMutation();

  const handleConvertLead = async (leadId: string, mode: 'intervention' | 'estimate') => {
    try {
      await convertLead.mutateAsync({ id: leadId, mode });
      toast.success(mode === 'intervention' ? 'Cerere preluată ca lucrare.' : 'Cerere convertită în smetă.');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Nu s-a putut converti cererea.');
    }
  };

  const activeInterventions =
    interventions?.filter(
      (i) =>
        i.status !== 'COMPLETED' && i.status !== 'CANCELLED' && i.status !== 'PAID',
    ) || [];

  const totalInvoiced =
    invoices?.reduce((acc, inv) => acc + Number(inv.amount), 0) || 0;
  const paidInvoices = invoices?.filter((inv) => inv.paymentStatus === 'PAID') || [];
  const totalPaid = paidInvoices.reduce((acc, inv) => acc + Number(inv.amount), 0) || 0;

  const memberships = meData?.memberships || [];
  const activeMembership = memberships.find((m) => m.companyId === activeCompanyId);
  const activeCompany =
    meData?.owned.find((company) => company.id === activeCompanyId) ??
    activeMembership?.company ??
    meData?.owned?.[0];
  const onboardingRequired = needsCompanyOnboarding({
    activeCompanyId,
    ownedCount: meData?.owned?.length ?? 0,
    membershipCount: memberships.length,
  });
  const subscription = subData;
  const activePlanName =
    subscription?.plan?.name || activeCompany?.subscription?.plan?.name || 'Free';

  const displayName = activeCompany?.name || user?.email?.split('@')[0] || 'Utilizator';

  const kpis = isManagement
    ? [
        {
          label: 'Clienți totali',
          value: String(customers?.length || 0),
          hint: 'Înregistrați în sistem',
          hintClass: 'text-emerald-600',
          accent: KPI_ACCENTS[0],
        },
        {
          label: 'Lucrări active',
          value: String(activeInterventions.length),
          hint: 'În curs de execuție',
          hintClass: 'text-amber-600',
          accent: KPI_ACCENTS[1],
        },
        {
          label: 'Total facturat',
          value: totalInvoiced.toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' }),
          hint: 'Valoare totală facturi',
          hintClass: 'text-gray-400',
          accent: KPI_ACCENTS[2],
        },
        {
          label: 'Încasări confirmate',
          value: totalPaid.toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' }),
          hint: 'Facturi plătite integral',
          hintClass: 'text-emerald-600',
          accent: KPI_ACCENTS[3],
          valueClass: 'text-emerald-600',
        },
      ]
    : [
        {
          label: 'Lucrările mele',
          value: String(interventions?.length || 0),
          hint: 'Total alocate',
          hintClass: 'text-violet-600',
          accent: KPI_ACCENTS[1],
        },
        {
          label: 'Lucrări active',
          value: String(activeInterventions.length),
          hint: 'De executat acum',
          hintClass: 'text-amber-600',
          accent: KPI_ACCENTS[0],
        },
        {
          label: 'Programate azi',
          value: String(
            interventions?.filter((i) => {
              if (!i.scheduledAt) return false;
              const d = new Date(i.scheduledAt);
              const now = new Date();
              return (
                d.getFullYear() === now.getFullYear() &&
                d.getMonth() === now.getMonth() &&
                d.getDate() === now.getDate()
              );
            }).length || 0,
          ),
          hint: 'Pe calendarul de azi',
          hintClass: 'text-blue-600',
          accent: KPI_ACCENTS[2],
        },
        {
          label: 'Finalizate',
          value: String(
            interventions?.filter((i) => i.status === 'COMPLETED' || i.status === 'PAID').length ||
              0,
          ),
          hint: 'Lucrări închise',
          hintClass: 'text-emerald-600',
          accent: KPI_ACCENTS[3],
          valueClass: 'text-emerald-600',
        },
      ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow="Panou principal"
        title={`Salut, ${displayName}! 👋`}
        description={
          isManagement
            ? 'Bine ai venit la panoul tău Faber CRM. Iată starea afacerii tale astăzi.'
            : 'Bine ai venit! Iată lucrările alocate ție și programarea de azi.'
        }
        action={
          onboardingRequired ? (
            <Link
              to="/company/profile"
              className="inline-flex items-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-violet-700 transition-colors"
            >
              Înregistrează compania
            </Link>
          ) : isManagement && activeCompany ? (
            <div className="text-right shrink-0">
              <SoftBadge tone="emerald">{activePlanName}</SoftBadge>
              <p className="text-xs text-gray-400 mt-2">Abonament activ</p>
              {isOwner ? (
                <Link
                  to="/company/subscription"
                  className="inline-block mt-2 text-xs font-semibold text-violet-600 hover:text-violet-700"
                >
                  Gestionează planul →
                </Link>
              ) : null}
            </div>
          ) : isManagement ? (
            <Link to="/company/profile" className="inline-flex items-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-violet-700 transition-colors">
              Creează profil companie
            </Link>
          ) : undefined
        }
      />

      {onboardingRequired ? (
        <Panel className="p-5 border border-amber-100 bg-amber-50/50">
          <p className="text-sm text-gray-800 leading-relaxed">
            Contul tău nu este legat încă de o companie. Completează{' '}
            <Link to="/company/profile" className="font-semibold text-violet-700 hover:text-violet-800">
              profilul companiei
            </Link>{' '}
            (IDNO, adresă, categorie) pentru a accesa clienți, cereri și restul modulelor.
          </p>
        </Panel>
      ) : null}

      {!isManagement && !onboardingRequired ? (
        <Panel className="p-4 border border-violet-100 bg-violet-50/40">
          <p className="text-sm text-gray-700">
            Cont de <strong>tehnician</strong> — clienții, cererile și setările companiei le gestionează managerul.
            Lucrările tale sunt în{' '}
            <Link to="/company/lucrari" className="font-semibold text-violet-700 hover:text-violet-800">
              Lucrări
            </Link>{' '}
            și{' '}
            <Link to="/company/calendar" className="font-semibold text-violet-700 hover:text-violet-800">
              Calendar
            </Link>
            . Pentru a-ți înregistra propria companie, ieși din cont și creează un cont nou de tip «Companie» pe pagina publică de înregistrare.
          </p>
        </Panel>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${kpi.accent.tone} p-5 shadow-premium`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {kpi.label}
              </span>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-2xl text-lg ${kpi.accent.iconBg}`}
              >
                {kpi.accent.icon}
              </span>
            </div>
            <p
              className={`mt-5 text-2xl sm:text-3xl font-black tracking-tight text-gray-900 ${kpi.valueClass ?? ''}`}
            >
              {kpi.value}
            </p>
            <p className={`text-[10px] font-bold mt-2 ${kpi.hintClass}`}>{kpi.hint}</p>
          </article>
        ))}
      </div>

      <div className={`grid grid-cols-1 gap-5 sm:gap-6 ${isManagement ? 'xl:grid-cols-3 lg:grid-cols-2' : 'lg:grid-cols-2'}`}>
        {isManagement ? (
          <Panel>
            <PanelHeader
              title="Cereri noi"
              action={
                <Link to="/company/cereri" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                  Vezi toate →
                </Link>
              }
            />

            {!newLeads?.length ? (
              <EmptyState message="Nicio cerere nouă din pachete sau site." />
            ) : (
              <div className="space-y-3">
                {newLeads.slice(0, 5).map((lead: CompanyLeadDto) => (
                  <div
                    key={lead.id}
                    className="rounded-2xl bg-white/70 px-4 py-3.5 space-y-2.5 transition-colors hover:bg-violet-50/40"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">{lead.contactName}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {lead.contactPhone}
                        {lead.contactEmail ? ` · ${lead.contactEmail}` : ''}
                      </p>
                      {lead.serviceTitle ? (
                        <p className="text-xs font-semibold text-violet-600 mt-1">{lead.serviceTitle}</p>
                      ) : null}
                      {lead.message ? (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{lead.message}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleConvertLead(lead.id, 'intervention')}
                        disabled={convertLead.isPending}
                        className={cabinetBtnPrimary}
                      >
                        Preia → Lucrare
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConvertLead(lead.id, 'estimate')}
                        disabled={convertLead.isPending}
                        className={cabinetBtnSecondary}
                      >
                        → Smetă
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        ) : null}

        <Panel>
          <PanelHeader
            title="Lucrări recente active"
            action={
              <Link to="/company/lucrari" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                Vezi toate
              </Link>
            }
          />

          {activeInterventions.length === 0 ? (
            <EmptyState
              message="Nicio lucrare activă în acest moment."
              action={
                isManagement ? (
                  <Link to="/company/lucrari" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                    + Creează lucrare
                  </Link>
                ) : (
                  <Link to="/company/lucrari" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                    Vezi lucrările mele
                  </Link>
                )
              }
            />
          ) : (
            <div className="space-y-2.5">
              {activeInterventions.slice(0, 5).map((inter: InterventionDto) => (
                <div
                  key={inter.id}
                  className="flex justify-between items-center gap-4 rounded-2xl bg-white/70 px-4 py-3.5 transition-colors hover:bg-violet-50/40"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {inter.number}
                    </span>
                    <h3 className="font-semibold text-gray-800 text-sm mt-0.5 truncate">{inter.type}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{inter.customer?.fullName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <SoftBadge tone="blue">{inter.status}</SoftBadge>
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      {inter.scheduledAt
                        ? new Date(inter.scheduledAt).toLocaleDateString('ro-MD')
                        : 'Nespecificat'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {isManagement ? (
          <Panel>
            <PanelHeader
              title="Facturi recente"
              action={
                <Link to="/company/facturi" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                  Vezi toate
                </Link>
              }
            />

            {!invoices?.length ? (
              <EmptyState
                message="Nicio factură emisă în acest moment."
                action={
                  <Link to="/company/facturi" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                    + Generează factură
                  </Link>
                }
              />
            ) : (
              <div className="space-y-2.5">
                {invoices.slice(0, 5).map((inv: InvoiceDto) => (
                  <div
                  key={inv.id}
                  className="flex justify-between items-center gap-4 rounded-2xl bg-white/70 px-4 py-3.5 transition-colors hover:bg-violet-50/40"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {inv.number}
                    </span>
                    <h3 className="font-bold text-gray-800 text-sm mt-0.5">
                      {Number(inv.amount).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {inv.intervention?.customer?.fullName || 'Client pachet'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${paymentStatusClass(inv.paymentStatus)}`}
                    >
                      {inv.paymentStatus}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      Scadent:{' '}
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('ro-MD') : 'Imediat'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
        ) : null}
      </div>
    </div>
  );
}
