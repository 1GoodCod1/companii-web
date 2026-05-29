import { useTranslation } from 'react-i18next';

interface RegisterPortalInviteBannerProps {
  invitePreview: {
    companyName: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;
  } | null | undefined;
}

export function RegisterPortalInviteBanner({ invitePreview }: RegisterPortalInviteBannerProps) {
  const { t } = useTranslation();

  if (!invitePreview) return null;

  return (
    <div className="mb-4 rounded-xl border border-violet-100 bg-violet-50/50 p-3.5 space-y-2">
      <p className="text-xs font-semibold text-violet-900">
        {t('auth.registerPage.portalInviteTitle', { company: invitePreview.companyName })}
      </p>
      <dl className="grid grid-cols-1 gap-1.5 text-xs">
        <div className="flex justify-between gap-3 border-b border-violet-100/30 pb-1">
          <dt className="text-violet-700/70 font-bold uppercase tracking-widest text-[8px]">
            {t('auth.registerPage.nameLabel')}
          </dt>
          <dd className="font-semibold text-slate-800 text-right text-[11px]">{invitePreview.customerName}</dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-violet-100/30 pb-1">
          <dt className="text-violet-700/70 font-bold uppercase tracking-widest text-[8px]">
            {t('auth.registerPage.phoneLabel')}
          </dt>
          <dd className="font-semibold text-slate-800 text-right text-[11px]">{invitePreview.customerPhone}</dd>
        </div>
        {invitePreview.customerEmail ? (
          <div className="flex justify-between gap-3">
            <dt className="text-violet-700/70 font-bold uppercase tracking-widest text-[8px]">
              {t('auth.registerPage.emailLabel')}
            </dt>
            <dd className="font-semibold text-slate-800 text-right break-all text-[11px]">{invitePreview.customerEmail}</dd>
          </div>
        ) : null}
      </dl>
      <p className="text-[10px] leading-relaxed text-violet-850">{t('auth.inviteRegisterHint')}</p>
    </div>
  );
}
