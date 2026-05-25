import { Link } from 'react-router-dom';
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

const EMPTY_MESSAGE =
  'Nu ai încă recenzii. Clienții pot lăsa feedback din portal după ce marchezi lucrările ca finalizate.';

export function CompanyReviewsPage() {
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
        eyebrow="Reputație"
        title="Recenzii primite"
        description="Feedback de la clienți după finalizarea lucrărilor"
        action={
          total > 0 ? (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 border border-amber-100">
              <StarRating value={average} />
              <span className="text-sm font-black text-gray-900 tabular-nums">
                {average.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">({total} recenzii)</span>
            </div>
          ) : null
        }
      />

      <Panel>
        <PanelHeader
          title="Lista recenziilor"
          description="Recenziile apar automat când clienții evaluează lucrările finalizate."
        />

        {isLoading && !data ? (
          <p className="text-sm text-gray-400 py-8 text-center">Se încarcă recenziile...</p>
        ) : showEmpty ? (
          <EmptyState
            message={
              !activeCompanyId
                ? 'Completează profilul companiei ca să poți primi recenzii de la clienți.'
                : EMPTY_MESSAGE
            }
            action={
              !activeCompanyId ? (
                <Link to="/company/profile" className={cabinetBtnSecondary}>
                  Mergi la profil companie
                </Link>
              ) : isError ? (
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className={cabinetBtnSecondary}
                >
                  Reîncearcă
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
