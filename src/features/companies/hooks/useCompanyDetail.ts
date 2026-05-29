import { useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  useCompanyBySlugQuery,
  useRequestPublicServiceMutation,
  useRequestPublicProjectMutation,
} from '@/features/companies/api/useCompanies';
import { useAuthStore } from '@/stores/authStore';
import { useMeQuery } from '@/features/auth/api/useAuth';
import { formatPersonName } from '@/utils/person';
import { getErrorMessage } from '@/utils/errors';

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

  const [requestModal, setRequestModal] = useState<{ serviceId: string; serviceName: string } | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [projectCategoryId, setProjectCategoryId] = useState('');
  const [projectEstimatedBudget, setProjectEstimatedBudget] = useState('');
  const [projectMessage, setProjectMessage] = useState('');

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

  const openServiceRequest = (serviceId: string, serviceName: string) => {
    if (!requireClientAuth()) return;
    setMessage('');
    setRequestModal({ serviceId, serviceName });
  };

  const openProjectRequest = () => {
    if (!requireClientAuth()) return;
    setProjectTitle('');
    setProjectAddress(me?.portalCustomer?.address || '');
    setProjectCategoryId(company?.category?.id ?? '');
    setProjectEstimatedBudget('');
    setProjectMessage('');
    setProjectModalOpen(true);
  };

  const handleRequestSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requestModal) return;
    try {
      await requestService.mutateAsync({
        serviceId: requestModal.serviceId,
        message: message.trim() || undefined,
      });
      toast.success(t('companyDetail.toast.serviceSent'));
      setRequestModal(null);
      setMessage('');
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
  };

  const handleProjectSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      await requestProject.mutateAsync({
        message: projectMessage.trim(),
        address: projectAddress.trim() || undefined,
        categoryId: projectCategoryId || company?.category?.id || undefined,
        projectTitle: projectTitle.trim() || undefined,
        estimatedBudget: budgetValue,
      });
      toast.success(t('companyDetail.toast.projectSent'));
      setProjectModalOpen(false);
      resetProjectForm();
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
