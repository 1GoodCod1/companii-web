import { LayoutTemplate, Plus, Trash2 } from 'lucide-react';
import type { Plan2dData, Plan2dRoom } from '@/types/estimates';

type Props = {
  value: Plan2dData;
  readOnly?: boolean;
  summaryArea: number;
  onAddRoom: () => void;
  onUpdateRoom: (id: string, patch: Partial<Plan2dRoom>) => void;
  onRemoveRoom: (id: string) => void;
  onApplyCategoryTemplate: () => void;
};

export function PlanRoomsTable({
  value,
  readOnly,
  summaryArea,
  onAddRoom,
  onUpdateRoom,
  onRemoveRoom,
  onApplyCategoryTemplate,
}: Props) {
  return (
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
              onClick={onApplyCategoryTemplate}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <LayoutTemplate className="w-4 h-4" /> Șablon Implicit
            </button>
            <button
              type="button"
              onClick={onAddRoom}
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
                        onChange={(e) => onUpdateRoom(room.id, { name: e.target.value })}
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
                          onUpdateRoom(room.id, { width: Number(e.target.value) || 1 })
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
                          onUpdateRoom(room.id, { height: Number(e.target.value) || 1 })
                        }
                        className="w-24 rounded-lg border border-slate-200 bg-transparent px-2.5 py-1.5 text-xs font-bold focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <select
                        disabled={readOnly}
                        value={room.shapeType || 'rectangle'}
                        onChange={(e) =>
                          onUpdateRoom(room.id, { shapeType: e.target.value as Plan2dRoom['shapeType'] })
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
                          onUpdateRoom(room.id, { roofType: e.target.value as Plan2dRoom['roofType'] })
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
                          onClick={() => onRemoveRoom(room.id)}
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
                  {summaryArea.toFixed(1)} m²
                </td>
                {!readOnly && <td className="py-3 px-3 rounded-r-xl"></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
