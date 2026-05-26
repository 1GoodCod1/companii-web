import { useState } from 'react';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/AppModal';
import type { CompanyMemberDto, CustomerDto } from '@/types/fsm';
import { useCreateInterventionMutation } from '@/features/fsm/api/useInterventions';
import { memberDisplayName } from '@/utils/teamMembers';
import { getErrorMessage } from '@/utils/errors';

type Props = {
  open: boolean;
  onClose: () => void;
  customers: CustomerDto[] | undefined;
  assignableTechnicians: CompanyMemberDto[];
};

export function CreateInterventionModal({ open, onClose, customers, assignableTechnicians }: Props) {
  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Creează Lucrare / Intervenție"
      size="xl"
      backgroundIndex={3}
    >
      {open ? (
        <CreateInterventionForm
          customers={customers}
          assignableTechnicians={assignableTechnicians}
          onClose={onClose}
        />
      ) : null}
    </AppModal>
  );
}

function CreateInterventionForm({
  customers,
  assignableTechnicians,
  onClose,
}: Omit<Props, 'open'>) {
  const createIntervention = useCreateInterventionMutation();

  const [customerId, setCustomerId] = useState('');
  const [type, setType] = useState('Reparație');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const handleCustomerChange = (cid: string) => {
    setCustomerId(cid);
    const cust = customers?.find((c) => c.id === cid);
    if (cust) setAddress(cust.address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      onClose();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Eroare la crearea lucrării.'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            {customers?.map((c) => (
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
            {assignableTechnicians.map((m) => (
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
          onClick={onClose}
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
  );
}
