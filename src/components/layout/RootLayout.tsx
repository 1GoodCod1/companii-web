import { Outlet } from 'react-router-dom';
import { CookieConsentBanner } from '@/components/legal/CookieConsentBanner';

export function RootLayout() {
  return (
    <>
      <Outlet />
      <CookieConsentBanner />
    </>
  );
}
