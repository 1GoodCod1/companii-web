import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers';
import { router } from '@/app/routes/router';
import { reportWebVitals } from '@/utils/reportWebVitals';
import '@/i18n';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);

// Collect Core Web Vitals (CLS, INP, LCP, FCP, TTFB) and ship them to the
// API after each metric resolves. Fire-and-forget — never blocks UI.
reportWebVitals();
