import { useTranslation } from 'react-i18next';

interface LoginPortalInviteBannerProps {
  invitePreview: {
    customerName: string;
    companyName: string;
  } | null | undefined;
}

export function LoginPortalInviteBanner({ invitePreview }: LoginPortalInviteBannerProps) {
  const { t } = useTranslation();

  if (!invitePreview) return null;

  return (
    <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50/50 px-4 py-3 text-xs font-semibold text-violet-855 leading-relaxed">
      {t('auth.portalInviteBanner', {
        customer: invitePreview.customerName,
        company: invitePreview.companyName,
      })}
    </div>
  );
}
