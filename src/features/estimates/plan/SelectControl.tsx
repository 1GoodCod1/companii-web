import { useMemo } from 'react';
import { AppSelect } from '@/widgets/cabinet/cabinet-ui';

export function SelectControl({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[value: string, label: string]>;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const appOptions = useMemo(
    () => options.map(([optionValue, optionLabel]) => ({ value: optionValue, label: optionLabel })),
    [options],
  );

  return (
    <label className="space-y-1">
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</span>
      <AppSelect
        value={value}
        onChange={onChange}
        options={appOptions}
        disabled={disabled}
        aria-label={label}
      />
    </label>
  );
}