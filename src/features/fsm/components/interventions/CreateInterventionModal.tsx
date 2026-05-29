import { useTranslation } from 'react-i18next';
import { AppModal } from '@/components/ui/AppModal';
import type { CompanyMemberDto, CustomerDto } from '@/types/fsm';
import { useCreateInterventionForm } from './hooks/useCreateInterventionForm';
import { AssignmentSection } from './components/AssignmentSection';

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

  const {
    customerId,
    type,
    setType,
    description,
    setDescription,
    address,
    setAddress,
    assignMode,
    setAssignMode,
    technicianId,
    setTechnicianId,
    memberIds,
    crewId,
    setCrewId,
    scheduledAt,
    setScheduledAt,
    estimatedPrice,
    setEstimatedPrice,
    internalNotes,
    setInternalNotes,
    techniciansSorted,
    activeCrews,
    toggleMember,
    handleCustomerChange,
    handleSubmit,
    isPending,
  } = useCreateInterventionForm({
    customers,
    assignableTechnicians,
    onClose,
  });

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

      <AssignmentSection
        assignMode={assignMode}
        setAssignMode={setAssignMode}
        technicianId={technicianId}
        setTechnicianId={setTechnicianId}
        memberIds={memberIds}
        toggleMember={toggleMember}
        crewId={crewId}
        setCrewId={setCrewId}
        techniciansSorted={techniciansSorted}
        activeCrews={activeCrews}
      />

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
          disabled={isPending}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
        >
          {t('company.fsm.interventions.createModal.submit')}
        </button>
      </div>
    </form>
  );
}
