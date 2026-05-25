import { useMemo } from 'react';
import type { EstimateBlueprintConfig, Plan2dData } from '../types';
import {
  buildClientPlan3d,
  isoProject,
  summarizePlan,
  WALL_HEIGHT_M,
} from '../planLayout';

type Props = {
  plan2d: Plan2dData;
  plan3d?: unknown;
  config?: EstimateBlueprintConfig | null;
  categoryName?: string;
};

const ISO_SCALE = 28;

export function PlanPreview3D({ plan2d, plan3d, config, categoryName }: Props) {
  const preview = useMemo(() => {
    const client = buildClientPlan3d(plan2d, config);
    if (client) return client;
    return (plan3d as ReturnType<typeof buildClientPlan3d>) ?? null;
  }, [plan2d, plan3d, config]);

  const summary = useMemo(() => summarizePlan(plan2d, config), [plan2d, config]);

  if (!preview?.rooms.length) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-400">
        Adăugați camere în planul 2D pentru previzualizare 3D.
      </div>
    );
  }

  const bounds = preview.rooms.reduce(
    (acc, room) => ({
      maxX: Math.max(acc.maxX, room.x + room.width),
      maxZ: Math.max(acc.maxZ, room.z + room.depth),
    }),
    { maxX: 0, maxZ: 0 },
  );

  const origin = isoProject(0, 0, ISO_SCALE);
  const corner = isoProject(bounds.maxX + 0.8, bounds.maxZ + 0.8, ISO_SCALE);
  const width = Math.max(420, corner.x - origin.x + 120);
  const height = Math.max(260, corner.y + 120);

  return (
    <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 shadow-premium overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300/80">
            {categoryName ?? 'Plan obiect'}
          </p>
          <h3 className="font-bold text-white text-lg">Previzualizare 3D isometrică</h3>
          <p className="text-xs text-slate-300/80 mt-1">
            {summary.roomCount} camere · {summary.area.toFixed(1)} m² · înălțime standard {WALL_HEIGHT_M} m
          </p>
        </div>
        {summary.pointSummary.length > 0 ? (
          <div className="flex flex-wrap gap-2 max-w-md">
            {summary.pointSummary.map((item) => (
              <span
                key={item.type}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/90"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label} · {item.count}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[420px] h-[280px]">
          <defs>
            <linearGradient id="floorGrid" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {preview.rooms.map((room) => {
            const base = isoProject(room.x, room.z, ISO_SCALE);
            const right = isoProject(room.x + room.width, room.z, ISO_SCALE);
            const front = isoProject(room.x, room.z + room.depth, ISO_SCALE);
            const far = isoProject(room.x + room.width, room.z + room.depth, ISO_SCALE);
            const wallH = room.height * ISO_SCALE * 0.55;
            const floorPath = `M ${base.x} ${base.y} L ${right.x} ${right.y} L ${far.x} ${far.y} L ${front.x} ${front.y} Z`;

            return (
              <g key={room.id}>
                <path d={floorPath} fill="url(#floorGrid)" stroke="#475569" strokeWidth="1.2" />
                <polygon
                  points={`${base.x},${base.y} ${right.x},${right.y} ${right.x},${right.y - wallH} ${base.x},${base.y - wallH}`}
                  fill={`${room.color}55`}
                  stroke={`${room.color}aa`}
                  strokeWidth="1"
                />
                <polygon
                  points={`${base.x},${base.y} ${front.x},${front.y} ${front.x},${front.y - wallH} ${base.x},${base.y - wallH}`}
                  fill={`${room.color}33`}
                  stroke={`${room.color}88`}
                  strokeWidth="1"
                />
                <text
                  x={(base.x + far.x) / 2}
                  y={(base.y + far.y) / 2 - wallH - 8}
                  textAnchor="middle"
                  className="fill-white text-[11px] font-bold"
                >
                  {room.name}
                </text>
                <text
                  x={(base.x + far.x) / 2}
                  y={(base.y + far.y) / 2 - wallH + 6}
                  textAnchor="middle"
                  className="fill-slate-300 text-[9px]"
                >
                  {room.width}×{room.depth} m
                </text>
              </g>
            );
          })}

          {preview.points.map((point) => {
            const pos = isoProject(point.x, point.z, ISO_SCALE);
            return (
              <g key={point.id}>
                <line
                  x1={pos.x}
                  y1={pos.y}
                  x2={pos.x}
                  y2={pos.y - point.elevation * ISO_SCALE * 0.45}
                  stroke={point.color}
                  strokeWidth="2"
                  opacity="0.7"
                />
                <circle
                  cx={pos.x}
                  cy={pos.y - point.elevation * ISO_SCALE * 0.45}
                  r="5"
                  fill={point.color}
                  stroke="#fff"
                  strokeWidth="1.5"
                />
                <text
                  x={pos.x + 8}
                  y={pos.y - point.elevation * ISO_SCALE * 0.45 + 4}
                  className="fill-white text-[9px] font-semibold"
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
