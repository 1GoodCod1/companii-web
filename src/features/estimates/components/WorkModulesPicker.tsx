import { useMemo } from 'react';
import type { EstimateBlueprintConfig, BlueprintWorkModule } from '@/types/estimate-blueprint-config.types';
import { getModuleSection, MODULE_SECTIONS } from '@/features/estimates/diagnostic/moduleSections';

type Props = {
  config: EstimateBlueprintConfig | null;
  enabled: string[];
  onToggle: (key: string, enabled: boolean) => void;
  disabled?: boolean;
};

type ModuleSection = {
  key: string;
  label: string;
  modules: BlueprintWorkModule[];
};

const EMPTY_MODULES: BlueprintWorkModule[] = [];

export function WorkModulesPicker({ config, enabled, onToggle, disabled }: Props) {
  const allModules = config?.workModules ?? EMPTY_MODULES;

  const sections = useMemo<ModuleSection[]>(() => {
    const buckets = new Map<string, BlueprintWorkModule[]>();
    const sectionLabels = new Map<string, string>();
    const order: string[] = [];

    for (const module of allModules) {
      const sec = module.section
        ? { key: module.section, label: module.section }
        : getModuleSection(module.key);
      if (!buckets.has(sec.key)) {
        buckets.set(sec.key, []);
        sectionLabels.set(sec.key, sec.label);
        order.push(sec.key);
      }
      buckets.get(sec.key)!.push(module);
    }

    // Respect predefined order, then append any unknown sections
    const ordered = new Set([...MODULE_SECTIONS, ...order]);
    return [...ordered]
      .filter((key) => buckets.has(key))
      .map((key) => ({
        key,
        label: sectionLabels.get(key) ?? getModuleSection(key).label,
        modules: buckets.get(key)!,
      }));
  }, [allModules]);

  if (!allModules.length) return null;

  const enabledSet = new Set(enabled);

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <fieldset key={section.key} className="space-y-2">
          <legend className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md inline-block">
            {section.label}
          </legend>
          <div className="grid sm:grid-cols-2 gap-2">
            {section.modules.map((module) => {
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
      ))}
    </div>
  );
}
