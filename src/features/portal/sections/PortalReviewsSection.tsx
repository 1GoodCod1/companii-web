import {
  Panel,
  PanelHeader,
  EmptyState,
} from '@/components/cabinet/cabinet-ui';
import type { PortalDashboardDto } from '@/features/portal/api/usePortal';
import { ReviewCard } from '@/components/reviews/ReviewCard';

export function PortalReviewsSection({ data }: { data: PortalDashboardDto }) {
  const { reviews } = data;

  return (
    <Panel>
      <PanelHeader title="Recenziile mele" meta={<span className="text-xs text-gray-400">{reviews.length}</span>} />
      {reviews.length === 0 ? (
        <EmptyState message="După finalizarea unei lucrări vei putea lăsa o recenzie din secțiunea Lucrări." />
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
