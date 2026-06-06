import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ListIcon, XIcon, CaretLeftIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useLogoutMutation, useMeQuery } from '@/features/auth';
import { useAuthStore } from '@/entities/user/model/authStore';
import { CabinetProfileCard } from '@/widgets/layout/CabinetProfileCard';
import { FaberLogo } from '@/shared/ui/brand/FaberLogo';
import { MobileSheet } from '@/widgets/layout/MobileSheet';
import {
  buildCabinetPath,
  isCabinetNavItemActive,
  type CabinetNavSection,
} from '@/widgets/layout/cabinet-nav';
import { formatPersonName } from '@/shared/utils/person';

function SidebarContent({
  sections,
  basePath,
  allPaths,
  user,
  meData,
  profileAvatarUrl,
  profileRole,
  currentPlanCode,
  sidebarExtras,
  onLogout,
  isLoggingOut,
  onNavClick,
  isCollapsed,
  onToggleCollapse,
}: {
  sections: CabinetNavSection[];
  basePath: string;
  allPaths: string[];
  user: ReturnType<typeof useAuthStore.getState>['user'];
  meData: { firstName?: string | null; lastName?: string | null; email?: string | null } | undefined;
  profileAvatarUrl?: string | null;
  profileRole?: string;
  currentPlanCode?: string;
  sidebarExtras?: ReactNode;
  onLogout: () => void;
  isLoggingOut: boolean;
  onNavClick?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const { t } = useTranslation();
  const location = useLocation();

  const displayName = formatPersonName(
    { firstName: meData?.firstName, lastName: meData?.lastName, email: user?.email },
    user?.email ?? '',
  );

  return (
    <>
      <div className="flex-none">
        <div className="mb-6 flex items-center justify-between px-1">
          <Link to="/" className="flex items-center">
            <FaberLogo size="sm" showText={!isCollapsed} />
          </Link>
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center rounded-lg border border-gray-100 bg-white p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors cursor-pointer"
              title={isCollapsed ? t('layout.sidebar.expand', 'Afișează meniu') : t('layout.sidebar.collapse', 'Ascunde meniu')}
            >
              <CaretLeftIcon className={cn('size-4 transition-transform', isCollapsed && 'rotate-180')} />
            </button>
          )}
          {onNavClick && (
            <button
              type="button"
              onClick={onNavClick}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors lg:hidden"
            >
              <XIcon className="size-5" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1 py-2 custom-scrollbar">
        {sections.map((section) => (
          <div key={section.key} className="space-y-1">
            {!isCollapsed ? (
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                {t(section.labelKey)}
              </p>
            ) : (
              <div className="border-t border-gray-100/70 my-2 mx-2" />
            )}
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
                    onClick={onNavClick}
                    title={isCollapsed ? t(item.labelKey) : undefined}
                    className={cn(
                      'group relative flex items-center transition-all duration-200 rounded-xl',
                      isCollapsed
                        ? 'justify-center w-11 h-11 mx-auto'
                        : 'gap-3 px-3 py-2.5 text-[13px]',
                      '[&_svg]:size-[1.125rem] [&_svg]:shrink-0 [&_svg]:stroke-[1.75]',
                      selected
                        ? 'bg-gray-900 font-semibold text-white shadow-sm shadow-gray-900/10'
                        : 'font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                    )}
                  >
                    <span
                      className={cn(
                        'flex shrink-0 items-center justify-center transition-colors',
                        selected
                          ? 'text-white/90'
                          : 'text-gray-400 group-hover:text-gray-600',
                      )}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="truncate">{t(item.labelKey)}</span>}
                    {item.badge != null && Number(item.badge) !== 0 ? (
                      isCollapsed ? (
                        <span className="absolute top-1.5 right-1.5 flex size-2 rounded-full bg-violet-600 ring-2 ring-white" />
                      ) : (
                        <span
                          className={cn(
                            'ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                            selected
                              ? 'bg-white/15 text-white ring-1 ring-white/20'
                              : 'bg-violet-600 text-white',
                          )}
                        >
                          {item.badge}
                        </span>
                      )
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {user ? (
        <div className="flex-none mt-auto">
          {!isCollapsed && sidebarExtras}
          <CabinetProfileCard
            displayName={displayName}
            email={user.email}
            role={profileRole ?? user.companyRole}
            planCode={currentPlanCode}
            avatarUrl={profileAvatarUrl}
            onLogout={onLogout}
            isLoggingOut={isLoggingOut}
            collapsed={isCollapsed}
          />
        </div>
      ) : null}
    </>
  );
}

export function CabinetShell({
  basePath,
  sections,
  currentPlanCode,
  profileAvatarUrl,
  profileRole,
  sidebarExtras,
  banner,
}: {
  basePath: string;
  sections: CabinetNavSection[];
  currentPlanCode?: string;
  profileAvatarUrl?: string | null;
  profileRole?: string;
  sidebarExtras?: ReactNode;
  banner?: ReactNode;
}) {
  const location = useLocation();
  const navTo = useNavigate();
  const logout = useLogoutMutation();
  const user = useAuthStore((s) => s.user);
  const { data: meData } = useMeQuery(!!user);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cabinet-sidebar-collapsed') === 'true';
    }
    return false;
  });

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const newVal = !prev;
      localStorage.setItem('cabinet-sidebar-collapsed', String(newVal));
      return newVal;
    });
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  const prevPathRef = useRef(location.pathname);
  useEffect(() => {
    const pathname = location.pathname;
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      closeMobileMenu();
    }
  }, [location, closeMobileMenu]);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      closeMobileMenu();
      navTo('/login');
    } catch {
      // fallback in case of connection errors
    }
  };

  const allPaths = sections.flatMap((section) =>
    section.items.map((item) => buildCabinetPath(basePath, item.to)),
  );

  const sidebarProps = {
    sections,
    basePath,
    allPaths,
    user,
    meData,
    profileAvatarUrl,
    profileRole,
    currentPlanCode,
    sidebarExtras,
    onLogout: () => void handleLogout(),
    isLoggingOut: logout.isPending,
  };

  return (
    <div className="h-screen flex bg-gray-50/30 overflow-hidden">
      {/* Desktop sidebar: hidden on screens < 1024px */}
      <aside className={cn(
        'hidden lg:flex h-full border-r border-gray-100 bg-white flex-col justify-between shrink-0 overflow-hidden transition-all duration-300',
        isCollapsed ? 'w-20 px-3.5 py-5' : 'w-64 p-5',
      )}>
        <SidebarContent
          {...sidebarProps}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </aside>

      {/* Mobile hamburger bar: visible on screens < 1024px */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between h-14 px-4 bg-white border-b border-gray-100 shadow-sm">
        <Link to="/" className="flex-shrink-0">
          <FaberLogo size="sm" />
        </Link>
        <button
          type="button"
          onClick={openMobileMenu}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="List"
        >
          <ListIcon className="size-5" />
        </button>
      </div>
      <MobileSheet open={mobileMenuOpen} onClose={closeMobileMenu}>
        <div className="flex flex-col h-full p-5">
          <SidebarContent {...sidebarProps} onNavClick={closeMobileMenu} />
        </div>
      </MobileSheet>
      <main className="cabinet-content flex-1 overflow-y-auto h-full p-4 sm:p-6 lg:p-8 pt-18 sm:pt-6 lg:pt-8">
        {banner}
        <Outlet />
      </main>
    </div>
  );
}