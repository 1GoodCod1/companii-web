import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquareQuote } from 'lucide-react';
import { useCompanyReviewsMeQuery } from '@/features/reviews/api/useReviews';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { StarRating } from '@/components/reviews/StarRating';
import {
  PageHero,
  Panel,
  PanelHeader,
  EmptyState,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import { CompanyManagementGate } from '@/features/companies/CompanyManagementGate';
import { useAuthStore } from '@/stores/authStore';

export function CompanyReviewsPage() {
  const { t } = useTranslation();
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  const { data, isLoading, isError, refetch } = useCompanyReviewsMeQuery();
  const reviews = data?.items ?? [];
  const total = data?.total ?? 0;
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const showEmpty = !activeCompanyId || isError || (!isLoading && reviews.length === 0);

  return (
    <CompanyManagementGate>
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow={t('company.reviewsPage.eyebrow')}
        title={t('company.reviewsPage.title')}
        description={t('company.reviewsPage.description')}
        action={
          total > 0 ? (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 border border-amber-100">
              <StarRating value={average} />
              <span className="text-sm font-black text-gray-900 tabular-nums">
                {average.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">{t('company.reviewsPage.reviewsCount', { count: total })}</span>
            </div>
          ) : null
        }
      />

      <Panel>
        <PanelHeader
          title={t('company.reviewsPage.panelTitle')}
          description={t('company.reviewsPage.panelDescription')}
        />

        {isLoading && !data ? (
          <p className="text-sm text-gray-400 py-8 text-center">{t('company.reviewsPage.loading')}</p>
        ) : showEmpty ? (
          <EmptyState
            message={
              !activeCompanyId
                ? t('company.reviewsPage.emptyNoCompany')
                : t('company.reviewsPage.emptyNoReviews')
            }
            action={
              !activeCompanyId ? (
                <Link to="/company/profile" className={cabinetBtnSecondary}>
                  {t('company.reviewsPage.goToProfile')}
                </Link>
              ) : isError ? (
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className={cabinetBtnSecondary}
                >
                  {t('company.reviewsPage.retry')}
                </button>
              ) : (
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
                  <MessageSquareQuote className="size-5" />
                </div>
              )
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </Panel>
    </div>
    </CompanyManagementGate>
  );
}
