import { useTranslation } from 'react-i18next';
import {
  Panel,
  PanelHeader,
  EmptyState,
} from '@/widgets/cabinet/cabinet-ui';
import type { PortalDashboardDto } from '@/features/portal/api/usePortal';
import { ReviewCard } from '@/entities/review/ui/ReviewCard';

export function PortalReviewsSection({ data }: { data: PortalDashboardDto }) {
  const { t } = useTranslation();
  const { reviews } = data;

  return (
    <Panel>
      <PanelHeader
        title={t('portal.reviewsSection.title')}
        meta={<span className="text-xs text-gray-400">{reviews.length}</span>}
      />
      {reviews.length === 0 ? (
        <EmptyState message={t('portal.reviewsSection.empty')} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </Panel>
  );
}
