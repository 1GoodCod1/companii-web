import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Gauge, Home, Layers, Ruler, Sparkles } from 'lucide-react';
import type { Plan2dData, Plan2dRoom } from '@/types/estimates';
import {
  computeRectangularRoofBaseArea,
  computeRectangularRoofPerimeter,
  computeRidgeLength,
  computeRoofAreaFromSlope,
  computeRoofSlopeCoefficient,
  deriveValleyLengthFromShape,
  getRoofInteractiveDrawingReasons,
  inferRoofShapeFromPlan,
  normalizeRoofShape,
} from '@/features/estimates/derivations/roofGeometry';
import { uid } from './utils';

type GlobalParams = NonNullable<Plan2dData['globalParameters']>;

type Props = {
  value: Plan2dData;
  globalParams: GlobalParams;
  setGlobalParams: (patch: Partial<GlobalParams>) => void;
  onChange: (next: Plan2dData) => void;
  readOnly?: boolean;
};

type RoofPreset = 'simple' | 'l-shape' | 'hip' | 'complex';

const SHAPE_OPTIONS: Array<{ value: NonNullable<Plan2dRoom['shapeType']>; label: string }> = [
  { value: 'rectangle', label: 'Dreptunghi' },
  { value: 'l-shape', label: 'L-shape' },
  { value: 't-shape', label: 'T-shape' },
  { value: 'u-shape', label: 'U-shape' },
];

function pointCount(value: Plan2dData, type: string): number {
  return value.points.filter((point) => point.type === type).length;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function roomArea(room: Pick<Plan2dRoom, 'width' | 'height'>): number {
  return round2(Math.max(0, room.width) * Math.max(0, room.height));
}

function totalRoomsArea(rooms: Plan2dRoom[]): number {
  return round2(rooms.reduce((sum, room) => sum + roomArea(room), 0));
}

function replaceTypedPoints(value: Plan2dData, counts: Record<string, number>): Plan2dData['points'] {
  const replacedTypes = new Set(Object.keys(counts));
  const preserved = value.points.filter((point) => !replacedTypes.has(point.type));
  const next = [...preserved];

  for (const [type, count] of Object.entries(counts)) {
    for (let i = 0; i < count; i++) {
      next.push({ id: uid(), type, elevation: 1.05 });
    }
  }

  return next;
}

function buildPresetRooms(preset: RoofPreset): Plan2dRoom[] {
  if (preset === 'complex') {
    return [
      { id: uid(), name: 'Scat principal', width: 10, height: 8, unit: 'm', shapeType: 'rectangle', roofType: 'gable' },
      { id: uid(), name: 'Extensie acoperiș', width: 5, height: 4, unit: 'm', shapeType: 'rectangle', roofType: 'gable' },
    ];
  }

  const shapeType: Plan2dRoom['shapeType'] = preset === 'l-shape' ? 'l-shape' : 'rectangle';
  const roofType: Plan2dRoom['roofType'] = preset === 'hip' ? 'hip' : 'gable';
  return [
    { id: uid(), name: 'Plan acoperiș', width: 10, height: 8, unit: 'm', shapeType, roofType },
  ];
}

function roofShapeForDiagnostic(shape: string, planeCount: number): string {
  if (planeCount > 1) return 'complex';
  if (shape === 'l-shape' || shape === 't-shape' || shape === 'u-shape') return shape;
  return 'rectangle';
}

function roofShapeLabel(shape: string, planeCount: number): string {
  if (planeCount > 1 || shape === 'complex') return 'Complex / multi-plan';
  if (shape === 'l-shape') return 'L-shape';
  if (shape === 't-shape') return 'T-shape';
  if (shape === 'u-shape') return 'U-shape';
  return 'Dreptunghi';
}

function reasonLabel(reason: string): string {
  switch (reason) {
    case 'steep_slope':
      return 'pantă abruptă';
    case 'complex_shape':
      return 'formă complexă';
    case 'multi_plane_plan':
      return 'mai multe planuri';
    case 'valleys':
      return 'dolii';
    case 'wall_intersections':
      return 'priză la perete';
    case 'chimneys':
      return 'coșuri';
    case 'skylights':
      return 'ferestre mansardă';
    default:
      return reason;
  }
}

function RoofSketch({
  shape,
  roofType,
  hasChimney,
  hasGutter,
  hasSkylight,
}: {
  shape: string;
  roofType: string;
  hasChimney: boolean;
  hasGutter: boolean;
  hasSkylight: boolean;
}) {
  const isL = shape === 'l-shape';
  const isT = shape === 't-shape';
  const isU = shape === 'u-shape';
  const outline = isL
    ? 'M35 35 H170 V85 H115 V145 H35 Z'
    : isT
      ? 'M55 35 H185 V80 H140 V145 H100 V80 H55 Z'
      : isU
        ? 'M35 35 H80 V105 H140 V35 H185 V145 H35 Z'
        : 'M35 40 H185 V140 H35 Z';

  return (
    <svg viewBox="0 0 220 180" className="h-44 w-full">
      <path d={outline} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
      <path d="M45 90 H175" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
      {roofType === 'hip' ? (
        <>
          <path d="M45 45 L110 90 L175 45" stroke="#fb923c" strokeWidth="2.5" fill="none" />
          <path d="M45 135 L110 90 L175 135" stroke="#fb923c" strokeWidth="2.5" fill="none" />
        </>
      ) : (
        <>
          <path d="M45 45 L110 90 L175 45" stroke="#fb923c" strokeWidth="2.5" fill="none" />
          <path d="M45 135 L110 90 L175 135" stroke="#fb923c" strokeWidth="2.5" fill="none" />
        </>
      )}
      {hasGutter && (
        <path d="M35 150 H185" stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round" />
      )}
      {hasChimney && (
        <rect x="138" y="64" width="18" height="24" rx="3" fill="#7c2d12" />
      )}
      {hasSkylight && (
        <rect x="75" y="68" width="22" height="16" rx="3" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
      )}
      <circle cx="110" cy="90" r="4" fill="#f97316" />
    </svg>
  );
}

export function PlanRoofGeometryPanel({
  value,
  globalParams,
  setGlobalParams,
  onChange,
  readOnly,
}: Props) {
  const { t } = useTranslation();
  const baseArea = Number(globalParams.baseArea) || 0;
  const slope = Number(globalParams.roofSlope) || 30;
  const roofOverhangM = Number(globalParams.roofOverhangM ?? 0.4);
  const planeCount = value.rooms.length || Math.max(1, pointCount(value, 'roof_plane'));
  const inferredShape = normalizeRoofShape(inferRoofShapeFromPlan(value) ?? value.rooms[0]?.shapeType ?? 'rectangle');
  const roofType = value.rooms[0]?.roofType ?? 'gable';
  const primaryRoom = value.rooms[0];
  const geometricBaseArea = primaryRoom
    ? computeRectangularRoofBaseArea(primaryRoom.width, primaryRoom.height, roofOverhangM)
    : baseArea;
  const roofArea = geometricBaseArea > 0 ? computeRoofAreaFromSlope(geometricBaseArea, slope) : 0;
  const perimeterEstimate = primaryRoom
    ? computeRectangularRoofPerimeter(primaryRoom.width, primaryRoom.height, roofOverhangM)
    : baseArea > 0 ? Math.round(Math.sqrt(baseArea) * 4 * 10) / 10 : 0;
  const gutterCount = pointCount(value, 'gutter');
  const chimneyCount = pointCount(value, 'chimney');
  const gutterLength = Number(globalParams.roofGutterLengthM ?? 0) > 0
    ? Number(globalParams.roofGutterLengthM)
    : perimeterEstimate;
  const ridgeLength = primaryRoom
    ? computeRidgeLength({
      width: primaryRoom.width,
      length: primaryRoom.height,
      roofType,
      overhangM: roofOverhangM,
    })
    : 0;
  const valleyLength = deriveValleyLengthFromShape(inferredShape);
  const skylightCount = pointCount(value, 'skylight');
  const drawingReasons = getRoofInteractiveDrawingReasons({
    plan2d: value,
    roofSlopeDegrees: slope,
    roofShape: inferredShape,
    valleyLengthM: valleyLength,
    chimneyCount,
    skylightCount,
  });
  const needsReview = drawingReasons.length > 0;
  const roomsArea = totalRoomsArea(value.rooms);
  const diagnosticShape = roofShapeForDiagnostic(inferredShape, planeCount);
  const diagnosticPatch = (patch: Record<string, unknown>) => {
    onChange({
      ...value,
      globalParameters: {
        ...globalParams,
        ...patch,
      } as GlobalParams,
    });
  };

  const applyPreset = (preset: RoofPreset) => {
    const rooms = buildPresetRooms(preset);
    const nextBaseArea = totalRoomsArea(rooms);
    const pointCounts =
      preset === 'complex'
        ? { roof_plane: 3, gutter: 6, chimney: 1, skylight: 1 }
        : preset === 'l-shape'
          ? { roof_plane: 2, gutter: 4, chimney: 0, skylight: 0 }
          : { roof_plane: 1, gutter: 4, chimney: 0, skylight: 0 };

    onChange({
      ...value,
      rooms,
      points: replaceTypedPoints(value, pointCounts),
      globalParameters: {
        ...globalParams,
        workContext: 'roof',
        baseArea: nextBaseArea,
        roofSlope: preset === 'hip' ? 25 : 30,
        roofOverhangM,
        roofGutterLengthM: computeRectangularRoofPerimeter(rooms[0].width, rooms[0].height, roofOverhangM),
      },
    });
  };

  const updateRooms = (rooms: Plan2dRoom[]) => {
    onChange({
      ...value,
      rooms,
      globalParameters: {
        ...globalParams,
        workContext: 'roof',
        baseArea: totalRoomsArea(rooms),
        roofGutterLengthM: rooms[0]
          ? computeRectangularRoofPerimeter(rooms[0].width, rooms[0].height, roofOverhangM)
          : undefined,
      },
    });
  };

  const updatePrimaryRoom = (patch: Partial<Plan2dRoom>) => {
    const first = value.rooms[0] ?? buildPresetRooms('simple')[0];
    const rest = value.rooms.slice(1);
    updateRooms([{ ...first, ...patch }, ...rest]);
  };

  const updateRoom = (id: string, patch: Partial<Plan2dRoom>) => {
    const currentRooms = value.rooms.length ? value.rooms : buildPresetRooms('simple');
    const hasRoom = currentRooms.some((room) => room.id === id);
    const rooms = hasRoom
      ? currentRooms.map((room) => (room.id === id ? { ...room, ...patch } : room))
      : [{ ...currentRooms[0], ...patch }];
    updateRooms(rooms);
  };

  const addPlane = () => {
    const currentRooms = value.rooms.length ? value.rooms : buildPresetRooms('simple');
    const nextRooms = [
      ...currentRooms,
      {
        id: uid(),
        name: `Scat ${currentRooms.length + 1}`,
        width: 4,
        height: 3,
        unit: 'm',
        shapeType: 'rectangle' as const,
        roofType,
      },
    ];
    onChange({
      ...value,
      rooms: nextRooms,
      points: replaceTypedPoints(value, { roof_plane: nextRooms.length }),
      globalParameters: {
        ...globalParams,
        workContext: 'roof',
        baseArea: totalRoomsArea(nextRooms),
        roofGutterLengthM: computeRectangularRoofPerimeter(nextRooms[0].width, nextRooms[0].height, roofOverhangM),
      },
    });
  };

  const removePlane = (id: string) => {
    const currentRooms = value.rooms.length ? value.rooms : buildPresetRooms('simple');
    const nextRooms = currentRooms.filter((room) => room.id !== id);
    const rooms = nextRooms.length ? nextRooms : buildPresetRooms('simple');
    onChange({
      ...value,
      rooms,
      points: replaceTypedPoints(value, { roof_plane: Math.max(1, rooms.length) }),
      globalParameters: {
        ...globalParams,
        workContext: 'roof',
        baseArea: totalRoomsArea(rooms),
        roofGutterLengthM: computeRectangularRoofPerimeter(rooms[0].width, rooms[0].height, roofOverhangM),
      },
    });
  };

  const setTypedPointCount = (type: string, count: number) => {
    onChange({
      ...value,
      points: replaceTypedPoints(value, { [type]: Math.max(0, count) }),
    });
  };

  const statItems = useMemo(
    () => [
      { label: 'Amprentă', value: baseArea > 0 ? `${baseArea.toFixed(1)} m²` : '-' },
      { label: 'Arie reală', value: roofArea > 0 ? `${roofArea.toFixed(1)} m²` : '-' },
      { label: 'Coamă estimată', value: ridgeLength > 0 ? `${ridgeLength.toFixed(1)} m` : '-' },
      { label: 'Jgheaburi', value: gutterLength > 0 ? `${gutterLength.toFixed(1)} m` : '-' },
    ],
    [baseArea, gutterLength, ridgeLength, roofArea],
  );

  return (
    <div className="rounded-3xl border border-orange-100 bg-white p-6 glass-panel space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-orange-100/70 pb-4">
        <div>
          <div className="flex items-center gap-2 text-orange-700 font-black text-[10px] uppercase tracking-widest">
            <Home className="h-4 w-4" />
            <span>{t('company.estimateWizard.roofGeometry.title', { defaultValue: 'Schemă acoperiș' })}</span>
          </div>
          <p className="mt-1 max-w-2xl text-xs font-medium leading-relaxed text-slate-500">
            {t('company.estimateWizard.roofGeometry.description', {
              defaultValue:
                'Configurați forma, panta și elementele principale. Aceste valori alimentează calculul pentru suprafață, dolii, jgheaburi și verificarea manuală.',
            })}
          </p>
        </div>
        {needsReview && (
          <div className="flex max-w-md items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-850">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Necesită verificare: {drawingReasons.map(reasonLabel).join(', ')}.
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-4">
            {(['simple', 'l-shape', 'hip', 'complex'] as RoofPreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={readOnly}
                onClick={() => applyPreset(preset)}
                className="rounded-2xl border border-orange-100 bg-orange-50/40 px-3 py-2 text-left text-[11px] font-black uppercase tracking-wider text-orange-850 transition-colors hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {preset === 'simple'
                  ? 'Simplu'
                  : preset === 'l-shape'
                    ? 'În L'
                    : preset === 'hip'
                      ? 'În 4 ape'
                      : 'Complex'}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1">
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <Ruler className="h-3.5 w-3.5" />
                Amprentă
              </span>
              <input
                type="number"
                min={5}
                step={0.1}
                disabled={readOnly}
                value={globalParams.baseArea ?? ''}
                onChange={(event) => setGlobalParams({ baseArea: Number(event.target.value) || undefined })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-850 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </label>

            <label className="space-y-1">
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <Gauge className="h-3.5 w-3.5" />
                Pantă
              </span>
              <input
                type="number"
                min={0}
                max={75}
                step={1}
                disabled={readOnly}
                value={globalParams.roofSlope ?? ''}
                onChange={(event) => setGlobalParams({ roofSlope: Number(event.target.value) || undefined })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-850 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </label>

            <label className="space-y-1">
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <Layers className="h-3.5 w-3.5" />
                Formă
              </span>
              <select
                disabled={readOnly}
                value={value.rooms[0]?.shapeType ?? 'rectangle'}
                onChange={(event) => updatePrimaryRoom({ shapeType: event.target.value as Plan2dRoom['shapeType'] })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-850 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                {SHAPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <Sparkles className="h-3.5 w-3.5" />
                Tip
              </span>
              <select
                disabled={readOnly}
                value={roofType}
                onChange={(event) => updatePrimaryRoom({ roofType: event.target.value as Plan2dRoom['roofType'] })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-850 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="gable">În două ape</option>
                <option value="hip">În patru ape</option>
                <option value="flat">Plat / anexă</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <Ruler className="h-3.5 w-3.5" />
                Surplombă
              </span>
              <select
                disabled={readOnly}
                value={globalParams.roofOverhangM ?? 0.4}
                onChange={(event) => {
                  const nextOverhang = Number(event.target.value);
                  setGlobalParams({
                    roofOverhangM: nextOverhang,
                    roofGutterLengthM: primaryRoom
                      ? computeRectangularRoofPerimeter(primaryRoom.width, primaryRoom.height, nextOverhang)
                      : undefined,
                  });
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-850 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value={0.3}>0.3 m</option>
                <option value={0.4}>0.4 m</option>
                <option value={0.5}>0.5 m</option>
                <option value={0.6}>0.6 m</option>
              </select>
            </label>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Materiale & condiții de lucru
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SelectControl
                label="Tip învelitoare"
                value={String(globalParams.coveringType ?? 'metal_tile')}
                disabled={readOnly}
                options={[
                  ['metal_tile', 'Țiglă metalică'],
                  ['ceramic_tile', 'Țiglă ceramică'],
                  ['bituminous_shingle', 'Șindrilă bituminoasă'],
                  ['standing_seam', 'Tablă fălțuită'],
                  ['ondulin', 'Ondulin'],
                  ['other', 'Alt tip'],
                ]}
                onChange={(coveringType) => diagnosticPatch({ coveringType })}
              />
              <SelectControl
                label="Tip membrană"
                value={String(globalParams.membraneType ?? 'anticondens')}
                disabled={readOnly}
                options={[
                  ['standard', 'Standard'],
                  ['anticondens', 'Anticondens'],
                  ['diffusion', 'Difuzie'],
                  ['superdiffusion', 'Superdifuzie'],
                  ['premium', 'Premium'],
                ]}
                onChange={(membraneType) => diagnosticPatch({ membraneType })}
              />
              <SelectControl
                label="Grosime izolație"
                value={String(globalParams.insulationThicknessMm ?? '150')}
                disabled={readOnly}
                options={[
                  ['100', '100 mm'],
                  ['150', '150 mm'],
                  ['200', '200 mm'],
                  ['250', '250 mm'],
                ]}
                onChange={(insulationThicknessMm) => diagnosticPatch({ insulationThicknessMm: Number(insulationThicknessMm) })}
              />
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Înălțime clădire</span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  disabled={readOnly}
                  value={globalParams.buildingHeightM ?? ''}
                  onChange={(event) => diagnosticPatch({ buildingHeightM: Number(event.target.value) || undefined })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-850 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700">
                <span>Schelă necesară</span>
                <input
                  type="checkbox"
                  disabled={readOnly}
                  checked={Boolean(globalParams.scaffoldingRequired)}
                  onChange={(event) => diagnosticPatch({ scaffoldingRequired: event.target.checked })}
                  className="h-4 w-4 accent-orange-600"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Parazăpadă lungime</span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  disabled={readOnly}
                  value={globalParams.snowGuardLengthM ?? ''}
                  placeholder={ridgeLength.toFixed(1)}
                  onChange={(event) => diagnosticPatch({ snowGuardLengthM: Number(event.target.value) || undefined })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-850 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Rânduri parazăpadă</span>
                <input
                  type="number"
                  min={1}
                  max={4}
                  step={1}
                  disabled={readOnly}
                  value={globalParams.snowGuardRows ?? 1}
                  onChange={(event) => diagnosticPatch({ snowGuardRows: Number(event.target.value) || 1 })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-850 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Planuri detaliate
                </p>
                <p className="text-[11px] font-medium text-slate-500">
                  Modificați lungimea și lățimea fiecărui plan. Amprenta se actualizează automat.
                </p>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={addPlane}
                  className="rounded-xl border border-orange-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wider text-orange-700 hover:bg-orange-50"
                >
                  + Adaugă plan
                </button>
              )}
            </div>

            <div className="space-y-2">
              {(value.rooms.length ? value.rooms : buildPresetRooms('simple')).map((room, index) => (
                <div
                  key={room.id}
                  className="grid gap-2 rounded-2xl border border-slate-100 bg-white p-3 sm:grid-cols-[minmax(0,1.2fr)_100px_100px_100px_44px]"
                >
                  <input
                    type="text"
                    disabled={readOnly}
                    value={room.name}
                    onChange={(event) => updateRoom(room.id, { name: event.target.value })}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-850 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                  <label className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Lungime</span>
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      disabled={readOnly}
                      value={room.width}
                      onChange={(event) => updateRoom(room.id, { width: Number(event.target.value) || 0.1 })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-850 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Lățime</span>
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      disabled={readOnly}
                      value={room.height}
                      onChange={(event) => updateRoom(room.id, { height: Number(event.target.value) || 0.1 })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-850 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </label>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Arie</span>
                    <p className="text-xs font-black text-slate-900">{roomArea(room).toFixed(1)} m²</p>
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      disabled={value.rooms.length <= 1 && index === 0}
                      onClick={() => removePlane(room.id)}
                      className="rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-xs font-semibold text-slate-600">
              <span>Total din planuri: <strong className="text-slate-900">{roomsArea.toFixed(1)} m²</strong></span>
              <span>Formă pentru calcul: <strong className="text-slate-900">{roofShapeLabel(diagnosticShape, planeCount)}</strong></span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CounterCard
              label="Planuri / scaturi"
              value={pointCount(value, 'roof_plane')}
              readOnly={readOnly}
              onChange={(count) => setTypedPointCount('roof_plane', count)}
            />
            <CounterCard
              label="Jgheaburi"
              value={Math.round(gutterLength)}
              readOnly={readOnly}
              suffix="m"
              onChange={(count) => setGlobalParams({ roofGutterLengthM: Math.max(0, count) })}
            />
            <CounterCard
              label="Coșuri de fum"
              value={chimneyCount}
              readOnly={readOnly}
              onChange={(count) => setTypedPointCount('chimney', count)}
            />
            <CounterCard
              label="Ferestre mansardă"
              value={skylightCount}
              readOnly={readOnly}
              onChange={(count) => setTypedPointCount('skylight', count)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {statItems.map((item) => (
              <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.label}</p>
                <p className="mt-1 text-sm font-black text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Cantități care intră la recalculare
            </p>
            <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
              <DetailQty label="baseArea" value={`${baseArea.toFixed(2)} m²`} />
              <DetailQty label="roofSlope" value={`${slope}°`} />
              <DetailQty label="roofShape" value={diagnosticShape} />
              <DetailQty label="roofArea" value={`${roofArea.toFixed(2)} m²`} />
              <DetailQty label="ridgeLengthM" value={`${ridgeLength.toFixed(2)} m`} />
              <DetailQty label="valleyLengthM" value={`${valleyLength.toFixed(2)} m`} />
              <DetailQty label="gutterLengthM" value={`${gutterLength.toFixed(2)} m`} />
              <DetailQty label="roofOverhangM" value={`${roofOverhangM.toFixed(2)} m`} />
              <DetailQty label="roofSlopeCoefficient" value={`${computeRoofSlopeCoefficient(slope).toFixed(2)}×`} />
              <DetailQty label="snowGuardTotalM" value={`${(Number(globalParams.snowGuardLengthM ?? ridgeLength) * Number(globalParams.snowGuardRows ?? 1)).toFixed(2)} m`} />
              <DetailQty label="skylightCount" value={`${skylightCount} buc`} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-4">
          <RoofSketch
            shape={inferredShape}
            roofType={roofType}
            hasChimney={chimneyCount > 0}
            hasGutter={gutterCount > 0}
            hasSkylight={skylightCount > 0}
          />
          <div className="rounded-2xl bg-white p-3 text-xs font-semibold text-slate-600">
            <div className="flex justify-between gap-3">
              <span>Formă</span>
              <span className="font-black text-slate-900">{roofShapeLabel(inferredShape, planeCount)}</span>
            </div>
            <div className="mt-1 flex justify-between gap-3">
              <span>Dolii estimate</span>
              <span className="font-black text-slate-900">{valleyLength.toFixed(1)} m</span>
            </div>
            <div className="mt-1 flex justify-between gap-3">
              <span>Coeficient pantă</span>
              <span className="font-black text-slate-900">
                {baseArea > 0 ? (roofArea / baseArea).toFixed(2) : '-'}×
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailQty({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 font-black text-slate-900">{value}</p>
    </div>
  );
}

function SelectControl({
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
  return (
    <label className="space-y-1">
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</span>
      <select
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-850 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function CounterCard({
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
          className="h-7 w-7 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
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
          className="h-7 w-7 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}
