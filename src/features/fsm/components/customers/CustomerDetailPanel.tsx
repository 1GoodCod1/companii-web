import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { cabinetSplitPanelClass } from '@/widgets/cabinet/EntityListDetailLayout';
import {
  EmptyState,
  Panel,
  PanelHeader,
  SoftBadge,
  cabinetFieldClass,
  cabinetLabelClass,
  cabinetBtnSecondary,
  cabinetPanelContentInsetClass,
} from '@/widgets/cabinet/cabinet-ui';
import type { CustomerDto, CustomerTimelineItemDto } from '@/entities/fsm/model/types';
import { useCustomerTimelineQuery } from '@/features/fsm/api/useCustomers';
import {
  buildPortalInviteUrl,
  useCreatePortalInviteMutation,
} from '@/features/companies/api/usePortalInvite';
import { useLocale } from '@/shared/hooks/useLocale';
import {
  timelineHref,
  timelineStatusLabel,
  timelineStatusTone,
} from '@/entities/fsm/model/customerTimeline';
import { formatDateLocalized, formatDateTimeLocalized } from '@/shared/utils/date';
import { getErrorMessage } from '@/shared/utils/errors';

type Props = {
  customer: CustomerDto | null;
  onEdit?: (customer: CustomerDto) => void;
  onDelete?: (id: string) => void;
};

export function CustomerDetailPanel({ customer, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();
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
        toast.success(t('company.fsm.customers.detail.toast.portalLinkCopied'));
      } catch {
        toast.success(t('company.fsm.customers.detail.toast.portalLinkGeneratedManual'));
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.customers.detail.toast.portalInviteError')));
    }
  };

  const handleCopyPortalLink = async () => {
    if (!activePortalInviteLink) return;
    try {
      await navigator.clipboard.writeText(activePortalInviteLink.url);
      toast.success(t('company.fsm.customers.detail.toast.linkCopied'));
    } catch {
      toast.error(t('company.fsm.customers.detail.toast.linkCopyError'));
    }
  };

  return (
    <Panel className={cabinetSplitPanelClass()}>
      <PanelHeader
        title={t('company.fsm.customers.detail.title')}
        description={t('company.fsm.customers.detail.subtitle')}
      />
      <div className={cabinetPanelContentInsetClass}>
      {customer ? (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-gray-900">{customer.fullName}</p>
              <p className="text-[10px] text-gray-400 mt-1">ID: {customer.id}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onEdit?.(customer)}
                className="p-2 hover:bg-violet-50 rounded-xl text-gray-500 hover:text-violet-600 border border-transparent hover:border-violet-100 transition-all cursor-pointer text-xs"
                title={t('cabinet.common.edit')}
              >
                ✏️
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(customer.id)}
                className="p-2 hover:bg-red-50 rounded-xl text-gray-500 hover:text-red-600 border border-transparent hover:border-red-100 transition-all cursor-pointer text-xs"
                title={t('cabinet.common.delete')}
              >
                🗑️
              </button>
            </div>
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
              <p className="text-xs font-semibold text-violet-700 mb-1.5">
                {t('company.fsm.customers.detail.internalNotes')}
              </p>
              <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{customer.notes}</p>
            </div>
          )}

          <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {t('company.fsm.customers.detail.portal.title')}
            </p>
            {customer.portalUserId ? (
              <p className="text-sm font-semibold text-emerald-700">
                {t('company.fsm.customers.detail.portal.alreadyLinked')}
              </p>
            ) : (
              <>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {t('company.fsm.customers.detail.portal.hint')}
                </p>
                <button
                  type="button"
                  onClick={() => handlePortalInvite(customer)}
                  disabled={createPortalInvite.isPending}
                  className={cabinetBtnSecondary}
                >
                  {createPortalInvite.isPending
                    ? t('company.fsm.customers.detail.portal.generating')
                    : activePortalInviteLink
                      ? t('company.fsm.customers.detail.portal.regenerate')
                      : t('company.fsm.customers.detail.portal.generate')}
                </button>
                {activePortalInviteLink && (
                  <div className="space-y-2">
                    <label className={cabinetLabelClass}>
                      {t('company.fsm.customers.detail.portal.linkLabel')}
                    </label>
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
                        {t('cabinet.common.copy')}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {t('company.fsm.customers.detail.portal.expiryNote', {
                        date: formatDateTimeLocalized(activePortalInviteLink.expiresAt, locale, 'datetimeShort'),
                      })}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="pt-2 text-xs text-gray-400">
            {t('company.fsm.customers.detail.registeredAt')}{' '}
            {customer.createdAt
              ? formatDateLocalized(customer.createdAt, locale)
              : t('company.fsm.common.unspecified')}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              {t('company.fsm.customers.detail.timeline.title')}
            </p>
            {timelineLoading ? (
              <p className="text-xs text-gray-400">{t('company.fsm.customers.detail.timeline.loading')}</p>
            ) : !timeline?.items.length ? (
              <EmptyState message={t('company.fsm.customers.detail.timeline.empty')} />
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
                            {formatDateLocalized(item.at, locale, 'medium')}
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
        <EmptyState message={t('company.fsm.customers.detail.empty')} fill />
      )}
      </div>
    </Panel>
  );
}
