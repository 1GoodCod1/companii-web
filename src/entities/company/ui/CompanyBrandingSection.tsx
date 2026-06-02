import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Images, Upload } from 'lucide-react';
import { CompanyLogo } from '@/entities/company/ui/CompanyLogo';
import {
  cabinetBtnSecondary,
  FormSection,
} from '@/widgets/cabinet/cabinet-ui';
import { validateImageFile } from '@/shared/utils/validateFile';

type Props = {
  companyName: string;
  logoUrl: string | null;
  logoPreview: string | null;
  onLogoPick: (file: File | null) => void;
  manageGalleryLink?: string;
  disabled?: boolean;
  variant?: 'default' | 'sidebar';
};

export function CompanyBrandingSection({
  companyName,
  logoUrl,
  logoPreview,
  onLogoPick,
  manageGalleryLink,
  disabled = false,
  variant = 'default',
}: Props) {
  const { t } = useTranslation();
  const isSidebar = variant === 'sidebar';
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const displayLogo = logoPreview ?? logoUrl;

  const handleLogoChange = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      setLogoError(
        err === 'files.tooLarge'
          ? t('company.branding.logoTooLarge')
          : t('company.branding.logoInvalidFormat'),
      );
      return;
    }
    setLogoError(null);
    onLogoPick(file);
  };

  const content = (
    <div
      className={
        isSidebar
          ? 'flex flex-col items-center gap-4 text-center'
          : 'flex flex-col sm:flex-row sm:items-center gap-4'
      }
    >
      <div className={isSidebar ? 'flex flex-col items-center gap-3' : 'shrink-0'}>
        <CompanyLogo
          name={companyName || t('company.branding.companyFallback')}
          logoUrl={displayLogo}
          size={isSidebar ? 'lg' : 'xl'}
          className="shrink-0"
        />
        {manageGalleryLink ? (
          <Link
            to={manageGalleryLink}
            className="inline-flex min-w-[11rem] items-center justify-center gap-2 rounded-2xl border border-violet-100 bg-violet-50/80 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-violet-700 transition-colors hover:border-violet-200 hover:bg-violet-100"
          >
            <Images className="size-3.5 shrink-0" />
            {t('company.branding.manageGallery')}
          </Link>
        ) : null}
      </div>
      <div className={`space-y-2 ${isSidebar ? 'w-full' : ''}`}>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleLogoChange(e.target.files)}
          aria-label={t('company.branding.uploadLogo')}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => logoInputRef.current?.click()}
          className={`${cabinetBtnSecondary} gap-2 ${isSidebar ? 'w-full justify-center' : ''}`}
        >
          <Upload className="size-4" />
          {displayLogo ? t('company.branding.changeLogo') : t('company.branding.uploadLogo')}
        </button>
        {displayLogo ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onLogoPick(null)}
            className="block text-xs font-medium text-gray-500 hover:text-red-600"
          >
            {t('company.branding.removeLogo')}
          </button>
        ) : null}
        {logoError ? <p className="text-xs text-red-600">{logoError}</p> : null}
        <p className="text-xs text-gray-400">{t('company.branding.logoHint')}</p>
      </div>
    </div>
  );

  if (isSidebar) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-base font-bold text-gray-900">{t('company.branding.sectionTitle')}</h2>
          <p className="mt-1 text-sm text-gray-500">{t('company.branding.sectionDescription')}</p>
        </div>
        {content}
      </div>
    );
  }

  return (
    <FormSection
      title={t('company.branding.sectionTitle')}
      description={t('company.branding.sectionDescription')}
    >
      {content}
    </FormSection>
  );
}
