import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquarePlus, X } from 'lucide-react';
import { InteractiveStarRating } from '@/shared/ui/reviews/StarRating';

type ReviewModalProps = {
  open: boolean;
  companyName: string;
  interventionLabel: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: { rating: number; comment: string }) => void;
};

export function ReviewModal({
  open,
  companyName,
  interventionLabel,
  isSubmitting,
  onClose,
  onSubmit,
}: ReviewModalProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!open) return null;

  const handleSubmit = () => {
    if (rating < 1) return;
    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label={t('company.reviewsUi.close')}
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl animate-modal-in">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:text-gray-700"
          aria-label={t('company.reviewsUi.closeModal')}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <MessageSquarePlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t('company.reviewsUi.modalTitle')}</h2>
            <p className="text-sm text-gray-500">{companyName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{interventionLabel}</p>
          </div>
        </div>

        <div className="space-y-5">
          <InteractiveStarRating value={rating} onChange={setRating} disabled={isSubmitting} />

          <div>
            <label htmlFor="review-comment" className="mb-2 block text-sm font-semibold text-gray-700">
              {t('company.reviewsUi.commentLabel')}
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder={t('company.reviewsUi.commentPlaceholder')}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
            <p className="mt-1 text-right text-[11px] text-gray-400">{comment.length}/500</p>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              {t('company.reviewsUi.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || rating < 1}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {isSubmitting ? t('company.reviewsUi.submitting') : t('company.reviewsUi.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
