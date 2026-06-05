import { FileCodeIcon, ArrowsCounterClockwiseIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import type { AdminBlueprintModalProps } from './AdminBlueprintModal';

export function BlueprintJsonEditor({
  configJsonStr,
  onJsonChange,
  jsonError,
  onBeautify,
}: Pick<AdminBlueprintModalProps, 'configJsonStr' | 'onJsonChange' | 'jsonError' | 'onBeautify'>) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
          <FileCodeIcon className="size-3.5 text-primary/60" />
          Complete Blueprint Config Schema JSON
        </p>
        <button
          type="button"
          onClick={onBeautify}
          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowsCounterClockwiseIcon className="size-3" />
          {t('admin.blueprintsPage.beautifyBtn')}
        </button>
      </div>

      <div className="relative">
        <textarea
          value={configJsonStr}
          onChange={(e) => onJsonChange(e.target.value)}
          rows={16}
          aria-label="Blueprint config JSON"
          className="w-full p-4 font-mono text-[11px] bg-gray-900 text-emerald-400 border border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner leading-relaxed"
        />
        {jsonError && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-950/80 backdrop-blur border border-red-800 text-red-200 px-3.5 py-2.5 rounded-xl flex items-start gap-2 text-xs shadow-lg">
            <WarningCircleIcon className="size-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wider text-[9px] text-red-400">JSON Syntax Error</p>
              <p className="font-medium text-[11px] leading-relaxed">{jsonError}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}