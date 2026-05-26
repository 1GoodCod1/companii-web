import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={t('company.fsm.interventions.createModal.title')}
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
  const { t } = useTranslation();
  const createIntervention = useCreateInterventionMutation();

  const [customerId, setCustomerId] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  useEffect(() => {
    setType(t('company.fsm.interventions.createModal.defaultType'));
  }, [t]);

  const handleCustomerChange = (cid: string) => {
    setCustomerId(cid);
    const cust = customers?.find((c) => c.id === cid);
    if (cust) setAddress(cust.address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !type || !description || !address) {
      toast.error(t('company.fsm.interventions.createModal.toast.requiredFields'));
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
      toast.success(t('company.fsm.interventions.createModal.toast.created'));
      onClose();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.interventions.createModal.toast.createError')));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {t('company.fsm.interventions.createModal.fields.customer')}
          </label>
          <select
            required
            value={customerId}
            onChange={(e) => handleCustomerChange(e.target.value)}
            className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white cursor-pointer font-medium"
          >
            <option value="">{t('company.fsm.interventions.createModal.fields.customerPlaceholder')}</option>
            {customers?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {t('company.fsm.interventions.createModal.fields.type')}
          </label>
          <input
            type="text"
            required
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder={t('company.fsm.interventions.createModal.fields.typePlaceholder')}
            className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white font-medium"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          {t('company.fsm.interventions.createModal.fields.description')}
        </label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('company.fsm.interventions.createModal.fields.descriptionPlaceholder')}
          className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white resize-none font-medium"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          {t('company.fsm.interventions.createModal.fields.address')}
        </label>
        <input
          type="text"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t('company.fsm.interventions.createModal.fields.addressPlaceholder')}
          className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white font-medium"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {t('company.fsm.interventions.createModal.fields.technician')}
          </label>
          <select
            value={technicianId}
            onChange={(e) => setTechnicianId(e.target.value)}
            className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white cursor-pointer font-medium"
          >
            <option value="">{t('company.fsm.interventions.createModal.fields.technicianPlaceholder')}</option>
            {assignableTechnicians.map((m) => (
              <option key={m.id} value={m.id}>
                {memberDisplayName(m)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {t('company.fsm.interventions.createModal.fields.scheduledAt')}
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
            {t('company.fsm.interventions.createModal.fields.estimatedPrice')}
          </label>
          <input
            type="number"
            value={estimatedPrice}
            onChange={(e) => setEstimatedPrice(e.target.value)}
            placeholder={t('company.fsm.interventions.createModal.fields.estimatedPricePlaceholder')}
            className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white font-bold"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {t('company.fsm.interventions.createModal.fields.internalNotes')}
          </label>
          <input
            type="text"
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder={t('company.fsm.interventions.createModal.fields.internalNotesPlaceholder')}
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
          {t('cabinet.common.cancel')}
        </button>
        <button
          type="submit"
          disabled={createIntervention.isPending}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
        >
          {t('company.fsm.interventions.createModal.submit')}
        </button>
      </div>
    </form>
  );
}
