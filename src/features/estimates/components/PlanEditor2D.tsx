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
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [draggingPointId, setDraggingPointId] = useState<string | null>(null);
  const [draggedOverRoomId, setDraggedOverRoomId] = useState<string | null>(null);

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
    setSelectedPointId(null);
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
    if (value.points.find((p) => p.roomId === id)?.id === selectedPointId) {
      setSelectedPointId(null);
    }
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
      elevation: 1.05, // default standard elevation height
    };
    onChange({ ...value, points: [...value.points, point] });
    setSelectedPointId(point.id);
  };

  const removePoint = (id: string) => {
    onChange({ ...value, points: value.points.filter((point) => point.id !== id) });
  };

  const handlePointMouseDown = (e: React.MouseEvent, pointId: string, roomId: string) => {
    if (readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    setDraggingPointId(pointId);
    setSelectedPointId(pointId);
    setSelectedRoomId(roomId);
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingPointId || readOnly) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const svgX = (clientX / rect.width) * svgWidth;
    const svgY = (clientY / rect.height) * svgHeight;
    const meterX = (svgX - 40) / PX_PER_M;
    const meterY = (svgY - 40) / PX_PER_M;

    let targetRoom = layoutRooms.find(
      (r) =>
        meterX >= r.layoutX &&
        meterX <= r.layoutX + r.width &&
        meterY >= r.layoutY &&
        meterY <= r.layoutY + r.height
    );

    const currentPoint = value.points.find((p) => p.id === draggingPointId);
    if (!currentPoint) return;

    if (targetRoom) {
      setDraggedOverRoomId(targetRoom.id);
    } else {
      targetRoom = layoutRooms.find((r) => r.id === currentPoint.roomId);
      setDraggedOverRoomId(null);
    }

    if (!targetRoom) return;

    const localX = meterX - targetRoom.layoutX;
    const localY = meterY - targetRoom.layoutY;
    const pctX = Math.max(0.02, Math.min(0.98, localX / targetRoom.width));
    const pctY = Math.max(0.02, Math.min(0.98, localY / targetRoom.height));

    onChange({
      ...value,
      points: value.points.map((p) =>
        p.id === draggingPointId
          ? { ...p, roomId: targetRoom!.id, x: pctX, y: pctY }
          : p
      ),
    });
  };

  const handleSvgMouseUp = () => {
    setDraggingPointId(null);
    setDraggedOverRoomId(null);
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

        <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-auto relative">
          {draggingPointId && (
            <div className="absolute top-3 left-3 bg-violet-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-10 animate-pulse">
              MUTARE COMPONENT (Trageți în orice cameră)
            </div>
          )}
          {value.rooms.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center p-10 text-sm text-gray-400 text-center">
              Folosiți «Șablon categorie» sau adăugați camere manual pentru a construi planul obiectului.
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full min-w-[520px] h-[360px]"
              onMouseMove={handleSvgMouseMove}
              onMouseUp={handleSvgMouseUp}
              onMouseLeave={handleSvgMouseUp}
            >
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
              <rect
                x="40"
                y="40"
                width={bounds.width * PX_PER_M}
                height={bounds.height * PX_PER_M}
                fill="url(#planGrid)"
              />

              {layoutRooms.map((room, index) => {
                const x = 40 + room.layoutX * PX_PER_M;
                const y = 40 + room.layoutY * PX_PER_M;
                const w = room.width * PX_PER_M;
                const h = room.height * PX_PER_M;
                const selected = room.id === selectedRoomId;
                const isDraggedOver = room.id === draggedOverRoomId;
                const roomPoints = value.points.filter((point) => point.roomId === room.id);

                return (
                  <g key={room.id}>
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      fill={ROOM_PALETTE[index % ROOM_PALETTE.length]}
                      stroke={isDraggedOver ? '#8b5cf6' : selected ? '#7c3aed' : '#64748b'}
                      strokeWidth={isDraggedOver ? 3.5 : selected ? 2.5 : 1.5}
                      strokeDasharray={isDraggedOver ? '4,4' : undefined}
                      rx="4"
                      className={readOnly ? '' : 'cursor-pointer'}
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        setSelectedPointId(null);
                      }}
                    />
                    <text x={x + 8} y={y + 18} className="fill-gray-900 text-[12px] font-bold select-none">
                      {room.name}
                    </text>
                    <text x={x + 8} y={y + 34} className="fill-gray-500 text-[10px] select-none">
                      {room.width} × {room.height} m · {(room.width * room.height).toFixed(1)} m²
                    </text>

                    <text
                      x={x + w / 2}
                      y={y - 6}
                      textAnchor="middle"
                      className="fill-slate-500 text-[9px] font-semibold select-none"
                    >
                      {room.width} m
                    </text>
                    <text
                      x={x - 8}
                      y={y + h / 2}
                      textAnchor="middle"
                      transform={`rotate(-90 ${x - 8} ${y + h / 2})`}
                      className="fill-slate-500 text-[9px] font-semibold select-none"
                    >
                      {room.height} m
                    </text>

                    {roomPoints.map((point, pointIndex) => {
                      const pos = pointPositionInRoom(room, point, pointIndex);
                      const px = 40 + pos.x * PX_PER_M;
                      const py = 40 + pos.y * PX_PER_M;
                      const meta = getPointTypeMeta(point.type, config);
                      const isDragging = point.id === draggingPointId;
                      const isSelected = point.id === selectedPointId;

                      return (
                        <g
                          key={point.id}
                          className={`transition-all ${readOnly ? '' : 'cursor-grab active:cursor-grabbing'}`}
                          onMouseDown={(e) => handlePointMouseDown(e, point.id, room.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPointId(point.id);
                            setSelectedRoomId(room.id);
                          }}
                        >
                          {/* Pulsing ring for dragging or selection */}
                          {(isSelected || isDragging) && (
                            <circle
                              cx={px}
                              cy={py}
                              r={isDragging ? 16 : 12}
                              fill={`${meta.color}33`}
                              className={isDragging ? '' : 'animate-pulse'}
                            />
                          )}

                          {/* Main node point */}
                          <circle
                            cx={px}
                            cy={py}
                            r={isDragging ? 9 : 7}
                            fill={meta.color}
                            stroke="#fff"
                            strokeWidth="2"
                            className="shadow-md"
                          />

                          {/* Clean, uncollidable white badge for label */}
                          <g transform={`translate(${px}, ${py + 14})`}>
                            <rect
                              x={-35}
                              y={-7}
                              width={70}
                              height={14}
                              fill="#ffffff"
                              fillOpacity="0.95"
                              rx="4"
                              stroke={isSelected ? '#7c3aed' : '#cbd5e1'}
                              strokeWidth={isSelected ? '1' : '0.5'}
                            />
                            <text
                              x={0}
                              y={2.5}
                              textAnchor="middle"
                              className="fill-slate-800 text-[8.5px] font-bold select-none"
                            >
                              {point.label ?? meta.label}
                            </text>
                          </g>
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

      {!readOnly && (
        <div className="space-y-5">
          {/* Real-time Property Inspector Panel */}
          {selectedPointId && (
            <div className="rounded-3xl border border-violet-200 bg-violet-50/20 p-5 shadow-premium space-y-4">
              <div className="flex items-center justify-between border-b border-violet-100 pb-2">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Proprietăți Obiect</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-0.5">
                    Ajustare fină
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPointId(null)}
                  className="text-xs font-bold text-violet-600 hover:text-violet-800"
                >
                  Închide
                </button>
              </div>

              {(() => {
                const point = value.points.find((p) => p.id === selectedPointId);
                if (!point) return <p className="text-xs text-gray-400">Selectați un obiect de pe plan.</p>;
                const meta = getPointTypeMeta(point.type, config);
                const currentElev = point.elevation ?? 1.05;

                return (
                  <div className="space-y-4">
                    <label className="block text-xs font-semibold text-gray-500">
                      Nume / Etichetă
                      <input
                        value={point.label ?? ''}
                        onChange={(e) => {
                          onChange({
                            ...value,
                            points: value.points.map((p) =>
                              p.id === point.id ? { ...p, label: e.target.value } : p
                            ),
                          });
                        }}
                        placeholder={meta.label}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                      />
                    </label>

                    {/* Z Height / Elevation Slider */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 font-semibold mb-1">
                        <span>Înălțime de la podea (Z):</span>
                        <span className="font-bold text-violet-700">{currentElev.toFixed(2)} m</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="2.80"
                        step="0.05"
                        value={currentElev}
                        onChange={(e) => {
                          onChange({
                            ...value,
                            points: value.points.map((p) =>
                              p.id === point.id ? { ...p, elevation: Number(e.target.value) } : p
                            ),
                          });
                        }}
                        className="w-full accent-violet-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-gray-400 font-semibold mt-1">
                        <span>0.0m (Podea)</span>
                        <span>1.2m (Întrerupător)</span>
                        <span>2.8m (Tavan)</span>
                      </div>
                    </div>

                    {/* Coordinates Sliders */}
                    <div className="space-y-2 border-t border-gray-100 pt-3">
                      <span className="block text-xs font-semibold text-gray-500">Coordonate relative camera</span>
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                          <span>Poziție X:</span>
                          <span className="font-bold text-gray-700">{Math.round((point.x ?? 0.5) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="98"
                          step="1"
                          value={Math.round((point.x ?? 0.5) * 100)}
                          onChange={(e) => {
                            onChange({
                              ...value,
                              points: value.points.map((p) =>
                                p.id === point.id ? { ...p, x: Number(e.target.value) / 100 } : p
                              ),
                            });
                          }}
                          className="w-full accent-slate-600 cursor-pointer h-1 bg-gray-200 rounded-lg appearance-none"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                          <span>Poziție Y:</span>
                          <span className="font-bold text-gray-700">{Math.round((point.y ?? 0.5) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="98"
                          step="1"
                          value={Math.round((point.y ?? 0.5) * 100)}
                          onChange={(e) => {
                            onChange({
                              ...value,
                              points: value.points.map((p) =>
                                p.id === point.id ? { ...p, y: Number(e.target.value) / 100 } : p
                              ),
                            });
                          }}
                          className="w-full accent-slate-600 cursor-pointer h-1 bg-gray-200 rounded-lg appearance-none"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        removePoint(point.id);
                        setSelectedPointId(null);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Șterge obiectul
                    </button>
                  </div>
                );
              })()}
            </div>
          )}

          {selectedRoom && (
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
                  <h4 className="font-bold text-gray-900 mb-1">Adăugare puncte — {categoryName ?? 'categorie'}</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Selectați tipul și apăsați butonul de adăugare pentru a plasa un nou obiect.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {config.planPointTypes.map((pointType) => (
                      <button
                        key={pointType.type}
                        type="button"
                        onClick={() => setActivePointType(pointType.type)}
                        className={`rounded-full px-3 py-1 text-xs font-bold border transition-colors ${
                          activePointType === pointType.type
                            ? 'border-transparent text-white'
                            : 'border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100'
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

                  <button
                    type="button"
                    onClick={addPoint}
                    className="w-full rounded-xl border border-dashed border-violet-200 bg-violet-50/50 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-50 transition-colors"
                  >
                    + Adaugă {getPointTypeMeta(activePointType, config).label}
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
