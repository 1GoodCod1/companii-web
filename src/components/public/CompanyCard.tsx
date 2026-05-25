import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Users, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompanyLogo } from '@/components/public/CompanyLogo';
import {
  companyCoverImage,
  companyInitials,
  type PublicCompanyListItemDto,
} from '@/features/companies/types';
import { MediaImage } from '@/components/ui/MediaImage';

const COVER_GRADIENTS = [
  'from-violet-500/80 via-indigo-500/70 to-purple-600/80',
  'from-blue-500/80 via-cyan-500/70 to-teal-600/80',
  'from-amber-500/80 via-orange-500/70 to-rose-500/80',
  'from-emerald-500/80 via-teal-500/70 to-cyan-600/80',
  'from-fuchsia-500/80 via-violet-500/70 to-indigo-600/80',
  'from-sky-500/80 via-blue-500/70 to-indigo-600/80',
];

function coverGradient(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) hash = (hash + slug.charCodeAt(i) * 17) % COVER_GRADIENTS.length;
  return COVER_GRADIENTS[hash];
}

function CardCover({
  company,
  coverSrc,
}: {
  company: PublicCompanyListItemDto;
  coverSrc: string | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = coverSrc && !imageFailed;

  return (
    <div className="relative h-44 shrink-0 overflow-hidden">
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br',
          coverGradient(company.slug),
        )}
      />
      {showImage ? (
        <MediaImage
          src={coverSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-black text-white/25 select-none">
            {companyInitials(company.name)}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
      <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm">
        <BadgeCheck className="h-3.5 w-3.5" />
        Verificată
      </span>
    </div>
  );
}

export function CompanyCard({ company }: { company: PublicCompanyListItemDto }) {
  const cover = companyCoverImage(company);
  const rating = Number(company.rating);

  return (
    <Link
      to={`/companies/${company.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl glass-panel shadow-premium hover:-translate-y-1 transition-all duration-300"
    >
      <CardCover company={company} coverSrc={cover} />

      <div className="relative flex flex-1 flex-col px-5 pb-5 pt-0">
        <div className="-mt-7 mb-3">
          <CompanyLogo name={company.name} logoUrl={company.logoUrl} size="md" />
        </div>

        <div className="flex items-start justify-between gap-3 min-h-[3.25rem]">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-gray-900 truncate group-hover:text-violet-700 transition-colors">
              {company.name}
            </h2>
            <p className="text-xs text-violet-600 font-medium mt-1 truncate min-h-[1rem]">
              {company.category?.name ?? '\u00A0'}
            </p>
          </div>
          <div className="flex h-8 shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2.5">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-gray-800 tabular-nums">{rating.toFixed(1)}</span>
          </div>
        </div>

        <p className="mt-3 min-h-[2.75rem] text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {company.description ?? 'Companie de servicii verificată pe platforma Faber.'}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100/80">
          <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1 min-w-0">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span className="truncate">{company.city?.name ?? '—'}</span>
            </span>
            <span className="inline-flex items-center justify-center gap-1 min-w-0">
              <Users className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span className="truncate">{company.teamSize}</span>
            </span>
            <span className="text-right truncate tabular-nums">{company.totalReviews} recenzii</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
