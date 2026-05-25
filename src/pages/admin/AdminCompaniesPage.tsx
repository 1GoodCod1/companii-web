import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAdminCompaniesQuery, type AdminCompanyDto } from '@/features/admin/api/useAdmin';
import { AdminCompanyModerationModal } from '@/features/admin/components/AdminCompanyModerationModal';
import { useAdminSetCompanyPlanMutation } from '@/features/subscriptions/api/useSubscriptions';
import type { CompanySubscriptionPlanCode } from '@/features/subscriptions/types';

const PLAN_OPTIONS: CompanySubscriptionPlanCode[] = ['FREE', 'PRO', 'BUSINESS'];

export function AdminCompaniesPage() {
  const [params, setParams] = useSearchParams();
  const { data: companies, isLoading } = useAdminCompaniesQuery();
  const setPlan = useAdminSetCompanyPlanMutation();
  const moderationCompanyId = params.get('moderate');

  const openModeration = (companyId: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('moderate', companyId);
        return next;
      },
      { replace: true },
    );
  };

  const closeModeration = () => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('moderate');
        return next;
      },
      { replace: true },
    );
  };

  const handleSetPlan = async (companyId: string, planCode: CompanySubscriptionPlanCode) => {
    try {
      await setPlan.mutateAsync({ companyId, planCode });
      toast.success(`Planul ${planCode} a fost setat.`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Nu s-a putut seta planul.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Companii</h1>
        <p className="text-gray-500 text-sm mt-1">
          Lista companiilor înregistrate, moderare, verificare și planuri active.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Se încarcă companiile...</p>
      ) : (
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left">Companie</th>
                  <th className="px-6 py-3 text-left">Proprietar</th>
                  <th className="px-6 py-3 text-left">Oraș</th>
                  <th className="px-6 py-3 text-left">Plan</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {companies?.map((company: AdminCompanyDto) => (
                  <tr key={company.id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{company.name}</p>
                      <p className="text-xs text-gray-400">{company.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{company.owner?.email ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{company.city?.name ?? '—'}</td>
                    <td className="px-6 py-4">
                      <select
                        value={company.subscription?.plan?.code ?? 'FREE'}
                        onChange={(e) =>
                          handleSetPlan(company.id, e.target.value as CompanySubscriptionPlanCode)
                        }
                        disabled={setPlan.isPending}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider bg-white"
                      >
                        {PLAN_OPTIONS.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border w-fit ${
                            company.isVerified
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}
                        >
                          {company.isVerified ? 'Verificată' : 'Neverifycată'}
                        </span>
                        {company.isPublished ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                            Publicată
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openModeration(company.id)}
                        className="text-[10px] font-black uppercase tracking-wider bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl transition-colors"
                      >
                        Moderare
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AdminCompanyModerationModal
        companyId={moderationCompanyId}
        open={!!moderationCompanyId}
        onClose={closeModeration}
      />
    </div>
  );
}
