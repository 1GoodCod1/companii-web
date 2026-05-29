import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import type { CompanyMemberDto, CustomerDto } from '@/types/fsm';
import { useCreateInterventionMutation } from '@/features/fsm/api/useInterventions';
import { useCrewsQuery } from '@/features/fsm/api/useCrews';
import { memberDisplayName } from '@/utils/teamMembers';
import { getErrorMessage } from '@/utils/errors';

export type AssignMode = 'single' | 'multiple' | 'crew';

interface UseCreateInterventionFormProps {
  customers: CustomerDto[] | undefined;
  assignableTechnicians: CompanyMemberDto[];
  onClose: () => void;
}

export function useCreateInterventionForm({
  customers,
  assignableTechnicians,
  onClose,
}: UseCreateInterventionFormProps) {
  const { t } = useTranslation();
  const createIntervention = useCreateInterventionMutation();
  const { data: crews } = useCrewsQuery();

  const [customerId, setCustomerId] = useState('');
  const [type, setType] = useState(() => t('company.fsm.interventions.createModal.defaultType'));
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

  return {
    customerId,
    setCustomerId,
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
    setMemberIds,
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
    isPending: createIntervention.isPending,
  };
}
