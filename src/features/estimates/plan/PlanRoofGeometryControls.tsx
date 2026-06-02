export function DetailQty({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 font-black text-slate-900">{value}</p>
    </div>
  );
}