import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/entities/user/model/authStore';
import {
  useCompanyAuditLogsQuery,
  useCompanyMembersQuery,
} from '@/features/companies/api/useCompanies';
import type { AdminAuditLogDto } from '@/features/admin';
import { auditActionLabel, formatAuditDetails, formatEntityType } from '@/shared/utils/audit';
import { formatAuditActorName } from '@/shared/utils/person';
import { formatDateTimeLocalized } from '@/shared/utils/date';
import { useLocale } from '@/shared/hooks/useLocale';
import {
  PageHero,
  Panel,
  EmptyState,
  AppSelect,
} from '@/widgets/cabinet/cabinet-ui';
import { CompanyOwnerGate } from '@/features/companies';

const COMPANY_AUDIT_ACTION_OPTIONS = [
  { value: 'COMPANY_CREATED', labelFallback: 'Companie creată' },
  { value: 'COMPANY_PUBLISHED', labelFallback: 'Companie publicată' },
  { value: 'COMPANY_SWITCHED', labelFallback: 'Schimbare companie activă' },
  { value: 'TEAM_MEMBER_ROLE_CHANGED', labelFallback: 'Schimbare rol echipă' },
  { value: 'TEAM_MEMBER_DEACTIVATED', labelFallback: 'Dezactivare membru' },
  { value: 'TEAM_MEMBER_LEFT', labelFallback: 'Părăsire echipă' },
  { value: 'TEAM_INVITATION_REVOKED', labelFallback: 'Revocare invitație' },
  { value: 'COMPANY_OWNERSHIP_TRANSFERRED', labelFallback: 'Transfer proprietate' },
  { value: 'SUBSCRIPTION_CHANGED', labelFallback: 'Schimbare plan' },
  { value: 'ESTIMATE_SENT', labelFallback: 'Calcul de preț trimis' },
  { value: 'ESTIMATE_ACCEPTED', labelFallback: 'Calcul de preț acceptat' },
  { value: 'ESTIMATE_REJECTED', labelFallback: 'Calcul de preț respins' },
  { value: 'ESTIMATE_CONVERTED', labelFallback: 'Calcul de preț convertit' },
] as const;

export function CompanyAuditPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId) ?? '';

  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  const { data: members } = useCompanyMembersQuery({ enabled: !!activeCompanyId });
  const { data: logs, isLoading } = useCompanyAuditLogsQuery(activeCompanyId, {
    action: actionFilter || undefined,
    userId: userFilter || undefined,
    limit: 100,
  });

  const actionOptions = useMemo(
    () => [
      { value: '', label: t('company.auditPage.filterAllActions') },
      ...COMPANY_AUDIT_ACTION_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(`admin.auditPage.filterLabels.${opt.value}`, opt.labelFallback),
      })),
    ],
    [t],
  );

  const userOptions = useMemo(
    () => [
      { value: '', label: t('company.auditPage.filterAllUsers') },
      ...(members?.map((m) => ({
        value: m.userId,
        label: `${m.user?.firstName ?? ''} ${m.user?.lastName ?? ''} (${m.role})`.trim(),
      })) ?? []),
    ],
    [members, t],
  );

  return (
    <CompanyOwnerGate>
      <div className="space-y-6 animate-fade-in">
        <PageHero
          title={t('company.auditPage.title')}
          description={t('company.auditPage.description')}
        />

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-3">
          <AppSelect
            value={actionFilter}
            onChange={setActionFilter}
            options={actionOptions}
            aria-label={t('company.auditPage.filterAllActions')}
            className="min-w-[220px]"
            maxVisibleItems={8}
          />

          <AppSelect
            value={userFilter}
            onChange={setUserFilter}
            options={userOptions}
            aria-label={t('company.auditPage.filterAllUsers')}
            className="min-w-[220px]"
            maxVisibleItems={8}
          />
        </div>

        {/* ── Table ── */}
        {isLoading ? (
          <p className="text-sm text-gray-400">{t('company.auditPage.loading')}</p>
        ) : (
          <Panel className="overflow-hidden p-0">
            {!logs?.length ? (
              <EmptyState message={t('company.auditPage.empty')} />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <tr>
                      <th className="px-6 py-3 text-left">{t('company.auditPage.colDate')}</th>
                      <th className="px-6 py-3 text-left">{t('company.auditPage.colAction')}</th>
                      <th className="px-6 py-3 text-left">{t('company.auditPage.colUser')}</th>
                      <th className="px-6 py-3 text-left">{t('company.auditPage.colEntity')}</th>
                      <th className="px-6 py-3 text-left">{t('company.auditPage.colDetails')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map((entry: AdminAuditLogDto) => {
                      const userName = formatAuditActorName(entry.user);
                      const details = formatAuditDetails(
                        entry.action,
                        entry.newData,
                        entry.entityId,
                        t,
                      );

                      return (
                        <tr key={entry.id}>
                          <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                            {formatDateTimeLocalized(entry.createdAt, locale)}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {auditActionLabel(entry.action, t)}
                          </td>
                          <td className="px-6 py-4 text-gray-600">{userName}</td>
                          <td className="px-6 py-4">
                            <span className="text-gray-500">{formatEntityType(entry.entityType)}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={details}>
                            {details}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        )}
      </div>
    </CompanyOwnerGate>
  );
}
