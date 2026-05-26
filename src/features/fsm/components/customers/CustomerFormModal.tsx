import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/AppModal';
import {
  cabinetFieldClass,
  cabinetLabelClass,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import type { CustomerDto } from '@/types/fsm';
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from '@/features/fsm/api/useCustomers';

type Props = {
  open: boolean;
  onClose: () => void;
  editingCustomer: CustomerDto | null;
};

export function CustomerFormModal({ open, onClose, editingCustomer }: Props) {
  const createCustomer = useCreateCustomerMutation();
  const updateCustomer = useUpdateCustomerMutation();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editingCustomer) {
      setFullName(editingCustomer.fullName);
      setPhone(editingCustomer.phone);
      setEmail(editingCustomer.email || '');
      setAddress(editingCustomer.address);
      setNotes(editingCustomer.notes || '');
    } else {
      setFullName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setNotes('');
    }
  }, [open, editingCustomer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      toast.error('Vă rugăm să completați toate câmpurile obligatorii.');
      return;
    }

    try {
      if (editingCustomer) {
        await updateCustomer.mutateAsync({
          id: editingCustomer.id,
          fullName,
          phone,
          email: email || undefined,
          address,
          notes: notes || undefined,
        });
        toast.success('Client actualizat cu succes!');
      } else {
        await createCustomer.mutateAsync({
          fullName,
          phone,
          email: email || undefined,
          address,
          notes: notes || undefined,
        });
        toast.success('Client creat cu succes!');
      }
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'A apărut o eroare.');
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={editingCustomer ? 'Editează Client' : 'Adaugă Client Nou'}
      size="lg"
      backgroundIndex={1}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={cabinetLabelClass}>Nume complet *</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="ex: Ion Popescu"
            className={cabinetFieldClass}
          />
        </div>

        <div>
          <label className={cabinetLabelClass}>Telefon *</label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="ex: +373 68 000 000"
            className={cabinetFieldClass}
          />
        </div>

        <div>
          <label className={cabinetLabelClass}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ex: ion@popescu.md"
            className={cabinetFieldClass}
          />
        </div>

        <div>
          <label className={cabinetLabelClass}>Adresă de livrare/lucru *</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="ex: str. Ștefan cel Mare 1, ap. 12, Chișinău"
            className={cabinetFieldClass}
          />
        </div>

        <div>
          <label className={cabinetLabelClass}>Note</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observații despre client (ex. cod interfon, ore preferate)..."
            rows={3}
            className={`${cabinetFieldClass} resize-none`}
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={cabinetBtnSecondary}>
            Anulează
          </button>
          <button
            type="submit"
            disabled={createCustomer.isPending || updateCustomer.isPending}
            className={cabinetBtnPrimary}
          >
            Salvează
          </button>
        </div>
      </form>
    </AppModal>
  );
}
