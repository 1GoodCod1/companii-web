import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import {
  PageHero,
  Panel,
  PanelHeader,
  EmptyState,
  SoftBadge,
} from '@/components/cabinet/cabinet-ui';
import { usePortalLeadsQuery } from '@/features/portal/api/usePortal';
import { formatDateRo } from '@/utils/date';
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_TONES,
  PORTAL_LEAD_SOURCE_LABELS,
} from '@/constants/leads.constants';

export function PortalCereriPage() {
  const { data: leads, isLoading, isError } = usePortalLeadsQuery();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow="Portal client"
        title="Cererile mele"
        description="Cererile trimise către companii — servicii simple sau proiecte complexe."
        action={
          <Link
            to="/companies"
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:opacity-95 transition-opacity"
          >
            Caută companii
          </Link>
        }
      />

      <Panel>
        <PanelHeader
          title="Istoric cereri"
          description="Urmărește statusul cererilor trimise din catalogul public."
        />

        {isLoading ? (
          <p className="text-sm text-gray-400 animate-pulse px-4 pb-6">Se încarcă cererile...</p>
        ) : isError ? (
          <EmptyState message="Nu s-au putut încărca cererile." />
        ) : !leads?.length ? (
          <EmptyState
            message="Nu ai trimis încă nicio cerere."
            action={
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                Deschide profilul unei companii din catalog, alege un serviciu sau trimite o cerere
                de proiect complex.
              </p>
            }
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {leads.map((lead) => (
              <article key={lead.id} className="px-4 py-5 sm:px-6 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {lead.serviceTitle || PORTAL_LEAD_SOURCE_LABELS[lead.source]}
                    </p>
                    <Link
                      to={`/companies/${lead.company.slug}`}
                      className="text-xs font-semibold text-violet-600 hover:underline"
                    >
                      {lead.company.name}
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SoftBadge tone={LEAD_STATUS_TONES[lead.status]}>
                      {LEAD_STATUS_LABELS[lead.status]}
                    </SoftBadge>
                    <SoftBadge tone="gray">{PORTAL_LEAD_SOURCE_LABELS[lead.source]}</SoftBadge>
                  </div>
                </div>

                {lead.message ? (
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                    {lead.message}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400">
                  {lead.category ? <span>{lead.category.name}</span> : null}
                  {lead.estimatedBudget != null && lead.estimatedBudget > 0 ? (
                    <span className="font-semibold text-violet-700">
                      Buget: {Number(lead.estimatedBudget).toLocaleString('ro-MD')} MDL
                    </span>
                  ) : null}
                  {lead.address ? <span>{lead.address}</span> : null}
                  <span>
                    {formatDateRo(lead.createdAt, 'medium')}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>

      <Panel>
        <div className="flex items-start gap-3 px-4 py-5 sm:px-6">
          <ClipboardList className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-gray-500 leading-relaxed">
            <p className="font-semibold text-gray-700">Proiecte complexe</p>
            <p>
              Cererile de proiect se trimit din pagina companiei — secțiunea „Cerere proiect /
              lucrare complexă”. Nu e nevoie de o pagină separată: alege compania, descrie lucrarea
              și o vei găsi aici după trimitere.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
