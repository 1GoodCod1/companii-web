import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuditQuery, useAdminCompaniesQuery, type AdminAuditLogDto } from '@/features/admin/api/useAdmin';
import {
  AUDIT_ACTION_FILTER_OPTIONS,
} from '@/constants/admin.constants';
import {
  auditActionLabel,
  formatAuditDetails,
} from '@/utils/audit';
import { formatAuditActorName } from '@/utils/person';
import { formatDateTimeRo } from '@/utils/date';

export function AdminAuditPage() {
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
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Audit platformă</h1>
        <p className="text-gray-500 text-sm mt-1">
          Jurnal acțiuni administrative. Filtrați după companie sau tip acțiune.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white min-w-[220px]"
        >
          <option value="">Toate companiile</option>
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
          <option value="">Toate acțiunile</option>
          {AUDIT_ACTION_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Se încarcă jurnalul...</p>
      ) : (
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-premium overflow-hidden">
          {!logs?.length ? (
            <p className="p-6 text-sm text-gray-500">Nicio înregistrare.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="px-6 py-3 text-left">Data</th>
                    <th className="px-6 py-3 text-left">Acțiune</th>
                    <th className="px-6 py-3 text-left">Utilizator</th>
                    <th className="px-6 py-3 text-left">Entitate</th>
                    <th className="px-6 py-3 text-left">Detalii</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((entry: AdminAuditLogDto) => {
                    const userName = formatAuditActorName(entry.user);
                    const details = formatAuditDetails(
                      entry.action,
                      entry.newData,
                      entry.entityId,
                    );

                    return (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {formatDateTimeRo(entry.createdAt)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {auditActionLabel(entry.action)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{userName}</td>
                        <td className="px-6 py-4">
                          {entry.entityType === 'Company' && entry.entityId ? (
                            <Link
                              to={`/admin/companies?moderate=${entry.entityId}`}
                              className="text-violet-600 hover:text-violet-700 font-medium"
                            >
                              Companie
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
