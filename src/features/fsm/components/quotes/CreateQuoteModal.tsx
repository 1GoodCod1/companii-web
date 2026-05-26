import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/AppModal';
import type { CompanyServiceDto, CustomerDto } from '@/types/fsm';
import { useCreateQuoteMutation } from '@/features/fsm/api/useQuotes';
import { useCustomersQuery } from '@/features/fsm/api/useCustomers';
import { useCompanyServicesQuery } from '@/features/fsm/api/useCompanyServices';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateQuoteModal({ open, onClose }: Props) {
  const { data: customers } = useCustomersQuery();
  const { data: services } = useCompanyServicesQuery();
  const createQuote = useCreateQuoteMutation();

  const [customerId, setCustomerId] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [lines, setLines] = useState<{ description: string; qty: number; unitPrice: number }[]>([
    { description: '', qty: 1, unitPrice: 0 },
  ]);
  const [catalogServiceId, setCatalogServiceId] = useState('');

  const resetForm = () => {
    setCustomerId('');
    setValidUntil('');
    setLines([{ description: '', qty: 1, unitPrice: 0 }]);
    setCatalogServiceId('');
  };

  useEffect(() => {
    if (open) resetForm();
  }, [open]);

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
      onClose();
      resetForm();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la crearea ofertei.');
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
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
            onClick={onClose}
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
  );
}
