import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePublicAuthCta } from '@/features/auth/usePublicAuthCta';
import { cn } from '@/lib/utils';

export function PublicLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthed, cabinetRoute, cabinetLabel, user } = usePublicAuthCta();
  const isLanding = location.pathname === '/' || location.pathname === '/companii';

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      {/* Dynamic Polka Dots Background header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-white font-black text-xs shadow-xs">
              FC
            </span>
            <span className="font-black text-gray-900 tracking-tight text-md">
              Faber Companii
            </span>
          </Link>
          
          <nav className="flex items-center gap-5 text-xs font-bold uppercase tracking-wider">
            <Link to="/how-it-works" className="text-gray-500 hover:text-gray-900 transition-colors">
              Cum funcționează
            </Link>
            <Link to="/companies" className="text-gray-500 hover:text-gray-900 transition-colors">
              {t('nav.companies')}
            </Link>
            {user?.accountKind !== 'END_CLIENT' && (
              <Link to="/subscriptions" className="text-gray-500 hover:text-gray-900 transition-colors">
                Abonamente
              </Link>
            )}
            <Link to="/faq" className="text-gray-500 hover:text-gray-900 transition-colors">
              FAQ
            </Link>
            <Link to="/contacts" className="text-gray-500 hover:text-gray-900 transition-colors">
              Contacte
            </Link>
            <span className="h-4 w-px bg-gray-200"></span>
            {isAuthed ? (
              <Link
                to={cabinetRoute}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-md"
              >
                {cabinetLabel}
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-gray-500 hover:text-gray-900 transition-colors">
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-xs hover:shadow-sm"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main content wrapper */}
      <main
        className={cn(
          'page-content flex-1 w-full',
          isLanding ? 'px-0 py-0 overflow-x-hidden' : 'max-w-6xl mx-auto px-6 py-10',
        )}
      >
        <Outlet />
      </main>

      {/* Modern, premium footer */}
      <footer className="bg-white border-t border-gray-100 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-white font-black text-xs">
                FC
              </span>
              <span className="font-black text-gray-900 tracking-tight text-sm">
                Faber Companii
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Cel mai complet ecosistem FSM și CRM pentru companiile de servicii din Republica Moldova. Toate procesele tale într-un singur ecran.
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} Faber. Toate drepturile rezervate.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Platformă</h4>
            <ul className="space-y-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <li>
                <Link to="/how-it-works" className="hover:text-violet-600 transition-colors">Cum funcționează</Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-violet-600 transition-colors">Companii înscrise</Link>
              </li>
              {user?.accountKind !== 'END_CLIENT' && (
                <li>
                  <Link to="/subscriptions" className="hover:text-violet-600 transition-colors">Abonamente</Link>
                </li>
              )}
              <li>
                <Link to="/faq" className="hover:text-violet-600 transition-colors">Întrebări frecvente</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <li>
                <Link to="/privacy" className="hover:text-violet-600 transition-colors">Confidențialitate</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-violet-600 transition-colors">Termeni de utilizare</Link>
              </li>
              <li>
                <Link to="/contacts" className="hover:text-violet-600 transition-colors">Contacte & Suport</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-black text-violet-700 uppercase tracking-widest bg-violet-50 px-2 py-1 rounded-md border border-violet-100">
              Made in Moldova
            </span>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Dezvoltat special pentru optimizarea afacerilor autohtone, reducând timpul pierdut pe telefoane și hârtii.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
