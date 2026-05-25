import { useMemo, useState } from 'react';
import {
  LayoutTemplate,
  Plus,
  Minus,
  Trash2,
  Settings,
  Sparkles,
  PlusCircle,
  Layers,
  Home,
  Ruler,
  Maximize,
  Compass,
} from 'lucide-react';
import type { EstimateBlueprintConfig, Plan2dData, Plan2dRoom } from '../types';
import {
  defaultRoomsForCategory,
  getPointTypeMeta,
  summarizePlan,
} from '../planLayout';

type Props = {
  value: Plan2dData;
  config?: EstimateBlueprintConfig | null;
  categoryName?: string;
  categorySlug?: string;
  onChange: (plan: Plan2dData) => void;
  readOnly?: boolean;
};

function uid() {
  return crypto.randomUUID();
}

export function PlanEditor2D({
  value,
  config,
  categoryName,
  categorySlug,
  onChange,
  readOnly,
}: Props) {
  const [newCustomLabel, setNewCustomLabel] = useState('');

  const summary = useMemo(() => summarizePlan(value, config), [value, config]);

  // Helper to resolve initial context from database category slug
  const defaultContextFromSlug = (slug?: string): 'general' | 'indoor' | 'roof' | 'facade' => {
    if (!slug) return 'general';
    if (slug === 'acoperis') return 'roof';
    if (slug === 'fatade') return 'facade';
    if (['santehnika', 'elektrika', 'lucrari-finisaj', 'okna-dveri', 'mobila', 'cleaning', 'it-networks'].includes(slug)) return 'indoor';
    return 'general';
  };

  const workContext = defaultContextFromSlug(categorySlug);
  const globalParams = value.globalParameters ?? {
    workContext,
  };

  const setGlobalParams = (patch: Partial<typeof globalParams>) => {
    onChange({
      ...value,
      globalParameters: {
        ...globalParams,
        ...patch,
        workContext, 
      } as any,
    });
  };

  const addRoom = () => {
    const room: Plan2dRoom = {
      id: uid(),
      name: `Cameră/Zonă ${value.rooms.length + 1}`,
      width: 4,
      height: 3.5,
      unit: 'm',
      shapeType: 'rectangle',
      roofType: 'flat',
      connectedRoomIds: [],
    };
    onChange({ ...value, rooms: [...value.rooms, room] });
  };

  const updateRoom = (id: string, patch: Partial<Plan2dRoom>) => {
    onChange({
      ...value,
      rooms: value.rooms.map((room) => (room.id === id ? { ...room, ...patch } : room)),
    });
  };

  const removeRoom = (id: string) => {
    onChange({
      ...value,
      rooms: value.rooms.filter((room) => room.id !== id),
      points: value.points.filter((point) => point.roomId !== id),
    });
  };

  const pointCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of value.points) {
      if (p.type !== 'custom') {
        counts.set(p.type, (counts.get(p.type) ?? 0) + 1);
      }
    }
    return counts;
  }, [value.points]);

  const adjustPointCount = (type: string, delta: number) => {
    const meta = getPointTypeMeta(type, config);
    if (delta > 0) {
      const newPoints = Array.from({ length: delta }, () => ({
        id: uid(),
        type,
        label: meta.label,
        elevation: 1.05,
      }));
      onChange({ ...value, points: [...value.points, ...newPoints] });
    } else {
      const absoluteDelta = Math.abs(delta);
      let removed = 0;
      const nextPoints = value.points.filter((p) => {
        if (p.type === type && removed < absoluteDelta) {
          removed++;
          return false;
        }
        return true;
      });
      onChange({ ...value, points: nextPoints });
    }
  };

  const customCounters = useMemo(() => {
    const counts = new Map<string, number>();
    for (const pt of value.points) {
      if (pt.type === 'custom') {
        const label = pt.label ?? 'Item Personalizat';
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
  }, [value.points]);

  const adjustCustomCount = (label: string, delta: number) => {
    if (delta > 0) {
      const newPoints = Array.from({ length: delta }, () => ({
        id: uid(),
        type: 'custom',
        label,
        elevation: 1.05,
      }));
      onChange({ ...value, points: [...value.points, ...newPoints] });
    } else {
      const absoluteDelta = Math.abs(delta);
      let removed = 0;
      const nextPoints = value.points.filter((p) => {
        if (p.type === 'custom' && p.label === label && removed < absoluteDelta) {
          removed++;
          return false;
        }
        return true;
      });
      onChange({ ...value, points: nextPoints });
    }
  };

  const handleAddCustomCounter = () => {
    const label = newCustomLabel.trim();
    if (!label) return;
    adjustCustomCount(label, 1);
    setNewCustomLabel('');
  };

  const applyCategoryTemplate = () => {
    const defaultCtx = defaultContextFromSlug(categorySlug);
    onChange({
      ...value,
      rooms: defaultRoomsForCategory(categorySlug).map((r) => ({
        ...r,
        shapeType: 'rectangle',
        roofType: defaultCtx === 'roof' ? 'gable' : 'flat',
        connectedRoomIds: [],
      })),
      points: [],
      globalParameters: {
        workContext: defaultCtx,
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* SECTION 1: GLOBAL BUILDING PARAMETERS */}
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

      {/* SECTION 2: ROOMS & WORKING ZONES LIST (TABLE) */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-premium space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Tabel Încăperi & Corpuri de lucru</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Specificați dimensiunile încăperilor. Suprafața calculată se actualizează automat.
            </p>
          </div>
          {!readOnly && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={applyCategoryTemplate}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <LayoutTemplate className="w-4 h-4" /> Șablon Implicit
              </button>
              <button
                type="button"
                onClick={addRoom}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" /> + Adaugă Încăpere
              </button>
            </div>
          )}
        </div>

        {value.rooms.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-semibold select-none">
            Nu s-au adăugat încăperi. Folosiți «Șablon Implicit» sau butonul de adăugare de mai sus.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-2.5 px-3 rounded-l-xl">Denumire încăpere</th>
                  <th className="py-2.5 px-3 w-32">Lățime (m)</th>
                  <th className="py-2.5 px-3 w-32">Lungime (m)</th>
                  <th className="py-2.5 px-3 w-40">Formă clădire</th>
                  <th className="py-2.5 px-3 w-40">Tip acoperiș</th>
                  <th className="py-2.5 px-3 w-32 text-right">Arie</th>
                  {!readOnly && <th className="py-2.5 px-3 w-16 text-center rounded-r-xl">Acțiune</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {value.rooms.map((room) => {
                  const area = room.width * room.height;
                  return (
                    <tr key={room.id} className="hover:bg-slate-50/40">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          disabled={readOnly}
                          value={room.name}
                          onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-transparent px-2.5 py-1.5 text-xs font-bold focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min={0.1}
                          step={0.1}
                          disabled={readOnly}
                          value={room.width}
                          onChange={(e) =>
                            updateRoom(room.id, { width: Number(e.target.value) || 1 })
                          }
                          className="w-24 rounded-lg border border-slate-200 bg-transparent px-2.5 py-1.5 text-xs font-bold focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min={0.1}
                          step={0.1}
                          disabled={readOnly}
                          value={room.height}
                          onChange={(e) =>
                            updateRoom(room.id, { height: Number(e.target.value) || 1 })
                          }
                          className="w-24 rounded-lg border border-slate-200 bg-transparent px-2.5 py-1.5 text-xs font-bold focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          disabled={readOnly}
                          value={room.shapeType || 'rectangle'}
                          onChange={(e) =>
                            updateRoom(room.id, { shapeType: e.target.value as any })
                          }
                          className="w-full rounded-lg border border-slate-200 bg-transparent px-2 py-1.5 text-xs font-bold focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                        >
                          <option value="rectangle">Dreptunghi / Pătrat</option>
                          <option value="l-shape">Formă în L</option>
                          <option value="t-shape">Formă în T</option>
                          <option value="u-shape">Formă în U</option>
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <select
                          disabled={readOnly}
                          value={room.roofType || 'flat'}
                          onChange={(e) =>
                            updateRoom(room.id, { roofType: e.target.value as any })
                          }
                          className="w-full rounded-lg border border-slate-200 bg-transparent px-2 py-1.5 text-xs font-bold focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                        >
                          <option value="flat">Acoperiș Plat</option>
                          <option value="gable">În două ape (Gable)</option>
                          <option value="hip">În patru ape (Hip)</option>
                        </select>
                      </td>
                      <td className="py-2 px-3 text-right font-black text-slate-800">
                        {area.toFixed(1)} m²
                      </td>
                      {!readOnly && (
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeRoom(room.id)}
                            className="p-1.5 text-slate-400 hover:text-red-650 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50/50 font-black text-slate-850">
                  <td className="py-3 px-3 rounded-l-xl">Total cumulat zone</td>
                  <td className="py-3 px-3"></td>
                  <td className="py-3 px-3"></td>
                  <td className="py-3 px-3"></td>
                  <td className="py-3 px-3 text-right text-[10px] font-black uppercase text-slate-400">
                    Arie Totală:
                  </td>
                  <td className="py-3 px-3 text-right text-sm font-black text-indigo-750">
                    {summary.area.toFixed(1)} m²
                  </td>
                  {!readOnly && <td className="py-3 px-3 rounded-r-xl"></td>}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 3: WORK ITEMS COUNTER SYSTEM */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-premium space-y-5">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
            Inventar Puncte de Lucru & Dotări
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Introduceți numărul de elemente și accesorii. Manopera și materialele se calculează instantaneu.
          </p>
        </div>

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
                      Cantitate:
                    </span>
                    <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1 shadow-3xs">
                      <button
                        type="button"
                        disabled={readOnly || currentCount <= 0}
                        onClick={() => adjustPointCount(pointType.type, -1)}
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
                        onClick={() => adjustPointCount(pointType.type, 1)}
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

        {/* CUSTOM ITEMS DRAW PANEL SECTION */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-black text-xs uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Elemente & Materiale Personalizate la bucată</span>
          </div>

          {!readOnly && (
            <div className="flex flex-wrap gap-2 max-w-md">
              <input
                type="text"
                placeholder="Ex: Parazăpadă metalică 2m, Tablou metalic..."
                value={newCustomLabel}
                onChange={(e) => setNewCustomLabel(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all shadow-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomCounter}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white transition-all shadow-md cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" /> Adaugă
              </button>
            </div>
          )}

          {customCounters.length === 0 ? (
            <p className="text-xs text-slate-400 italic font-semibold">
              Nu s-au adăugat elemente personalizate. Introduceți un nume mai sus pentru a genera contoare adiționale.
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
                        Cantitate:
                      </span>
                      <div className="flex items-center gap-2 bg-white rounded-xl border border-violet-200 p-1 shadow-3xs">
                        <button
                          type="button"
                          disabled={readOnly || item.count <= 0}
                          onClick={() => adjustCustomCount(item.label, -1)}
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
                          onClick={() => adjustCustomCount(item.label, 1)}
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
    </div>
  );
}
