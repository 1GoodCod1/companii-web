import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { getErrorMessage } from '@/utils/errors';

type Props = {
  open: boolean;
  onClose: () => void;
  editingCustomer: CustomerDto | null;
};

export function CustomerFormModal({ open, onClose, editingCustomer }: Props) {
  const { t } = useTranslation();
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
      toast.error(t('company.fsm.customers.form.toast.requiredFields'));
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
        toast.success(t('company.fsm.customers.form.toast.updated'));
      } else {
        await createCustomer.mutateAsync({
          fullName,
          phone,
          email: email || undefined,
          address,
          notes: notes || undefined,
        });
        toast.success(t('company.fsm.customers.form.toast.created'));
      }
      onClose();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.common.errorGeneric')));
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={
        editingCustomer
          ? t('company.fsm.customers.form.titleEdit')
          : t('company.fsm.customers.form.titleCreate')
      }
      size="lg"
      backgroundIndex={1}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={cabinetLabelClass}>{t('company.fsm.customers.form.fields.fullName')}</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t('company.fsm.customers.form.fields.fullNamePlaceholder')}
            className={cabinetFieldClass}
          />
        </div>

        <div>
          <label className={cabinetLabelClass}>{t('company.fsm.customers.form.fields.phone')}</label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('company.fsm.customers.form.fields.phonePlaceholder')}
            className={cabinetFieldClass}
          />
        </div>

        <div>
          <label className={cabinetLabelClass}>{t('company.fsm.customers.form.fields.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('company.fsm.customers.form.fields.emailPlaceholder')}
            className={cabinetFieldClass}
          />
        </div>

        <div>
          <label className={cabinetLabelClass}>{t('company.fsm.customers.form.fields.address')}</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t('company.fsm.customers.form.fields.addressPlaceholder')}
            className={cabinetFieldClass}
          />
        </div>

        <div>
          <label className={cabinetLabelClass}>{t('company.fsm.customers.form.fields.notes')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('company.fsm.customers.form.fields.notesPlaceholder')}
            rows={3}
            className={`${cabinetFieldClass} resize-none`}
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={cabinetBtnSecondary}>
            {t('cabinet.common.cancel')}
          </button>
          <button
            type="submit"
            disabled={createCustomer.isPending || updateCustomer.isPending}
            className={cabinetBtnPrimary}
          >
            {t('cabinet.common.save')}
          </button>
        </div>
      </form>
    </AppModal>
  );
}
