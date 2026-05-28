import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import {
  useCompanyAuditLogsQuery,
  useCompanyMembersQuery,
} from '@/features/companies/api/useCompanies';
import type { AdminAuditLogDto } from '@/features/admin/api/useAdmin';
import { auditActionLabel, formatAuditDetails, formatEntityType } from '@/utils/audit';
import { formatAuditActorName } from '@/utils/person';
import { formatDateTimeLocalized } from '@/utils/date';
import { useLocale } from '@/hooks/useLocale';
import {
  PageHero,
  Panel,
  EmptyState,
} from '@/components/cabinet/cabinet-ui';
import { CompanyOwnerGate } from '@/features/companies/CompanyManagementGate';

/** Company-level audit filter options relevant for an owner. */
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
  { value: 'ESTIMATE_SENT', labelFallback: 'Smetă trimisă' },
  { value: 'ESTIMATE_ACCEPTED', labelFallback: 'Smetă acceptată' },
  { value: 'ESTIMATE_REJECTED', labelFallback: 'Smetă respinsă' },
  { value: 'ESTIMATE_CONVERTED', labelFallback: 'Smetă convertită' },
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

  return (
    <CompanyOwnerGate>
      <div className="space-y-6 animate-fade-in">
        <PageHero
          title={t('company.auditPage.title')}
          description={t('company.auditPage.description')}
        />

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-3">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="border border-gray-200 px-4 py-2.5 text-sm bg-white min-w-[220px]"
          >
            <option value="">{t('company.auditPage.filterAllActions')}</option>
            {COMPANY_AUDIT_ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(`admin.auditPage.filterLabels.${opt.value}`, opt.labelFallback)}
              </option>
            ))}
          </select>

          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="border border-gray-200 px-4 py-2.5 text-sm bg-white min-w-[220px]"
          >
            <option value="">{t('company.auditPage.filterAllUsers')}</option>
            {members?.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user?.firstName ?? ''} {m.user?.lastName ?? ''} ({m.role})
              </option>
            ))}
          </select>
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
