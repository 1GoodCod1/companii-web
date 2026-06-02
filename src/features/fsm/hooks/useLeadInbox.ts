import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useCategoriesQuery } from '@/features/companies/api/useCompanies';
import {
  useLeadsQuery,
  useUpdateLeadMutation,
  useConvertLeadMutation,
  useCompleteLeadMutation,
} from '@/features/fsm/api/useLeads';
import { LEAD_STATUS } from '@/entities/fsm/model/leadStatus.constants';
import type { CompanyLeadDto, CompanyLeadStatus } from '@/entities/fsm/model/types';
import { getErrorMessage } from '@/shared/utils/errors';

export function useLeadInbox(initialStatus: CompanyLeadStatus | undefined = LEAD_STATUS.NEW) {
  const { t } = useTranslation();
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
    () => (leads ?? []).toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [leads],
  );

  const handleStatusChange = async (lead: CompanyLeadDto, status: CompanyLeadStatus) => {
    try {
      await updateLead.mutateAsync({ id: lead.id, status });
      toast.success(t('company.fsm.leads.inbox.toasts.statusUpdated'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.leads.inbox.toasts.updateFailed')));
    }
  };

  const handleNotesChange = async (lead: CompanyLeadDto, notes: string | null) => {
    await updateLead.mutateAsync({ id: lead.id, notes });
  };

  const handleConvertIntervention = async (leadId: string) => {
    try {
      const result = await convertLead.mutateAsync({ id: leadId, mode: 'intervention' });
      const keptOpen = (result as { keptOpen?: boolean })?.keptOpen;
      toast.success(
        keptOpen
          ? t('company.fsm.leads.inbox.toasts.interventionCreatedKeptOpen')
          : t('company.fsm.leads.inbox.toasts.interventionConverted'),
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.leads.inbox.toasts.convertFailed')));
    }
  };

  const handleCompleteLead = async (leadId: string) => {
    try {
      await completeLead.mutateAsync(leadId);
      toast.success(t('company.fsm.leads.inbox.toasts.leadCompleted'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.leads.inbox.toasts.completeFailed')));
    }
  };

  const handleConvertCustomer = async (leadId: string) => {
    try {
      await convertLead.mutateAsync({ id: leadId, mode: 'customer' });
      toast.success(t('company.fsm.leads.inbox.toasts.customerSaved'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.leads.inbox.toasts.saveCustomerFailed')));
    }
  };

  const openEstimateConvert = (lead: CompanyLeadDto) => {
    setEstimateLead(lead);
    setCategoryId(lead.categoryId ?? lead.category?.id ?? categories?.[0]?.id ?? '');
    setEstimateTitle(
      lead.serviceTitle ??
        t('company.fsm.leads.inbox.toasts.defaultEstimateTitle', { name: lead.contactName }),
    );
  };

  const handleConvertEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estimateLead || !categoryId) {
      toast.error(t('company.fsm.leads.inbox.toasts.selectEstimateCategory'));
      return;
    }
    try {
      const result = await convertLead.mutateAsync({
        id: estimateLead.id,
        mode: 'estimate',
        categoryId,
        title: estimateTitle.trim() || undefined,
      });
      toast.success(t('company.fsm.leads.inbox.toasts.estimateConverted'));
      setEstimateLead(null);
      const projectId = (result as { project?: { id?: string } })?.project?.id;
      if (projectId) navigate(`/company/smete/${projectId}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.leads.inbox.toasts.estimateCreateFailed')));
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
    handleNotesChange,
    handleConvertIntervention,
    handleCompleteLead,
    handleConvertCustomer,
    openEstimateConvert,
    handleConvertEstimate,
  };
}
