import { useState } from 'react';
import {
  Settings,
  Home,
  Ruler,
  Layers,
  Compass,
  Maximize,
  Calculator,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Plan2dData } from '@/types/estimates';

type GlobalParams = NonNullable<Plan2dData['globalParameters']>;

type Props = {
  globalParams: GlobalParams;
  setGlobalParams: (patch: Partial<GlobalParams>) => void;
  readOnly?: boolean;
  categoryName?: string;
  categorySlug?: string;
};

function FacadeAreaCalculator({
  onApply,
  disabled,
}: {
  onApply: (area: number) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const ns = 'company.estimateWizard.planEditor.globalParams.facadeCalc';
  const [perimeter, setPerimeter] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [openingsPct, setOpeningsPct] = useState<number>(12);

  const perimeterNum = typeof perimeter === 'number' ? perimeter : 0;
  const heightNum = typeof height === 'number' ? height : 0;
  const gross = perimeterNum * heightNum;
  const net = Math.max(0, gross * (1 - openingsPct / 100));
  const canApply = !disabled && net > 0;

  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50/30 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sky-700 font-black text-[10px] uppercase tracking-widest">
        <Calculator className="w-3.5 h-3.5" />
        <span>{t(`${ns}.title`, { defaultValue: 'Calculator suprafață fațadă' })}</span>
      </div>
      <p className="text-[11px] text-slate-500 leading-snug">
        {t(`${ns}.hint`, {
          defaultValue: 'Perimetrul clădirii × înălțimea, minus procentul ferestrelor și ușilor.',
        })}
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        <div>
          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {t(`${ns}.perimeter`, { defaultValue: 'Perimetru' })} (m)
          </label>
          <input
            type="number"
            min={0}
            step={0.1}
            disabled={disabled}
            placeholder="Ex: 40"
            value={perimeter}
            onChange={(e) => {
              const v = e.target.value;
              setPerimeter(v === '' ? '' : Number(v));
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:border-sky-500 focus:outline-none disabled:bg-slate-50"
          />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {t(`${ns}.height`, { defaultValue: 'Înălțime' })} (m)
          </label>
          <input
            type="number"
            min={0}
            step={0.1}
            disabled={disabled}
            placeholder="Ex: 6"
            value={height}
            onChange={(e) => {
              const v = e.target.value;
              setHeight(v === '' ? '' : Number(v));
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:border-sky-500 focus:outline-none disabled:bg-slate-50"
          />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {t(`${ns}.openings`, { defaultValue: 'Ferestre & uși' })} (%)
          </label>
          <input
            type="number"
            min={0}
            max={50}
            step={1}
            disabled={disabled}
            value={openingsPct}
            onChange={(e) => setOpeningsPct(Math.max(0, Math.min(50, Number(e.target.value) || 0)))}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:border-sky-500 focus:outline-none disabled:bg-slate-50"
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 border border-sky-100">
        <div className="text-[10px] text-slate-500">
          <div>
            {t(`${ns}.gross`, { defaultValue: 'Brut' })}:{' '}
            <span className="font-bold text-slate-700">{gross.toFixed(1)} m²</span>
          </div>
          <div>
            {t(`${ns}.net`, { defaultValue: 'Net (după deducere)' })}:{' '}
            <span className="font-black text-sky-700">{net.toFixed(1)} m²</span>
          </div>
        </div>
        <button
          type="button"
          disabled={!canApply}
          onClick={() => onApply(Number(net.toFixed(2)))}
          className="rounded-xl bg-sky-600 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-white hover:bg-sky-700 transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          {t(`${ns}.apply`, { defaultValue: 'Aplică' })}
        </button>
      </div>
    </div>
  );
}

/**
 * Live computation: roofArea = baseArea / cos(slope) × 1.12 (matches backend
 * roofing-measurements.util.ts). Slope > 70° or cos <= 0.1 → baseArea × 1.15.
 */
function computeRoofAreaPreview(baseArea: number, slopeDeg: number): number {
  const slope = Math.min(75, Math.max(0, slopeDeg));
  const cosVal = Math.cos((slope * Math.PI) / 180);
  if (slope >= 70 || cosVal <= 0.1) return baseArea * 1.15;
  return (baseArea / cosVal) * 1.12;
}

export function PlanGlobalParameters({
  globalParams,
  setGlobalParams,
  readOnly,
  categoryName,
  categorySlug,
}: Props) {
  const { t } = useTranslation();
  const ns = 'company.estimateWizard.planEditor.globalParams';
  const [showCalc, setShowCalc] = useState(false);
  const isFacade = globalParams.workContext === 'facade';
  const isRoof = globalParams.workContext === 'roof';
  const isFlatRoof = categorySlug === 'acoperis-plat';

  const baseAreaNum = Number(globalParams.baseArea) || 0;
  const slopeNum = Number(globalParams.roofSlope) || 30;
  const roofAreaPreview =
    isRoof && baseAreaNum > 0 ? computeRoofAreaPreview(baseAreaNum, slopeNum) : 0;

  return (
    <div className="rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/30 p-6 glass-panel space-y-6 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="flex items-center justify-between border-b border-indigo-100/50 pb-3 relative z-10">
        <div className="flex items-center gap-2.5 text-indigo-950 font-black text-xs uppercase tracking-widest">
          <Settings className="w-5 h-5 text-indigo-600 animate-spin-slow" />
          <span>{t(`${ns}.title`)}</span>
        </div>
        {categoryName && (
          <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-2.5 py-0.5 rounded-lg select-none">
            {categoryName}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 relative z-10">
        {!isFacade && (
          <div className={isRoof ? 'space-y-1 col-span-2' : 'space-y-1'}>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Home className="w-3.5 h-3.5 text-slate-400" />
              {t(`${ns}.baseArea`)}
            </label>
            <input
              type="number"
              min={0}
              disabled={readOnly}
              placeholder="Ex: 120"
              value={globalParams.baseArea ?? ''}
              onChange={(e) =>
                setGlobalParams({ baseArea: Number(e.target.value) || undefined })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all shadow-xs disabled:bg-slate-50 disabled:text-slate-500"
            />
            {isRoof && (
              <p className="text-[10px] text-slate-500 leading-snug pt-0.5">
                {t(`${ns}.baseArea.roofHint`, {
                  defaultValue:
                    'Amprenta clădirii (pătratul de sub acoperiș) — NU suprafața scaturilor.',
                })}
              </p>
            )}
          </div>
        )}

        {/* wallHeight & floors are irrelevant for a roof estimate — hide them. */}
        {!isRoof && (
          <>
            <div className="space-y-1">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-slate-400" />
                {t(`${ns}.wallHeight`)}
              </label>
              <input
                type="number"
                min={1}
                max={10}
                step={0.1}
                disabled={readOnly}
                placeholder="Ex: 2.8"
                value={globalParams.wallHeight ?? ''}
                onChange={(e) =>
                  setGlobalParams({ wallHeight: Number(e.target.value) || undefined })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all shadow-xs disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                {t(`${ns}.floors`)}
              </label>
              <input
                type="number"
                min={1}
                disabled={readOnly}
                placeholder="Ex: 1"
                value={globalParams.floorsCount ?? ''}
                onChange={(e) =>
                  setGlobalParams({ floorsCount: Number(e.target.value) || undefined })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all shadow-xs disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </>
        )}

        {isRoof && !isFlatRoof && (
          <div className="space-y-1 animate-fade-in col-span-2">
            <label className="block text-[9px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              {t(`${ns}.roofSlope`)}
            </label>
            <input
              type="number"
              min={0}
              max={90}
              disabled={readOnly}
              placeholder="Ex: 35"
              value={globalParams.roofSlope ?? ''}
              onChange={(e) =>
                setGlobalParams({ roofSlope: Number(e.target.value) || undefined })
              }
              className="w-full rounded-xl border border-rose-200 bg-rose-50/10 px-3.5 py-2 text-xs font-bold text-rose-950 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 focus:outline-none transition-all shadow-xs disabled:bg-slate-50 disabled:text-slate-500"
            />
            {roofAreaPreview > 0 && (
              <p className="text-[10px] text-rose-700/80 leading-snug pt-0.5">
                {t(`${ns}.roofArea.preview`, {
                  defaultValue: 'Aria reală a acoperișului ≈',
                })}{' '}
                <span className="font-black text-rose-700">{roofAreaPreview.toFixed(1)} m²</span>
              </p>
            )}
          </div>
        )}

        {isFacade && (
          <div className="space-y-1 animate-fade-in col-span-2">
            <label className="block text-[9px] font-black text-sky-600 uppercase tracking-widest flex items-center gap-1">
              <Maximize className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
              {t(`${ns}.facadeArea`)}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                disabled={readOnly}
                placeholder="Ex: 160"
                value={globalParams.facadeArea ?? ''}
                onChange={(e) =>
                  setGlobalParams({ facadeArea: Number(e.target.value) || undefined })
                }
                className="flex-1 rounded-xl border border-sky-200 bg-sky-50/10 px-3.5 py-2 text-xs font-bold text-sky-950 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none transition-all shadow-xs disabled:bg-slate-50 disabled:text-slate-500"
              />
              <button
                type="button"
                disabled={readOnly}
                onClick={() => setShowCalc((v) => !v)}
                className="inline-flex items-center gap-1 rounded-xl border border-sky-200 bg-white px-2.5 py-2 text-[10px] font-black uppercase tracking-wider text-sky-700 hover:bg-sky-50 transition-colors disabled:opacity-50"
              >
                <Calculator className="w-3.5 h-3.5" />
                {showCalc
                  ? t(`${ns}.facadeCalc.hide`, { defaultValue: 'Ascunde' })
                  : t(`${ns}.facadeCalc.open`, { defaultValue: 'Calculează' })}
              </button>
            </div>
            <p className="text-[10px] text-sky-700/80 leading-snug pt-0.5">
              {t(`${ns}.facadeArea.scaffoldingHint`, {
                defaultValue:
                  'Această valoare se folosește automat și ca suprafață schelă (dacă nu se setează altfel).',
              })}
            </p>
          </div>
        )}
      </div>

      {isFacade && showCalc && (
        <div className="relative z-10 animate-fade-in">
          <FacadeAreaCalculator
            disabled={readOnly}
            onApply={(area) => {
              setGlobalParams({ facadeArea: area });
              setShowCalc(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
