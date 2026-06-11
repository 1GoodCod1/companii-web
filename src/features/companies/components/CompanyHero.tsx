import { SealCheckIcon, MapPinIcon, UsersIcon, StarIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { CompanyLogo } from '@/entities/company/ui/CompanyLogo';
import {
  getTranslatedCategoryName,
  getTranslatedCityName,
} from '@/shared/utils/translateCityCategory';
import type { PublicCompanyDetailDto } from '@/entities/company/model/companies.types';

interface CompanyHeroProps {
  company: PublicCompanyDetailDto;
}

export function CompanyHero({ company }: CompanyHeroProps) {
  const { t } = useTranslation();
  const rating = Number(company.rating);

  return (
    <div className="border border-gray-200 bg-white overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
          <CompanyLogo
            name={company.name}
            logoUrl={company.logoUrl}
            size="lg"
            className="shrink-0 rounded-none border border-gray-200 shadow-none self-start sm:self-auto"
          />

          <div className="flex-1 min-w-0">
            {company.category ? (
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-600 mb-2">
                {getTranslatedCategoryName(t, company.category)}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none text-wrap:balance">
                {company.name}
              </h1>
              <span className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                <SealCheckIcon className="size-3.5" />
                {t('companyDetail.verified')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-100 border-t border-gray-100">
        <div className="flex items-center gap-3 bg-white px-6 py-4">
          <span className="flex size-9 shrink-0 items-center justify-center bg-slate-50 text-gray-500">
            <MapPinIcon className="size-4" />
          </span>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {company.city ? getTranslatedCityName(t, company.city) : '—'}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white px-6 py-4">
          <span className="flex size-9 shrink-0 items-center justify-center bg-slate-50 text-gray-500">
            <UsersIcon className="size-4" />
          </span>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {t('companyDetail.teamMembers', { count: company.teamSize })}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white px-6 py-4">
          <span className="flex size-9 shrink-0 items-center justify-center bg-amber-50 text-amber-500">
            <StarIcon className="size-4 fill-amber-400 text-amber-400" />
          </span>
          <p className="text-sm text-gray-500 truncate">
            <span className="font-black text-gray-900">{rating.toFixed(1)}</span>
            {' · '}
            {t('companyDetail.reviewsCount', { count: company.totalReviews })}
          </p>
        </div>
      </div>
    </div>
  );
}
