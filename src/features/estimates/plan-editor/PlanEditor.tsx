import { useMemo } from 'react';
import type { Plan2dData, Plan2dRoom } from '@/types/estimates';
import {
  defaultRoomsForCategory,
  getPointTypeMeta,
  summarizePlan,
} from '../planLayout';
import type { PlanEditorProps } from './types';
import { uid, defaultContextFromSlug } from './utils';
import { PlanGlobalParameters } from './PlanGlobalParameters';
import { PlanRoomsTable } from './PlanRoomsTable';
import { PlanWorkItemsPanel } from './PlanWorkItemsPanel';

export function PlanEditor({
  value,
  config,
  categoryName,
  categorySlug,
  onChange,
  readOnly,
}: PlanEditorProps) {
  const summary = useMemo(() => summarizePlan(value, config), [value, config]);

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
      } as Plan2dData['globalParameters'],
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
      <PlanGlobalParameters
        globalParams={globalParams}
        setGlobalParams={setGlobalParams}
        readOnly={readOnly}
        categoryName={categoryName}
      />

      <PlanRoomsTable
        value={value}
        readOnly={readOnly}
        summaryArea={summary.area}
        onAddRoom={addRoom}
        onUpdateRoom={updateRoom}
        onRemoveRoom={removeRoom}
        onApplyCategoryTemplate={applyCategoryTemplate}
      />

      <PlanWorkItemsPanel
        config={config}
        readOnly={readOnly}
        pointCounts={pointCounts}
        onAdjustPointCount={adjustPointCount}
        customCounters={customCounters}
        onAdjustCustomCount={adjustCustomCount}
      />
    </div>
  );
}
