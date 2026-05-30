import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  useUpdateEstimateLineMutation,
  useAddEstimateLineMutation,
  useDeleteEstimateLineMutation,
} from '@/features/estimates/api/useEstimates';
import { getErrorMessage } from '@/utils/errors';

export function useWizardLineActions(projectId: string) {
  const { t } = useTranslation();
  const updateLine = useUpdateEstimateLineMutation();
  const addLineMutation = useAddEstimateLineMutation();
  const deleteLineMutation = useDeleteEstimateLineMutation();

  const [editingStore, setEditingStore] = useState<{ lineId: string; value: string } | null>(null);
  const [uploadingLineId, setUploadingLineId] = useState<string | null>(null);

  const handleUploadReceipt = async (lineId: string, stageId: string, file: File) => {
    setUploadingLineId(lineId);
    try {
      const { uploadFile } = await import('@/api/files');
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

  const handleDeleteReceipt = async (lineId: string, stageId: string) => {
    if (!confirm(t('company.estimateWizard.wizard.toasts.confirmDeleteReceipt'))) return;
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

  const handleDeleteLine = async (lineId: string, stageId: string) => {
    if (!confirm(t('company.estimateWizard.wizard.toasts.confirmDeleteLine'))) return;
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
    handleAddLine,
    handleDeleteLine,
  };
}

export type WizardLineActions = ReturnType<typeof useWizardLineActions>;
