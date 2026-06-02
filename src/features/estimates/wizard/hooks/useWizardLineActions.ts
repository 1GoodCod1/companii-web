import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { uploadFile } from '@/shared/api/files';
import {
  useUpdateEstimateLineMutation,
  useAddEstimateLineMutation,
  useDeleteEstimateLineMutation,
} from '@/features/estimates/api/useEstimates';
import { getErrorMessage } from '@/shared/utils/errors';
import type { AskCabinetConfirm } from '@/shared/hooks/useCabinetConfirmDialog';

export function useWizardLineActions(projectId: string, askConfirm: AskCabinetConfirm) {
  const { t } = useTranslation();
  const updateLine = useUpdateEstimateLineMutation();
  const addLineMutation = useAddEstimateLineMutation();
  const deleteLineMutation = useDeleteEstimateLineMutation();

  const [editingStore, setEditingStore] = useState<{ lineId: string; value: string } | null>(null);
  const [uploadingLineId, setUploadingLineId] = useState<string | null>(null);

  const handleUploadReceipt = async (lineId: string, stageId: string, file: File) => {
    setUploadingLineId(lineId);
    try {
      const uploaded = await uploadFile(file);
      await updateLine.mutateAsync({
        projectId,
        stageId,
        lineId,
        receiptFileKey: uploaded.id,
      });
      toast.success(t('company.estimateWizard.wizard.toasts.receiptUploaded'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.receiptUploadFailed')));
    } finally {
      setUploadingLineId(null);
    }
  };

  const handleDeleteReceipt = (lineId: string, stageId: string) => {
    askConfirm({
      title: t('cabinet.common.delete'),
      message: t('company.estimateWizard.wizard.toasts.confirmDeleteReceipt'),
      onConfirm: async () => {
        try {
          await updateLine.mutateAsync({
            projectId,
            stageId,
            lineId,
            receiptFileKey: null,
          });
          toast.success(t('company.estimateWizard.wizard.toasts.receiptDeleted'));
        } catch (err: unknown) {
          toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.deleteFailed')));
        }
      },
    });
  };

  const handleSaveStore = async (lineId: string, stageId: string) => {
    if (!editingStore || editingStore.lineId !== lineId) return;
    try {
      await updateLine.mutateAsync({
        projectId,
        stageId,
        lineId,
        materialStore: editingStore.value || null,
      });
      setEditingStore(null);
      toast.success(t('company.estimateWizard.wizard.toasts.storeSaved'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.storeSaveFailed')));
    }
  };

  const handleUpdateLineQtyOrPrice = async (
    lineId: string,
    stageId: string,
    field: 'qty' | 'unitPrice',
    val: number,
  ) => {
    if (isNaN(val) || val < 0) return;
    try {
      await updateLine.mutateAsync({
        projectId,
        stageId,
        lineId,
        [field]: val,
      });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.updateFailed')));
    }
  };

  const handleUpdateLineUnit = async (lineId: string, stageId: string, unit: string) => {
    try {
      await updateLine.mutateAsync({
        projectId,
        stageId,
        lineId,
        unit,
      });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.updateFailed')));
    }
  };

  const handleAddLine = async (stageId: string) => {
    try {
      await addLineMutation.mutateAsync({
        projectId,
        stageId,
        description: t('company.estimateWizard.wizard.toasts.newLineDescription'),
        qty: 1,
        unit: 'buc',
        unitPrice: 0,
      });
      toast.success(t('company.estimateWizard.wizard.toasts.lineAdded'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.lineAddFailed')));
    }
  };

  const handleDeleteLine = (lineId: string, stageId: string) => {
    askConfirm({
      title: t('cabinet.common.delete'),
      message: t('company.estimateWizard.wizard.toasts.confirmDeleteLine'),
      onConfirm: async () => {
        try {
          await deleteLineMutation.mutateAsync({
            projectId,
            stageId,
            lineId,
          });
          toast.success(t('company.estimateWizard.wizard.toasts.lineDeleted'));
        } catch (err: unknown) {
          toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.lineDeleteFailed')));
        }
      },
    });
  };

  return {
    editingStore,
    setEditingStore,
    uploadingLineId,
    updateLine,
    addLineMutation,
    deleteLineMutation,
    handleUploadReceipt,
    handleDeleteReceipt,
    handleSaveStore,
    handleUpdateLineQtyOrPrice,
    handleUpdateLineUnit,
    handleAddLine,
    handleDeleteLine,
  };
}

export type WizardLineActions = ReturnType<typeof useWizardLineActions>;
