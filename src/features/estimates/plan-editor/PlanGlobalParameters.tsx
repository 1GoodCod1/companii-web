import {
  Settings,
  Home,
  Ruler,
  Layers,
  Compass,
  Maximize,
} from 'lucide-react';
import type { Plan2dData } from '@/types/estimates';

type GlobalParams = NonNullable<Plan2dData['globalParameters']>;

type Props = {
  globalParams: GlobalParams;
  setGlobalParams: (patch: Partial<GlobalParams>) => void;
  readOnly?: boolean;
  categoryName?: string;
};

export function PlanGlobalParameters({
  globalParams,
  setGlobalParams,
  readOnly,
  categoryName,
}: Props) {
  return (
    <div className="rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/30 p-6 shadow-premium space-y-6 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="flex items-center justify-between border-b border-indigo-100/50 pb-3 relative z-10">
        <div className="flex items-center gap-2.5 text-indigo-950 font-black text-xs uppercase tracking-widest">
          <Settings className="w-5 h-5 text-indigo-600 animate-spin-slow" />
          <span>Configurare Context Proiect & Parametri Globali</span>
        </div>
        {categoryName && (
          <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-2.5 py-0.5 rounded-lg select-none">
            {categoryName}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 relative z-10">
        <div className="space-y-1">
          <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            Suprafață la sol (m²)
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
        </div>

        <div className="space-y-1">
          <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5 text-slate-400" />
            Înălțime Pereți (m)
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
            Niveluri (Etaje)
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

        {globalParams.workContext === 'roof' && (
          <div className="space-y-1 animate-fade-in col-span-1">
            <label className="block text-[9px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              Înclinație acoperiș (°)
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
          </div>
        )}

        {globalParams.workContext === 'facade' && (
          <div className="space-y-1 animate-fade-in col-span-1">
            <label className="block text-[9px] font-black text-sky-600 uppercase tracking-widest flex items-center gap-1">
              <Maximize className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
              Suprafață fațadă (m²)
            </label>
            <input
              type="number"
              min={0}
              disabled={readOnly}
              placeholder="Ex: 160"
              value={globalParams.facadeArea ?? ''}
              onChange={(e) =>
                setGlobalParams({ facadeArea: Number(e.target.value) || undefined })
              }
              className="w-full rounded-xl border border-sky-200 bg-sky-50/10 px-3.5 py-2 text-xs font-bold text-sky-950 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none transition-all shadow-xs disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}
