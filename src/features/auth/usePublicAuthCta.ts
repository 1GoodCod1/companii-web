import { useAuthStore, type AuthUserSnapshot } from '@/stores/authStore';

export type PublicAuthCta = {
  to: string;
  label: string;
};

function resolveCabinet(user: AuthUserSnapshot): PublicAuthCta {
  if (user.accountKind === 'END_CLIENT') {
    return { to: '/portal', label: 'Portal client' };
  }
  if (user.accountKind === 'PLATFORM_ADMIN') {
    return { to: '/admin', label: 'Panou admin' };
  }
  if (user.accountKind === 'COMPANY_STAFF' && !user.activeCompanyId) {
    return { to: '/company/profile', label: 'Înregistrează compania' };
  }
  return { to: '/company', label: 'Cabinet personal' };
}

export function usePublicAuthCta() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthed = !!user && !!accessToken;

  const cabinet = user ? resolveCabinet(user) : null;

  return {
    isAuthed,
    user,
    cabinetRoute: cabinet?.to ?? '/company',
    cabinetLabel: cabinet?.label ?? 'Cabinet personal',
    primaryCta: isAuthed && cabinet
      ? cabinet
      : ({ to: '/register', label: 'Începe gratuit' } satisfies PublicAuthCta),
    signupCta: isAuthed && cabinet
      ? cabinet
      : ({ to: '/register', label: 'Creează cont gratuit' } satisfies PublicAuthCta),
    planCardCta: isAuthed && cabinet
      ? { to: cabinet.to, label: 'Deschide cabinetul' }
      : null,
  };
}
