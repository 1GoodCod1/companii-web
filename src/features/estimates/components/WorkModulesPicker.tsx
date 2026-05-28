import type { EstimateBlueprintConfig } from '@/types/estimate-blueprint-config.types';

type Props = {
  config: EstimateBlueprintConfig | null;
  enabled: string[];
  onToggle: (key: string, enabled: boolean) => void;
  disabled?: boolean;
};

export function WorkModulesPicker({ config, enabled, onToggle, disabled }: Props) {
  const modules = config?.workModules ?? [];
  if (!modules.length) return null;

  const enabledSet = new Set(enabled);

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
        Состав работ
      </legend>
      <div className="grid sm:grid-cols-2 gap-2">
        {modules.map((module) => {
          const isOn = enabledSet.has(module.key);
          return (
            <label
              key={module.key}
              className={`flex items-start gap-3 rounded-2xl border px-3.5 py-2.5 cursor-pointer transition-all ${
                isOn
                  ? 'border-violet-300 bg-violet-50/60'
                  : 'border-slate-200 bg-white/60 hover:border-slate-300'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={isOn}
                disabled={disabled}
                onChange={(e) => onToggle(module.key, e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-gray-900">{module.label}</span>
                {module.helpText && (
                  <span className="block text-[11px] text-gray-500 mt-0.5 leading-snug">
                    {module.helpText}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
