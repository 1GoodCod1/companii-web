import { useState } from 'react';
import {
  useInvoicesQuery,
  useInvoiceQuery,
  useInterventionsQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  downloadCompanyInvoicePdf,
  downloadInvoicesCsv,
} from '@/features/fsm/api/useFsm';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/AppModal';
import {
  PageHero,
  Panel,
  PanelHeader,
  EmptyState,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import type { InvoicePaymentStatus } from '@/features/fsm/types';
import {
  getAllowedPaymentTransitions,
  getPaymentStatusHint,
} from '@/features/fsm/statusTransitions';
import { PAYMENT_STATUS_LABELS } from '@/features/fsm/statusLabels';
import { CompanyManagementGate } from '@/features/companies/CompanyManagementGate';

export function CompanyInvoicesPage() {
  const { data: invoices, isLoading } = useInvoicesQuery();
  const { data: interventions } = useInterventionsQuery('COMPLETED');

  const createInvoice = useCreateInvoiceMutation();
  const updateInvoice = useUpdateInvoiceMutation();
  const deleteInvoice = useDeleteInvoiceMutation();

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [interventionId, setInterventionId] = useState('');
  const [tvaRate, setTvaRate] = useState(20); // default 20% in MD
  const [dueDate, setDueDate] = useState('');

  // Detail sidebar state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: detail, isLoading: isLoadingDetail } = useInvoiceQuery(selectedId || '');

  const handleOpenCreate = () => {
    setInterventionId('');
    setTvaRate(20);
    setDueDate('');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interventionId) {
      toast.error('Vă rugăm să alegeți o intervenție finalizată.');
      return;
    }

    try {
      await createInvoice.mutateAsync({
        interventionId,
        tvaRate: Number(tvaRate),
        dueDate: dueDate || undefined,
      });
      toast.success('Factură generată cu succes!');
      setShowCreateModal(false);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la generarea facturii.');
    }
  };

  const handlePaymentStatusChange = async (newStatus: InvoicePaymentStatus) => {
    if (!selectedId || !detail) return;
    if (newStatus === detail.paymentStatus) return;
    try {
      await updateInvoice.mutateAsync({ id: selectedId, paymentStatus: newStatus });
      toast.success(`Factura a fost marcată ca ${PAYMENT_STATUS_LABELS[newStatus]}!`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la actualizarea facturii.');
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedId || !detail) return;
    try {
      await downloadCompanyInvoicePdf(selectedId, `${detail.number}.pdf`);
      toast.success('PDF descărcat cu succes!');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la generarea PDF.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur doriți să ștergeți această factură? (Facturile plătite nu pot fi șterse)')) return;
    try {
      await deleteInvoice.mutateAsync(id);
      toast.success('Factură ștearsă cu succes!');
      setSelectedId(null);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Nu s-a putut șterge factura.');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'UNPAID':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'PAID':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'OVERDUE':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <CompanyManagementGate>
    <div className="space-y-6 animate-fade-in">
      <PageHero
        title="Facturi FSM"
        description="Gestionează fluxul financiar, plățile, TVA-ul și facturarea comenzilor finalizate."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => downloadInvoicesCsv().catch((e: Error) => toast.error(e.message))}
              className={cabinetBtnSecondary}
            >
              Export CSV
            </button>
            <button type="button" onClick={handleOpenCreate} className={cabinetBtnPrimary}>
              + Generează factură
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2 p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Se încarcă facturile...</div>
          ) : invoices?.length === 0 ? (
            <EmptyState message="Nicio factură emisă în sistem." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold">
                    <th className="p-4 text-xs uppercase tracking-wider">Factură Nr / Emisă</th>
                    <th className="p-4 text-xs uppercase tracking-wider">Beneficiar / Lucrare</th>
                    <th className="p-4 text-xs uppercase tracking-wider">Suma totală</th>
                    <th className="p-4 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices?.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`hover:bg-violet-50/20 transition-colors cursor-pointer ${
                        selectedId === item.id ? 'bg-violet-50/40 font-semibold' : ''
                      }`}
                    >
                      <td className="p-4">
                        <span className="font-bold text-gray-800">{item.number}</span>
                        <div className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">
                          {new Date(item.issuedAt).toLocaleDateString('ro-MD')}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-semibold text-gray-900">
                        <div>{item.intervention?.customer?.fullName || 'Client pachet'}</div>
                        <div className="text-gray-400 font-normal mt-0.5">
                          Lucrare: {item.intervention?.number}
                        </div>
                      </td>
                      <td className="p-4 font-black text-gray-950">
                        {Number(item.amount).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusStyle(
                            item.paymentStatus
                          )}`}
                        >
                          {item.paymentStatus}
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
            title="Vizualizare factură"
            action={
              selectedId && !isLoadingDetail && detail ? (
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
              <div className="text-center py-20 text-gray-400">Se încarcă detaliile facturii...</div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">{detail.number}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                      Emisă la: {new Date(detail.issuedAt).toLocaleDateString('ro-MD')}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${getStatusStyle(
                      detail.paymentStatus
                    )}`}
                  >
                    {PAYMENT_STATUS_LABELS[detail.paymentStatus]}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  Descarcă chitanța PDF
                </button>

                {/* Status Updater */}
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-2.5">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Modifică status plată
                  </h4>
                  {(() => {
                    const allowed = getAllowedPaymentTransitions(detail.paymentStatus);
                    const hint = getPaymentStatusHint(detail.paymentStatus);
                    if (allowed.length === 0) {
                      return (
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                          {hint || 'Nu există acțiuni disponibile pentru acest status.'}
                        </p>
                      );
                    }
                    return (
                      <div className="flex gap-2">
                        {[detail.paymentStatus, ...allowed].filter(
                          (st, idx, arr) => arr.indexOf(st) === idx,
                        ).map((st) => {
                          const isCurrent = detail.paymentStatus === st;
                          const isAction = allowed.includes(st);
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => isAction && handlePaymentStatusChange(st)}
                              disabled={isCurrent || updateInvoice.isPending}
                              className={`flex-1 py-2 rounded-xl text-[10px] font-black border transition-all ${
                                isCurrent
                                  ? 'bg-violet-600 text-white border-violet-600 shadow-xs cursor-default'
                                  : isAction
                                    ? 'bg-white text-gray-700 border-gray-200 hover:bg-violet-50 hover:border-violet-200 cursor-pointer'
                                    : 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed opacity-60'
                              }`}
                            >
                              {PAYMENT_STATUS_LABELS[st]}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                <div className="text-sm border-t border-gray-100 pt-3 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">CLIENT BENEFICIAR</span>
                    <span className="font-bold text-gray-900">
                      {detail.intervention?.customer?.fullName || 'Client pachet'}
                    </span>
                    <span className="text-xs text-gray-500 block font-medium">
                      {detail.intervention?.customer?.phone}
                    </span>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      {detail.intervention?.customer?.address}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">LUCRARE ASOCIATĂ</span>
                    <span className="font-semibold text-xs text-gray-800">
                      {detail.intervention?.number} — {detail.intervention?.type}
                    </span>
                  </div>

                  {detail.dueDate && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">TERMEN DE PLATĂ</span>
                      <span className="font-bold text-red-500 text-xs">
                        Până la {new Date(detail.dueDate).toLocaleDateString('ro-MD')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Amount breakdown */}
                <div className="border-t border-gray-100 pt-3 space-y-2 bg-violet-50/10 p-3.5 rounded-xl border border-violet-100">
                  <h4 className="text-[10px] font-bold text-violet-700 uppercase tracking-widest">
                    Calcul fiscal detaliat
                  </h4>
                  <div className="space-y-1.5 text-xs text-gray-600 font-medium">
                    <div className="flex justify-between">
                      <span>Bază impozabilă:</span>
                      <span className="font-bold text-gray-800">
                        {Number(detail.amount).toLocaleString('ro-MD')} MDL
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>TVA ({detail.tvaRate}%):</span>
                      <span className="font-bold text-gray-800">
                        {Number(detail.tvaAmount).toLocaleString('ro-MD')} MDL
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-100 pt-1.5">
                      <span>TOTAL DE PLATĂ:</span>
                      <span className="text-violet-700">
                        {(Number(detail.amount) + Number(detail.tvaAmount)).toLocaleString('ro-MD', {
                          style: 'currency',
                          currency: 'MDL',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <EmptyState message="Selectează o factură din listă pentru a-i vedea descrierea fiscală detaliată." />
          )}
        </Panel>
      </div>

      {/* Create Invoice Modal */}
      <AppModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Generează Factură"
        size="lg"
        backgroundIndex={2}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Alege Lucrarea Finalizată (FSM) *
                </label>
                <select
                  required
                  value={interventionId}
                  onChange={(e) => setInterventionId(e.target.value)}
                  className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white cursor-pointer font-medium"
                >
                  <option value="">Alege lucrarea finalizată...</option>
                  {interventions?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.number} — {item.customer?.fullName} ({item.type})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 font-medium mt-1.5 leading-relaxed">
                  Doar lucrările în stadiul COMPLETED care nu au fost facturate sunt afișate.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Cotă TVA (%) *
                  </label>
                  <select
                    value={tvaRate}
                    onChange={(e) => setTvaRate(Number(e.target.value))}
                    className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white cursor-pointer font-medium"
                  >
                    <option value="20">20% (Standard MD)</option>
                    <option value="8">8% (Redusă MD)</option>
                    <option value="0">0% (Scutită / Fără)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Dată Scadență (Due Date)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white cursor-pointer font-medium"
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
                  disabled={createInvoice.isPending}
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Emite Factură
                </button>
              </div>
            </form>
      </AppModal>
    </div>
    </CompanyManagementGate>
  );
}
