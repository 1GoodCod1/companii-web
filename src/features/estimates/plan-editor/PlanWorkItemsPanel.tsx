import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, PlusCircle, Sparkles, LayoutTemplate } from 'lucide-react';
import type { EstimateBlueprintConfig } from '@/types/estimates';
import { getTemplatesForCategory, type PointTemplate } from '../planTemplates';

type CustomCounter = { label: string; count: number };

type Props = {
  config?: EstimateBlueprintConfig | null;
  readOnly?: boolean;
  categorySlug?: string;
  pointCounts: Map<string, number>;
  onAdjustPointCount: (type: string, delta: number) => void;
  onSetPointCounts?: (counts: Record<string, number>) => void;
  customCounters: CustomCounter[];
  onAdjustCustomCount: (label: string, delta: number) => void;
};

export function PlanWorkItemsPanel({
  config,
  readOnly,
  categorySlug,
  pointCounts,
  onAdjustPointCount,
  onSetPointCounts,
  customCounters,
  onAdjustCustomCount,
}: Props) {
  const { t, i18n } = useTranslation();
  const [newCustomLabel, setNewCustomLabel] = useState('');

  const handleAddCustomCounter = () => {
    const label = newCustomLabel.trim();
    if (!label) return;
    onAdjustCustomCount(label, 1);
    setNewCustomLabel('');
  };

  // I-05: Quick category templates
  const templates = useMemo(
    () => (categorySlug ? getTemplatesForCategory(categorySlug) : []),
    [categorySlug],
  );

  const handleApplyTemplate = (template: PointTemplate) => {
    if (!onSetPointCounts) return;

    // Reset all existing point counts to 0, then apply template
    const resetCounts: Record<string, number> = {};
    for (const pt of config?.planPointTypes ?? []) {
      resetCounts[pt.type] = 0;
    }
    for (const [type, count] of Object.entries(template.counts)) {
      resetCounts[type] = (resetCounts[type] ?? 0) + count;
    }
    onSetPointCounts(resetCounts);
  };

  const templateLabel = (tpl: PointTemplate) =>
    i18n.language === 'ru' ? tpl.labelRu : tpl.labelRo;

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 glass-panel space-y-5">
      <div>
        <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
          {t('company.estimateWizard.workItems.title')}
        </h3>
        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
          {t('company.estimateWizard.workItems.description')}
        </p>
      </div>

      {/* I-05: Quick template buttons */}
      {templates.length > 0 && onSetPointCounts && !readOnly && (
        <div className="flex flex-wrap gap-2">
          <LayoutTemplate className="w-4 h-4 text-amber-500 my-auto" />
          {templates.map((tpl) => (
            <button
              key={tpl.key}
              type="button"
              onClick={() => handleApplyTemplate(tpl)}
              className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-1.5 text-[11px] font-bold text-amber-800 hover:bg-amber-100 transition-colors active:scale-95"
            >
              {templateLabel(tpl)}
            </button>
          ))}
        </div>
      )}

      {config?.planPointTypes?.length ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {config.planPointTypes.map((pointType) => {
            const currentCount = pointCounts.get(pointType.type) ?? 0;
            const isActive = currentCount > 0;
            return (
              <div
                key={pointType.type}
                className={`rounded-2xl border p-4 flex flex-col justify-between transition-all duration-300 ${
                  isActive
                    ? 'border-indigo-300 bg-white shadow-sm ring-1 ring-indigo-50 -translate-y-0.5'
                    : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50/80 hover:border-slate-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${isActive ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: pointType.color }}
                  />
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider leading-tight">
                    {pointType.label}
                  </h4>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
                    {t('company.estimateWizard.workItems.quantity')}:
                  </span>
                  <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1 shadow-3xs">
                    <button
                      type="button"
                      disabled={readOnly || currentCount <= 0}
                      onClick={() => onAdjustPointCount(pointType.type, -1)}
                      className="w-6 h-6 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className={`w-8 text-center text-xs font-black ${isActive ? 'text-indigo-700' : 'text-slate-850'}`}>
                      {currentCount}
                    </span>
                    <button
                      type="button"
                      disabled={readOnly}
                      onClick={() => onAdjustPointCount(pointType.type, 1)}
                      className="w-6 h-6 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="border-t border-slate-100 pt-5 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-black text-xs uppercase tracking-widest">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>{t('company.estimateWizard.workItems.customSection')}</span>
        </div>

        {!readOnly && (
          <div className="flex flex-wrap gap-2 max-w-md">
            <input
              type="text"
              placeholder={t('company.estimateWizard.workItems.customPlaceholder')}
              value={newCustomLabel}
              onChange={(e) => setNewCustomLabel(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all shadow-xs"
            />
            <button
              type="button"
              onClick={handleAddCustomCounter}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white transition-all shadow-md cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> {t('cabinet.common.add')}
            </button>
          </div>
        )}

        {customCounters.length === 0 ? (
          <p className="text-xs text-slate-400 italic font-semibold">
            {t('company.estimateWizard.workItems.noCustomItems')}
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
            {customCounters.map((item) => {
              const isActive = item.count > 0;
              return (
                <div
                  key={item.label}
                  className={`rounded-2xl border p-4 flex flex-col justify-between transition-all duration-300 ${
                    isActive
                      ? 'border-violet-300 bg-white shadow-sm ring-1 ring-violet-50 -translate-y-0.5'
                      : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50/80 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full bg-violet-500 mt-1 shrink-0 ${isActive ? 'animate-pulse' : ''}`} />
                    <h4 className="font-bold text-violet-950 text-xs uppercase tracking-wider leading-tight truncate">
                      {item.label}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
                      {t('company.estimateWizard.workItems.quantity')}:
                    </span>
                    <div className="flex items-center gap-2 bg-white rounded-xl border border-violet-200 p-1 shadow-3xs">
                      <button
                        type="button"
                        disabled={readOnly || item.count <= 0}
                        onClick={() => onAdjustCustomCount(item.label, -1)}
                        className="w-6 h-6 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className={`w-8 text-center text-xs font-black ${isActive ? 'text-violet-750' : 'text-slate-800'}`}>
                        {item.count}
                      </span>
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => onAdjustCustomCount(item.label, 1)}
                        className="w-6 h-6 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}