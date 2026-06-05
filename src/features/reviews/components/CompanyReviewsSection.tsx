import { useTranslation } from 'react-i18next';
import { useCompanyReviewsBySlugQuery } from '@/features/reviews/api/useReviews';
import { ReviewCard } from '@/entities/review/ui/ReviewCard';
import { StarRating } from '@/shared/ui/reviews/StarRating';
import { LoadingStatus } from '@/shared/ui/LoadingStatus';
import { SkeletonCard } from '@/widgets/cabinet/cabinet-ui';

type CompanyReviewsSectionProps = {
  slug: string;
  rating: number;
  totalReviews: number;
};

export function CompanyReviewsSection({ slug, rating, totalReviews }: CompanyReviewsSectionProps) {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useCompanyReviewsBySlugQuery(slug);
  const reviews = data?.items ?? [];

  return (
    <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{t('companyDetail.reviews.title')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('companyDetail.reviews.subtitle')}</p>
        </div>
        {totalReviews > 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 border border-amber-100">
            <StarRating value={rating} />
            <span className="text-sm font-black text-gray-900 tabular-nums">{rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({totalReviews})</span>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <LoadingStatus label={t('companyDetail.reviews.loading')} className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </LoadingStatus>
      ) : null}

      {isError ? (
        <p className="text-sm text-gray-400 py-6 text-center">{t('companyDetail.reviews.empty')}</p>
      ) : null}

      {!isLoading && !isError && reviews.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">{t('companyDetail.reviews.empty')}</p>
      ) : null}

      {!isLoading && !isError && reviews.length > 0 ? (
        <div className="grid gap-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
