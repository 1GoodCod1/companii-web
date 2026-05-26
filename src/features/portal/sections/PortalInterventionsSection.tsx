import { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Panel,
  PanelHeader,
  EmptyState,
  SoftBadge,
} from '@/components/cabinet/cabinet-ui';
import type { PortalDashboardDto } from '@/features/portal/api/usePortal';
import { interventionStatusTone } from '@/features/portal/portalStatus';
import type { ReviewTarget } from '@/features/portal/portalSectionTypes';
import { useCreateReviewMutation } from '@/features/reviews/api/useReviews';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { StarRating } from '@/components/reviews/StarRating';
import type { PortalInterventionDto } from '@/types/reviews';
import { formatDateRo } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';

export function PortalInterventionsSection({ data }: { data: PortalDashboardDto }) {
  const createReview = useCreateReviewMutation();
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const { interventions } = data;
  const pendingReviews = interventions.filter((i) => i.canReview);

  const openReviewModal = (item: PortalInterventionDto) => {
    setReviewTarget({
      interventionId: item.id,
      companyId: item.companyId,
      companyName: item.company?.name ?? 'Companie',
      interventionLabel: `${item.type} · ${item.number}`,
    });
  };

  const handleSubmitReview = async (payload: { rating: number; comment: string }) => {
    if (!reviewTarget) return;
    try {
      await createReview.mutateAsync({
        companyId: reviewTarget.companyId,
        interventionId: reviewTarget.interventionId,
        rating: payload.rating,
        comment: payload.comment || undefined,
      });
      toast.success('Recenzia a fost trimisă. Mulțumim!');
      setReviewTarget(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut trimite recenzia.'));
    }
  };

  return (
    <>
      {pendingReviews.length > 0 ? (
        <Panel className="border-amber-100/80 bg-amber-50/40">
          <p className="text-sm font-bold text-amber-900">
            Ai {pendingReviews.length} lucrări finalizate fără recenzie
          </p>
          <p className="text-xs text-amber-800/80 mt-1">
            Părerea ta ajută alți clienți să aleagă servicii de calitate.
          </p>
        </Panel>
      ) : null}

      <Panel>
        <PanelHeader
          title="Solicitările mele"
          meta={
            <span className="text-xs text-gray-400">{interventions.length} lucrări</span>
          }
        />
        {interventions.length === 0 ? (
          <EmptyState message="Nu ai nicio lucrare înregistrată." />
        ) : (
          <ul className="space-y-3">
            {interventions.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl bg-white/60 px-4 py-4 hover:bg-violet-50/30 transition-colors space-y-3"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {item.number}
                    </span>
                    <h3 className="font-bold text-gray-800 text-sm mt-0.5">{item.type}</h3>
                    {item.company?.name ? (
                      <p className="text-[11px] text-violet-600 font-semibold mt-1">{item.company.name}</p>
                    ) : null}
                    <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">{item.description}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-1.5">
                    <SoftBadge tone={interventionStatusTone(item.status)}>{item.status}</SoftBadge>
                    <p className="text-[10px] text-gray-400">
                      {item.scheduledAt
                        ? formatDateRo(item.scheduledAt)
                        : 'În procesare'}
                    </p>
                  </div>
                </div>

                {item.review ? (
                  <div className="rounded-xl bg-emerald-50/70 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                        Recenzie trimisă
                      </p>
                      <StarRating value={item.review.rating} size="sm" />
                    </div>
                    {item.review.comment ? (
                      <p className="text-xs text-emerald-900/80 mt-1">{item.review.comment}</p>
                    ) : null}
                  </div>
                ) : item.canReview ? (
                  <button
                    type="button"
                    onClick={() => openReviewModal(item)}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600 transition-colors"
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                    Lasă recenzie
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <ReviewModal
        open={!!reviewTarget}
        companyName={reviewTarget?.companyName ?? ''}
        interventionLabel={reviewTarget?.interventionLabel ?? ''}
        isSubmitting={createReview.isPending}
        onClose={() => setReviewTarget(null)}
        onSubmit={handleSubmitReview}
      />
    </>
  );
}
