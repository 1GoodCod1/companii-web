import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CoinsIcon, HammerIcon, CalendarIcon, ClockIcon, SparkleIcon } from '@phosphor-icons/react';
import type { CustomPricingValues } from '../utils/customPricing';

type Props = {
  values: CustomPricingValues;
  onChange: (values: CustomPricingValues) => void;
  compact?: boolean;
  unitLabel?: string;
  disabled?: boolean;
};

function parseOptionalNumber(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return value;
}

export function CustomPricingFields({ values, onChange, unitLabel, disabled }: Props) {
  const { t } = useTranslation();
  const [showUnitPrice, setShowUnitPrice] = useState(!!values.customUnitPriceSqm);
  const [showLaborTotal, setShowLaborTotal] = useState(!!values.customLaborTotal);
  const [showDuration, setShowDuration] = useState(!!values.customDurationDays);
  const [showLaborHours, setShowLaborHours] = useState(!!values.customLaborHours);

  const toggleUnitPrice = () => {
    if (disabled) return;
    const next = !showUnitPrice;
    setShowUnitPrice(next);
    if (!next) {
      onChange({ ...values, customUnitPriceSqm: undefined });
    }
  };

  const toggleLaborTotal = () => {
    if (disabled) return;
    const next = !showLaborTotal;
    setShowLaborTotal(next);
    if (!next) {
      onChange({ ...values, customLaborTotal: undefined });
    }
  };

  const toggleDuration = () => {
    if (disabled) return;
    const next = !showDuration;
    setShowDuration(next);
    if (!next) {
      onChange({ ...values, customDurationDays: undefined });
    }
  };

  const toggleLaborHours = () => {
    if (disabled) return;
    const next = !showLaborHours;
    setShowLaborHours(next);
    if (!next) {
      onChange({ ...values, customLaborHours: undefined });
    }
  };

  return (
    <div className="rounded-2xl bg-white/60 p-4 sm:p-5 space-y-5 border border-slate-100/50 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <SparkleIcon className="size-4.5 text-violet-500 animate-pulse" />
            <span>{t('company.estimateWizard.customPricing.title')}</span>
          </h4>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            {t('company.estimateWizard.customPricing.description')}
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-100 select-none">
          {t('company.estimateWizard.customPricing.badge')}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* 1. PREȚ / MP */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <CoinsIcon className={`size-4 ${showUnitPrice ? 'text-violet-500' : 'text-gray-400'}`} />
              <span>{unitLabel || t('company.estimateWizard.customPricing.unitPriceDefault')}</span>
            </span>
            <button
              type="button"
              onClick={toggleUnitPrice}
              disabled={disabled}
              aria-pressed={showUnitPrice}
              aria-label={unitLabel || t('company.estimateWizard.customPricing.unitPriceDefault')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                showUnitPrice ? 'bg-violet-600 shadow-[0_0_8px_rgba(124,58,237,0.3)]' : 'bg-slate-200'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                  showUnitPrice ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <input
            type="number"
            min={0}
            step={1}
            disabled={disabled || !showUnitPrice}
            aria-label={unitLabel || t('company.estimateWizard.customPricing.unitPriceDefault')}
            placeholder={showUnitPrice ? t('company.estimateWizard.customPricing.unitPricePlaceholder') : t('company.estimateWizard.customPricing.inactivePlaceholder')}
            value={showUnitPrice ? (values.customUnitPriceSqm ?? '') : ''}
            onChange={(e) =>
              onChange({
                ...values,
                customUnitPriceSqm: parseOptionalNumber(e.target.value),
              })
            }
            className={`w-full rounded-xl bg-slate-50/90 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:shadow-sm ${
              showUnitPrice && !disabled
                ? 'text-gray-900 border border-slate-200 focus:border-violet-500' 
                : 'text-gray-400 border border-slate-100 bg-slate-100/30 cursor-not-allowed opacity-60'
            }`}
          />
        </div>

        {/* 2. PREȚ TOTAL MANOPERĂ */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <HammerIcon className={`size-4 ${showLaborTotal ? 'text-violet-500' : 'text-gray-400'}`} />
              <span>{t('company.estimateWizard.customPricing.labor')}</span>
            </span>
            <button
              type="button"
              onClick={toggleLaborTotal}
              disabled={disabled}
              aria-pressed={showLaborTotal}
              aria-label={t('company.estimateWizard.customPricing.labor')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                showLaborTotal ? 'bg-violet-600 shadow-[0_0_8px_rgba(124,58,237,0.3)]' : 'bg-slate-200'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                  showLaborTotal ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <input
            type="number"
            min={0}
            step={1}
            disabled={disabled || !showLaborTotal}
            aria-label={t('company.estimateWizard.customPricing.labor')}
            placeholder={showLaborTotal ? t('company.estimateWizard.customPricing.laborPlaceholder') : t('company.estimateWizard.customPricing.inactivePlaceholder')}
            value={showLaborTotal ? (values.customLaborTotal ?? '') : ''}
            onChange={(e) =>
              onChange({
                ...values,
                customLaborTotal: parseOptionalNumber(e.target.value),
              })
            }
            className={`w-full rounded-xl bg-slate-50/90 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:shadow-sm ${
              showLaborTotal && !disabled
                ? 'text-gray-900 border border-slate-200 focus:border-violet-500' 
                : 'text-gray-400 border border-slate-100 bg-slate-100/30 cursor-not-allowed opacity-60'
            }`}
          />
        </div>

        {/* 3. DURATĂ ESTIMATĂ */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <CalendarIcon className={`size-4 ${showDuration ? 'text-violet-500' : 'text-gray-400'}`} />
              <span>{t('company.estimateWizard.customPricing.duration')}</span>
            </span>
            <button
              type="button"
              onClick={toggleDuration}
              disabled={disabled}
              aria-pressed={showDuration}
              aria-label={t('company.estimateWizard.customPricing.duration')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                showDuration ? 'bg-violet-600 shadow-[0_0_8px_rgba(124,58,237,0.3)]' : 'bg-slate-200'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                  showDuration ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <input
            type="number"
            min={0}
            step={1}
            disabled={disabled || !showDuration}
            aria-label={t('company.estimateWizard.customPricing.duration')}
            placeholder={showDuration ? t('company.estimateWizard.customPricing.durationPlaceholder') : t('company.estimateWizard.customPricing.inactivePlaceholder')}
            value={showDuration ? (values.customDurationDays ?? '') : ''}
            onChange={(e) =>
              onChange({
                ...values,
                customDurationDays: parseOptionalNumber(e.target.value),
              })
            }
            className={`w-full rounded-xl bg-slate-50/90 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:shadow-sm ${
              showDuration && !disabled
                ? 'text-gray-900 border border-slate-200 focus:border-violet-500' 
                : 'text-gray-400 border border-slate-100 bg-slate-100/30 cursor-not-allowed opacity-60'
            }`}
          />
        </div>

        {/* 4. ORE MANOPERĂ TOTALĂ */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <ClockIcon className={`size-4 ${showLaborHours ? 'text-violet-500' : 'text-gray-400'}`} />
                <span>{t('company.estimateWizard.customPricing.laborHours')}</span>
            </span>
            <button
              type="button"
              onClick={toggleLaborHours}
              disabled={disabled}
              aria-pressed={showLaborHours}
              aria-label={t('company.estimateWizard.customPricing.laborHours')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                showLaborHours ? 'bg-violet-600 shadow-[0_0_8px_rgba(124,58,237,0.3)]' : 'bg-slate-200'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                  showLaborHours ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <input
            type="number"
            min={0}
            step={0.5}
            disabled={disabled || !showLaborHours}
            aria-label={t('company.estimateWizard.customPricing.laborHours')}
            placeholder={showLaborHours ? t('company.estimateWizard.customPricing.laborHoursPlaceholder') : t('company.estimateWizard.customPricing.inactivePlaceholder')}
            value={showLaborHours ? (values.customLaborHours ?? '') : ''}
            onChange={(e) =>
              onChange({
                ...values,
                customLaborHours: parseOptionalNumber(e.target.value),
              })
            }
            className={`w-full rounded-xl bg-slate-50/90 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:shadow-sm ${
              showLaborHours && !disabled
                ? 'text-gray-900 border border-slate-200 focus:border-violet-500' 
                : 'text-gray-400 border border-slate-100 bg-slate-100/30 cursor-not-allowed opacity-60'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
