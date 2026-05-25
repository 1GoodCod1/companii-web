import { useMemo, useState } from 'react';
import { LayoutTemplate, Plus, Trash2 } from 'lucide-react';
import type { EstimateBlueprintConfig, Plan2dData, Plan2dPoint, Plan2dRoom } from '../types';
import {
  defaultRoomsForCategory,
  getPointTypeMeta,
  layoutBounds,
  normalizeRoomLayout,
  PX_PER_M,
  pointPositionInRoom,
  ROOM_PALETTE,
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
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(value.rooms[0]?.id ?? null);
  const [activePointType, setActivePointType] = useState(config?.planPointTypes[0]?.type ?? 'zone');

  const layoutRooms = useMemo(() => normalizeRoomLayout(value.rooms), [value.rooms]);
  const bounds = useMemo(() => layoutBounds(layoutRooms), [layoutRooms]);
  const summary = useMemo(() => summarizePlan(value, config), [value, config]);

  const svgWidth = bounds.width * PX_PER_M + 80;
  const svgHeight = bounds.height * PX_PER_M + 80;

  const selectedRoom = value.rooms.find((room) => room.id === selectedRoomId) ?? null;

  const addRoom = () => {
    const last = layoutRooms[layoutRooms.length - 1];
    const room: Plan2dRoom = {
      id: uid(),
      name: `Cameră ${value.rooms.length + 1}`,
      width: 4,
      height: 3.5,
      x: last ? last.layoutX + last.width + 0.6 : 0,
      y: 0,
      unit: 'm',
    };
    onChange({ ...value, rooms: [...value.rooms, room] });
    setSelectedRoomId(room.id);
  };

  const applyCategoryTemplate = () => {
    onChange({
      ...value,
      rooms: defaultRoomsForCategory(categorySlug),
      points: [],
    });
    setSelectedRoomId(null);
  };

  const updateRoom = (id: string, patch: Partial<Plan2dRoom>) => {
    onChange({
      ...value,
      rooms: value.rooms.map((room) => (room.id === id ? { ...room, ...patch } : room)),
    });
  };

  const removeRoom = (id: string) => {
    onChange({
      rooms: value.rooms.filter((room) => room.id !== id),
      points: value.points.filter((point) => point.roomId !== id),
    });
    if (selectedRoomId === id) setSelectedRoomId(null);
  };

  const addPoint = () => {
    if (!selectedRoomId) return;
    const roomPoints = value.points.filter((point) => point.roomId === selectedRoomId);
    const meta = getPointTypeMeta(activePointType, config);
    const point: Plan2dPoint = {
      id: uid(),
      roomId: selectedRoomId,
      type: activePointType,
      label: meta.label,
      x: 0.15 + (roomPoints.length % 3) * 0.28,
      y: 0.2 + Math.floor(roomPoints.length / 3) * 0.25,
    };
    onChange({ ...value, points: [...value.points, point] });
  };

  const removePoint = (id: string) => {
    onChange({ ...value, points: value.points.filter((point) => point.id !== id) });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-premium space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600">
              {categoryName ?? 'Plan obiect'}
            </p>
            <h3 className="font-bold text-gray-900 text-lg">Plan 2D — suprafață & puncte de lucru</h3>
            <p className="text-sm text-gray-500 mt-1">
              Suprafață totală:{' '}
              <span className="font-semibold text-violet-700">{summary.area.toFixed(1)} m²</span>
              {' · '}
              {summary.roomCount} camere
            </p>
          </div>
          {!readOnly && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={applyCategoryTemplate}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100"
              >
                <LayoutTemplate className="w-4 h-4" /> Șablon categorie
              </button>
              <button
                type="button"
                onClick={addRoom}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Plus className="w-4 h-4" /> Cameră
              </button>
            </div>
          )}
        </div>

        {config?.planPointTypes?.length ? (
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Legendă categorie — puncte de lucru
            </p>
            <div className="flex flex-wrap gap-2">
              {config.planPointTypes.map((pointType) => (
                <span
                  key={pointType.type}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pointType.color }} />
                  {pointType.label}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-auto">
          {value.rooms.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center p-10 text-sm text-gray-400 text-center">
              Folosiți «Șablon categorie» sau adăugați camere manual pentru a construi planul obiectului.
            </div>
          ) : (
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full min-w-[520px] h-[360px]">
              <defs>
                <pattern id="planGrid" width={PX_PER_M} height={PX_PER_M} patternUnits="userSpaceOnUse">
                  <path
                    d={`M ${PX_PER_M} 0 L 0 0 0 ${PX_PER_M}`}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="0.8"
                  />
                </pattern>
              </defs>
              <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="#f8fafc" />
              <rect x="40" y="40" width={bounds.width * PX_PER_M} height={bounds.height * PX_PER_M} fill="url(#planGrid)" />

              {layoutRooms.map((room, index) => {
                const x = 40 + room.layoutX * PX_PER_M;
                const y = 40 + room.layoutY * PX_PER_M;
                const w = room.width * PX_PER_M;
                const h = room.height * PX_PER_M;
                const selected = room.id === selectedRoomId;
                const roomPoints = value.points.filter((point) => point.roomId === room.id);

                return (
                  <g key={room.id}>
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      fill={ROOM_PALETTE[index % ROOM_PALETTE.length]}
                      stroke={selected ? '#7c3aed' : '#64748b'}
                      strokeWidth={selected ? 2.5 : 1.5}
                      rx="4"
                      className={readOnly ? '' : 'cursor-pointer'}
                      onClick={() => setSelectedRoomId(room.id)}
                    />
                    <text x={x + 8} y={y + 18} className="fill-gray-900 text-[12px] font-bold">
                      {room.name}
                    </text>
                    <text x={x + 8} y={y + 34} className="fill-gray-500 text-[10px]">
                      {room.width} × {room.height} m · {(room.width * room.height).toFixed(1)} m²
                    </text>

                    <text x={x + w / 2} y={y - 6} textAnchor="middle" className="fill-slate-500 text-[9px] font-semibold">
                      {room.width} m
                    </text>
                    <text
                      x={x - 8}
                      y={y + h / 2}
                      textAnchor="middle"
                      transform={`rotate(-90 ${x - 8} ${y + h / 2})`}
                      className="fill-slate-500 text-[9px] font-semibold"
                    >
                      {room.height} m
                    </text>

                    {roomPoints.map((point, pointIndex) => {
                      const pos = pointPositionInRoom(room, point, pointIndex);
                      const px = 40 + pos.x * PX_PER_M;
                      const py = 40 + pos.y * PX_PER_M;
                      const meta = getPointTypeMeta(point.type, config);
                      return (
                        <g key={point.id}>
                          <circle cx={px} cy={py} r="7" fill={meta.color} stroke="#fff" strokeWidth="2" />
                          <text x={px + 10} y={py + 4} className="fill-gray-800 text-[9px] font-bold">
                            {point.label ?? meta.label}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {summary.pointSummary.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {summary.pointSummary.map((item) => (
              <span
                key={item.type}
                className="rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-[11px] font-semibold text-violet-800"
              >
                {item.label}: {item.count}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {!readOnly && selectedRoom && (
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-premium space-y-5">
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Dimensiuni — {selectedRoom.name}</h4>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-500">
                Nume cameră
                <input
                  value={selectedRoom.name}
                  onChange={(e) => updateRoom(selectedRoom.id, { name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-gray-500">
                  Lățime (m)
                  <input
                    type="number"
                    min={1}
                    step={0.1}
                    value={selectedRoom.width}
                    onChange={(e) => updateRoom(selectedRoom.id, { width: Number(e.target.value) || 1 })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-xs font-semibold text-gray-500">
                  Lungime (m)
                  <input
                    type="number"
                    min={1}
                    step={0.1}
                    value={selectedRoom.height}
                    onChange={(e) => updateRoom(selectedRoom.id, { height: Number(e.target.value) || 1 })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => removeRoom(selectedRoom.id)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3.5 h-3.5" /> Șterge camera
              </button>
            </div>
          </div>

          {config?.planPointTypes?.length ? (
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Puncte de lucru — {categoryName ?? 'categorie'}</h4>
              <p className="text-xs text-gray-500 mb-3">
                Marcați obiectele relevante pentru calculul smetei (ex: prize, țevi, zone placă).
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {config.planPointTypes.map((pointType) => (
                  <button
                    key={pointType.type}
                    type="button"
                    onClick={() => setActivePointType(pointType.type)}
                    className={`rounded-full px-3 py-1 text-xs font-bold border ${
                      activePointType === pointType.type
                        ? 'border-transparent text-white'
                        : 'border-gray-200 text-gray-600 bg-gray-50'
                    }`}
                    style={
                      activePointType === pointType.type
                        ? { backgroundColor: pointType.color }
                        : undefined
                    }
                  >
                    {pointType.label}
                  </button>
                ))}
              </div>
              <div className="space-y-2 mb-3">
                {value.points
                  .filter((point) => point.roomId === selectedRoom.id)
                  .map((point) => {
                    const meta = getPointTypeMeta(point.type, config);
                    return (
                      <div
                        key={point.id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2 text-xs"
                      >
                        <span className="inline-flex items-center gap-2 font-semibold text-gray-700">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                          {point.label ?? meta.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePoint(point.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
              </div>
              <button
                type="button"
                onClick={addPoint}
                className="w-full rounded-xl border border-dashed border-violet-200 bg-violet-50/50 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50"
              >
                + Adaugă {getPointTypeMeta(activePointType, config).label}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
