import { useState, useMemo } from 'react';
import { ChatTextIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Panel,
  PanelHeader,
  EmptyState,
  SoftBadge,
} from '@/widgets/cabinet/cabinet-ui';
import type { PortalDashboardDto } from '@/features/portal/api/usePortal';
import { interventionStatusTone } from '@/features/portal/portalStatus';
import type { ReviewTarget } from '@/features/portal/portalSectionTypes';
import { useCreateReviewMutation } from '@/features/reviews';
import { ReviewModal } from '@/features/reviews';
import { StarRating } from '@/shared/ui/reviews/StarRating';
import type { PortalInterventionDto } from '@/entities/review/model/reviews.types';
import { formatDateLocalized } from '@/shared/utils/date';
import { useLocale } from '@/shared/hooks/useLocale';
import { getErrorMessage } from '@/shared/utils/errors';
import { interventionStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';

export function PortalInterventionsSection({ data }: { data: PortalDashboardDto }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const createReview = useCreateReviewMutation();
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const { interventions } = data;
  const pendingReviews = interventions.filter((i) => i.canReview);

  const interventionsMeta = useMemo(
    () => (
      <span className="text-xs text-gray-400">
        {t('portal.interventionsSection.meta', { count: interventions.length })}
      </span>
    ),
    [interventions.length, t],
  );

  const openReviewModal = (item: PortalInterventionDto) => {
    setReviewTarget({
      interventionId: item.id,
      companyId: item.companyId,
      companyName: item.company?.name ?? t('portal.interventionsSection.companyFallback'),
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
      toast.success(t('portal.interventionsSection.toastReviewSent'));
      setReviewTarget(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('portal.interventionsSection.toastReviewError')));
    }
  };

  return (
    <>
      {pendingReviews.length > 0 ? (
        <Panel className="border-amber-100/80 bg-amber-50/40">
          <p className="text-sm font-bold text-amber-900">
            {t('portal.interventionsSection.pendingBanner', { count: pendingReviews.length })}
          </p>
          <p className="text-xs text-amber-800/80 mt-1">
            {t('portal.interventionsSection.pendingHint')}
          </p>
        </Panel>
      ) : null}

      <Panel>
        <PanelHeader
          title={t('portal.interventionsSection.title')}
          meta={interventionsMeta}
        />
        {interventions.length === 0 ? (
          <EmptyState message={t('portal.interventionsSection.empty')} />
        ) : (
          <ul className="space-y-3">
            {interventions.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl bg-white/60 p-4 hover:bg-violet-50/30 transition-colors space-y-3"
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
                    <SoftBadge tone={interventionStatusTone(item.status)}>
                      {interventionStatusLabel(item.status, t)}
                    </SoftBadge>
                    <p className="text-[10px] text-gray-400">
                      {item.scheduledAt
                        ? formatDateLocalized(item.scheduledAt, locale)
                        : t('portal.interventionsSection.inProgress')}
                    </p>
                  </div>
                </div>

                {item.review ? (
                  <div className="rounded-xl bg-emerald-50/70 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                        {t('portal.interventionsSection.reviewSubmitted')}
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
                    <ChatTextIcon className="size-4" />
                    {t('portal.interventionsSection.leaveReview')}
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
