import { useTranslation } from 'react-i18next';
import { ACCOUNT_KIND } from '@/constants/roles.constants';
import type { AccountKind } from '@/stores/authStore';

interface RegisterAccountKindSelectorProps {
  portalInviteToken: string | undefined;
  teamInviteToken: string | undefined;
  accountKind: AccountKind;
  onAccountKindChange: (kind: AccountKind) => void;
}

export function RegisterAccountKindSelector({
  portalInviteToken,
  teamInviteToken,
  accountKind,
  onAccountKindChange,
}: RegisterAccountKindSelectorProps) {
  const { t } = useTranslation();

  if (portalInviteToken || teamInviteToken) return null;

  return (
    <div className="flex gap-2.5 mb-4 bg-slate-100/50 p-1 rounded-2xl border border-slate-200 relative">
      {([ACCOUNT_KIND.COMPANY_STAFF, ACCOUNT_KIND.END_CLIENT] as const).map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onAccountKindChange(k)}
          className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
            accountKind === k
              ? 'bg-white border border-slate-200 text-violet-650 shadow-xs font-black'
              : 'border border-transparent text-slate-405 hover:text-slate-700'
          }`}
        >
          {k === ACCOUNT_KIND.COMPANY_STAFF ? t('auth.companyStaff') : t('auth.endClient')}
        </button>
      ))}
    </div>
  );
}
