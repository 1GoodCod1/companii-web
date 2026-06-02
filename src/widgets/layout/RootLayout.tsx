import { Outlet } from 'react-router-dom';
import { CookieConsentBanner } from '@/shared/ui/legal/CookieConsentBanner';

export function RootLayout() {
  return (
    <>
      <Outlet />
      <CookieConsentBanner />
    </>
  );
}
