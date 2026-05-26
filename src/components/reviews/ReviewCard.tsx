import { useTranslation } from 'react-i18next';
import { StarRating } from '@/components/reviews/StarRating';
import { useLocale } from '@/hooks/useLocale';
import type { CompanyReviewDto } from '@/types/reviews';
import { formatDateLocalized } from '@/utils/date';

type ReviewCardProps = {
  review: CompanyReviewDto;
};

export function ReviewCard({ review }: ReviewCardProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const author = review.clientName?.trim() || t('companyDetail.reviews.verifiedClient');
  const date = formatDateLocalized(review.createdAt, locale, 'long');

  return (
    <article className="rounded-2xl bg-white/60 p-4 shadow-xs hover:bg-violet-50/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-900">{author}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {review.intervention.type} · {review.intervention.number}
          </p>
        </div>
        <StarRating value={review.rating} size="sm" />
      </div>
      {review.comment ? (
        <p className="mt-3 text-sm leading-relaxed text-gray-600">{review.comment}</p>
      ) : null}
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{date}</p>
    </article>
  );
}
