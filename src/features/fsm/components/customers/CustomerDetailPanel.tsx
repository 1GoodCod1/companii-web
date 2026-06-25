import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { cabinetSplitDetailPanelClass } from '@/widgets/cabinet/EntityListDetailLayout';
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
import { cn } from '@/lib/utils';
import type { CustomerDto, CustomerTimelineGroupDto, CustomerTimelineItemDto } from '@/entities/fsm/model/types';
import { useCustomerTimelineQuery } from '@/features/fsm/api/useCustomers';
import {
  buildPortalInviteUrl,
  useCreatePortalInviteMutation,
} from '@/features/companies/api/usePortalInvite';
import { useLocale } from '@/shared/hooks/useLocale';
import type { AppLanguage } from '@/shared/config/i18n/utils';
import type { TFunction } from 'i18next';
import {
  timelineGroupKindLabel,
  timelineGroupStatusLabel,
  timelineGroupStatusTone,
  timelineHref,
  timelineStatusLabel,
  timelineStatusTone,
  timelineStepTypeLabel,
} from '@/entities/fsm/model/customerTimeline';
import { formatDateLocalized, formatDateTimeLocalized } from '@/shared/utils/date';
import { getErrorMessage } from '@/shared/utils/errors';

type Props = {
  customer: CustomerDto | null;
  onEdit?: (customer: CustomerDto) => void;
  onDelete?: (id: string) => void;
};

type DetailTab = 'details' | 'history';

function customerInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function CustomerDetailPanel({ customer, onEdit, onDelete }: Props) {
  const { t } = useTranslation();

  return (
    <Panel className={cabinetSplitDetailPanelClass()}>
      {customer ? (
        <CustomerDetailContent
          key={customer.id}
          customer={customer}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <>
          <PanelHeader
            title={t('company.fsm.customers.detail.title')}
            description={t('company.fsm.customers.detail.subtitle')}
          />
          <div className={cabinetPanelContentInsetClass}>
            <EmptyState message={t('company.fsm.customers.detail.empty')} fill />
          </div>
        </>
      )}
    </Panel>
  );
}

function CustomerDetailContent({
  customer,
  onEdit,
  onDelete,
}: {
  customer: CustomerDto;
  onEdit?: (customer: CustomerDto) => void;
  onDelete?: (id: string) => void;
}) {
  const { t } = useTranslation();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<DetailTab>('details');

  const tabs: { id: DetailTab; label: string }[] = [
    { id: 'details', label: t('company.fsm.customers.detail.tabs.details') },
    { id: 'history', label: t('company.fsm.customers.detail.tabs.history') },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-700">
            {customerInitials(customer.fullName)}
          </span>
          <div className="min-w-0">
            <p className="text-lg font-black tracking-tight text-gray-900 truncate">
              {customer.fullName}
            </p>
            <p className="text-[11px] text-gray-400">
              {t('company.fsm.customers.detail.registeredAt')}{' '}
              {customer.createdAt
                ? formatDateLocalized(customer.createdAt, locale)
                : t('company.fsm.common.unspecified')}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(customer)}
            className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-violet-200 hover:text-violet-700"
          >
            {t('cabinet.common.edit')}
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(customer.id)}
            className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-red-200 hover:text-red-600"
          >
            {t('cabinet.common.delete')}
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-5 border-b border-gray-200" role="tablist">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                '-mb-px border-b-2 px-1 pb-2.5 text-xs font-bold transition-colors',
                active
                  ? 'border-violet-600 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {activeTab === 'details' ? (
          <CustomerDetailsTab customer={customer} />
        ) : (
          <CustomerHistoryTab customer={customer} />
        )}
      </div>
    </div>
  );
}

function CustomerDetailsTab({ customer }: { customer: CustomerDto }) {
  const { t } = useTranslation();

  const rows: { label: string; value: string | null | undefined; strong?: boolean }[] = [
    { label: t('company.fsm.customers.detail.contact.phone'), value: customer.phone, strong: true },
    { label: t('company.fsm.customers.detail.contact.email'), value: customer.email },
    { label: t('company.fsm.customers.detail.contact.address'), value: customer.address },
  ];

  return (
    <div className="space-y-4">
      <dl className="divide-y divide-gray-100 rounded-xl bg-slate-50/80">
        {rows
          .filter((row) => row.value)
          .map((row) => (
            <div key={row.label} className="flex items-baseline gap-4 px-4 py-3">
              <dt className="w-20 shrink-0 text-[10px] font-black uppercase tracking-widest text-gray-400">
                {row.label}
              </dt>
              <dd
                className={cn(
                  'text-sm text-gray-800 break-words min-w-0',
                  row.strong ? 'font-bold' : 'font-medium',
                )}
              >
                {row.value}
              </dd>
            </div>
          ))}
      </dl>

      {customer.notes ? (
        <div className="rounded-xl bg-violet-50/40 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-violet-700 mb-1.5">
            {t('company.fsm.customers.detail.internalNotes')}
          </p>
          <p className="text-xs leading-relaxed text-gray-600 whitespace-pre-wrap">{customer.notes}</p>
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2.5">
          {t('company.fsm.customers.detail.portal.title')}
        </p>
        <CustomerPortalBlock customer={customer} />
      </div>
    </div>
  );
}

function CustomerPortalBlock({ customer }: { customer: CustomerDto }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const createPortalInvite = useCreatePortalInviteMutation();
  const [portalInviteLink, setPortalInviteLink] = useState<{
    url: string;
    expiresAt: string;
  } | null>(null);

  const handlePortalInvite = async () => {
    try {
      const invite = await createPortalInvite.mutateAsync(customer.id);
      const inviteUrl = buildPortalInviteUrl(invite.token);
      setPortalInviteLink({ url: inviteUrl, expiresAt: invite.expiresAt });
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
    if (!portalInviteLink) return;
    try {
      await navigator.clipboard.writeText(portalInviteLink.url);
      toast.success(t('company.fsm.customers.detail.toast.linkCopied'));
    } catch {
      toast.error(t('company.fsm.customers.detail.toast.linkCopyError'));
    }
  };

  if (customer.portalUserId) {
    return (
      <div className="rounded-xl bg-emerald-50/60 p-4">
        <p className="text-sm font-semibold text-emerald-700">
          {t('company.fsm.customers.detail.portal.alreadyLinked')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-gray-500">
        {t('company.fsm.customers.detail.portal.hint')}
      </p>
      <button
        type="button"
        onClick={handlePortalInvite}
        disabled={createPortalInvite.isPending}
        className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
      >
        {createPortalInvite.isPending
          ? t('company.fsm.customers.detail.portal.generating')
          : portalInviteLink
            ? t('company.fsm.customers.detail.portal.regenerate')
            : t('company.fsm.customers.detail.portal.generate')}
      </button>
      {portalInviteLink ? (
        <div className="space-y-2">
          <label htmlFor="customer-portal-link" className={cabinetLabelClass}>
            {t('company.fsm.customers.detail.portal.linkLabel')}
          </label>
          <div className="flex gap-2">
            <input
              id="customer-portal-link"
              type="text"
              readOnly
              value={portalInviteLink.url}
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
              date: formatDateTimeLocalized(portalInviteLink.expiresAt, locale, 'datetimeShort'),
            })}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function CustomerHistoryTab({ customer }: { customer: CustomerDto }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data: timeline, isLoading: timelineLoading } = useCustomerTimelineQuery(
    customer.id,
    true,
  );

  if (timelineLoading) {
    return <p className="text-xs text-gray-400">{t('company.fsm.customers.detail.timeline.loading')}</p>;
  }

  const groups = timeline?.groups ?? [];

  if (!groups.length) {
    return <EmptyState message={t('company.fsm.customers.detail.timeline.empty')} />;
  }

  return (
    <ol className="space-y-3">
      {groups.map((group: CustomerTimelineGroupDto) => (
        <CustomerTimelineGroupCard key={group.id} group={group} locale={locale} t={t} />
      ))}
    </ol>
  );
}

function CustomerTimelineGroupCard({
  group,
  locale,
  t,
}: {
  group: CustomerTimelineGroupDto;
  locale: AppLanguage;
  t: TFunction;
}) {
  const groupStatus = timelineGroupStatusLabel(group, t);

  return (
    <li className="overflow-hidden border border-[var(--dashboard-divider)] border-l-[3px] border-l-[var(--dashboard-accent)] bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
            {timelineGroupKindLabel(group.kind, t)}
          </p>
          <p className="text-sm font-black tracking-tight text-gray-900">{group.title}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {groupStatus ? (
            <SoftBadge tone={timelineGroupStatusTone(group)}>{groupStatus}</SoftBadge>
          ) : null}
          <span className="text-[10px] font-medium text-gray-400">
            {formatDateLocalized(group.at, locale, 'medium')}
          </span>
        </div>
      </div>

      {group.steps.length > 1 ? (
        <ul className="divide-y divide-[var(--dashboard-divider)] border-t border-[var(--dashboard-divider)]">
          {group.steps.map((step: CustomerTimelineItemDto) => {
            const href = timelineHref(step);
            const statusLabel = timelineStatusLabel(step);
            return (
              <li
                key={`${group.id}-${step.type}-${step.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    {timelineStepTypeLabel(step.type, t)}
                  </p>
                  {href ? (
                    <Link
                      to={href}
                      className="text-xs font-semibold text-[var(--dashboard-accent)] hover:opacity-80"
                    >
                      {step.title}
                    </Link>
                  ) : (
                    <p className="text-xs font-semibold text-gray-800">{step.title}</p>
                  )}
                  {step.subtitle ? (
                    <p className="text-[11px] text-gray-500">{step.subtitle}</p>
                  ) : null}
                </div>
                {statusLabel ? (
                  <SoftBadge tone={timelineStatusTone(step)}>{statusLabel}</SoftBadge>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </li>
  );
}
