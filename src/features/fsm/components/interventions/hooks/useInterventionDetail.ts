import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { uploadFiles } from '@/shared/api/files';
import type { InterventionNoteDto, InterventionStatus } from '@/entities/fsm/model/types';
import {
  useInterventionQuery,
  useUpdateInterventionMutation,
  useUpdateInterventionStatusMutation,
  useDeleteInterventionMutation,
  useCreateInterventionNoteMutation,
  useDeleteInterventionNoteMutation,
  useAddInterventionPhotosMutation,
} from '@/features/fsm/api/useInterventions';
import { useCreateInvoiceMutation } from '@/features/fsm/api/useInvoices';
import { interventionStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import { getErrorMessage, isConflictError } from '@/shared/utils/errors';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';

interface UseInterventionDetailProps {
  selectedId: string | null;
  onClearSelection: () => void;
  isManagement: boolean;
  memberId: string | undefined;
  canDeleteAnyNote: boolean;
  canDeleteOwnNotes: boolean;
}

export function useInterventionDetail({
  selectedId,
  onClearSelection,
  isManagement,
  memberId,
  canDeleteAnyNote,
  canDeleteOwnNotes,
}: UseInterventionDetailProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { ask, dialog: confirmDialog } = useCabinetConfirmDialog();
  const { data: detail, isLoading: isLoadingDetail } = useInterventionQuery(selectedId || '');

  const updateIntervention = useUpdateInterventionMutation();
  const updateStatus = useUpdateInterventionStatusMutation();
  const deleteIntervention = useDeleteInterventionMutation();
  const createInvoice = useCreateInvoiceMutation();
  const createNote = useCreateInterventionNoteMutation(selectedId || '');
  const deleteNote = useDeleteInterventionNoteMutation(selectedId || '');
  const addPhotos = useAddInterventionPhotosMutation(selectedId || '');

  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [editType, setEditType] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editTechnicianId, setEditTechnicianId] = useState('');
  const [editScheduledAt, setEditScheduledAt] = useState('');
  const [editEstimatedPrice, setEditEstimatedPrice] = useState('');
  const [editFinalPrice, setEditFinalPrice] = useState('');
  const [editInternalNotes, setEditInternalNotes] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const handleStartEdit = () => {
    if (!detail) return;
    setEditType(detail.type);
    setEditDescription(detail.description);
    setEditAddress(detail.address);
    setEditTechnicianId(detail.technicianId || '');
    setEditScheduledAt(
      detail.scheduledAt ? new Date(detail.scheduledAt).toISOString().slice(0, 16) : '',
    );
    setEditEstimatedPrice(detail.estimatedPrice ? String(detail.estimatedPrice) : '');
    setEditFinalPrice(detail.finalPrice ? String(detail.finalPrice) : '');
    setEditInternalNotes(detail.internalNotes || '');
    setIsEditingDetail(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedId) return;
    try {
      if (isManagement) {
        await updateIntervention.mutateAsync({
          id: selectedId,
          type: editType,
          description: editDescription,
          address: editAddress,
          technicianId: editTechnicianId || null,
          scheduledAt: editScheduledAt || null,
          estimatedPrice: editEstimatedPrice ? Number(editEstimatedPrice) : null,
          finalPrice: editFinalPrice ? Number(editFinalPrice) : null,
          internalNotes: editInternalNotes || null,
        });
      } else {
        await updateIntervention.mutateAsync({
          id: selectedId,
          address: editAddress,
        });
      }
      toast.success(t('company.fsm.interventions.detail.toast.saved'));
      setIsEditingDetail(false);
    } catch (err: unknown) {
      toast.error(
        isConflictError(err)
          ? t('company.fsm.common.scheduleConflict')
          : getErrorMessage(err, t('company.fsm.interventions.detail.toast.saveError')),
      );
    }
  };

  const canDeleteNote = (note: InterventionNoteDto) =>
    canDeleteAnyNote || (canDeleteOwnNotes && note.authorMemberId === memberId);

  const handleStatusChange = async (newStatus: InterventionStatus) => {
    if (!selectedId) return;
    try {
      await updateStatus.mutateAsync({
        id: selectedId,
        status: newStatus,
        note: statusNote.trim() || undefined,
      });
      setStatusNote('');
      toast.success(t('cabinet.toasts.statusChanged', { status: interventionStatusLabel(newStatus, t) }));
    } catch (err: unknown) {
      toast.error(
        isConflictError(err)
          ? t('company.fsm.common.scheduleConflict')
          : getErrorMessage(err, t('company.fsm.interventions.detail.toast.statusError')),
      );
    }
  };

  const handleDelete = (id: string) => {
    ask({
      title: t('cabinet.common.delete'),
      message: t('company.fsm.interventions.detail.confirm.delete'),
      onConfirm: async () => {
        try {
          await deleteIntervention.mutateAsync(id);
          toast.success(t('company.fsm.interventions.detail.toast.deleted'));
          onClearSelection();
        } catch (err: unknown) {
          toast.error(getErrorMessage(err, t('company.fsm.interventions.detail.toast.deleteError')));
        }
      },
    });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteBody.trim() || !selectedId) return;
    try {
      await createNote.mutateAsync({ body: noteBody });
      setNoteBody('');
      toast.success(t('company.fsm.interventions.detail.toast.noteAdded'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.interventions.detail.toast.noteAddError')));
    }
  };

  const handleDeleteNote = (noteId: string) => {
    ask({
      title: t('cabinet.common.delete'),
      message: t('company.fsm.interventions.detail.confirm.deleteNote'),
      onConfirm: async () => {
        try {
          await deleteNote.mutateAsync(noteId);
          toast.success(t('company.fsm.interventions.detail.toast.noteDeleted'));
        } catch (err: unknown) {
          toast.error(getErrorMessage(err, t('company.fsm.common.error')));
        }
      },
    });
  };

  const handleGenerateInvoice = async () => {
    if (!selectedId || !detail) return;
    try {
      const invoice = await createInvoice.mutateAsync({ interventionId: selectedId });
      toast.success(t('company.fsm.interventions.detail.toast.invoiceGenerated'));
      navigate(`/company/facturi?selectedId=${invoice.id}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.interventions.detail.toast.invoiceError')));
    }
  };

  const handlePhotoUpload = async (files: File[]) => {
    if (!files.length || !selectedId) return;
    try {
      const uploaded = await uploadFiles(files);
      await addPhotos.mutateAsync(uploaded.map((f) => f.id));
      toast.success(t('company.fsm.interventions.detail.toast.photosAdded'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.interventions.detail.toast.uploadError')));
    }
  };

  return {
    detail,
    isLoadingDetail,
    isEditingDetail,
    setIsEditingDetail,
    editType,
    setEditType,
    editDescription,
    setEditDescription,
    editAddress,
    setEditAddress,
    editTechnicianId,
    setEditTechnicianId,
    editScheduledAt,
    setEditScheduledAt,
    editEstimatedPrice,
    setEditEstimatedPrice,
    editFinalPrice,
    setEditFinalPrice,
    editInternalNotes,
    setEditInternalNotes,
    noteBody,
    setNoteBody,
    statusNote,
    setStatusNote,
    handleStartEdit,
    handleSaveEdit,
    canDeleteNote,
    handleStatusChange,
    handleDelete,
    handleAddNote,
    handleDeleteNote,
    handleGenerateInvoice,
    handlePhotoUpload,
    isStatusUpdating: updateStatus.isPending,
    isGeneratingInvoice: createInvoice.isPending,
    confirmDialog,
  };
}
