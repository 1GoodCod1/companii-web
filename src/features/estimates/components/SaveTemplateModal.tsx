import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/AppModal';
import {
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetLabelClass,
} from '@/components/cabinet/cabinet-ui';
import { useCreateEstimateTemplateMutation } from '../api/useEstimateTemplates';
import { getErrorMessage } from '@/utils/errors';

type Props = {
  open: boolean;
  onClose: () => void;
  projectId: string;
};

export function SaveTemplateModal({ open, onClose, projectId }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createTemplate = useCreateEstimateTemplateMutation();

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(t('company.estimatesTemplatesPage.templateName') + ' is required');
      return;
    }

    try {
      await createTemplate.mutateAsync({
        name,
        description: description || undefined,
        projectId,
      });
      toast.success(t('company.estimatesTemplatesPage.created'));
      onClose();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to save template'));
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={t('company.estimatesTemplatesPage.saveModalTitle')}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={cabinetBtnSecondary}
            disabled={createTemplate.isPending}
          >
            {t('cabinet.common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={cabinetBtnPrimary}
            disabled={createTemplate.isPending}
          >
            {createTemplate.isPending ? t('cabinet.common.saving') : t('cabinet.common.save')}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-500 leading-relaxed font-medium">
          {t('company.estimatesTemplatesPage.saveModalDescription')}
        </p>

        <label className={cabinetLabelClass}>
          {t('company.estimatesTemplatesPage.templateName')}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cabinetFieldClass}
            placeholder="Ex: Baie standard 5 m²"
            autoFocus
          />
        </label>

        <label className={cabinetLabelClass}>
          {t('company.estimatesTemplatesPage.templateDescription')}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={cabinetFieldClass}
            placeholder="Ex: Include demolări, instalații sanitare, hidroizolație și placare gresie/faianță..."
            rows={3}
          />
        </label>
      </div>
    </AppModal>
  );
}
