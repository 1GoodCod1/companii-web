import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Coins, 
  Hammer, 
  Calendar, 
  Clock, 
  Sparkles 
} from 'lucide-react';
import type { CustomPricingValues } from '../customPricing';

type Props = {
  values: CustomPricingValues;
  onChange: (values: CustomPricingValues) => void;
  compact?: boolean;
  unitLabel?: string;
};

function parseOptionalNumber(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return value;
}

export function CustomPricingFields({ values, onChange, compact, unitLabel }: Props) {
  const { t } = useTranslation();
  const [showUnitPrice, setShowUnitPrice] = useState(!!values.customUnitPriceSqm);
  const [showLaborTotal, setShowLaborTotal] = useState(!!values.customLaborTotal);
  const [showDuration, setShowDuration] = useState(!!values.customDurationDays);
  const [showLaborHours, setShowLaborHours] = useState(!!values.customLaborHours);

  const toggleUnitPrice = () => {
    const next = !showUnitPrice;
    setShowUnitPrice(next);
    if (!next) {
      onChange({ ...values, customUnitPriceSqm: undefined });
    }
  };

  const toggleLaborTotal = () => {
    const next = !showLaborTotal;
    setShowLaborTotal(next);
    if (!next) {
      onChange({ ...values, customLaborTotal: undefined });
    }
  };

  const toggleDuration = () => {
    const next = !showDuration;
    setShowDuration(next);
    if (!next) {
      onChange({ ...values, customDurationDays: undefined });
    }
  };

  const toggleLaborHours = () => {
    const next = !showLaborHours;
    setShowLaborHours(next);
    if (!next) {
      onChange({ ...values, customLaborHours: undefined });
    }
  };

  return (
    <div className={compact 
      ? 'rounded-2xl border border-amber-100 bg-amber-50/5 p-3.5 space-y-4 shadow-2xs' 
      : 'rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50/10 via-amber-50/5 to-amber-100/10 p-5 space-y-4 shadow-sm'
    }>
      <div className="border-b border-amber-100/50 pb-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>{t('company.estimateWizard.customPricing.title')}</span>
          </h4>
          {!compact && (
            <p className="text-[10px] text-slate-500 mt-0.5 font-semibold leading-relaxed">
              {t('company.estimateWizard.customPricing.description')}
            </p>
          )}
        </div>
        <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-100/80 px-2 py-0.5 rounded-md select-none shrink-0 self-start sm:self-auto">
          {t('company.estimateWizard.customPricing.badge')}
        </span>
      </div>

      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {/* 1. PREȚ / MP */}
        <div className={`rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-between min-h-[105px] ${
          showUnitPrice 
            ? 'border-amber-300 bg-white shadow-sm ring-1 ring-amber-100' 
            : 'border-slate-100 bg-white/60 hover:bg-white hover:border-slate-200 shadow-3xs'
        }`}>
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-1.5">
              <Coins className={`w-4 h-4 shrink-0 ${showUnitPrice ? 'text-amber-500' : 'text-slate-400'}`} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                {unitLabel || t('company.estimateWizard.customPricing.unitPriceDefault')}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleUnitPrice}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                showUnitPrice ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                  showUnitPrice ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          {showUnitPrice ? (
            <div className="animate-fade-in pt-3">
              <input
                type="number"
                min={0}
                step={1}
                placeholder={t('company.estimateWizard.customPricing.unitPricePlaceholder')}
                value={values.customUnitPriceSqm ?? ''}
                onChange={(e) =>
                  onChange({
                    ...values,
                    customUnitPriceSqm: parseOptionalNumber(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-200/50 focus:outline-none transition-all shadow-xs"
              />
            </div>
          ) : (
            <div className="pt-3 text-[10px] text-slate-400 font-bold italic leading-none">
              {t('company.estimateWizard.customPricing.inactive')}
            </div>
          )}
        </div>

        {/* 2. PREȚ TOTAL MANOPERĂ */}
        <div className={`rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-between min-h-[105px] ${
          showLaborTotal 
            ? 'border-amber-300 bg-white shadow-sm ring-1 ring-amber-100' 
            : 'border-slate-100 bg-white/60 hover:bg-white hover:border-slate-200 shadow-3xs'
        }`}>
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-1.5">
              <Hammer className={`w-4 h-4 shrink-0 ${showLaborTotal ? 'text-amber-500' : 'text-slate-400'}`} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                {t('company.estimateWizard.customPricing.labor')}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleLaborTotal}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                showLaborTotal ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                  showLaborTotal ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          {showLaborTotal ? (
            <div className="animate-fade-in pt-3">
              <input
                type="number"
                min={0}
                step={1}
                placeholder={t('company.estimateWizard.customPricing.laborPlaceholder')}
                value={values.customLaborTotal ?? ''}
                onChange={(e) =>
                  onChange({
                    ...values,
                    customLaborTotal: parseOptionalNumber(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-200/50 focus:outline-none transition-all shadow-xs"
              />
            </div>
          ) : (
            <div className="pt-3 text-[10px] text-slate-400 font-bold italic leading-none">
              {t('company.estimateWizard.customPricing.inactive')}
            </div>
          )}
        </div>

        {/* 3. DURATĂ ESTIMATĂ */}
        <div className={`rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-between min-h-[105px] ${
          showDuration 
            ? 'border-amber-300 bg-white shadow-sm ring-1 ring-amber-100' 
            : 'border-slate-100 bg-white/60 hover:bg-white hover:border-slate-200 shadow-3xs'
        }`}>
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-1.5">
              <Calendar className={`w-4 h-4 shrink-0 ${showDuration ? 'text-amber-500' : 'text-slate-400'}`} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                {t('company.estimateWizard.customPricing.duration')}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleDuration}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                showDuration ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                  showDuration ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          {showDuration ? (
            <div className="animate-fade-in pt-3">
              <input
                type="number"
                min={0}
                step={1}
                placeholder={t('company.estimateWizard.customPricing.durationPlaceholder')}
                value={values.customDurationDays ?? ''}
                onChange={(e) =>
                  onChange({
                    ...values,
                    customDurationDays: parseOptionalNumber(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-200/50 focus:outline-none transition-all shadow-xs"
              />
            </div>
          ) : (
            <div className="pt-3 text-[10px] text-slate-400 font-bold italic leading-none">
              {t('company.estimateWizard.customPricing.inactive')}
            </div>
          )}
        </div>

        {/* 4. ORE MANOPERĂ TOTALĂ */}
        <div className={`rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-between min-h-[105px] ${
          showLaborHours 
            ? 'border-amber-300 bg-white shadow-sm ring-1 ring-amber-100' 
            : 'border-slate-100 bg-white/60 hover:bg-white hover:border-slate-200 shadow-3xs'
        }`}>
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-1.5">
              <Clock className={`w-4 h-4 shrink-0 ${showLaborHours ? 'text-amber-500' : 'text-slate-400'}`} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                {t('company.estimateWizard.customPricing.laborHours')}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleLaborHours}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                showLaborHours ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                  showLaborHours ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          {showLaborHours ? (
            <div className="animate-fade-in pt-3">
              <input
                type="number"
                min={0}
                step={0.5}
                placeholder={t('company.estimateWizard.customPricing.laborHoursPlaceholder')}
                value={values.customLaborHours ?? ''}
                onChange={(e) =>
                  onChange({
                    ...values,
                    customLaborHours: parseOptionalNumber(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-200/50 focus:outline-none transition-all shadow-xs"
              />
            </div>
          ) : (
            <div className="pt-3 text-[10px] text-slate-400 font-bold italic leading-none">
              {t('company.estimateWizard.customPricing.inactive')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
