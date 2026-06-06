import { useTranslation } from 'react-i18next';
import { WarningIcon } from '@phosphor-icons/react';

export function EstimateDevNoticeBanner() {
  const { t } = useTranslation();

  return (
    <div className="border border-amber-100 bg-amber-50/20 px-4 py-3.5 flex items-center gap-3.5 animate-fade-in rounded-none">
      <WarningIcon className="size-5 text-amber-600 shrink-0" />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[9px] font-black text-amber-800 bg-amber-100/70 px-1.5 py-0.5 tracking-wider uppercase">
          Beta
        </span>
        <span className="text-xs text-amber-900 font-medium leading-relaxed">
          {t('company.devNotice.description')}
        </span>
      </div>
    </div>
  );
}
