import { useState } from 'react';
import {
  useQuotesQuery,
  useQuoteQuery,
  useCustomersQuery,
  useCreateQuoteMutation,
  useUpdateQuoteMutation,
  useDeleteQuoteMutation,
  useConvertQuoteMutation,
  useSendQuoteMutation,
  useCompanyServicesQuery,
  downloadCompanyQuotePdf,
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
import type { QuoteStatus, QuoteLineDto, QuoteDto, CustomerDto, CompanyServiceDto } from '@/features/fsm/types';
import { CompanyManagementGate } from '@/features/companies/CompanyManagementGate';

export function CompanyQuotesPage() {
  const { data: quotes, isLoading } = useQuotesQuery();
  const { data: customers } = useCustomersQuery();
  const { data: services } = useCompanyServicesQuery();

  const createQuote = useCreateQuoteMutation();
  const updateQuote = useUpdateQuoteMutation();
  const deleteQuote = useDeleteQuoteMutation();
  const convertQuote = useConvertQuoteMutation();
  const sendQuote = useSendQuoteMutation();

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [lines, setLines] = useState<
    { description: string; qty: number; unitPrice: number }[]
  >([{ description: '', qty: 1, unitPrice: 0 }]);
  const [catalogServiceId, setCatalogServiceId] = useState('');

  // Detail Modal state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: detail, isLoading: isLoadingDetail } = useQuoteQuery(selectedId || '');

  const handleAddLine = () => {
    setLines([...lines, { description: '', qty: 1, unitPrice: 0 }]);
  };

  const handleAddFromCatalog = () => {
    const service = services?.find((item: CompanyServiceDto) => item.id === catalogServiceId);
    if (!service) {
      toast.error('Selectați un serviciu din catalog.');
      return;
    }
    setLines([
      ...lines,
      {
        description: service.name,
        qty: 1,
        unitPrice: Number(service.defaultPrice),
      },
    ]);
    setCatalogServiceId('');
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: string, value: string | number) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const calculateTotal = () => {
    return lines.reduce((acc, line) => acc + line.qty * line.unitPrice, 0);
  };

  const handleOpenCreate = () => {
    setCustomerId('');
    setValidUntil('');
    setLines([{ description: '', qty: 1, unitPrice: 0 }]);
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || lines.some((l) => !l.description || l.qty <= 0 || l.unitPrice < 0)) {
      toast.error('Completați toate câmpurile obligatorii și asigurați-vă că prețurile sunt corecte.');
      return;
    }

    try {
      await createQuote.mutateAsync({
        customerId,
        validUntil: validUntil || undefined,
        lines,
      });
      toast.success('Ofertă comercială creată cu succes!');
      setShowCreateModal(false);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la crearea ofertei.');
    }
  };

  const handleStatusChange = async (newStatus: QuoteStatus) => {
    if (!selectedId) return;
    try {
      await updateQuote.mutateAsync({ id: selectedId, status: newStatus });
      toast.success(`Status ofertă schimbat în ${newStatus}`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la actualizarea statusului.');
    }
  };

  const handleSend = async () => {
    if (!selectedId) return;
    try {
      await sendQuote.mutateAsync(selectedId);
      toast.success('Oferta a fost trimisă clientului.');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Eroare la trimiterea ofertei.');
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedId || !detail) return;
    setDownloadingPdf(true);
    try {
      await downloadCompanyQuotePdf(selectedId, `${detail.number}.pdf`);
      toast.success('PDF descărcat.');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Eroare la descărcarea PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleConvert = async () => {
    if (!selectedId) return;
    try {
      await convertQuote.mutateAsync(selectedId);
      toast.success('Oferta a fost convertită cu succes într-o comandă de lucru (Intervenție)!');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la convertirea ofertei.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur doriți să ștergeți această ofertă comercială?')) return;
    try {
      await deleteQuote.mutateAsync(id);
      toast.success('Ofertă ștearsă cu succes!');
      setSelectedId(null);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la ștergerea ofertei.');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'SENT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ACCEPTED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'CONVERTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <CompanyManagementGate>
    <div className="space-y-6 animate-fade-in">
      <PageHero
        title="Oferte comerciale"
        description="Generează devize de cheltuieli, bugete de lucru și oferte de preț pentru clienții tăi."
        action={
          <button type="button" onClick={handleOpenCreate} className={cabinetBtnPrimary}>
            + Creează ofertă
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2 p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Se încarcă ofertele...</div>
          ) : quotes?.length === 0 ? (
            <EmptyState message="Nicio ofertă creată în sistem." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold">
                    <th className="p-4 text-xs uppercase tracking-wider">Număr / Dată</th>
                    <th className="p-4 text-xs uppercase tracking-wider">Client</th>
                    <th className="p-4 text-xs uppercase tracking-wider">Total</th>
                    <th className="p-4 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {quotes?.map((item: QuoteDto) => (
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
                          {new Date(item.createdAt).toLocaleDateString('ro-MD')}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-bold text-gray-900">
                        {item.customer?.fullName}
                      </td>
                      <td className="p-4 font-black text-gray-950">
                        {Number(item.total).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
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
            title="Vizualizare deviz"
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
              <div className="text-center py-20 text-gray-400">Se încarcă detaliile devizului...</div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">{detail.number}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                      Emis la: {new Date(detail.createdAt).toLocaleDateString('ro-MD')}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${getStatusStyle(
                      detail.status
                    )}`}
                  >
                    {detail.status}
                  </span>
                </div>

                <div className="text-sm border-t border-gray-100 pt-3 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">CLIENT BENEFICIAR</span>
                    <span className="font-bold text-gray-900">{detail.customer?.fullName}</span>
                    <span className="text-xs text-gray-500 block font-semibold mt-0.5">{detail.customer?.phone}</span>
                    <span className="text-xs text-gray-400 block mt-0.5">{detail.customer?.address}</span>
                  </div>
                  {detail.validUntil && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">VALABILITATE OFERTĂ</span>
                      <span className="font-bold text-red-500 text-xs">
                        Până la {new Date(detail.validUntil).toLocaleDateString('ro-MD')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status & actions */}
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Actualizează stadiul ofertei
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(['DRAFT', 'ACCEPTED', 'REJECTED'] as QuoteStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${
                          detail.status === st
                            ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {detail.status !== 'SENT' && detail.status !== 'CONVERTED' ? (
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={sendQuote.isPending}
                      className={`${cabinetBtnPrimary} w-full`}
                    >
                      {sendQuote.isPending ? 'Se trimite...' : 'Trimite clientului'}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className={`${cabinetBtnSecondary} w-full`}
                  >
                    {downloadingPdf ? 'Se generează...' : 'PDF'}
                  </button>

                  {detail.status === 'ACCEPTED' && (
                    <button
                      onClick={handleConvert}
                      className="w-full mt-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      🚀 Convertește în Lucrare (FSM)
                    </button>
                  )}
                </div>

                {/* Lines Itemizer */}
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Articole / Materiale / Manoperă
                  </h4>
                  <div className="divide-y divide-gray-100 text-xs font-semibold">
                    {detail.lines?.map((line: QuoteLineDto) => (
                      <div key={line.id} className="py-2.5 flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{line.description}</p>
                          <span className="text-gray-400 text-[10px] font-bold block uppercase mt-0.5">
                            {line.qty} buc x {Number(line.unitPrice).toLocaleString('ro-MD')} MDL
                          </span>
                        </div>
                        <span className="font-black text-gray-900">
                          {(line.qty * Number(line.unitPrice)).toLocaleString('ro-MD')} MDL
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-3.5 flex justify-between items-center text-sm font-bold bg-violet-50/10 p-3.5 rounded-xl border border-violet-100">
                    <span className="text-gray-600 text-xs uppercase tracking-wider font-bold">TOTAL Deviz</span>
                    <span className="text-violet-700 font-black text-lg">
                      {Number(detail.total).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                    </span>
                  </div>
                </div>
              </div>
            )
          ) : (
            <EmptyState message="Selectează o ofertă din listă pentru a-i inspecta devizul detaliat." />
          )}
        </Panel>
      </div>

      {/* Create Quote Modal */}
      <AppModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Creează Ofertă Comercială (Deviz)"
        size="xl"
        backgroundIndex={4}
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
                    onChange={(e) => setCustomerId(e.target.value)}
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
                    Valabil până la
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white cursor-pointer font-medium"
                  />
                </div>
              </div>

              {/* Dynamic Line Editor */}
              <div className="space-y-2 border-t border-gray-100 pt-3">
                <div className="flex justify-between items-center mb-1 gap-3">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Elemente Deviz (Articole / Manoperă)
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {services?.length ? (
                      <>
                        <select
                          value={catalogServiceId}
                          onChange={(e) => setCatalogServiceId(e.target.value)}
                          className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                        >
                          <option value="">Din catalog...</option>
                          {services.map((service: CompanyServiceDto) => (
                            <option key={service.id} value={service.id}>
                              {service.name} — {Number(service.defaultPrice).toLocaleString('ro-MD')} MDL
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleAddFromCatalog}
                          className="text-xs font-black text-emerald-600 hover:text-emerald-800 cursor-pointer"
                        >
                          + Catalog
                        </button>
                      </>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleAddLine}
                      className="text-xs font-black text-violet-600 hover:text-violet-800 cursor-pointer"
                    >
                      + Adaugă Rând
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {lines.map((line, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        required
                        placeholder="Descriere articol sau serviciu"
                        value={line.description}
                        onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                        className="flex-1 border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-3 py-2 text-xs outline-none transition-all bg-white"
                      />
                      <input
                        type="number"
                        required
                        placeholder="Cant."
                        min={1}
                        value={line.qty}
                        onChange={(e) => handleLineChange(index, 'qty', Number(e.target.value))}
                        className="w-16 border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-2 py-2 text-xs outline-none transition-all bg-white text-center font-bold"
                      />
                      <input
                        type="number"
                        required
                        placeholder="Preț unitar (MDL)"
                        min={0}
                        value={line.unitPrice}
                        onChange={(e) => handleLineChange(index, 'unitPrice', Number(e.target.value))}
                        className="w-28 border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-2 py-2 text-xs outline-none transition-all bg-white text-right font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(index)}
                        disabled={lines.length === 1}
                        className="text-red-500 hover:text-red-700 disabled:opacity-30 text-sm font-semibold p-1 cursor-pointer"
                        title="Șterge rând"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm font-bold bg-gray-50/50 p-4 rounded-xl border">
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Calcul Total Deviz:</span>
                  <span className="text-violet-700 font-black text-lg">
                    {calculateTotal().toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                  </span>
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
                  disabled={createQuote.isPending}
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Creează Deviz
                </button>
              </div>
            </form>
      </AppModal>
    </div>
    </CompanyManagementGate>
  );
}
