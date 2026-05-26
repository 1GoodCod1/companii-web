import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCategoriesQuery } from '@/features/companies/api/useCompanies';
import {
  useLeadsQuery,
  useUpdateLeadMutation,
  useConvertLeadMutation,
  useCompleteLeadMutation,
} from '@/features/fsm/api/useLeads';
import { LEAD_STATUS } from '@/constants/leadStatus.constants';
import type { CompanyLeadDto, CompanyLeadStatus } from '@/types/fsm';
import { getErrorMessage } from '@/utils/errors';

export function useLeadInbox(initialStatus: CompanyLeadStatus | undefined = LEAD_STATUS.NEW) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<CompanyLeadStatus | undefined>(initialStatus);
  const { data: leads, isLoading } = useLeadsQuery(statusFilter);
  const { data: categories } = useCategoriesQuery();
  const updateLead = useUpdateLeadMutation();
  const convertLead = useConvertLeadMutation();
  const completeLead = useCompleteLeadMutation();

  const [estimateLead, setEstimateLead] = useState<CompanyLeadDto | null>(null);
  const [categoryId, setCategoryId] = useState('');
  const [estimateTitle, setEstimateTitle] = useState('');

  const sortedLeads = useMemo(
    () => [...(leads ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [leads],
  );

  const handleStatusChange = async (lead: CompanyLeadDto, status: CompanyLeadStatus) => {
    try {
      await updateLead.mutateAsync({ id: lead.id, status });
      toast.success('Status actualizat.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Eroare la actualizare.'));
    }
  };

  const handleConvertIntervention = async (leadId: string) => {
    try {
      const result = await convertLead.mutateAsync({ id: leadId, mode: 'intervention' });
      const keptOpen = (result as { keptOpen?: boolean })?.keptOpen;
      toast.success(
        keptOpen ? 'Lucrare creată — cererea rămâne deschisă.' : 'Cerere preluată ca lucrare.',
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut converti cererea.'));
    }
  };

  const handleCompleteLead = async (leadId: string) => {
    try {
      await completeLead.mutateAsync(leadId);
      toast.success('Cerere finalizată.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut finaliza cererea.'));
    }
  };

  const handleConvertCustomer = async (leadId: string) => {
    try {
      await convertLead.mutateAsync({ id: leadId, mode: 'customer' });
      toast.success('Client salvat în CRM.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut salva clientul.'));
    }
  };

  const openEstimateConvert = (lead: CompanyLeadDto) => {
    setEstimateLead(lead);
    setCategoryId(lead.categoryId ?? lead.category?.id ?? categories?.[0]?.id ?? '');
    setEstimateTitle(lead.serviceTitle ?? `Smetă ${lead.contactName}`);
  };

  const handleConvertEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estimateLead || !categoryId) {
      toast.error('Selectați categoria pentru smetă.');
      return;
    }
    try {
      const result = await convertLead.mutateAsync({
        id: estimateLead.id,
        mode: 'estimate',
        categoryId,
        title: estimateTitle.trim() || undefined,
      });
      toast.success('Cerere convertită în smetă.');
      setEstimateLead(null);
      const projectId = (result as { project?: { id?: string } })?.project?.id;
      if (projectId) navigate(`/company/smete/${projectId}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut crea smeta.'));
    }
  };

  return {
    statusFilter,
    setStatusFilter,
    sortedLeads,
    isLoading,
    categories,
    estimateLead,
    categoryId,
    estimateTitle,
    setCategoryId,
    setEstimateTitle,
    setEstimateLead,
    convertPending: convertLead.isPending,
    completePending: completeLead.isPending,
    handleStatusChange,
    handleConvertIntervention,
    handleCompleteLead,
    handleConvertCustomer,
    openEstimateConvert,
    handleConvertEstimate,
  };
}
