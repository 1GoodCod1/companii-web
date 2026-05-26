import { useState } from 'react';
import { useAdminPendingCompaniesQuery, useAdminStatsQuery, type AdminCompanyDto } from '@/features/admin/api/useAdmin';
import { AdminCompanyModerationModal } from '@/features/admin/components/AdminCompanyModerationModal';
import { formatDateRo } from '@/utils/date';

export function AdminHomePage() {
  const { data: stats, isLoading: statsLoading } = useAdminStatsQuery();
  const { data: pending, isLoading: pendingLoading } = useAdminPendingCompaniesQuery();
  const [moderationCompanyId, setModerationCompanyId] = useState<string | null>(null);

  const statCards = [
    { label: 'Companii', value: stats?.companies ?? 0 },
    { label: 'Utilizatori', value: stats?.users ?? 0 },
    { label: 'Intervenții', value: stats?.interventions ?? 0 },
    { label: 'Waitlist', value: stats?.waitlist ?? 0 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Panou administrare</h1>
        <p className="text-gray-500 text-sm mt-1">
          Monitorizați platforma Faber Companii și gestionați verificările companiilor.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl p-5 shadow-premium"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {card.label}
            </p>
            <p className="text-3xl font-black text-gray-900 mt-2">
              {statsLoading ? '…' : card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-premium overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xs font-black uppercase tracking-widest text-amber-700">
            Companii în așteptarea verificării
          </h2>
        </div>

        {pendingLoading ? (
          <p className="p-6 text-sm text-gray-400">Se încarcă...</p>
        ) : !pending?.length ? (
          <p className="p-6 text-sm text-gray-500">Nu există companii neverifycate.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left">Companie</th>
                  <th className="px-6 py-3 text-left">Proprietar</th>
                  <th className="px-6 py-3 text-left">Oraș</th>
                  <th className="px-6 py-3 text-left">Creată</th>
                  <th className="px-6 py-3 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pending.map((company: AdminCompanyDto) => (
                  <tr key={company.id}>
                    <td className="px-6 py-4 font-semibold text-gray-900">{company.name}</td>
                    <td className="px-6 py-4 text-gray-500">{company.owner?.email ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{company.city?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDateRo(company.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setModerationCompanyId(company.id)}
                        className="text-[10px] font-black uppercase tracking-wider bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl transition-colors"
                      >
                        Verificare
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AdminCompanyModerationModal
        companyId={moderationCompanyId}
        open={!!moderationCompanyId}
        onClose={() => setModerationCompanyId(null)}
      />
    </div>
  );
}
