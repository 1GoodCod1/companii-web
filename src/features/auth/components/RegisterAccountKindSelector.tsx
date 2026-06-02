import { Building2, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ACCOUNT_KIND } from '@/entities/company/model/roles.constants';
import type { AccountKind } from '@/entities/user/model/authStore';

interface RegisterAccountKindSelectorProps {
  portalInviteToken: string | undefined;
  teamInviteToken: string | undefined;
  accountKind: AccountKind;
  onAccountKindChange: (kind: AccountKind) => void;
}

const OPTIONS = [
  { kind: ACCOUNT_KIND.COMPANY_STAFF, icon: Building2, labelKey: 'auth.companyStaff' },
  { kind: ACCOUNT_KIND.END_CLIENT, icon: UserRound, labelKey: 'auth.endClient' },
] as const;

export function RegisterAccountKindSelector({
  portalInviteToken,
  teamInviteToken,
  accountKind,
  onAccountKindChange,
}: RegisterAccountKindSelectorProps) {
  const { t } = useTranslation();

  if (portalInviteToken || teamInviteToken) return null;

  return (
    <div className="flex gap-1 p-1 mb-4 rounded-lg bg-slate-100/80 border border-slate-200">
      {OPTIONS.map(({ kind, icon: Icon, labelKey }) => {
        const selected = accountKind === kind;
        return (
          <button
            key={kind}
            type="button"
            onClick={() => onAccountKindChange(kind)}
            aria-pressed={selected}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
              selected
                ? 'bg-white text-violet-700 shadow-sm ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Icon className="size-3.5" strokeWidth={2} />
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
}
