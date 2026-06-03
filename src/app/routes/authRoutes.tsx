import { AuthLayout } from '@/widgets/layout/AuthLayout';
import { LazyPage } from './LazyPage';
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  PortalInvitePage,
  TeamInvitePage,
} from './lazy-pages';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { PUBLIC_ROUTE, INVITE_ROUTE } from '@/shared/constants/routes.constants';

export const authPublicRoutes = [
  { path: PUBLIC_ROUTE.LOGIN, element: <LazyPage><LoginPage /></LazyPage> },
  { path: PUBLIC_ROUTE.REGISTER, element: <LazyPage><RegisterPage /></LazyPage> },
  { path: PUBLIC_ROUTE.FORGOT_PASSWORD, element: <LazyPage><ForgotPasswordPage /></LazyPage> },
  { path: PUBLIC_ROUTE.RESET_PASSWORD, element: <LazyPage><ResetPasswordPage /></LazyPage> },
  { path: INVITE_ROUTE.PORTAL, element: <LazyPage><PortalInvitePage /></LazyPage> },
  { path: INVITE_ROUTE.TEAM, element: <LazyPage><TeamInvitePage /></LazyPage> },
  { path: '*', element: <NotFoundPage compact /> },
];

export const authRoutesSection = {
  element: <AuthLayout />,
  children: authPublicRoutes,
};
