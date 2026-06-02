import { Suspense } from 'react';
import { AuthLayout } from '@/widgets/layout/AuthLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { PortalInvitePage } from '@/pages/portal/PortalInvitePage';
import { TeamInvitePage } from '@/pages/company/TeamInvitePage';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { PUBLIC_ROUTE, INVITE_ROUTE } from '@/shared/constants/routes.constants';

export const authPublicRoutes = [
  { path: PUBLIC_ROUTE.LOGIN, element: <LoginPage /> },
  { path: PUBLIC_ROUTE.REGISTER, element: <RegisterPage /> },
  { path: PUBLIC_ROUTE.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
  { path: PUBLIC_ROUTE.RESET_PASSWORD, element: <ResetPasswordPage /> },
  { path: INVITE_ROUTE.PORTAL, element: <PortalInvitePage /> },
  { path: INVITE_ROUTE.TEAM, element: <TeamInvitePage /> },
  { path: '*', element: <NotFoundPage compact /> },
];

export const authRoutesSection = {
  element: (
    <Suspense fallback={null}>
      <AuthLayout />
    </Suspense>
  ),
  children: authPublicRoutes,
};
