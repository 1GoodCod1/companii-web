import { useTranslation } from 'react-i18next';
import { FormSection, cabinetLabelClass, cabinetFieldClass } from '@/widgets/cabinet/cabinet-ui';

interface LegalInfoSectionProps {
  name: string;
  setName: (val: string) => void;
  legalName: string;
  setLegalName: (val: string) => void;
  idno: string;
  setIdno: (val: string) => void;
  legalAddress: string;
  setLegalAddress: (val: string) => void;
  legalReadOnly: boolean;
}

const getFieldClass = (readOnly: boolean) =>
  readOnly ? `${cabinetFieldClass} bg-gray-50 text-gray-600 cursor-not-allowed` : cabinetFieldClass;

export function LegalInfoSection({
  name,
  setName,
  legalName,
  setLegalName,
  idno,
  setIdno,
  legalAddress,
  setLegalAddress,
  legalReadOnly,
}: LegalInfoSectionProps) {
  const { t } = useTranslation();

  return (
    <FormSection
      title={t('company.profileEditor.form.legalTitle')}
      description={
        legalReadOnly
          ? t('company.profileEditor.form.legalDescReadOnly')
          : t('company.profileEditor.form.legalDesc')
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="legal-trade-name" className={cabinetLabelClass}>{t('company.profileEditor.form.tradeName')}</label>
          <input
            id="legal-trade-name"
            type="text"
            required={!legalReadOnly}
            readOnly={legalReadOnly}
            placeholder={t('company.profileEditor.form.tradeNamePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={getFieldClass(legalReadOnly)}
          />
        </div>
        <div>
          <label htmlFor="legal-name" className={cabinetLabelClass}>{t('company.profileEditor.form.legalName')}</label>
          <input
            id="legal-name"
            type="text"
            required={!legalReadOnly}
            readOnly={legalReadOnly}
            placeholder={t('company.profileEditor.form.legalNamePlaceholder')}
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            className={getFieldClass(legalReadOnly)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="legal-idno" className={cabinetLabelClass}>{t('company.profileEditor.form.idno')}</label>
          <input
            id="legal-idno"
            type="text"
            required={!legalReadOnly}
            readOnly={legalReadOnly}
            maxLength={13}
            placeholder={t('company.profileEditor.form.idnoPlaceholder')}
            value={idno}
            onChange={(e) => setIdno(e.target.value.replace(/\D/g, ''))}
            className={`${getFieldClass(legalReadOnly)} font-semibold tracking-wide`}
          />
        </div>
        <div>
          <label htmlFor="legal-address" className={cabinetLabelClass}>{t('company.profileEditor.form.legalAddress')}</label>
          <input
            id="legal-address"
            type="text"
            required={!legalReadOnly}
            readOnly={legalReadOnly}
            placeholder={t('company.profileEditor.form.legalAddressPlaceholder')}
            value={legalAddress}
            onChange={(e) => setLegalAddress(e.target.value)}
            className={getFieldClass(legalReadOnly)}
          />
        </div>
      </div>
    </FormSection>
  );
}
