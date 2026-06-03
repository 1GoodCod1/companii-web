import { lazyWithRetry } from '@/shared/lib/lazyWithRetry';

export const LoginPage = lazyWithRetry(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);

export const RegisterPage = lazyWithRetry(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);

export const ForgotPasswordPage = lazyWithRetry(() =>
  import('@/pages/auth/ForgotPasswordPage').then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);

export const ResetPasswordPage = lazyWithRetry(() =>
  import('@/pages/auth/ResetPasswordPage').then((m) => ({
    default: m.ResetPasswordPage,
  })),
);

export const PortalInvitePage = lazyWithRetry(() =>
  import('@/pages/portal/PortalInvitePage').then((m) => ({
    default: m.PortalInvitePage,
  })),
);

export const TeamInvitePage = lazyWithRetry(() =>
  import('@/pages/company/TeamInvitePage').then((m) => ({
    default: m.TeamInvitePage,
  })),
);