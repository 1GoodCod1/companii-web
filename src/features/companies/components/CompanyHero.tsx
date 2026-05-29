import { BadgeCheck, MapPin, Users, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CompanyLogo } from '@/components/public/CompanyLogo';
import {
  getTranslatedCategoryName,
  getTranslatedCityName,
} from '@/utils/translateCityCategory';
import type { PublicCompanyDetailDto } from '@/types/companies';

interface CompanyHeroProps {
  company: PublicCompanyDetailDto;
}

export function CompanyHero({ company }: CompanyHeroProps) {
  const { t } = useTranslation();
  const rating = Number(company.rating);

  return (
    <div className="relative rounded-[32px] overflow-hidden border border-slate-200/60 bg-white glass-panel">
      {/* Deep corporate backdrop */}
      <div
        className="absolute top-0 inset-x-0 h-44 sm:h-52"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 40%, #1e3a5f 70%, #0f172a 100%)',
        }}
      />

      {/* Subtle warm accent glow */}
      <div
        className="absolute top-0 inset-x-0 h-44 sm:h-52 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 70% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(51, 65, 85, 0.3) 0%, transparent 50%)',
        }}
      />

      {/* Fine grid lines for blueprint feel */}
      <div
        className="absolute top-0 inset-x-0 h-44 sm:h-52 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Decorative glass accents */}
      <div className="absolute top-10 right-12 w-32 h-16 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/[0.08] hidden md:block" />
      <div className="absolute top-24 right-28 w-12 h-12 rounded-full bg-white/[0.04] backdrop-blur-lg border border-white/[0.06] hidden md:block" />

      {/* Hero Content Section */}
      <div className="relative pt-24 sm:pt-32 px-6 sm:px-10 pb-8">
        <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
          {/* Logo Frame with Double Gradient Glow */}
          <div className="shrink-0 -mt-14 relative group self-start md:self-auto">
            <div className="absolute -inset-1 bg-gradient-to-tr from-slate-600 to-indigo-500 rounded-[30px] blur opacity-30 group-hover:opacity-55 transition-opacity duration-500" />
            <div className="relative p-1 bg-white rounded-[30px] shadow-2xl">
              <CompanyLogo
                name={company.name}
                logoUrl={company.logoUrl}
                size="xl"
                className="shrink-0 rounded-[26px] border border-slate-100 bg-white"
              />
            </div>
          </div>

          {/* Identity details with Premium Tags */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-none text-wrap:balance">
                {company.name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-bold text-emerald-700 shadow-xs">
                <BadgeCheck className="h-3.5 w-3.5 fill-emerald-100" />
                {t('companyDetail.verified')}
              </span>
            </div>

            {company.category ? (
              <span className="inline-block rounded-xl bg-violet-50 border border-violet-100 px-3.5 py-1 text-xs font-bold text-violet-700 tracking-wide uppercase mb-4">
                {getTranslatedCategoryName(t, company.category)}
              </span>
            ) : null}

            {/* Refined modern info tags */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600 pt-2 border-t border-slate-100">
              {company.city ? (
                <span className="inline-flex items-center gap-2 font-medium">
                  <div className="p-1 rounded-lg bg-slate-100 text-slate-500">
                    <MapPin className="h-4 w-4" />
                  </div>
                  {getTranslatedCityName(t, company.city)}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2 font-medium">
                <div className="p-1 rounded-lg bg-slate-100 text-slate-500">
                  <Users className="h-4 w-4" />
                </div>
                {t('companyDetail.teamMembers', { count: company.teamSize })}
              </span>
              <span className="inline-flex items-center gap-2 font-medium">
                <div className="p-1 rounded-lg bg-amber-50 text-amber-500 border border-amber-100/50">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </div>
                <span className="font-extrabold text-slate-800">{rating.toFixed(1)}</span>
                <span className="text-slate-400">
                  · {t('companyDetail.reviewsCount', { count: company.totalReviews })}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
