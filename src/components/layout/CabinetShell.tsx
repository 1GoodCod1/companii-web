import type { ReactNode } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useLogoutMutation, useMeQuery } from '@/features/auth/api/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { CabinetProfileCard } from '@/components/layout/CabinetProfileCard';
import { FaberLogo } from '@/components/brand/FaberLogo';
import {
  buildCabinetPath,
  isCabinetNavItemActive,
  type CabinetNavSection,
} from '@/components/layout/cabinet-nav';
import { formatPersonName } from '@/utils/person';

export function CabinetShell({
  basePath,
  sections,
  currentPlanCode,
  profileAvatarUrl,
  profileRole,
  sidebarExtras,
}: {
  basePath: string;
  sections: CabinetNavSection[];
  currentPlanCode?: string;
  profileAvatarUrl?: string | null;
  profileRole?: string;
  sidebarExtras?: ReactNode;
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const navTo = useNavigate();
  const logout = useLogoutMutation();
  const user = useAuthStore((s) => s.user);
  const { data: meData } = useMeQuery(!!user);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      navTo('/login');
    } catch {
      // fallback in case of connection errors
    }
  };

  const allPaths = sections.flatMap((section) =>
    section.items.map((item) => buildCabinetPath(basePath, item.to)),
  );

  const displayName =
    formatPersonName(
      { firstName: meData?.firstName, lastName: meData?.lastName, email: user?.email },
      user?.email ?? '',
    );

  return (
    <div className="h-screen flex bg-gray-50/30 overflow-hidden">
      <aside className="w-64 h-full border-r border-gray-100 bg-white p-5 flex flex-col justify-between shrink-0 overflow-hidden">
        {/* Top: Logo */}
        <div className="flex-none">
          <Link to="/" className="block mb-6 px-2">
            <FaberLogo size="sm" />
          </Link>
        </div>

        {/* Middle: Scrollable Menu Items */}
        <nav className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1 py-2 custom-scrollbar">
          {sections.map((section) => (
            <div key={section.key}>
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                {t(section.labelKey)}
              </p>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const fullPath = buildCabinetPath(basePath, item.to);
                  const selected = isCabinetNavItemActive(
                    location.pathname,
                    basePath,
                    item.to,
                    allPaths,
                  );

                  return (
                    <Link
                      key={item.key}
                      to={fullPath}
                      className={cn(
                        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all duration-200',
                        '[&_svg]:size-[1.125rem] [&_svg]:shrink-0 [&_svg]:stroke-[1.75]',
                        selected
                          ? 'bg-violet-50 font-semibold text-violet-700 shadow-xs border-l-4 border-violet-600 pl-2'
                          : 'font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 border-l-4 border-transparent',
                      )}
                    >
                      <span
                        className={cn(
                          'flex shrink-0 items-center justify-center transition-colors',
                          selected
                            ? 'text-violet-600'
                            : 'text-gray-400 group-hover:text-gray-600',
                        )}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{t(item.labelKey)}</span>
                      {item.badge != null && Number(item.badge) !== 0 ? (
                        <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: Profile & Actions Pinned */}
        {user ? (
          <div className="flex-none mt-auto">
            {sidebarExtras}
            <CabinetProfileCard
              displayName={displayName}
              email={user.email}
              role={profileRole ?? user.companyRole}
              planCode={currentPlanCode}
              avatarUrl={profileAvatarUrl}
              onLogout={() => void handleLogout()}
              isLoggingOut={logout.isPending}
            />
          </div>
        ) : null}
      </aside>
      <main className="cabinet-content flex-1 p-6 sm:p-8 overflow-y-auto h-full">
        <Outlet />
      </main>
    </div>
  );
}
