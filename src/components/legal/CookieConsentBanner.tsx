import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LS_COOKIE_CONSENT_KEY } from '@/constants/storage';
import { safeStorage } from '@/lib/safeStorage';

type CookieConsentValue = 'accepted' | 'declined';

function readCookieConsentVisible(): boolean {
  const stored = safeStorage.getItem(LS_COOKIE_CONSENT_KEY) as CookieConsentValue | null;
  return !stored;
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(readCookieConsentVisible);

  const saveChoice = (value: CookieConsentValue) => {
    safeStorage.setItem(LS_COOKIE_CONSENT_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-bold text-gray-900">Cookie-uri și confidențialitate</p>
            <p className="text-xs leading-relaxed text-gray-500">
              Folosim cookie-uri esențiale pentru autentificare și preferințe locale. Poți consulta{' '}
              <Link to="/privacy" className="font-semibold text-violet-600 hover:text-violet-700">
                Politica de confidențialitate
              </Link>{' '}
              și{' '}
              <Link to="/terms" className="font-semibold text-violet-600 hover:text-violet-700">
                Termenii de utilizare
              </Link>
              .
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => saveChoice('declined')}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50"
            >
              Refuz
            </button>
            <button
              type="button"
              onClick={() => saveChoice('accepted')}
              className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-violet-700"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
