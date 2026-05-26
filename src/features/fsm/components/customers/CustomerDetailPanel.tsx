import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  EmptyState,
  Panel,
  PanelHeader,
  SoftBadge,
  cabinetFieldClass,
  cabinetLabelClass,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import type { CustomerDto, CustomerTimelineItemDto } from '@/types/fsm';
import { useCustomerTimelineQuery } from '@/features/fsm/api/useCustomers';
import {
  buildPortalInviteUrl,
  useCreatePortalInviteMutation,
} from '@/features/companies/api/usePortalInvite';
import {
  timelineHref,
  timelineStatusLabel,
  timelineStatusTone,
} from '@/utils/customerTimeline';
import { formatDateRo, formatDateTimeRo } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';

type Props = {
  customer: CustomerDto | null;
};

export function CustomerDetailPanel({ customer }: Props) {
  const createPortalInvite = useCreatePortalInviteMutation();
  const [portalInviteLink, setPortalInviteLink] = useState<{
    customerId: string;
    url: string;
    expiresAt: string;
  } | null>(null);

  const activePortalInviteLink =
    portalInviteLink && customer?.id === portalInviteLink.customerId ? portalInviteLink : null;

  const { data: timeline, isLoading: timelineLoading } = useCustomerTimelineQuery(
    customer?.id ?? '',
    !!customer,
  );

  const handlePortalInvite = async (c: CustomerDto) => {
    try {
      const invite = await createPortalInvite.mutateAsync(c.id);
      const inviteUrl = buildPortalInviteUrl(invite.token);
      setPortalInviteLink({
        customerId: c.id,
        url: inviteUrl,
        expiresAt: invite.expiresAt,
      });
      try {
        await navigator.clipboard.writeText(inviteUrl);
        toast.success('Link portal generat și copiat în clipboard.');
      } catch {
        toast.success('Link portal generat. Copiază manual din câmp.');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut genera invitația.'));
    }
  };

  const handleCopyPortalLink = async () => {
    if (!activePortalInviteLink) return;
    try {
      await navigator.clipboard.writeText(activePortalInviteLink.url);
      toast.success('Link copiat în clipboard.');
    } catch {
      toast.error('Nu s-a putut copia linkul.');
    }
  };

  return (
    <Panel>
      <PanelHeader title="Detalii client" description="Selectează un client din listă." />
      {customer ? (
        <div className="space-y-4">
          <div>
            <p className="text-lg font-semibold text-gray-900">{customer.fullName}</p>
            <p className="text-[10px] text-gray-400 mt-1">ID: {customer.id}</p>
          </div>

          <div className="space-y-2.5 text-sm text-gray-700 bg-slate-50/80 p-4 rounded-xl">
            <div className="flex items-center gap-2.5">
              <span className="text-gray-400">📞</span>
              <span className="font-bold text-gray-800">{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-2.5">
                <span className="text-gray-400">✉️</span>
                <span className="font-medium text-gray-600">{customer.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <span className="text-gray-400">📍</span>
              <span className="text-gray-600 font-medium">{customer.address}</span>
            </div>
          </div>

          {customer.notes && (
            <div className="bg-violet-50/40 p-3.5 rounded-xl">
              <p className="text-xs font-semibold text-violet-700 mb-1.5">Note interne</p>
              <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{customer.notes}</p>
            </div>
          )}

          <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Acces portal client</p>
            {customer.portalUserId ? (
              <p className="text-sm font-semibold text-emerald-700">Clientul are deja cont legat în portal.</p>
            ) : (
              <>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Trimite linkul clientului sau lasă-l să se înregistreze cu același telefon/email.
                </p>
                <button
                  type="button"
                  onClick={() => handlePortalInvite(customer)}
                  disabled={createPortalInvite.isPending}
                  className={cabinetBtnSecondary}
                >
                  {createPortalInvite.isPending
                    ? 'Se generează...'
                    : activePortalInviteLink
                      ? 'Regenerează link portal'
                      : 'Generează link portal'}
                </button>
                {activePortalInviteLink && (
                  <div className="space-y-2">
                    <label className={cabinetLabelClass}>Link portal (valabil 2 ore)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={activePortalInviteLink.url}
                        className={`${cabinetFieldClass} text-xs font-mono`}
                        onFocus={(e) => e.target.select()}
                      />
                      <button
                        type="button"
                        onClick={handleCopyPortalLink}
                        className={`${cabinetBtnSecondary} shrink-0 px-3`}
                      >
                        Copiază
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Expiră la:{' '}
                      {formatDateTimeRo(activePortalInviteLink.expiresAt, 'datetimeShort')}
                      . Linkurile vechi devin invalide la regenerare.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="pt-2 text-xs text-gray-400">
            Înregistrat la:{' '}
            {customer.createdAt
              ? formatDateRo(customer.createdAt)
              : 'Nespecificat'}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Istoric client</p>
            {timelineLoading ? (
              <p className="text-xs text-gray-400">Se încarcă istoricul...</p>
            ) : !timeline?.items.length ? (
              <EmptyState message="Nicio activitate înregistrată." />
            ) : (
              <ol className="relative border-l border-violet-100 ml-2 space-y-4">
                {timeline.items.map((item: CustomerTimelineItemDto) => {
                  const href = timelineHref(item);
                  const statusLabel = timelineStatusLabel(item);
                  return (
                    <li key={item.id} className="ml-4">
                      <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-violet-400 ring-4 ring-white" />
                      <div className="rounded-xl bg-slate-50/80 px-3 py-2.5 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <SoftBadge tone="violet">{item.type}</SoftBadge>
                            {statusLabel ? (
                              <SoftBadge tone={timelineStatusTone(item)}>{statusLabel}</SoftBadge>
                            ) : null}
                          </div>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {formatDateRo(item.at, 'medium')}
                          </span>
                        </div>
                        {href ? (
                          <Link to={href} className="text-sm font-semibold text-violet-700 hover:text-violet-800">
                            {item.title}
                          </Link>
                        ) : (
                          <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        )}
                        {item.subtitle ? <p className="text-xs text-gray-500">{item.subtitle}</p> : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      ) : (
        <EmptyState message="Selectează un client din listă pentru a-i vedea profilul detaliat." />
      )}
    </Panel>
  );
}
