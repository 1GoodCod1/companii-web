import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { getInitialLanguage } from '@/i18n';
import { localizePath } from '@/lib/i18n/localeRoutes';

import { publicRoutesSection } from './publicRoutes';
import { authRoutesSection } from './authRoutes';
import { companyRoutesSection } from './companyRoutes';
import { portalRoutesSection } from './portalRoutes';
import { adminRoutesSection } from './adminRoutes';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
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
        element: <Navigate to={localizePath('/', getInitialLanguage())} replace />,
      },
    ],
  },
]);
