import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { uploadFiles, fileDownloadPath } from '@/api/files';
import { EmptyState, Panel, PanelHeader } from '@/components/cabinet/cabinet-ui';
import type { CompanyRole } from '@/types/roles';
import type { CompanyMemberDto, InterventionNoteDto, InterventionStatus } from '@/types/fsm';
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
import { useLocale } from '@/hooks/useLocale';
import { memberDisplayName, technicianDisplayName } from '@/utils/teamMembers';
import { INTERVENTION_STATUS } from '@/constants/interventionStatus.constants';
import { interventionStatusHint, interventionStatusLabel } from '@/utils/i18nStatusLabels';
import {
  getAllowedInterventionTransitions,
  getInterventionStatusStyle,
  isTerminalInterventionStatus,
} from '@/utils/interventionStatus';
import { formatDateLocalized, formatDateTimeLocalized } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';

type Props = {
  selectedId: string | null;
  onClearSelection: () => void;
  isManagement: boolean;
  role: CompanyRole | undefined;
  memberId: string | undefined;
  canEditAssignedInterventionFields: boolean;
  canDeleteAnyNote: boolean;
  canDeleteOwnNotes: boolean;
  assignableTechnicians: CompanyMemberDto[];
};

export function InterventionDetailPanel({
  selectedId,
  onClearSelection,
  isManagement,
  role,
  memberId,
  canEditAssignedInterventionFields,
  canDeleteAnyNote,
  canDeleteOwnNotes,
  assignableTechnicians,
}: Props) {
  const { t } = useTranslation();
  const locale = useLocale();
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
          description: editDescription,
          address: editAddress,
          finalPrice: editFinalPrice ? Number(editFinalPrice) : null,
        });
      }
      toast.success(t('company.fsm.interventions.detail.toast.saved'));
      setIsEditingDetail(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.interventions.detail.toast.saveError')));
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
      toast.error(getErrorMessage(err, t('company.fsm.interventions.detail.toast.statusError')));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('company.fsm.interventions.detail.confirm.delete'))) return;
    try {
      await deleteIntervention.mutateAsync(id);
      toast.success(t('company.fsm.interventions.detail.toast.deleted'));
      onClearSelection();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.interventions.detail.toast.deleteError')));
    }
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

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm(t('company.fsm.interventions.detail.confirm.deleteNote'))) return;
    try {
      await deleteNote.mutateAsync(noteId);
      toast.success(t('company.fsm.interventions.detail.toast.noteDeleted'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.common.error')));
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedId || !detail) return;
    try {
      await createInvoice.mutateAsync({ interventionId: selectedId });
      toast.success(t('company.fsm.interventions.detail.toast.invoiceGenerated'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.interventions.detail.toast.invoiceError')));
    }
  };

  return (
    <Panel>
      <PanelHeader
        title={t('company.fsm.interventions.detail.title')}
        action={
          isManagement && selectedId && !isLoadingDetail && detail ? (
            <button
              type="button"
              onClick={() => handleDelete(selectedId)}
              className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
            >
              {t('cabinet.common.delete')}
            </button>
          ) : undefined
        }
      />

      {selectedId ? (
        isLoadingDetail || !detail ? (
          <div className="text-center py-20 text-gray-400">{t('company.fsm.interventions.detail.loading')}</div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">{detail.number}</span>
                <h3 className="text-lg font-black text-gray-900 mt-0.5 tracking-tight">{detail.type}</h3>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${getInterventionStatusStyle(
                  detail.status,
                )}`}
              >
                {interventionStatusLabel(detail.status, t)}
              </span>
            </div>

            {detail.estimateProjectId && (
              <Link
                to={`/company/lucrari/${detail.id}/fisa`}
                className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                {t('company.fsm.interventions.detail.executionSheetLink')}
              </Link>
            )}

            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-2.5">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {t('company.fsm.interventions.detail.nextStep.title')}
              </h4>
              {(() => {
                const allowed = getAllowedInterventionTransitions(detail.status, role);
                const hint = interventionStatusHint(detail.status, t);
                if (allowed.length === 0) {
                  return (
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      {hint ||
                        (isTerminalInterventionStatus(detail.status)
                          ? t('company.fsm.interventions.detail.nextStep.terminalStatus')
                          : t('company.fsm.interventions.detail.nextStep.noActions'))}
                    </p>
                  );
                }
                return (
                  <>
                    <input
                      type="text"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder={t('company.fsm.interventions.detail.nextStep.statusNotePlaceholder')}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {allowed.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleStatusChange(st)}
                          disabled={updateStatus.isPending}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${
                            st === INTERVENTION_STATUS.CANCELLED
                              ? 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                              : 'bg-violet-600 text-white border-violet-600 hover:bg-violet-700 shadow-xs'
                          } disabled:opacity-50`}
                        >
                          {interventionStatusLabel(st, t)}
                        </button>
                      ))}
                    </div>
                  </>
                );
              })()}
              {isManagement && detail.status === INTERVENTION_STATUS.COMPLETED && (
                <button
                  onClick={handleGenerateInvoice}
                  className="w-full mt-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {t('company.fsm.interventions.detail.generateInvoice')}
                </button>
              )}
            </div>

            {!isEditingDetail ? (
              <div className="space-y-4">
                <div className="space-y-2.5 text-sm text-gray-700">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                      {t('company.fsm.interventions.detail.fields.client')}
                    </span>
                    <span className="font-bold text-gray-900">{detail.customer?.fullName}</span>
                    <span className="text-xs text-gray-500 block font-semibold mt-0.5">{detail.customer?.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                      {t('company.fsm.interventions.detail.fields.address')}
                    </span>
                    <span className="font-bold text-gray-800">{detail.address}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                      {t('company.fsm.interventions.detail.fields.description')}
                    </span>
                    <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap bg-gray-50/50 p-3 rounded-xl border border-gray-100 leading-relaxed font-medium">
                      {detail.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                        {t('company.fsm.interventions.detail.fields.schedule')}
                      </span>
                      <span className="text-xs font-bold text-gray-800">
                        {detail.scheduledAt
                          ? formatDateTimeLocalized(detail.scheduledAt, locale, 'datetimeShort')
                          : t('company.fsm.interventions.detail.fields.unscheduled')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                        {t('company.fsm.interventions.detail.fields.technician')}
                      </span>
                      <span className="text-xs font-bold text-gray-800">{technicianDisplayName(detail.technician)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3.5">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                        {t('company.fsm.interventions.detail.fields.estimatedPrice')}
                      </span>
                      <span className="font-black text-sm text-gray-900">
                        {detail.estimatedPrice
                          ? `${detail.estimatedPrice} MDL`
                          : t('company.fsm.common.unspecified')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                        {t('company.fsm.interventions.detail.fields.finalPrice')}
                      </span>
                      <span className="font-black text-sm text-emerald-600">
                        {detail.finalPrice
                          ? `${detail.finalPrice} MDL`
                          : t('company.fsm.common.unspecified')}
                      </span>
                    </div>
                  </div>
                </div>

                {detail.internalNotes && (
                  <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
                    <span className="text-[10px] font-bold text-amber-800 block uppercase tracking-wider mb-1">
                      {t('company.fsm.interventions.detail.fields.internalNotes')}
                    </span>
                    <p className="text-xs text-amber-950 font-medium whitespace-pre-wrap leading-relaxed">{detail.internalNotes}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                    {t('company.fsm.interventions.detail.photos.title')}
                  </span>
                  {detail.photos?.length ? (
                    <div className="grid grid-cols-3 gap-2">
                      {detail.photos.map((photo) => (
                        <a
                          key={photo.id}
                          href={fileDownloadPath(photo.fileKey)}
                          target="_blank"
                          rel="noreferrer"
                          className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
                        >
                          <img src={fileDownloadPath(photo.fileKey)} alt="" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">{t('company.fsm.interventions.detail.photos.empty')}</p>
                  )}
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files ? Array.from(e.target.files) : [];
                        if (!files.length || !selectedId) return;
                        try {
                          const uploaded = await uploadFiles(files);
                          await addPhotos.mutateAsync(uploaded.map((f) => f.id));
                          toast.success(t('company.fsm.interventions.detail.toast.photosAdded'));
                        } catch (err: unknown) {
                          toast.error(getErrorMessage(err, t('company.fsm.interventions.detail.toast.uploadError')));
                        }
                        e.target.value = '';
                      }}
                    />
                    {t('company.fsm.interventions.detail.photos.add')}
                  </label>
                </div>

                {isManagement || canEditAssignedInterventionFields ? (
                  <button
                    onClick={handleStartEdit}
                    className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {isManagement
                      ? t('company.fsm.interventions.detail.edit.management')
                      : t('company.fsm.interventions.detail.edit.technician')}
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {isManagement
                    ? t('company.fsm.interventions.detail.editForm.titleManagement')
                    : t('company.fsm.interventions.detail.editForm.titleTechnician')}
                </h4>
                {isManagement ? (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      {t('company.fsm.interventions.detail.editForm.type')}
                    </label>
                    <input
                      type="text"
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-2 text-xs outline-none bg-white font-medium"
                    />
                  </div>
                ) : null}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    {t('company.fsm.interventions.detail.editForm.address')}
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-2 text-xs outline-none bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    {t('company.fsm.interventions.detail.editForm.description')}
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-2 text-xs outline-none bg-white resize-none font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {isManagement ? (
                    <>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          {t('company.fsm.interventions.detail.editForm.technician')}
                        </label>
                        <select
                          value={editTechnicianId}
                          onChange={(e) => setEditTechnicianId(e.target.value)}
                          className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-2 text-xs outline-none bg-white cursor-pointer font-medium"
                        >
                          <option value="">{t('company.fsm.interventions.detail.editForm.unassigned')}</option>
                          {assignableTechnicians.map((m) => (
                            <option key={m.id} value={m.id}>
                              {memberDisplayName(m)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          {t('company.fsm.interventions.detail.editForm.schedule')}
                        </label>
                        <input
                          type="datetime-local"
                          value={editScheduledAt}
                          onChange={(e) => setEditScheduledAt(e.target.value)}
                          className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-1.5 text-xs outline-none bg-white cursor-pointer font-medium"
                        />
                      </div>
                    </>
                  ) : null}
                </div>
                <div className={`grid gap-2 ${isManagement ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {isManagement ? (
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        {t('company.fsm.interventions.detail.editForm.estimatedPrice')}
                      </label>
                      <input
                        type="number"
                        value={editEstimatedPrice}
                        onChange={(e) => setEditEstimatedPrice(e.target.value)}
                        className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-2 text-xs outline-none bg-white font-bold"
                      />
                    </div>
                  ) : null}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      {t('company.fsm.interventions.detail.editForm.finalPrice')}
                    </label>
                    <input
                      type="number"
                      value={editFinalPrice}
                      onChange={(e) => setEditFinalPrice(e.target.value)}
                      className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-2 text-xs outline-none bg-white font-bold"
                    />
                  </div>
                </div>
                {isManagement ? (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      {t('company.fsm.interventions.detail.editForm.internalNotes')}
                    </label>
                    <input
                      type="text"
                      value={editInternalNotes}
                      onChange={(e) => setEditInternalNotes(e.target.value)}
                      className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-2 text-xs outline-none bg-white font-medium"
                    />
                  </div>
                ) : null}
                <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setIsEditingDetail(false)}
                    className="px-3.5 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-500 cursor-pointer bg-white"
                  >
                    {t('cabinet.common.cancel')}
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    {t('cabinet.common.save')}
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4 space-y-3.5">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {t('company.fsm.interventions.detail.notes.title', { count: detail.notes?.length || 0 })}
              </h4>
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder={t('company.fsm.interventions.detail.notes.placeholder')}
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  className="flex-1 border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-3 py-2 text-xs outline-none transition-all bg-white"
                />
                <button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  {t('cabinet.common.send')}
                </button>
              </form>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {detail.notes?.map((n) => (
                  <div key={n.id} className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 relative group">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-violet-700">
                        {n.author?.fullName || n.author?.user?.email}
                      </span>
                      {canDeleteNote(n) ? (
                        <button
                          onClick={() => handleDeleteNote(n.id)}
                          className="text-[10px] text-red-500 opacity-0 group-hover:opacity-100 hover:underline transition-opacity cursor-pointer font-bold uppercase"
                        >
                          {t('cabinet.common.delete')}
                        </button>
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-700 mt-1.5 whitespace-pre-wrap leading-relaxed font-medium">{n.body}</p>
                    <span className="text-[9px] text-gray-400 block text-right mt-1.5 font-bold uppercase tracking-wider">
                      {formatDateLocalized(n.createdAt, locale)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      ) : (
        <EmptyState message={t('company.fsm.interventions.detail.empty')} />
      )}
    </Panel>
  );
}
