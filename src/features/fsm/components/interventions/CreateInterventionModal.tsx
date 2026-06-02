import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppModal } from '@/shared/ui/AppModal';
import { AppSelect, cabinetBtnPrimary, cabinetBtnSecondary } from '@/widgets/cabinet/cabinet-ui';
import type { CompanyMemberDto, CustomerDto } from '@/entities/fsm/model/types';
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

  const customerOptions = useMemo(
    () => [
      { value: '', label: t('company.fsm.interventions.createModal.fields.customerPlaceholder') },
      ...(customers?.map((c) => ({ value: c.id, label: c.fullName })) ?? []),
    ],
    [customers, t],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {t('company.fsm.interventions.createModal.fields.customer')}
          </label>
          <AppSelect
            value={customerId}
            onChange={handleCustomerChange}
            options={customerOptions}
            aria-label={t('company.fsm.interventions.createModal.fields.customer')}
          />
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
        <button type="button" onClick={onClose} className={cabinetBtnSecondary}>
          {t('cabinet.common.cancel')}
        </button>
        <button type="submit" disabled={isPending} className={cabinetBtnPrimary}>
          {t('company.fsm.interventions.createModal.submit')}
        </button>
      </div>
    </form>
  );
}
