import { useState } from 'react';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/AppModal';
import { INTERVENTION_STATUS } from '@/constants/interventionStatus.constants';
import { useCreateInvoiceMutation } from '@/features/fsm/api/useInvoices';
import { useInterventionsQuery } from '@/features/fsm/api/useInterventions';
import { getErrorMessage } from '@/utils/errors';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateInvoiceModal({ open, onClose }: Props) {
  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Generează Factură"
      size="lg"
      backgroundIndex={2}
    >
      {open ? <CreateInvoiceForm onClose={onClose} /> : null}
    </AppModal>
  );
}

function CreateInvoiceForm({ onClose }: Pick<Props, 'onClose'>) {
  const { data: interventions } = useInterventionsQuery(INTERVENTION_STATUS.COMPLETED);
  const createInvoice = useCreateInvoiceMutation();

  const [interventionId, setInterventionId] = useState('');
  const [tvaRate, setTvaRate] = useState(20);
  const [dueDate, setDueDate] = useState('');

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
      onClose();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Eroare la generarea facturii.'));
    }
  };

  return (
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
          onClick={onClose}
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
  );
}
