import { useTranslation } from 'react-i18next';
import { FormSection, cabinetLabelClass, cabinetFieldClass } from '@/widgets/cabinet/cabinet-ui';

interface ContactSectionProps {
  contactPhone: string;
  setContactPhone: (val: string) => void;
  contactEmail: string;
  setContactEmail: (val: string) => void;
  showPublicPhone: boolean;
  setShowPublicPhone: (val: boolean) => void;
  showPublicEmail: boolean;
  setShowPublicEmail: (val: boolean) => void;
  description: string;
  setDescription: (val: string) => void;
  isLegalOwner: boolean;
}

export function ContactSection({
  contactPhone,
  setContactPhone,
  contactEmail,
  setContactEmail,
  showPublicPhone,
  setShowPublicPhone,
  showPublicEmail,
  setShowPublicEmail,
  description,
  setDescription,
  isLegalOwner,
}: ContactSectionProps) {
  const { t } = useTranslation();

  return (
    <FormSection
      title={t('company.profileEditor.form.contactTitle')}
      description={t('company.profileEditor.form.contactDesc')}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={cabinetLabelClass}>{t('company.profileEditor.form.contactPhone')}</label>
          <input
            type="text"
            placeholder={t('company.profileEditor.form.contactPhonePlaceholder')}
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className={cabinetFieldClass}
          />
        </div>
        <div>
          <label className={cabinetLabelClass}>{t('company.profileEditor.form.contactEmail')}</label>
          <input
            type="email"
            placeholder={t('company.profileEditor.form.contactEmailPlaceholder')}
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className={cabinetFieldClass}
          />
        </div>

        {isLegalOwner ? (
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
            <label className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50/60 hover:bg-slate-100/80 transition-colors border border-slate-100 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                className="rounded text-violet-600 focus:ring-violet-500/20 w-4 h-4 cursor-pointer"
                checked={showPublicPhone}
                onChange={(e) => setShowPublicPhone(e.target.checked)}
              />
              <span className="text-xs font-semibold text-slate-700 leading-none select-none">
                {t('company.profileEditor.form.showPublicPhone')}
              </span>
            </label>
            <label className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50/60 hover:bg-slate-100/80 transition-colors border border-slate-100 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                className="rounded text-violet-600 focus:ring-violet-500/20 w-4 h-4 cursor-pointer"
                checked={showPublicEmail}
                onChange={(e) => setShowPublicEmail(e.target.checked)}
              />
              <span className="text-xs font-semibold text-slate-700 leading-none select-none">
                {t('company.profileEditor.form.showPublicEmail')}
              </span>
            </label>
          </div>
        ) : null}
      </div>

      <div>
        <label className={cabinetLabelClass}>{t('company.profileEditor.form.description')}</label>
        <textarea
          placeholder={t('company.profileEditor.form.descriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={`${cabinetFieldClass} resize-none`}
        />
      </div>
    </FormSection>
  );
}
