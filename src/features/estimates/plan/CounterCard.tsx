export function CounterCard({
  label,
  value,
  readOnly,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  readOnly?: boolean;
  suffix?: string;
  onChange: (next: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
      <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-1">
        <button
          type="button"
          disabled={readOnly || value <= 0}
          onClick={() => onChange(value - 1)}
          className="size-7 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        >
          -
        </button>
        <span className="text-sm font-black text-slate-900">
          {value}{suffix ? ` ${suffix}` : ''}
        </span>
        <button
          type="button"
          disabled={readOnly}
          onClick={() => onChange(value + 1)}
          className="size-7 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}