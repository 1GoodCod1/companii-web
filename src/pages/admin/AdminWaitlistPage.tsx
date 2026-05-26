import { useAdminWaitlistQuery } from '@/features/admin/api/useAdmin';
import { formatDateTimeRo } from '@/utils/date';

export function AdminWaitlistPage() {
  const { data: entries, isLoading } = useAdminWaitlistQuery();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Waitlist</h1>
        <p className="text-gray-500 text-sm mt-1">
          Companii care au solicitat acces timpuriu la platformă.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Se încarcă...</p>
      ) : (
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-premium overflow-hidden">
          {!entries?.length ? (
            <p className="p-6 text-sm text-gray-500">Lista waitlist este goală.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="px-6 py-3 text-left">Companie</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Înscris la</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 font-semibold text-gray-900">{entry.companyName}</td>
                      <td className="px-6 py-4 text-gray-600">{entry.email}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDateTimeRo(entry.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
