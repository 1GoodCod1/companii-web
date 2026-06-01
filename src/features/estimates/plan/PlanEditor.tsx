import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, LayoutGrid, ListTree, MapPin } from 'lucide-react';
import type { Plan2dData, Plan2dRoom } from '@/types/estimates';
import {
  defaultRoomsForCategory,
  getPointTypeMeta,
  summarizePlan,
} from './planLayout';
import type { PlanEditorProps } from './types';
import { uid, defaultContextFromSlug } from './utils';
import { PlanGlobalParameters } from './PlanGlobalParameters';
import { PlanRoomsTable } from './PlanRoomsTable';
import { PlanWorkItemsPanel } from './PlanWorkItemsPanel';
import { PlanRoofGeometryPanel } from './PlanRoofGeometryPanel';
import { globalParamsHasValues } from './planWorksheetContent';

type PlanEditorTab = 'rooms' | 'items' | 'global' | 'preview';

const ALL_TABS: { key: PlanEditorTab; icon: React.FC<{ className?: string }> }[] = [
  { key: 'rooms', icon: MapPin },
  { key: 'items', icon: ListTree },
  { key: 'global', icon: Globe },
  { key: 'preview', icon: LayoutGrid },
];

export function PlanEditor({
  value,
  config,
  categoryName,
  categorySlug,
  onChange,
  readOnly,
  variant = 'wizard',
}: PlanEditorProps) {
  const { t } = useTranslation();
  const summary = useMemo(() => summarizePlan(value, config), [value, config]);
  const isWorksheet = variant === 'worksheet';

  const workContext = defaultContextFromSlug(categorySlug);
  const isFacade = workContext === 'facade';
  const isRoof = workContext === 'roof';
  const globalParams: NonNullable<Plan2dData['globalParameters']> = value.globalParameters ?? {
    workContext,
  };
  const showGlobalSection = !isWorksheet || globalParamsHasValues(globalParams);
  const showRoomsSection = !isWorksheet || value.rooms.length > 0;
  const showItemsSection = !isWorksheet || value.points.length > 0;

  const tabs = useMemo(
    () => {
      const base = isRoof
        ? ALL_TABS.filter((tab) => tab.key === 'global' || tab.key === 'preview')
        : isFacade
          ? ALL_TABS.filter((tab) => tab.key !== 'rooms')
          : ALL_TABS;
      if (!isWorksheet) return base;
      return base.filter((tab) => {
        if (tab.key === 'global') return showGlobalSection;
        if (tab.key === 'rooms') return showRoomsSection;
        if (tab.key === 'items') return showItemsSection;
        return false;
      });
    },
    [isFacade, isRoof, isWorksheet, showGlobalSection, showRoomsSection, showItemsSection],
  );
  const [mobileTab, setMobileTab] = useState<PlanEditorTab>(
    isFacade || isRoof ? 'global' : 'rooms',
  );

  const setGlobalParams = (patch: Partial<typeof globalParams>) => {
    onChange({
      ...value,
      globalParameters: {
        ...globalParams,
        ...patch,
        workContext,
      } as Plan2dData['globalParameters'],
    });
  };

  const addRoom = () => {
    const room: Plan2dRoom = {
      id: uid(),
      name: t('company.estimateWizard.planEditor.defaultRoomName', { index: value.rooms.length + 1 }),
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
        const label = pt.label ?? t('company.estimateWizard.planEditor.defaultCustomItem');
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
  }, [value.points, t]);

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

  const applyCategoryTemplate = () => {
    const defaultCtx = defaultContextFromSlug(categorySlug);
    onChange({
      ...value,
      rooms: defaultRoomsForCategory(categorySlug, t).map((r) => ({
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

  const setPointCounts = (counts: Record<string, number>) => {
    const validTypes = new Set((config?.planPointTypes ?? []).map((p) => p.type));
    const newPoints: typeof value.points = [];
    for (const [type, count] of Object.entries(counts)) {
      if (!validTypes.has(type)) continue;
      const meta = getPointTypeMeta(type, config);
      for (let i = 0; i < count; i++) {
        newPoints.push({
          id: uid(),
          type,
          label: meta.label,
          elevation: 1.05,
        });
      }
    }
    const customPoints = value.points.filter((p) => p.type === 'custom');
    onChange({ ...value, points: [...newPoints, ...customPoints] });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* I-04: Mobile tabs — visible on small screens only */}
      <div className="md:hidden flex rounded-2xl bg-slate-100 p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setMobileTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
              mobileTab === tab.key
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {t(`company.estimateWizard.planEditor.tab.${tab.key}`)}
          </button>
        ))}
      </div>

      {/* Desktop: all sections visible. Mobile: only active tab section. */}
      {isRoof ? (
        showGlobalSection ? (
        <div className={mobileTab === 'global' ? 'block' : 'hidden md:block'}>
          <PlanRoofGeometryPanel
            value={value}
            globalParams={globalParams}
            setGlobalParams={setGlobalParams}
            onChange={onChange}
            readOnly={readOnly}
          />
        </div>
        ) : null
      ) : (
        showGlobalSection ? (
        <div className={mobileTab === 'global' ? 'block' : 'hidden md:block'}>
          <PlanGlobalParameters
            globalParams={globalParams}
            setGlobalParams={setGlobalParams}
            readOnly={readOnly}
            categoryName={categoryName}
            categorySlug={categorySlug}
          />
        </div>
        ) : null
      )}

      {!isFacade && !isRoof && showRoomsSection && (
        <div className={mobileTab === 'rooms' ? 'block' : 'hidden md:block'}>
          <PlanRoomsTable
            value={value}
            readOnly={readOnly}
            summaryArea={summary.area}
            onAddRoom={addRoom}
            onUpdateRoom={updateRoom}
            onRemoveRoom={removeRoom}
            onApplyCategoryTemplate={applyCategoryTemplate}
          />
        </div>
      )}

      {!isRoof && showItemsSection && (
        <div className={mobileTab === 'items' ? 'block' : 'hidden md:block'}>
        <PlanWorkItemsPanel
          config={config}
          readOnly={readOnly}
          categorySlug={categorySlug}
          pointCounts={pointCounts}
          onAdjustPointCount={adjustPointCount}
          onSetPointCounts={setPointCounts}
          customCounters={customCounters}
          onAdjustCustomCount={adjustCustomCount}
        />
        </div>
      )}

      {mobileTab === 'preview' && (
        <div className="md:hidden rounded-3xl border border-slate-100 bg-white p-6 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
            {t('company.estimateWizard.planEditor.tab.preview')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">{t('company.estimateWizard.planEditor.roomsTable.title')}</p>
              <p className="text-xl font-black text-slate-900">{value.rooms.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">{t('company.estimateWizard.planEditor.previewTotalArea')}</p>
              <p className="text-xl font-black text-slate-900">{summary.area.toFixed(1)} m²</p>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-4 border border-indigo-100">
              <p className="text-xs text-indigo-600">{t('company.estimateWizard.planEditor.previewPoints')}</p>
              <p className="text-xl font-black text-indigo-700">{value.points.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">{t('company.estimateWizard.planEditor.previewRooms')}</p>
              <div className="text-sm font-semibold text-slate-800 mt-1 space-y-0.5">
                {summary.pointSummary.slice(0, 3).map((pt) => (
                  <div key={pt.type} className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: pt.color }}
                      />
                      {pt.label}
                    </span>
                    <span className="font-black">{pt.count}</span>
                  </div>
                ))}
                {summary.pointSummary.length > 3 && (
                  <p className="text-xs text-slate-400">
                    +{summary.pointSummary.length - 3} {t('company.estimateWizard.planEditor.previewMore')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}