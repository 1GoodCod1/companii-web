import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AppSelect } from '@/widgets/cabinet/cabinet-ui';
import { useAdminCompaniesQuery, type AdminCompanyDto } from '@/features/admin';
import { AdminCompanyModerationModal } from '@/features/admin';
import { useAdminSetCompanyPlanMutation } from '@/entities/subscription/api/useSubscriptions';
import { DEFAULT_SUBSCRIPTION_PLAN, SUBSCRIPTION_PLAN_CODES } from '@/entities/subscription/model/subscriptions.constants';
import type { CompanySubscriptionPlanCode } from '@/entities/subscription/model/types';

export function AdminCompaniesPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const { data: companies, isLoading } = useAdminCompaniesQuery();
  const setPlan = useAdminSetCompanyPlanMutation();
  const moderationCompanyId = params.get('moderate');

  const planOptions = useMemo(
    () =>
      SUBSCRIPTION_PLAN_CODES.map((code) => ({
        value: code,
        label: code,
      })),
    [],
  );

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
      toast.success(t('admin.companiesPage.toastPlanSet', { code: planCode }));
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || t('admin.companiesPage.toastPlanFailed'));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('admin.companiesPage.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('admin.companiesPage.description')}</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">{t('admin.companiesPage.loading')}</p>
      ) : (
        <div className="border border-gray-100 rounded-3xl glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left">{t('admin.companiesPage.colCompany')}</th>
                  <th className="px-6 py-3 text-left">{t('admin.companiesPage.colOwner')}</th>
                  <th className="px-6 py-3 text-left">{t('admin.companiesPage.colCity')}</th>
                  <th className="px-6 py-3 text-left">{t('admin.companiesPage.colPlan')}</th>
                  <th className="px-6 py-3 text-left">{t('admin.companiesPage.colStatus')}</th>
                  <th className="px-6 py-3 text-right">{t('admin.companiesPage.colActions')}</th>
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
                      <AppSelect
                        value={company.subscription?.plan?.code ?? DEFAULT_SUBSCRIPTION_PLAN}
                        onChange={(value) =>
                          handleSetPlan(company.id, value as CompanySubscriptionPlanCode)
                        }
                        options={planOptions}
                        disabled={setPlan.isPending}
                        aria-label={t('admin.companiesPage.colPlan')}
                        className="min-w-[120px]"
                        maxVisibleItems={8}
                      />
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
                          {company.isVerified
                            ? t('admin.companiesPage.verified')
                            : t('admin.companiesPage.unverified')}
                        </span>
                        {company.isPublished ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                            {t('admin.companiesPage.published')}
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
                        {t('admin.companiesPage.moderate')}
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
