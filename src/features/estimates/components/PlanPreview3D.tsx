import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { EstimateBlueprintConfig, Plan2dData } from '../types';
import { ProceduralModel } from './ProceduralModel3D';
import {
  getPointTypeMeta,
  normalizeRoomLayout,
  WALL_HEIGHT_M,
  ROOM_PALETTE,
} from '../planLayout';
import {
  getThemeColorsForCategory,
  identifyCategorySlug,
  computePlanSummary,
  calculateRoomBounds,
  compute3DPoints
} from '../utils/planCalculations';
import {
  RotateCcw,
  Trash2,
  Settings,
  X,
  Activity,
  Layers,
  Box as BoxIcon,
  Grid,
} from 'lucide-react';

type Props = {
  plan2d: Plan2dData;
  plan3d?: unknown;
  config?: EstimateBlueprintConfig | null;
  categoryName?: string;
  onChange?: (plan: Plan2dData) => void;
  readOnly?: boolean;
};

// ==========================================
// SCENE RENDER ENGINE
// ==========================================

type SceneProps = {
  layoutRooms: ReturnType<typeof normalizeRoomLayout>;
  wallHeight: number;
  selectedPointId: string | null;
  onSelectPoint: (id: string | null) => void;
  readOnly: boolean;
  categorySlug: string;
  points3d: Array<{
    id: string;
    roomId?: string;
    type: string;
    label: string;
    x: number;
    z: number;
    elevation: number;
    color: string;
  }>;
};

function SceneContent({
  layoutRooms,
  wallHeight,
  selectedPointId,
  onSelectPoint,
  readOnly,
  categorySlug,
  points3d,
}: SceneProps) {

  // Color mapping based on category slug for beautiful visual vibes
  const themeColors = useMemo(() => getThemeColorsForCategory(categorySlug), [categorySlug]);

  const selectedPoint = useMemo(() => {
    return points3d.find((p) => p.id === selectedPointId);
  }, [points3d, selectedPointId]);

  return (
    <group>
      {/* 3D ROOM FLOOR GRIDS & SOLID BACK-WALLS */}
      {layoutRooms.map((room, roomIdx) => {
        const roomColor = ROOM_PALETTE[roomIdx % ROOM_PALETTE.length] ?? '#312e81';

        return (
          <group key={`room-${room.id}`}>
            {/* FLOORS */}
            <group position={[room.layoutX + room.width / 2, 0, room.layoutY + room.height / 2]}>
              <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[room.width, room.height]} />
                <meshStandardMaterial color={themeColors.floor} roughness={0.65} metalness={0.15} />
              </mesh>

              {/* Room perimeter frames */}
              <line>
                <bufferGeometry attach="geometry" onUpdate={(self) => {
                  const halfW = room.width / 2;
                  const halfH = room.height / 2;
                  self.setFromPoints([
                    new THREE.Vector3(-halfW, 0.001, -halfH),
                    new THREE.Vector3(halfW, 0.001, -halfH),
                    new THREE.Vector3(halfW, 0.001, halfH),
                    new THREE.Vector3(-halfW, 0.001, halfH),
                    new THREE.Vector3(-halfW, 0.001, -halfH),
                  ]);
                }} />
                <lineBasicMaterial attach="material" color={themeColors.border} linewidth={2} />
              </line>

              {/* Fine scaling grids (1m increments) */}
              {Array.from({ length: Math.ceil(room.width) - 1 }).map((_, i) => {
                const posX = -room.width / 2 + (i + 1);
                return (
                  <line key={`grid-x-${i}`}>
                    <bufferGeometry attach="geometry" onUpdate={(self) => {
                      self.setFromPoints([
                        new THREE.Vector3(posX, 0.0015, -room.height / 2),
                        new THREE.Vector3(posX, 0.0015, room.height / 2)
                      ]);
                    }} />
                    <lineBasicMaterial attach="material" color={themeColors.grid} transparent opacity={0.25} />
                  </line>
                );
              })}
              {Array.from({ length: Math.ceil(room.height) - 1 }).map((_, i) => {
                const posZ = -room.height / 2 + (i + 1);
                return (
                  <line key={`grid-z-${i}`}>
                    <bufferGeometry attach="geometry" onUpdate={(self) => {
                      self.setFromPoints([
                        new THREE.Vector3(-room.width / 2, 0.0015, posZ),
                        new THREE.Vector3(room.width / 2, 0.0015, posZ)
                      ]);
                    }} />
                    <lineBasicMaterial attach="material" color={themeColors.grid} transparent opacity={0.25} />
                  </line>
                );
              })}
            </group>

            {/* SOLID NORTH WALLS (BACK WALLS) */}
            <mesh castShadow receiveShadow position={[room.layoutX + room.width / 2, wallHeight / 2, room.layoutY]}>
              <boxGeometry args={[room.width, wallHeight, 0.03]} />
              <meshStandardMaterial color={roomColor} transparent opacity={0.25} roughness={0.4} metalness={0.1} />
            </mesh>

            {/* SOLID WEST WALLS (BACK WALLS) */}
            <mesh castShadow receiveShadow position={[room.layoutX, wallHeight / 2, room.layoutY + room.height / 2]}>
              <boxGeometry args={[0.03, wallHeight, room.height]} />
              <meshStandardMaterial color={roomColor} transparent opacity={0.25} roughness={0.4} metalness={0.1} />
            </mesh>

            {/* DASHED WIREFRAME FRONT WALLS (Allows looking inside easily) */}
            {/* South outline */}
            <line>
              <bufferGeometry attach="geometry" onUpdate={(self) => {
                self.setFromPoints([
                  new THREE.Vector3(room.layoutX, 0, room.layoutY + room.height),
                  new THREE.Vector3(room.layoutX + room.width, 0, room.layoutY + room.height),
                  new THREE.Vector3(room.layoutX + room.width, wallHeight, room.layoutY + room.height),
                  new THREE.Vector3(room.layoutX, wallHeight, room.layoutY + room.height),
                  new THREE.Vector3(room.layoutX, 0, room.layoutY + room.height),
                ]);
              }} />
              <lineBasicMaterial attach="material" color={roomColor} transparent opacity={0.3} />
            </line>
            {/* East outline */}
            <line>
              <bufferGeometry attach="geometry" onUpdate={(self) => {
                self.setFromPoints([
                  new THREE.Vector3(room.layoutX + room.width, 0, room.layoutY),
                  new THREE.Vector3(room.layoutX + room.width, 0, room.layoutY + room.height),
                  new THREE.Vector3(room.layoutX + room.width, wallHeight, room.layoutY + room.height),
                  new THREE.Vector3(room.layoutX + room.width, wallHeight, room.layoutY),
                  new THREE.Vector3(room.layoutX + room.width, 0, room.layoutY),
                ]);
              }} />
              <lineBasicMaterial attach="material" color={roomColor} transparent opacity={0.3} />
            </line>

            {/* FLOATING TEXT LABELS (Renders via sleek floating glass HTML overlay) */}
            <Html
              position={[room.layoutX + room.width / 2, wallHeight + 0.35, room.layoutY + room.height / 2]}
              center
              distanceFactor={8}
            >
              <div className="rounded-xl border border-white/10 bg-slate-950/85 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow-xl backdrop-blur select-none pointer-events-none whitespace-nowrap">
                {room.name}
              </div>
            </Html>
          </group>
        );
      })}

      {/* 3D OBJECT NODES */}
      {points3d.map((pt) => {
        const isSelected = pt.id === selectedPointId;

        return (
          <group
            key={`point3d-${pt.id}`}
            position={[pt.x, pt.elevation, pt.z]}
            onClick={(e) => {
              e.stopPropagation();
              if (!readOnly) onSelectPoint(pt.id);
            }}
          >
            {/* Pulsing indicator orb around selected mesh */}
            {isSelected && (
              <mesh>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshBasicMaterial color={pt.color} transparent opacity={0.22} depthWrite={false} />
              </mesh>
            )}

            {/* The 3D Procedural Model itself */}
            <ProceduralModel type={pt.type} color={pt.color} />

            {/* Floating item tag label */}
            <Html position={[0, 0.32, 0]} center distanceFactor={6}>
              <div
                className={`rounded-lg border px-2 py-0.5 text-[8.5px] font-black select-none pointer-events-none transition-all ${
                  isSelected
                    ? 'bg-violet-600 text-white border-violet-400/50 scale-110 shadow-lg shadow-violet-500/20'
                    : 'bg-slate-900/80 text-slate-300 border-white/10'
                }`}
              >
                {pt.label}
              </div>
            </Html>
          </group>
        );
      })}

      {/* FLOATING CAD STALK HELPER FOR SELECTED ITEM */}
      {selectedPoint && (
        <group>
          {/* Sleek translucent alignment pillar connecting object to floor */}
          <mesh position={[selectedPoint.x, selectedPoint.elevation / 2, selectedPoint.z]}>
            <cylinderGeometry args={[0.005, 0.005, selectedPoint.elevation, 8]} />
            <meshBasicMaterial color={selectedPoint.color} transparent opacity={0.5} />
          </mesh>
          {/* Target circle marker on floor */}
          <mesh position={[selectedPoint.x, 0.015, selectedPoint.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.15, 32]} />
            <meshBasicMaterial color={selectedPoint.color} side={THREE.DoubleSide} transparent opacity={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ==========================================
// MAIN COMPONENT & INSPECTOR PANEL
// ==========================================

export function PlanPreview3D({
  plan2d,
  config,
  categoryName,
  onChange,
  readOnly,
}: Props) {
  // UI adjust states
  const [wallHeight, setWallHeight] = useState(WALL_HEIGHT_M); // 1.0m to 3.5m
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [cameraKey, setCameraKey] = useState(0); // For dynamic rebuild / reset view

  // Identify room layouts
  const layoutRooms = useMemo(() => normalizeRoomLayout(plan2d.rooms), [plan2d.rooms]);

  // Compute 3D point positions
  const points3d = useMemo(() => {
    return compute3DPoints(plan2d.points, layoutRooms, config);
  }, [plan2d.points, layoutRooms, config]);

  // Compute Layout Center for targeting OrbitControls
  const bounds = useMemo(() => calculateRoomBounds(layoutRooms), [layoutRooms]);

  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerZ = (bounds.minZ + bounds.maxZ) / 2;

  // Identify active category slug
  const categorySlug = useMemo(() => identifyCategorySlug(plan2d.points), [plan2d.points]);

  // CAD HUD control trigger keys
  const resetView = () => {
    setCameraKey((prev) => prev + 1);
    setWallHeight(WALL_HEIGHT_M);
    setSelectedPointId(null);
  };

  const selectedPoint = useMemo(() => {
    return points3d.find((p) => p.id === selectedPointId);
  }, [points3d, selectedPointId]);

  const summary = useMemo(() => computePlanSummary(plan2d, config), [plan2d, config]);

  if (!layoutRooms.length) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-400">
        Adăugați camere în planul 2D pentru previzualizare 3D.
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
      {/* 3D Viewport Box */}
      <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 shadow-premium overflow-hidden relative">
        {/* Header section inside viewport */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4 select-none relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">
                {categoryName ?? 'Plan obiect'} · Interactive 3D WebGL
              </p>
            </div>
            <h3 className="font-bold text-white text-lg mt-0.5">Vizualizare interactivă deviz</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {summary.roomCount} camere · {summary.area.toFixed(1)} m² · înălțime {wallHeight.toFixed(1)} m
            </p>
          </div>
          {summary.pointSummary.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-w-md">
              {summary.pointSummary.map((item) => (
                <span
                  key={item.type}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold text-white/90"
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label} · {item.count}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* The ThreeJS Canvas Container */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-0.5 overflow-hidden h-[440px] relative select-none cursor-grab active:cursor-grabbing shadow-inner">
          {/* Glassmorphic CAD HUD Floating Panel */}
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-white/10 px-3 py-2 rounded-2xl shadow-2xl z-20">
            <button
              type="button"
              onClick={resetView}
              title="Resetează Vederea"
              className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-white/10" />
            <button
              type="button"
              onClick={() => setSelectedPointId(null)}
              title="Deselectează obiect"
              disabled={!selectedPointId}
              className="p-1.5 text-slate-300 hover:text-white disabled:text-slate-600 disabled:hover:bg-transparent rounded-xl hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-white/10" />
            <div className="text-[9px] font-bold text-violet-300 tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> WebGL ACTIVE
            </div>
          </div>

          {/* Helper CAD legend floating overlay */}
          <div className="absolute bottom-4 left-4 bg-slate-900/75 backdrop-blur border border-white/10 px-3 py-1.5 rounded-xl shadow-lg z-20 text-[9px] font-black tracking-wider text-slate-400 select-none uppercase space-y-1">
            <div className="flex items-center gap-1.5"><Layers className="w-3 h-3 text-violet-400" /> Click stânga drag: Rotește scenă</div>
            <div className="flex items-center gap-1.5"><BoxIcon className="w-3 h-3 text-sky-400" /> Click dreapta drag: Pan / Mișcă camera</div>
            <div className="flex items-center gap-1.5"><Grid className="w-3 h-3 text-emerald-400" /> Scroll / Click obiect: Zoom & selectare</div>
          </div>

          <Canvas
            key={cameraKey}
            frameloop="demand"
            shadows
            camera={{ position: [centerX, 6, centerZ + 8], fov: 40 }}
            gl={{ antialias: true, alpha: false, preserveDrawingBuffer: false }}
            onPointerDown={(e) => {
              // Click empty space to deselect
              if (e.target === e.currentTarget) {
                setSelectedPointId(null);
              }
            }}
          >
            <color attach="background" args={['#090d16']} />
            
            {/* Sleek architectural dynamic lighting */}
            <ambientLight intensity={0.7} />
            <directionalLight
              position={[10, 15, 8]}
              intensity={0.8}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            {/* Subtle floating glow light source centered over selected item */}
            {selectedPoint && (
              <pointLight
                position={[
                  selectedPoint.x ?? centerX,
                  (selectedPoint.elevation ?? 1) + 0.5,
                  selectedPoint.z ?? centerZ
                ]}
                color={getPointTypeMeta(selectedPoint.type, config).color}
                intensity={1.2}
                distance={4}
                decay={2}
              />
            )}
            
            <SceneContent
              layoutRooms={layoutRooms}
              wallHeight={wallHeight}
              selectedPointId={selectedPointId}
              onSelectPoint={setSelectedPointId}
              readOnly={!!readOnly}
              categorySlug={categorySlug}
              points3d={points3d}
            />

            <OrbitControls
              makeDefault
              maxPolarAngle={Math.PI / 2.05} // stops camera from dipping below the floors
              minDistance={3}
              maxDistance={30}
              target={[centerX, 0, centerZ]}
              enableDamping
              dampingFactor={0.05}
            />
          </Canvas>
        </div>
      </div>

      {/* Adjustments & Precision Sidebar Inspector */}
      <div className="space-y-4">
        {/* Wall Height Adjustment */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-premium space-y-4">
          <div className="flex items-center gap-2.5 text-violet-600 font-bold text-sm">
            <Settings className="w-4 h-4 text-violet-600 animate-spin" />
            <span>Ajustări Vizualizare 3D</span>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-500 font-semibold mb-1">
              <span>Înălțime Pereți Model:</span>
              <span className="font-bold text-violet-700">{wallHeight.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.5"
              step="0.1"
              value={wallHeight}
              onChange={(e) => setWallHeight(Number(e.target.value))}
              className="w-full accent-violet-600 cursor-pointer h-1.5 bg-gray-100 rounded-lg appearance-none"
            />
          </div>
          <div className="text-[10px] text-gray-400 font-semibold leading-relaxed">
            * Faceți click stânga pe un obiect direct în spațiul 3D pentru a deschide inspectorul de poziție precis.
          </div>
        </div>

        {/* Selected Point Properties Inspector Drawer */}
        {!readOnly && onChange && selectedPointId && (
          <div className="rounded-3xl border border-violet-200 bg-violet-50/20 p-5 shadow-premium space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-violet-100 pb-2">
              <div>
                <h4 className="font-black text-violet-950 text-sm">3D Inspector Punct</h4>
                <p className="text-[9px] text-violet-600 uppercase tracking-wider font-bold mt-0.5">
                  Editare directă în model 3D
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPointId(null)}
                className="text-slate-400 hover:text-slate-700 rounded-full p-1 hover:bg-slate-100/50"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {(() => {
              const point = plan2d.points.find((p) => p.id === selectedPointId);
              if (!point) return <p className="text-xs text-gray-400">Punctul a fost șters.</p>;
              const meta = getPointTypeMeta(point.type, config);
              const currentElev = point.elevation ?? 1.05;

              return (
                <div className="space-y-4">
                  <label className="block text-xs font-semibold text-gray-500">
                    Etichetă obiect
                    <input
                      value={point.label ?? ''}
                      onChange={(e) => {
                        onChange({
                          ...plan2d,
                          points: plan2d.points.map((p) =>
                            p.id === point.id ? { ...p, label: e.target.value } : p
                          ),
                        });
                      }}
                      placeholder={meta.label}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all shadow-xs"
                    />
                  </label>

                  {/* Z height slider inside 3D inspector */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 font-semibold mb-1">
                      <span>Cota înălțime (Z):</span>
                      <span className="font-bold text-violet-700">{currentElev.toFixed(2)} m</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="2.8"
                      step="0.05"
                      value={currentElev}
                      onChange={(e) => {
                        onChange({
                          ...plan2d,
                          points: plan2d.points.map((p) =>
                            p.id === point.id ? { ...p, elevation: Number(e.target.value) } : p
                          ),
                        });
                      }}
                      className="w-full accent-violet-600 cursor-pointer h-1.5 bg-gray-100 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[8px] text-gray-400 font-bold mt-1 uppercase">
                      <span>Podea (0.0m)</span>
                      <span>Mijloc (1.2m)</span>
                      <span>Tavan (2.8m)</span>
                    </div>
                  </div>

                  {/* Real-time X/Y precision positioning */}
                  <div className="space-y-2 border-t border-gray-100 pt-3">
                    <span className="block text-xs font-bold text-slate-600">Ajustare Poziție (Lățime/Adâncime)</span>
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                        <span>Lățime camera (X):</span>
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
                            ...plan2d,
                            points: plan2d.points.map((p) =>
                              p.id === point.id ? { ...p, x: Number(e.target.value) / 100 } : p
                            ),
                          });
                        }}
                        className="w-full accent-indigo-600 cursor-pointer h-1 bg-gray-200 rounded-lg appearance-none"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                        <span>Lungime camera (Y):</span>
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
                            ...plan2d,
                            points: plan2d.points.map((p) =>
                              p.id === point.id ? { ...p, y: Number(e.target.value) / 100 } : p
                            ),
                          });
                        }}
                        className="w-full accent-indigo-600 cursor-pointer h-1 bg-gray-200 rounded-lg appearance-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...plan2d,
                        points: plan2d.points.filter((p) => p.id !== point.id),
                      });
                      setSelectedPointId(null);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer active:scale-98"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Șterge din 3D
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
