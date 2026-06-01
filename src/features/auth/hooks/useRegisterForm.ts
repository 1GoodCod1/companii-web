import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useRegisterMutation } from '@/features/auth/api/useAuth';
import { usePortalInvitePreviewQuery } from '@/features/portal/api/usePortal';
import { useTeamInvitePreviewQuery } from '@/features/companies/api/useCompanies';
import {
  getAuthErrorMessage,
  isAuthEmailTakenError,
  isAuthPhoneTakenError,
  isAuthRegistrationConflictError,
} from '@/features/auth/authErrors';
import { ACCOUNT_KIND } from '@/constants/roles.constants';
import { ROUTE_ABS } from '@/constants/routes.constants';
import {
  isEndClientAccount,
  isPlatformAdminAccount,
} from '@/utils/roles';
import type { AccountKind } from '@/stores/authStore';
import { useAuthStore } from '@/stores/authStore';
import { resolveCompanyHomeRoute } from '@/features/companies/companyHomeRoute';
import {
  createRegisterSchema,
  type RegisterFormValues,
} from '@/lib/forms/schemas/authSchemas';
import { showFirstFormError } from '@/lib/forms/showFirstFormError';

export function useRegisterForm() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [params] = useSearchParams();

  const portalInviteToken = params.get('invite') ?? undefined;
  const teamInviteToken = params.get('teamInvite') ?? undefined;
  const initialKind = (params.get('kind') as AccountKind | null) ?? ACCOUNT_KIND.COMPANY_STAFF;

  const register = useRegisterMutation();
  const { user, accessToken } = useAuthStore();

  const { data: invitePreview, isLoading: portalInviteLoading } = usePortalInvitePreviewQuery(
    portalInviteToken ?? '',
  );
  const { data: teamPreview, isLoading: teamInviteLoading } = useTeamInvitePreviewQuery(
    teamInviteToken ?? '',
  );

  const isPortalInviteFlow =
    !!portalInviteToken && !!invitePreview && !invitePreview.alreadyLinked;
  const isTeamInviteFlow = !!teamInviteToken && !!teamPreview && !teamPreview.alreadyMember;

  const [accountKind, setAccountKind] = useState<AccountKind>(
    portalInviteToken ? ACCOUNT_KIND.END_CLIENT : teamInviteToken ? ACCOUNT_KIND.COMPANY_STAFF : initialKind,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [conflictType, setConflictType] = useState<'email' | 'phone' | 'general' | null>(null);

  const needsInviteEmail = isPortalInviteFlow && !invitePreview?.customerEmail;
  const inviteLoading = portalInviteLoading || teamInviteLoading;
  const requireEndClientPhone =
    !isPortalInviteFlow && !isTeamInviteFlow && isEndClientAccount(accountKind);

  const schema = useMemo(
    () =>
      createRegisterSchema(t, {
        isPortalInviteFlow,
        isTeamInviteFlow,
        needsInviteEmail,
        requireEndClientPhone,
      }),
    [t, isPortalInviteFlow, isTeamInviteFlow, needsInviteEmail, requireEndClientPhone],
  );

  const schemaRef = useRef(schema);

  useEffect(() => {
    schemaRef.current = schema;
  }, [schema]);

  const form = useForm<RegisterFormValues>({
    resolver: (values, context, options) =>
      zodResolver(schemaRef.current)(values, context, options),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      acceptTerms: false,
    },
  });

  useEffect(() => {
    if (isTeamInviteFlow && teamPreview?.invitedEmail) {
      form.setValue('email', teamPreview.invitedEmail);
    }
  }, [form, isTeamInviteFlow, teamPreview?.invitedEmail]);

  useEffect(() => {
    if (user && accessToken) {
      if (isEndClientAccount(user.accountKind)) nav(ROUTE_ABS.PORTAL, { replace: true });
      else if (isPlatformAdminAccount(user.accountKind)) nav(ROUTE_ABS.ADMIN, { replace: true });
      else nav(ROUTE_ABS.COMPANY, { replace: true });
    }
  }, [user, accessToken, nav]);

  const emailValue = useWatch({ control: form.control, name: 'email' }) ?? '';
  const phoneValue = useWatch({ control: form.control, name: 'phone' }) ?? '';

  const loginPrefill =
    conflictType === 'phone' && phoneValue.trim()
      ? phoneValue.trim()
      : emailValue.trim();
  const loginLinkTo = teamInviteToken
    ? `/login?teamInvite=${encodeURIComponent(teamInviteToken)}&login=${encodeURIComponent(loginPrefill)}`
    : portalInviteToken
      ? `/login?invite=${encodeURIComponent(portalInviteToken)}&login=${encodeURIComponent(loginPrefill)}`
      : `/login?login=${encodeURIComponent(loginPrefill)}`;
  const showConflictBanner = conflictType === 'email' || conflictType === 'phone';

  const onSubmit = form.handleSubmit(
    async (values) => {
      if (register.isPending) return;

      setFormError(null);
      setConflictType(null);

      try {
        const registrationEmail =
          isPortalInviteFlow && invitePreview?.customerEmail
            ? invitePreview.customerEmail
            : isTeamInviteFlow && teamPreview?.invitedEmail
              ? teamPreview.invitedEmail
              : values.email;

        await register.mutateAsync({
          email: registrationEmail,
          password: values.password,
          accountKind: accountKind as typeof ACCOUNT_KIND.COMPANY_STAFF | typeof ACCOUNT_KIND.END_CLIENT,
          firstName: values.firstName || undefined,
          lastName: values.lastName || undefined,
          phone: isPortalInviteFlow || isTeamInviteFlow ? undefined : values.phone.trim() || undefined,
          acceptTerms: true,
          portalInviteToken: portalInviteToken,
          teamInviteToken: teamInviteToken,
        });
        toast.success(t('auth.registerPage.accountActivated'));
        if (isTeamInviteFlow) nav('/company/team', { replace: true });
        else if (isPortalInviteFlow) nav('/portal', { replace: true });
        else if (isEndClientAccount(accountKind)) nav(ROUTE_ABS.PORTAL, { replace: true });
        else {
          const sessionUser = useAuthStore.getState().user;
          nav(
            resolveCompanyHomeRoute({
              companyRole: sessionUser?.companyRole,
              activeCompanyId: sessionUser?.activeCompanyId,
            }),
            { replace: true },
          );
        }
      } catch (err) {
        const message = getAuthErrorMessage(err);
        setFormError(message);
        if (isAuthPhoneTakenError(err)) {
          setConflictType('phone');
        } else if (isAuthEmailTakenError(err)) {
          setConflictType('email');
        } else if (isAuthRegistrationConflictError(err)) {
          setConflictType('general');
        }
        toast.error(message);
      }
    },
    (errors) => showFirstFormError(errors),
  );

  return {
    t,
    portalInviteToken,
    teamInviteToken,
    invitePreview,
    teamPreview,
    isPortalInviteFlow,
    isTeamInviteFlow,
    accountKind,
    setAccountKind,
    form,
    formError,
    conflictType,
    needsInviteEmail,
    inviteLoading,
    loginLinkTo,
    showConflictBanner,
    onSubmit,
    isPending: register.isPending,
  };
}
