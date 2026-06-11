import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPinIcon, StarIcon, UsersIcon, SealCheckIcon } from '@phosphor-icons/react';
import { CompanyLogo } from '@/entities/company/ui/CompanyLogo';
import {
  companyCoverImage,
  companyInitials,
  type PublicCompanyListItemDto,
} from '@/entities/company/model/companies.types';
import { MediaImage } from '@/shared/ui/MediaImage';
import { useLocalizedPath } from '@/shared/hooks/useLocalizedPath';
import {
  getTranslatedCategoryName,
  getTranslatedCityName,
} from '@/shared/utils/translateCityCategory';

function CardCover({
  company,
  coverSrc,
  verifiedLabel,
}: {
  company: PublicCompanyListItemDto;
  coverSrc: string | null;
  verifiedLabel: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = coverSrc && !imageFailed;

  return (
    <div className="relative h-32 shrink-0 overflow-hidden border-b border-gray-100 bg-slate-50">
      {showImage ? (
        <MediaImage
          src={coverSrc}
          alt=""
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-50 to-slate-100">
          <span className="text-4xl font-black text-violet-200 select-none">
            {companyInitials(company.name)}
          </span>
        </div>
      )}
      <span className="absolute top-3 right-3 inline-flex items-center gap-1 border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        <SealCheckIcon className="size-3.5" />
        {verifiedLabel}
      </span>
    </div>
  );
}

export function CompanyCard({ company }: { company: PublicCompanyListItemDto }) {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const cover = companyCoverImage(company);
  const rating = Number(company.rating);

  return (
    <Link
      to={lp(`/companies/${company.slug}`)}
      className="group flex h-full flex-col border border-gray-200 bg-white transition-colors hover:border-violet-300"
    >
      <CardCover
        company={company}
        coverSrc={cover}
        verifiedLabel={t('companyCard.verified')}
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3 min-h-[3.25rem]">
          <CompanyLogo
            name={company.name}
            logoUrl={company.logoUrl}
            size="sm"
            className="rounded-none border border-gray-100 shadow-none shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-gray-900 truncate group-hover:text-violet-700 transition-colors">
              {company.name}
            </h2>
            <p className="text-[10px] font-black uppercase tracking-wider text-violet-600 mt-1 truncate min-h-[1rem]">
              {company.category ? getTranslatedCategoryName(t, company.category) : ' '}
            </p>
          </div>
          <div className="flex h-7 shrink-0 items-center gap-1 border border-amber-100 bg-amber-50 px-2">
            <StarIcon className="size-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-gray-800 tabular-nums">{rating.toFixed(1)}</span>
          </div>
        </div>

        <p className="mt-3 min-h-[2.75rem] text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {company.description ?? t('companyCard.fallbackDescription')}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1 min-w-0">
              <MapPinIcon className="size-3.5 shrink-0 text-gray-400" />
              <span className="truncate">{company.city ? getTranslatedCityName(t, company.city) : '—'}</span>
            </span>
            <span className="inline-flex items-center justify-center gap-1 min-w-0">
              <UsersIcon className="size-3.5 shrink-0 text-gray-400" />
              <span className="truncate">{company.teamSize}</span>
            </span>
            <span className="text-right truncate tabular-nums">
              {t('companyCard.reviews', { count: company.totalReviews })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
