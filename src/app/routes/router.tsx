import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/widgets/layout/RootLayout';
import { RouteErrorBoundary } from '@/shared/ui/errors/RouteErrorBoundary';
import { getInitialLanguage } from '@/shared/config/i18n';
import { localizePath } from '@/lib/i18n/localeRoutes';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { publicRoutesSection } from './publicRoutes';
import { authRoutesSection } from './authRoutes';
import { companyRoutesSection } from './companyRoutes';
import { portalRoutesSection } from './portalRoutes';
import { adminRoutesSection } from './adminRoutes';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <Navigate to={localizePath('/', getInitialLanguage())} replace />
        ),
      },
      authRoutesSection,
      ...publicRoutesSection,
      companyRoutesSection,
      portalRoutesSection,
      adminRoutesSection,
      {
        path: '*',
        element: <NotFoundPage standalone />,
      },
    ],
  },
]);
