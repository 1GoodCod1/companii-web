import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  getTranslatedCategoryName,
  getTranslatedCityName,
} from '@/shared/utils/translateCityCategory';
import type { PublicCompanyDetailDto } from '@/entities/company/model/companies.types';

interface CompanySpecsSidebarProps {
  company: PublicCompanyDetailDto;
}

export function CompanySpecsSidebar({ company }: CompanySpecsSidebarProps) {
  const { t } = useTranslation();

  return (
    <div className="glass-panel rounded-[28px] p-6 border border-white/40 space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
        <ShieldCheck className="size-5 text-emerald-600" />
        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">
          {t('companyDetail.specsTitle')}
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider">
            {t('companyDetail.specCity')}
          </span>
          <span className="font-extrabold text-slate-800 text-right">
            {company.city ? getTranslatedCityName(t, company.city) : '—'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider">
            {t('companyDetail.specCategory')}
          </span>
          <span className="font-extrabold text-violet-600 text-right">
            {company.category ? getTranslatedCategoryName(t, company.category) : '—'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider">
            {t('companyDetail.specTeam')}
          </span>
          <span className="font-extrabold text-slate-800 text-right">
            {t('companyDetail.activeMembers', { count: company.teamSize })}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider">
            {t('companyDetail.specVat')}
          </span>
          <span className="font-extrabold text-slate-800 text-right">
            {company.isTvaPayer ? t('companyDetail.vatPayer') : t('companyDetail.vatNonPayer')}
          </span>
        </div>
      </div>
    </div>
  );
}
