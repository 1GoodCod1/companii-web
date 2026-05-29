import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/AppModal';
import type { CompanyMemberDto, CustomerDto } from '@/types/fsm';
import { useCreateInterventionMutation } from '@/features/fsm/api/useInterventions';
import { useCrewsQuery } from '@/features/fsm/api/useCrews';
import { memberDisplayName } from '@/utils/teamMembers';
import { getErrorMessage } from '@/utils/errors';

type AssignMode = 'single' | 'multiple' | 'crew';

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
  const { data: crews } = useCrewsQuery();

  const [customerId, setCustomerId] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [assignMode, setAssignMode] = useState<AssignMode>('single');
  const [technicianId, setTechnicianId] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [crewId, setCrewId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const techniciansSorted = useMemo(
    () =>
      [...assignableTechnicians].sort((a, b) =>
        memberDisplayName(a).localeCompare(memberDisplayName(b)),
      ),
    [assignableTechnicians],
  );
  const activeCrews = useMemo(() => crews?.filter((c) => c.isActive) ?? [], [crews]);

  const toggleMember = (id: string) => {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

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

    // Resolve assignment based on the chosen mode. Only one of the three
    // payload fields is sent — backend treats them with precedence
    // crewId > assigneeMemberIds > technicianId.
    let assignFields: {
      technicianId?: string;
      assigneeMemberIds?: string[];
      crewId?: string;
    } = {};
    if (assignMode === 'crew' && crewId) {
      assignFields = { crewId };
    } else if (assignMode === 'multiple' && memberIds.length > 0) {
      assignFields = { assigneeMemberIds: memberIds };
    } else if (assignMode === 'single' && technicianId) {
      assignFields = { technicianId };
    }

    try {
      await createIntervention.mutateAsync({
        customerId,
        type,
        description,
        address,
        ...assignFields,
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

      {/* Phase A — multi-assignee + crew picker. */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-3 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
            {t('company.fsm.interventions.createModal.fields.assignmentMode', {
              defaultValue: 'Atribuire',
            })}
          </span>
          {(['single', 'multiple', 'crew'] as AssignMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setAssignMode(mode)}
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors ${
                assignMode === mode
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-violet-50'
              }`}
            >
              {t(`company.fsm.interventions.createModal.assignMode.${mode}`, {
                defaultValue:
                  mode === 'single' ? 'Un singur' : mode === 'multiple' ? 'Mai mulți' : 'Brigadă',
              })}
            </button>
          ))}
        </div>

        {assignMode === 'single' && (
          <select
            value={technicianId}
            onChange={(e) => setTechnicianId(e.target.value)}
            className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none bg-white cursor-pointer font-medium"
          >
            <option value="">
              {t('company.fsm.interventions.createModal.fields.technicianPlaceholder')}
            </option>
            {techniciansSorted.map((m) => (
              <option key={m.id} value={m.id}>
                {memberDisplayName(m)}
              </option>
            ))}
          </select>
        )}

        {assignMode === 'multiple' && (
          <div className="space-y-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2">
            {techniciansSorted.length === 0 ? (
              <p className="text-xs text-gray-400 italic p-2">
                {t('company.fsm.interventions.createModal.assignMode.noMembers', {
                  defaultValue: 'Niciun membru disponibil',
                })}
              </p>
            ) : (
              techniciansSorted.map((m, idx) => (
                <label
                  key={m.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-violet-50 cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={memberIds.includes(m.id)}
                    onChange={() => toggleMember(m.id)}
                    className="w-3.5 h-3.5 accent-violet-600"
                  />
                  <span className="font-medium text-gray-800">{memberDisplayName(m)}</span>
                  {memberIds.indexOf(m.id) === 0 && memberIds.length > 1 && (
                    <span className="ml-auto text-[9px] font-black uppercase text-violet-600">
                      {t('company.fsm.interventions.createModal.assignMode.lead', {
                        defaultValue: 'Lead',
                      })}
                    </span>
                  )}
                  {memberIds.length === 1 && memberIds[0] === m.id && (
                    <span className="ml-auto text-[9px] font-black uppercase text-violet-600">
                      {t('company.fsm.interventions.createModal.assignMode.lead', { defaultValue: 'Lead' })}
                    </span>
                  )}
                  <span className="sr-only">{idx}</span>
                </label>
              ))
            )}
          </div>
        )}

        {assignMode === 'crew' && (
          <div className="space-y-2">
            <select
              value={crewId}
              onChange={(e) => setCrewId(e.target.value)}
              className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none bg-white cursor-pointer font-medium"
            >
              <option value="">
                {t('company.fsm.interventions.createModal.assignMode.crewPlaceholder', {
                  defaultValue: 'Alege o brigadă...',
                })}
              </option>
              {activeCrews.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.members.length})
                </option>
              ))}
            </select>
            {(() => {
              const chosen = activeCrews.find((c) => c.id === crewId);
              if (!chosen) return null;
              return (
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  {chosen.members
                    .map((mm) => mm.member.fullName || '—')
                    .join(', ')}
                </p>
              );
            })()}
            {activeCrews.length === 0 && (
              <p className="text-[10px] text-amber-700 italic">
                {t('company.fsm.interventions.createModal.assignMode.noCrews', {
                  defaultValue:
                    'Nu există brigăzi configurate. Creează o brigadă în pagina „Brigăzi”.',
                })}
              </p>
            )}
          </div>
        )}
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
