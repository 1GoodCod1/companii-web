import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useLoginMutation } from '@/features/auth/api/useAuth';
import {
  useAcceptPortalInvitationMutation,
  usePortalInvitePreviewQuery,
} from '@/features/portal/api/usePortal';
import {
  useAcceptTeamInvitationMutation,
  useTeamInvitePreviewQuery,
} from '@/features/companies/api/useCompanies';
import { getAuthErrorMessage } from '@/features/auth/authErrors';
import { useAuthStore } from '@/stores/authStore';
import { ROUTE_ABS } from '@/constants/routes.constants';
import {
  isCompanyStaffAccount,
  isEndClientAccount,
  isPlatformAdminAccount,
} from '@/utils/roles';
import { resolveCompanyHomeRoute } from '@/features/companies/companyHomeRoute';
import { companyAbsolutePath } from '@/utils/routes';
import { COMPANY_ROUTE } from '@/constants/routes.constants';

export function useLoginForm() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [params] = useSearchParams();

  const inviteToken = params.get('invite') ?? undefined;
  const teamInviteToken = params.get('teamInvite') ?? undefined;
  const queryLogin = params.get('login') ?? params.get('email') ?? '';
  const returnUrl = params.get('returnUrl');
  const safeReturnUrl =
    returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : null;

  const login = useLoginMutation();
  const acceptInvite = useAcceptPortalInvitationMutation();
  const acceptTeamInvite = useAcceptTeamInvitationMutation();

  const { data: invitePreview } = usePortalInvitePreviewQuery(inviteToken ?? '');
  const { data: teamPreview } = useTeamInvitePreviewQuery(teamInviteToken ?? '');

  const { user, accessToken } = useAuthStore();

  const [loginValue, setLoginValue] = useState('');
  const [loginPresetApplied, setLoginPresetApplied] = useState(false);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user && accessToken) {
      if (safeReturnUrl && isEndClientAccount(user.accountKind)) {
        nav(safeReturnUrl, { replace: true });
        return;
      }
      if (isEndClientAccount(user.accountKind)) nav(ROUTE_ABS.PORTAL, { replace: true });
      else if (isPlatformAdminAccount(user.accountKind)) nav(ROUTE_ABS.ADMIN, { replace: true });
      else {
        nav(
          resolveCompanyHomeRoute({
            companyRole: user.companyRole,
            activeCompanyId: user.activeCompanyId,
          }),
          { replace: true },
        );
      }
    }
  }, [user, accessToken, nav, safeReturnUrl]);

  const presetLogin =
    invitePreview?.customerEmail ||
    invitePreview?.customerPhone ||
    teamPreview?.invitedEmail ||
    queryLogin ||
    '';
  const effectiveLogin = loginPresetApplied || !presetLogin ? loginValue : presetLogin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      const res = await login.mutateAsync({
        login: effectiveLogin.trim(),
        password,
        rememberMe,
      });
      if (inviteToken && isEndClientAccount(res.user.accountKind)) {
        await acceptInvite.mutateAsync(inviteToken);
        toast.success(t('auth.inviteAccepted'));
      }
      if (teamInviteToken && isCompanyStaffAccount(res.user.accountKind)) {
        await acceptTeamInvite.mutateAsync(teamInviteToken);
        toast.success(t('auth.teamJoined'));
      }
      if (isEndClientAccount(res.user.accountKind)) {
        nav(safeReturnUrl ?? ROUTE_ABS.PORTAL);
      } else if (isPlatformAdminAccount(res.user.accountKind)) nav(ROUTE_ABS.ADMIN);
      else if (teamInviteToken) nav(companyAbsolutePath(COMPANY_ROUTE.TEAM));
      else {
        nav(
          resolveCompanyHomeRoute({
            companyRole: res.user.companyRole,
            activeCompanyId: res.user.activeCompanyId,
          }),
        );
      }
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setFormError(message);
      toast.error(message);
    }
  };

  return {
    t,
    inviteToken,
    teamInviteToken,
    invitePreview,
    teamPreview,
    loginValue,
    setLoginValue,
    setLoginPresetApplied,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    formError,
    effectiveLogin,
    handleSubmit,
    isPending: login.isPending || acceptInvite.isPending || acceptTeamInvite.isPending,
  };
}
