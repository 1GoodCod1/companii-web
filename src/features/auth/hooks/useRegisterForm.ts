import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [conflictType, setConflictType] = useState<'email' | 'phone' | 'general' | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (user && accessToken) {
      if (isEndClientAccount(user.accountKind)) nav(ROUTE_ABS.PORTAL, { replace: true });
      else if (isPlatformAdminAccount(user.accountKind)) nav(ROUTE_ABS.ADMIN, { replace: true });
      else nav(ROUTE_ABS.COMPANY, { replace: true });
    }
  }, [user, accessToken, nav]);

  const needsInviteEmail = isPortalInviteFlow && !invitePreview?.customerEmail;
  const inviteLoading = portalInviteLoading || teamInviteLoading;
  const loginPrefill =
    conflictType === 'phone' && phone.trim() ? phone.trim() : email.trim();
  const loginLinkTo = teamInviteToken
    ? `/login?teamInvite=${encodeURIComponent(teamInviteToken)}&login=${encodeURIComponent(loginPrefill)}`
    : portalInviteToken
      ? `/login?invite=${encodeURIComponent(portalInviteToken)}&login=${encodeURIComponent(loginPrefill)}`
      : `/login?login=${encodeURIComponent(loginPrefill)}`;
  const showConflictBanner = conflictType === 'email' || conflictType === 'phone';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || register.isPending) return;

    setFormError(null);
    setConflictType(null);

    if (!acceptTerms) {
      const message = t('auth.termsRequired');
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!isPortalInviteFlow && !isTeamInviteFlow && isEndClientAccount(accountKind) && !phone.trim()) {
      const message = t('auth.phoneRequired');
      setFormError(message);
      toast.error(message);
      return;
    }

    if (isPortalInviteFlow && needsInviteEmail && !email.trim()) {
      const message = t('auth.inviteEmailRequired');
      setFormError(message);
      toast.error(message);
      return;
    }

    submittingRef.current = true;
    try {
      const registrationEmail =
        isPortalInviteFlow && invitePreview?.customerEmail
          ? invitePreview.customerEmail
          : isTeamInviteFlow && teamPreview?.invitedEmail
            ? teamPreview.invitedEmail
            : email;

      await register.mutateAsync({
        email: registrationEmail,
        password,
        accountKind: accountKind as typeof ACCOUNT_KIND.COMPANY_STAFF | typeof ACCOUNT_KIND.END_CLIENT,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: isPortalInviteFlow || isTeamInviteFlow ? undefined : phone.trim() || undefined,
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
    } finally {
      submittingRef.current = false;
    }
  };

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
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    password,
    setPassword,
    acceptTerms,
    setAcceptTerms,
    formError,
    conflictType,
    needsInviteEmail,
    inviteLoading,
    loginLinkTo,
    showConflictBanner,
    handleSubmit,
    isPending: register.isPending,
  };
}
