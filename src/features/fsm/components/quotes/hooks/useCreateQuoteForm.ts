import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import type { CompanyServiceDto } from '@/types/fsm';
import { useCreateQuoteMutation } from '@/features/fsm/api/useQuotes';
import { useCustomersQuery } from '@/features/fsm/api/useCustomers';
import { useCompanyServicesQuery } from '@/features/fsm/api/useCompanyServices';
import { getErrorMessage } from '@/utils/errors';

interface UseCreateQuoteFormProps {
  onClose: () => void;
}

export function useCreateQuoteForm({ onClose }: UseCreateQuoteFormProps) {
  const { t } = useTranslation();
  const { data: customers } = useCustomersQuery();
  const { data: services } = useCompanyServicesQuery();
  const createQuote = useCreateQuoteMutation();

  const [customerId, setCustomerId] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [lines, setLines] = useState<{ description: string; qty: number; unitPrice: number }[]>([
    { description: '', qty: 1, unitPrice: 0 },
  ]);
  const [catalogServiceId, setCatalogServiceId] = useState('');

  const resetForm = () => {
    setCustomerId('');
    setValidUntil('');
    setLines([{ description: '', qty: 1, unitPrice: 0 }]);
    setCatalogServiceId('');
  };

  const handleAddLine = () => {
    setLines([...lines, { description: '', qty: 1, unitPrice: 0 }]);
  };

  const handleAddFromCatalog = () => {
    const service = services?.find((item: CompanyServiceDto) => item.id === catalogServiceId);
    if (!service) {
      toast.error(t('company.fsm.quotes.createModal.toast.selectService'));
      return;
    }
    setLines([
      ...lines,
      {
        description: service.name,
        qty: 1,
        unitPrice: Number(service.defaultPrice),
      },
    ]);
    setCatalogServiceId('');
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: string, value: string | number) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const calculateTotal = () => {
    return lines.reduce((acc, line) => acc + line.qty * line.unitPrice, 0);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || lines.some((l) => !l.description || l.qty <= 0 || l.unitPrice < 0)) {
      toast.error(t('company.fsm.quotes.createModal.toast.requiredFields'));
      return;
    }

    try {
      await createQuote.mutateAsync({
        customerId,
        validUntil: validUntil || undefined,
        lines,
      });
      toast.success(t('company.fsm.quotes.createModal.toast.created'));
      onClose();
      resetForm();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.quotes.createModal.toast.createError')));
    }
  };

  return {
    customers,
    services,
    customerId,
    setCustomerId,
    validUntil,
    setValidUntil,
    lines,
    catalogServiceId,
    setCatalogServiceId,
    handleAddLine,
    handleAddFromCatalog,
    handleRemoveLine,
    handleLineChange,
    calculateTotal,
    handleCreateSubmit,
    isPending: createQuote.isPending,
  };
}
