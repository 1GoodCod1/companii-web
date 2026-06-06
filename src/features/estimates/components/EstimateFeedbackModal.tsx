import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AppModal } from '@/shared/ui/AppModal';
import {
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetLabelClass,
} from '@/widgets/cabinet/cabinet-ui';
import { useSubmitEstimateFeedbackMutation } from '../api/useEstimateFeedback';
import { getErrorMessage } from '@/shared/utils/errors';

const CATEGORIES = [
  'INCORRECT_CALCULATION',
  'MISSING_CATEGORY_WORK',
  'COMPLEX_UI',
  'PRICING_COEFFICIENTS_ERROR',
  'PDF_EXPORT_ERROR',
  'FEATURE_SUGGESTION',
  'OTHER',
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  projectId?: string;
};

export function EstimateFeedbackModal({ open, onClose, projectId }: Props) {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [details, setDetails] = useState('');
  const submitMutation = useSubmitEstimateFeedbackMutation();

  const handleSubmitting = async () => {
    if (!selectedCategory) {
      toast.error(t('company.feedbackModal.categoryLabel'));
      return;
    }
    if (!details.trim()) {
      toast.error(t('company.feedbackModal.detailsLabel'));
      return;
    }

    try {
      await submitMutation.mutateAsync({
        projectId,
        category: selectedCategory,
        details: details.trim(),
      });
      toast.success(t('company.devNotice.toastSuccess'));
      onClose();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.devNotice.toastError')));
    }
  };

  const maxChars = 4000;
  const charsLeft = Math.max(0, maxChars - details.length);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={t('company.feedbackModal.title')}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={cabinetBtnSecondary}
            disabled={submitMutation.isPending}
          >
            {t('company.feedbackModal.cancelBtn')}
          </button>
          <button
            type="button"
            onClick={handleSubmitting}
            className={cabinetBtnPrimary}
            disabled={submitMutation.isPending || !selectedCategory || !details.trim()}
          >
            {submitMutation.isPending ? t('cabinet.common.saving') : t('company.feedbackModal.submitBtn')}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <label className={cabinetLabelClass}>
            {t('company.feedbackModal.categoryLabel')}
          </label>
          <div className="mt-2 space-y-3">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-start gap-3.5 cursor-pointer group">
                <input
                  type="radio"
                  name="feedback_category"
                  value={cat}
                  checked={selectedCategory === cat}
                  onChange={() => setSelectedCategory(cat)}
                  className="mt-1 size-4 shrink-0 rounded-full border-gray-300 text-violet-600 focus:ring-violet-500 accent-violet-600 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  {t(`company.feedbackModal.categories.${cat}`)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={cabinetLabelClass}>
            {t('company.feedbackModal.detailsLabel')}
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value.slice(0, maxChars))}
            className={`${cabinetFieldClass} resize-none min-h-[120px]`}
            placeholder={t('company.feedbackModal.detailsPlaceholder')}
            maxLength={maxChars}
          />
          <div className="flex justify-end">
            <span className="text-[11px] text-gray-400 font-bold">
              {t('company.feedbackModal.charactersLeft', { count: charsLeft })}
            </span>
          </div>
        </div>
      </div>
    </AppModal>
  );
}
