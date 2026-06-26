import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import type { InvoiceDto } from '@/entities/fsm/model/types';
import { INTERVENTION_STATUS } from '@/entities/fsm/model/interventionStatus.constants';
import { useCreateInvoiceMutation } from '@/features/fsm/api/useInvoices';
import { useInterventionsQuery } from '@/features/fsm/api/useInterventions';
import { useCompanyMeQuery } from '@/features/companies/api/useCompanies';
import { useAuthStore } from '@/entities/user/model/authStore';
import { getErrorMessage } from '@/shared/utils/errors';

interface UseCreateInvoiceFormProps {
  onClose: () => void;
  onCreated?: (invoice: InvoiceDto) => void;
}

export function useCreateInvoiceForm({ onClose, onCreated }: UseCreateInvoiceFormProps) {
  const { t } = useTranslation();
  const { data: interventions } = useInterventionsQuery(INTERVENTION_STATUS.COMPLETED);
  const { data: companyMe } = useCompanyMeQuery();
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  const createInvoice = useCreateInvoiceMutation();

  const activeCompany = useMemo(
    () => companyMe?.owned.find((c) => c.id === activeCompanyId) ?? null,
    [companyMe, activeCompanyId],
  );

  const defaultTvaRate = activeCompany?.isTvaPayer ? 20 : 0;
  const [interventionId, setInterventionId] = useState('');
  const [tvaRate, setTvaRate] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState('');

  const resolvedTvaRate = tvaRate ?? defaultTvaRate;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interventionId) {
      toast.error(t('company.fsm.invoices.createModal.toast.selectIntervention'));
      return;
    }

    try {
      const invoice = await createInvoice.mutateAsync({
        interventionId,
        tvaRate: Number(resolvedTvaRate),
        dueDate: dueDate || undefined,
      });
      toast.success(t('company.fsm.invoices.createModal.toast.created'));
      onCreated?.(invoice);
      onClose();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.invoices.createModal.toast.createError')));
    }
  };

  return {
    interventions,
    activeCompany,
    interventionId,
    setInterventionId,
    tvaRate: resolvedTvaRate,
    setTvaRate,
    dueDate,
    setDueDate,
    handleCreateSubmit,
    isPending: createInvoice.isPending,
  };
}
