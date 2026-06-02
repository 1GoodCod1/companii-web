import { useTranslation } from 'react-i18next';
import { useAuthStore, type AuthUserSnapshot } from '@/entities/user/model/authStore';

export type PublicAuthCta = {
  to: string;
  label: string;
};

function resolveCabinet(user: AuthUserSnapshot, t: (key: string) => string): PublicAuthCta {
  if (user.accountKind === 'END_CLIENT') {
    return { to: '/portal', label: t('auth.cabinetCta.endClient') };
  }
  if (user.accountKind === 'PLATFORM_ADMIN') {
    return { to: '/admin', label: t('auth.cabinetCta.admin') };
  }
  if (user.accountKind === 'COMPANY_STAFF' && !user.activeCompanyId) {
    return { to: '/company/profile', label: t('auth.cabinetCta.registerCompany') };
  }
  return { to: '/company', label: t('auth.cabinetCta.personal') };
}

export function usePublicAuthCta() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthed = !!user && !!accessToken;

  const cabinet = user ? resolveCabinet(user, t) : null;

  return {
    isAuthed,
    user,
    cabinetRoute: cabinet?.to ?? '/company',
    cabinetLabel: cabinet?.label ?? t('auth.cabinetCta.personal'),
    primaryCta: isAuthed && cabinet
      ? cabinet
      : ({ to: '/register', label: t('auth.cabinetCta.startFree') } satisfies PublicAuthCta),
    signupCta: isAuthed && cabinet
      ? cabinet
      : ({ to: '/register', label: t('auth.cabinetCta.createFreeAccount') } satisfies PublicAuthCta),
    planCardCta: isAuthed && cabinet
      ? { to: cabinet.to, label: t('auth.cabinetCta.openCabinet') }
      : null,
  };
}
