import { useTranslation } from 'react-i18next';
import { FormSection, cabinetLabelClass, cabinetFieldClass } from '@/widgets/cabinet/cabinet-ui';

interface FiscalSectionProps {
  isTvaPayer: boolean;
  setIsTvaPayer: (val: boolean) => void;
  tvaCode: string;
  setTvaCode: (val: string) => void;
  legalReadOnly: boolean;
}

const getFieldClass = (readOnly: boolean) =>
  readOnly ? `${cabinetFieldClass} bg-gray-50 text-gray-600 cursor-not-allowed` : cabinetFieldClass;

export function FiscalSection({
  isTvaPayer,
  setIsTvaPayer,
  tvaCode,
  setTvaCode,
  legalReadOnly,
}: FiscalSectionProps) {
  const { t } = useTranslation();

  return (
    <FormSection
      title={t('company.profileEditor.form.fiscalTitle')}
      description={
        legalReadOnly
          ? t('company.profileEditor.form.fiscalDescReadOnly')
          : t('company.profileEditor.form.fiscalDesc')
      }
    >
      <label
        className={`flex items-start gap-3 rounded-xl bg-slate-50/80 px-3.5 py-3 ${
          legalReadOnly ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
        }`}
      >
        <input
          type="checkbox"
          disabled={legalReadOnly}
          className="mt-0.5 rounded text-violet-600 focus:ring-violet-500/20 size-4 cursor-pointer disabled:cursor-not-allowed"
          checked={isTvaPayer}
          onChange={(e) => setIsTvaPayer(e.target.checked)}
        />
        <span className="text-sm text-gray-700 leading-snug">
          {t('company.profileEditor.form.tvaPayer')}
        </span>
      </label>

      {isTvaPayer ? (
        <div className="max-w-sm animate-fade-in">
          <label htmlFor="fiscal-tva-code" className={cabinetLabelClass}>{t('company.profileEditor.form.tvaCode')}</label>
          <input
            id="fiscal-tva-code"
            type="text"
            required={!legalReadOnly}
            readOnly={legalReadOnly}
            placeholder={t('company.profileEditor.form.tvaCodePlaceholder')}
            value={tvaCode}
            onChange={(e) => setTvaCode(e.target.value)}
            className={`${getFieldClass(legalReadOnly)} font-semibold`}
          />
        </div>
      ) : null}
    </FormSection>
  );
}
