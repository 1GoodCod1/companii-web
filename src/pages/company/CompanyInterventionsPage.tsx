import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useInterventionsQuery,
  useInterventionQuery,
  useCustomersQuery,
  useCreateInterventionMutation,
  useUpdateInterventionMutation,
  useUpdateInterventionStatusMutation,
  useDeleteInterventionMutation,
  useCreateInterventionNoteMutation,
  useDeleteInterventionNoteMutation,
  useCreateInvoiceMutation,
  useAddInterventionPhotosMutation,
} from '@/features/fsm/api/useFsm';
import { uploadFiles } from '@/api/files';
import { fileDownloadPath } from '@/api/files';
import { useCompanyMembersQuery } from '@/features/companies/api/useCompanies';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/AppModal';
import {
  PageHero,
  Panel,
  PanelHeader,
  EmptyState,
  cabinetBtnPrimary,
} from '@/components/cabinet/cabinet-ui';
import type { InterventionStatus, InterventionDto, CompanyMemberDto, CustomerDto, InterventionNoteDto } from '@/features/fsm/types';
import { memberDisplayName, technicianDisplayName, filterAssignableTechnicians } from '@/features/companies/teamRoles';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';
import {
  getAllowedInterventionTransitions,
  getInterventionStatusHint,
  isTerminalInterventionStatus,
} from '@/features/fsm/statusTransitions';
import { INTERVENTION_STATUS_LABELS } from '@/features/fsm/statusLabels';

export function CompanyInterventionsPage() {
  const {
    isManagement,
    role,
    memberId,
    canEditAssignedInterventionFields,
    canDeleteAnyNote,
    canDeleteOwnNotes,
  } = useCompanyPermissions();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data: interventions, isLoading } = useInterventionsQuery(
    (statusFilter || undefined) as InterventionStatus | undefined
  );
  const { data: customers } = useCustomersQuery({ enabled: isManagement });
  const { data: members } = useCompanyMembersQuery({ enabled: isManagement });
  const assignableTechnicians = useMemo(
    () => filterAssignableTechnicians(members),
    [members],
  );

  const createIntervention = useCreateInterventionMutation();
  const updateIntervention = useUpdateInterventionMutation();
  const updateStatus = useUpdateInterventionStatusMutation();
  const deleteIntervention = useDeleteInterventionMutation();
  const createInvoice = useCreateInvoiceMutation();

  // Create Modal Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // Detail Modal State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: detail, isLoading: isLoadingDetail } = useInterventionQuery(selectedId || '');

  // Detail Modal Editing State
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [editType, setEditType] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editTechnicianId, setEditTechnicianId] = useState('');
  const [editScheduledAt, setEditScheduledAt] = useState('');
  const [editEstimatedPrice, setEditEstimatedPrice] = useState('');
  const [editFinalPrice, setEditFinalPrice] = useState('');
  const [editInternalNotes, setEditInternalNotes] = useState('');

  // Comment State
  const [noteBody, setNoteBody] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const createNote = useCreateInterventionNoteMutation(selectedId || '');
  const deleteNote = useDeleteInterventionNoteMutation(selectedId || '');
  const addPhotos = useAddInterventionPhotosMutation(selectedId || '');

  const handleOpenCreate = () => {
    setCustomerId('');
    setType('Reparație');
    setDescription('');
    setAddress('');
    setTechnicianId('');
    setScheduledAt('');
    setEstimatedPrice('');
    setInternalNotes('');
    setShowCreateModal(true);
  };

  const handleCustomerChange = (cid: string) => {
    setCustomerId(cid);
    const cust = customers?.find((c: CustomerDto) => c.id === cid);
    if (cust) setAddress(cust.address);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !type || !description || !address) {
      toast.error('Completați câmpurile obligatorii.');
      return;
    }

    try {
      await createIntervention.mutateAsync({
        customerId,
        type,
        description,
        address,
        technicianId: technicianId || undefined,
        scheduledAt: scheduledAt || undefined,
        estimatedPrice: estimatedPrice ? Number(estimatedPrice) : undefined,
        internalNotes: internalNotes || undefined,
      });
      toast.success('Lucrare creată cu succes!');
      setShowCreateModal(false);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la crearea lucrării.');
    }
  };

  const handleOpenDetail = (item: InterventionDto) => {
    setSelectedId(item.id);
    setIsEditingDetail(false);
  };

  const handleStartEdit = () => {
    if (!detail) return;
    setEditType(detail.type);
    setEditDescription(detail.description);
    setEditAddress(detail.address);
    setEditTechnicianId(detail.technicianId || '');
    setEditScheduledAt(
      detail.scheduledAt ? new Date(detail.scheduledAt).toISOString().slice(0, 16) : ''
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
      toast.success('Detalii salvate cu succes!');
      setIsEditingDetail(false);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la salvare.');
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
      toast.success(`Status schimbat în ${INTERVENTION_STATUS_LABELS[newStatus]}`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la schimbarea statusului.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur doriți să ștergeți această lucrare?')) return;
    try {
      await deleteIntervention.mutateAsync(id);
      toast.success('Lucrare ștearsă cu succes!');
      setSelectedId(null);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la ștergerea lucrării.');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteBody.trim() || !selectedId) return;
    try {
      await createNote.mutateAsync({ body: noteBody });
      setNoteBody('');
      toast.success('Notă adăugată!');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la adăugarea notei.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Ștergeți această notă?')) return;
    try {
      await deleteNote.mutateAsync(noteId);
      toast.success('Notă ștearsă!');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare.');
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedId || !detail) return;
    try {
      await createInvoice.mutateAsync({ interventionId: selectedId });
      toast.success('Factură generată cu succes! Lucrarea este acum facturată.');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la generarea facturii.');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'SCHEDULED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'EN_ROUTE':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-orange-700 border-amber-200';
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'INVOICED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        title="Lucrări"
        description={
          isManagement
            ? 'Gestionează comenzile de lucru, programările, tehnicienii alocați și stadiul execuției.'
            : 'Lucrările alocate ție — actualizează statusul și adaugă note după execuție.'
        }
        action={
          isManagement ? (
            <button type="button" onClick={handleOpenCreate} className={cabinetBtnPrimary}>
              + Creează lucrare
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap gap-1.5 pb-2">
        {[
          { label: 'Toate', value: '' },
          { label: 'Noi', value: 'NEW' },
          { label: 'Programate', value: 'SCHEDULED' },
          { label: 'În deplasare', value: 'EN_ROUTE' },
          { label: 'În lucru', value: 'IN_PROGRESS' },
          { label: 'Finalizate', value: 'COMPLETED' },
          { label: 'Facturate', value: 'INVOICED' },
          { label: 'Plătite', value: 'PAID' },
          { label: 'Anulate', value: 'CANCELLED' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === tab.value
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-white/80 text-gray-500 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2 p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Se încarcă lucrările...</div>
          ) : interventions?.length === 0 ? (
            <EmptyState message="Nicio lucrare găsită." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold">
                    <th className="p-4 text-xs uppercase tracking-wider">Cod / Tip</th>
                    <th className="p-4 text-xs uppercase tracking-wider">Client & Adresă</th>
                    <th className="p-4 text-xs uppercase tracking-wider">Programare & Tehnician</th>
                    <th className="p-4 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {interventions?.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenDetail(item)}
                      className={`hover:bg-violet-50/20 transition-colors cursor-pointer ${
                        selectedId === item.id ? 'bg-violet-50/40 font-semibold' : ''
                      }`}
                    >
                      <td className="p-4">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">{item.number}</span>
                        <div className="font-bold text-gray-800 text-sm mt-0.5">{item.type}</div>
                      </td>
                      <td className="p-4 text-xs">
                        <div className="font-bold text-gray-900">{item.customer?.fullName}</div>
                        <div className="text-gray-500 mt-0.5 max-w-xs truncate">{item.address}</div>
                      </td>
                      <td className="p-4 text-xs text-gray-700">
                        <div className="font-bold text-gray-800">
                          {item.scheduledAt
                            ? new Date(item.scheduledAt).toLocaleString('ro-MD', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : 'Neprogramată'}
                        </div>
                        <div className="text-gray-400 mt-0.5">
                          {technicianDisplayName(item.technician)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusStyle(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel>
          <PanelHeader
            title="Fișa lucrării"
            action={
              isManagement && selectedId && !isLoadingDetail && detail ? (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedId)}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                >
                  Șterge
                </button>
              ) : undefined
            }
          />

          {selectedId ? (
            isLoadingDetail || !detail ? (
              <div className="text-center py-20 text-gray-400">Se încarcă detaliile...</div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">{detail.number}</span>
                    <h3 className="text-lg font-black text-gray-900 mt-0.5 tracking-tight">{detail.type}</h3>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${getStatusStyle(
                      detail.status
                    )}`}
                  >
                    {INTERVENTION_STATUS_LABELS[detail.status]}
                  </span>
                </div>

                {detail.estimateProjectId && (
                  <Link
                    to={`/company/lucrari/${detail.id}/fisa`}
                    className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    Fișă execuție (plan & etape)
                  </Link>
                )}

                {/* Status workflow */}
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-2.5">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Următorul pas
                  </h4>
                  {(() => {
                    const allowed = getAllowedInterventionTransitions(detail.status, role);
                    const hint = getInterventionStatusHint(detail.status);
                    if (allowed.length === 0) {
                      return (
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                          {hint ||
                            (isTerminalInterventionStatus(detail.status)
                              ? 'Status final — nu mai poate fi modificat.'
                              : 'Nu există acțiuni disponibile pentru acest status.')}
                        </p>
                      );
                    }
                    return (
                      <>
                        <input
                          type="text"
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          placeholder="Notă opțională pentru schimbarea de status..."
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
                                st === 'CANCELLED'
                                  ? 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                                  : 'bg-violet-600 text-white border-violet-600 hover:bg-violet-700 shadow-xs'
                              } disabled:opacity-50`}
                            >
                              {INTERVENTION_STATUS_LABELS[st]}
                            </button>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                  {isManagement && detail.status === 'COMPLETED' && (
                    <button
                      onClick={handleGenerateInvoice}
                      className="w-full mt-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      🧾 Generează Factură (Invoiced)
                    </button>
                  )}
                </div>

                {!isEditingDetail ? (
                  <div className="space-y-4">
                    {/* View Details */}
                    <div className="space-y-2.5 text-sm text-gray-700">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">CLIENT</span>
                        <span className="font-bold text-gray-900">{detail.customer?.fullName}</span>
                        <span className="text-xs text-gray-500 block font-semibold mt-0.5">{detail.customer?.phone}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">ADRESĂ DE DESFĂȘURARE</span>
                        <span className="font-bold text-gray-800">{detail.address}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">DESCRIERE DEFECT</span>
                        <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap bg-gray-50/50 p-3 rounded-xl border border-gray-100 leading-relaxed font-medium">
                          {detail.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">PROGRES / DATA</span>
                          <span className="text-xs font-bold text-gray-800">
                            {detail.scheduledAt
                              ? new Date(detail.scheduledAt).toLocaleString('ro-MD')
                              : 'Neasociată'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">TEHNICIAN ALOCAT</span>
                          <span className="text-xs font-bold text-gray-800">
                            {technicianDisplayName(detail.technician)}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3.5">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">PREȚ ESTIMAT</span>
                          <span className="font-black text-sm text-gray-900">
                            {detail.estimatedPrice ? `${detail.estimatedPrice} MDL` : 'Nespecificat'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">PREȚ FINAL</span>
                          <span className="font-black text-sm text-emerald-600">
                            {detail.finalPrice ? `${detail.finalPrice} MDL` : 'Nespecificat'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {detail.internalNotes && (
                      <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
                        <span className="text-[10px] font-bold text-amber-800 block uppercase tracking-wider mb-1">
                          Observații interne importante
                        </span>
                        <p className="text-xs text-amber-950 font-medium whitespace-pre-wrap leading-relaxed">{detail.internalNotes}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">FOTO ȘANTIER</span>
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
                        <p className="text-xs text-gray-400">Nicio fotografie încă.</p>
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
                              toast.success('Fotografii adăugate.');
                            } catch (err: unknown) {
                              toast.error((err as Error).message || 'Eroare la upload.');
                            }
                            e.target.value = '';
                          }}
                        />
                        + Adaugă fotografii
                      </label>
                    </div>

                    {isManagement || canEditAssignedInterventionFields ? (
                      <button
                        onClick={handleStartEdit}
                        className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        ✏️ {isManagement ? 'Editează detalii fișă' : 'Actualizează adresă / descriere / preț'}
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {isManagement ? 'Editează fișă' : 'Actualizează detalii lucrare'}
                    </h4>
                    {isManagement ? (
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Tip lucrare</label>
                        <input
                          type="text"
                          value={editType}
                          onChange={(e) => setEditType(e.target.value)}
                          className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-2 text-xs outline-none bg-white font-medium"
                        />
                      </div>
                    ) : null}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Adresă</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-2 text-xs outline-none bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Descriere</label>
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
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Tehnician</label>
                            <select
                              value={editTechnicianId}
                              onChange={(e) => setEditTechnicianId(e.target.value)}
                              className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-2 text-xs outline-none bg-white cursor-pointer font-medium"
                            >
                              <option value="">Neatribuit</option>
                              {assignableTechnicians.map((m: CompanyMemberDto) => (
                                <option key={m.id} value={m.id}>
                                  {memberDisplayName(m)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Programare</label>
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
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Preț Estimat</label>
                          <input
                            type="number"
                            value={editEstimatedPrice}
                            onChange={(e) => setEditEstimatedPrice(e.target.value)}
                            className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-2 text-xs outline-none bg-white font-bold"
                          />
                        </div>
                      ) : null}
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Preț Final</label>
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
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Note Interne</label>
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
                        Anulează
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Salvează
                      </button>
                    </div>
                  </div>
                )}

                {/* Notes Stream */}
                <div className="border-t border-gray-100 pt-4 space-y-3.5">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Discuții & Note interne ({detail.notes?.length || 0})
                  </h4>
                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Adaugă un comentariu intern..."
                      value={noteBody}
                      onChange={(e) => setNoteBody(e.target.value)}
                      className="flex-1 border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-3 py-2 text-xs outline-none transition-all bg-white"
                    />
                    <button
                      type="submit"
                      className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Trimite
                    </button>
                  </form>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {detail.notes?.map((n: InterventionNoteDto) => (
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
                              Șterge
                            </button>
                          ) : null}
                        </div>
                        <p className="text-xs text-gray-700 mt-1.5 whitespace-pre-wrap leading-relaxed font-medium">{n.body}</p>
                        <span className="text-[9px] text-gray-400 block text-right mt-1.5 font-bold uppercase tracking-wider">
                          {new Date(n.createdAt).toLocaleDateString('ro-MD')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : (
            <EmptyState message="Selectează o lucrare din listă pentru a-i deschide fișa de monitorizare." />
          )}
        </Panel>
      </div>

      {/* Create Modal */}
      <AppModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Creează Lucrare / Intervenție"
        size="xl"
        backgroundIndex={3}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Client *
                  </label>
                  <select
                    required
                    value={customerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white cursor-pointer font-medium"
                  >
                    <option value="">Alege clientul...</option>
                    {customers?.map((c: CustomerDto) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Tip lucrare *
                  </label>
                  <input
                    type="text"
                    required
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="ex: Instalare Aer Condiționat"
                    className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Descriere solicitare *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detaliați lucrarea care trebuie efectuată..."
                  className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white resize-none font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Adresă de desfășurare *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Adresa unde va merge tehnicianul"
                  className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Alocă Tehnician
                  </label>
                  <select
                    value={technicianId}
                    onChange={(e) => setTechnicianId(e.target.value)}
                    className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white cursor-pointer font-medium"
                  >
                    <option value="">Alege tehnicianul...</option>
                    {assignableTechnicians.map((m: CompanyMemberDto) => (
                      <option key={m.id} value={m.id}>
                        {memberDisplayName(m)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Programare Dată & Oră
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white cursor-pointer font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Preț Estimativ (MDL)
                  </label>
                  <input
                    type="number"
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(e.target.value)}
                    placeholder="ex: 1500"
                    className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Note interne importante
                  </label>
                  <input
                    type="text"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="ex: Cod interfon 45#"
                    className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-500 cursor-pointer"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={createIntervention.isPending}
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Creează Lucrare
                </button>
              </div>
            </form>
      </AppModal>
    </div>
  );
}
