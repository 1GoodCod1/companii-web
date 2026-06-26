import { useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  useCompanyBySlugQuery,
  useRequestPublicServiceMutation,
  useRequestPublicProjectMutation,
} from '@/features/companies/api/useCompanies';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useMeQuery } from '@/features/auth';
import { formatPersonName } from '@/shared/utils/person';
import { getErrorMessage } from '@/shared/utils/errors';
import type { PortalRequestSuccessState } from '@/features/portal/types/requestSuccess.types';

export function useCompanyDetail() {
  const { t } = useTranslation();
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const isAuthenticated = !!user && !!accessToken;
  const isEndClient = user?.accountKind === 'END_CLIENT';
  const showRequestActions = !isAuthenticated || isEndClient;

  const { data: me } = useMeQuery(isAuthenticated && isEndClient);
  const { data: company, isLoading, isError } = useCompanyBySlugQuery(slug);

  const requestService = useRequestPublicServiceMutation(slug);
  const requestProject = useRequestPublicProjectMutation(slug);

  const [requestModal, setRequestModal] = useState<{
    serviceId: string;
    serviceName: string;
    durationMinutes?: number | null;
  } | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingDuration, setBookingDuration] = useState<number | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [projectCategoryId, setProjectCategoryId] = useState('');
  const [projectEstimatedBudget, setProjectEstimatedBudget] = useState('');
  const [projectMessage, setProjectMessage] = useState('');
  const [projectSelectedSlot, setProjectSelectedSlot] = useState<string | null>(null);
  const [projectDuration, setProjectDuration] = useState<number | null>(null);

  const profileName = formatPersonName(
    { firstName: me?.firstName, lastName: me?.lastName, email: me?.email },
    me?.email?.split('@')[0] ?? '',
  );
  const profilePhone = me?.phone?.trim() ?? '';
  const profileEmail = me?.email ?? '';

  const requireClientAuth = useCallback(() => {
    if (!isAuthenticated) {
      navigate(`/login?returnUrl=${encodeURIComponent(location.pathname)}`);
      return false;
    }
    if (!isEndClient) {
      toast.error(t('companyDetail.toast.clientOnly'));
      return false;
    }
    if (!profilePhone) {
      toast.error(t('companyDetail.toast.phoneRequired'));
      navigate('/register?kind=END_CLIENT');
      return false;
    }
    return true;
  }, [isAuthenticated, isEndClient, location.pathname, navigate, profilePhone, t]);

  const openServiceRequest = (
    serviceId: string,
    serviceName: string,
    durationMinutes?: number | null,
  ) => {
    if (!requireClientAuth()) return;
    setMessage('');
    setSelectedSlot(null);
    setBookingDuration(durationMinutes ?? null);
    setRequestModal({ serviceId, serviceName, durationMinutes });
  };

  const openProjectRequest = () => {
    if (!requireClientAuth()) return;
    setProjectTitle('');
    setProjectAddress(me?.portalCustomer?.address || '');
    setProjectCategoryId(company?.category?.id ?? '');
    setProjectEstimatedBudget('');
    setProjectMessage('');
    setProjectSelectedSlot(null);
    setProjectDuration(null);
    setProjectModalOpen(true);
  };

  const handleRequestSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requestModal || !company) return;
    try {
      const result = await requestService.mutateAsync({
        serviceId: requestModal.serviceId,
        message: message.trim() || undefined,
        scheduledAt: selectedSlot ?? undefined,
        durationMinutes: selectedSlot ? bookingDuration ?? undefined : undefined,
      });

      const successState: PortalRequestSuccessState = {
        type: selectedSlot
          ? result.scheduled
            ? 'booking-confirmed'
            : 'booking'
          : 'service',
        companyName: company.name,
        companySlug: company.slug,
        serviceName: requestModal.serviceName,
        scheduledAt: selectedSlot,
        leadId: result.leadId,
        interventionId: result.interventionId,
      };

      setRequestModal(null);
      setMessage('');
      setSelectedSlot(null);
      setBookingDuration(null);
      navigate('/portal/cereri/success', { replace: true, state: successState });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('companyDetail.toast.sendFailed')));
    }
  };

  const resetProjectForm = () => {
    setProjectTitle('');
    setProjectAddress('');
    setProjectCategoryId('');
    setProjectEstimatedBudget('');
    setProjectMessage('');
    setProjectSelectedSlot(null);
    setProjectDuration(null);
  };

  const handleProjectSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!company) return;
    if (!projectMessage.trim()) {
      toast.error(t('companyDetail.toast.descriptionRequired'));
      return;
    }
    const budgetValue = projectEstimatedBudget.trim()
      ? Number(projectEstimatedBudget.replace(/\s/g, '').replace(',', '.'))
      : undefined;
    if (budgetValue != null && (Number.isNaN(budgetValue) || budgetValue < 0)) {
      toast.error(t('companyDetail.toast.budgetInvalid'));
      return;
    }
    try {
      const result = await requestProject.mutateAsync({
        message: projectMessage.trim(),
        address: projectAddress.trim() || undefined,
        categoryId: projectCategoryId || company?.category?.id || undefined,
        projectTitle: projectTitle.trim() || undefined,
        estimatedBudget: budgetValue,
        scheduledAt: projectSelectedSlot ?? undefined,
        durationMinutes: projectSelectedSlot ? projectDuration ?? undefined : undefined,
      });

      const successState: PortalRequestSuccessState = {
        type: 'project',
        companyName: company.name,
        companySlug: company.slug,
        projectTitle: projectTitle.trim() || undefined,
        scheduledAt: projectSelectedSlot,
        leadId: result.leadId,
      };

      setProjectModalOpen(false);
      resetProjectForm();
      navigate('/portal/cereri/success', { replace: true, state: successState });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('companyDetail.toast.sendFailed')));
    }
  };

  return {
    t,
    slug,
    isAuthenticated,
    isEndClient,
    showRequestActions,
    company,
    isLoading,
    isError,
    requestModal,
    setRequestModal,
    projectModalOpen,
    setProjectModalOpen,
    message,
    setMessage,
    selectedSlot,
    setSelectedSlot,
    setBookingDuration,
    projectTitle,
    setProjectTitle,
    projectAddress,
    setProjectAddress,
    projectCategoryId,
    setProjectCategoryId,
    projectEstimatedBudget,
    setProjectEstimatedBudget,
    projectMessage,
    setProjectMessage,
    projectSelectedSlot,
    setProjectSelectedSlot,
    setProjectDuration,
    profileName,
    profilePhone,
    profileEmail,
    openServiceRequest,
    openProjectRequest,
    handleRequestSubmit,
    handleProjectSubmit,
    resetProjectForm,
    location,
    isRequestServicePending: requestService.isPending,
    isRequestProjectPending: requestProject.isPending,
  };
}
