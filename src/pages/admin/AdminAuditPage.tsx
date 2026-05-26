import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminAuditQuery, useAdminCompaniesQuery, type AdminAuditLogDto } from '@/features/admin/api/useAdmin';
import { AUDIT_ACTION_FILTER_OPTIONS } from '@/constants/admin.constants';
import { auditActionLabel, formatAuditDetails } from '@/utils/audit';
import { formatAuditActorName } from '@/utils/person';
import { formatDateTimeLocalized } from '@/utils/date';
import { useLocale } from '@/hooks/useLocale';

export function AdminAuditPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data: companies } = useAdminCompaniesQuery();
  const [companyId, setCompanyId] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const filters = {
    ...(companyId ? { entityType: 'Company', entityId: companyId } : {}),
    ...(actionFilter ? { action: actionFilter } : {}),
  };

  const { data: logs, isLoading } = useAdminAuditQuery(filters);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('admin.auditPage.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('admin.auditPage.description')}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white min-w-[220px]"
        >
          <option value="">{t('admin.auditPage.filterAllCompanies')}</option>
          {companies?.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white min-w-[220px]"
        >
          <option value="">{t('admin.auditPage.filterAllActions')}</option>
          {AUDIT_ACTION_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(`admin.auditPage.filterLabels.${option.value}`, option.label)}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">{t('admin.auditPage.loading')}</p>
      ) : (
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-premium overflow-hidden">
          {!logs?.length ? (
            <p className="p-6 text-sm text-gray-500">{t('cabinet.common.noRecords')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="px-6 py-3 text-left">{t('admin.auditPage.colDate')}</th>
                    <th className="px-6 py-3 text-left">{t('admin.auditPage.colAction')}</th>
                    <th className="px-6 py-3 text-left">{t('admin.auditPage.colUser')}</th>
                    <th className="px-6 py-3 text-left">{t('admin.auditPage.colEntity')}</th>
                    <th className="px-6 py-3 text-left">{t('admin.auditPage.colDetails')}</th>
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
                          {entry.entityType === 'Company' && entry.entityId ? (
                            <Link
                              to={`/admin/companies?moderate=${entry.entityId}`}
                              className="text-violet-600 hover:text-violet-700 font-medium"
                            >
                              {t('admin.auditPage.entityCompany')}
                            </Link>
                          ) : (
                            <span className="text-gray-400">{entry.entityType ?? '—'}</span>
                          )}
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
        </div>
      )}
    </div>
  );
}
