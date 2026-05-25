import type { Plan2dData, EstimateBlueprintConfig, Plan2dPoint } from '../types';
import { getPointTypeMeta, normalizeRoomLayout } from '../planLayout';
import { CATEGORY_THEME_COLORS, DEFAULT_BOUNDS } from '../constants/planConstants';

export function getThemeColorsForCategory(categorySlug: string) {
  return CATEGORY_THEME_COLORS[categorySlug] || CATEGORY_THEME_COLORS.default;
}

export function identifyCategorySlug(points: Plan2dPoint[]) {
  const isElectric = points.some((p) => ['socket', 'switch', 'light', 'panel'].includes(p.type));
  const isPlumbing = points.some((p) => ['toilet', 'water', 'mixer'].includes(p.type));
  if (isElectric) return 'elektrika';
  if (isPlumbing) return 'santehnika';
  return 'default';
}

export function computePlanSummary(plan2d: Plan2dData, config?: EstimateBlueprintConfig | null) {
  const counts = new Map<string, number>();
  for (const point of plan2d.points) {
    counts.set(point.type, (counts.get(point.type) ?? 0) + 1);
  }
  const area = plan2d.rooms.reduce((acc, room) => acc + room.width * room.height, 0);
  return {
    area,
    roomCount: plan2d.rooms.length,
    pointSummary: Array.from(counts.entries()).map(([type, count]) => ({
      ...getPointTypeMeta(type, config),
      type,
      count,
    })),
  };
}

export function calculateRoomBounds(layoutRooms: ReturnType<typeof normalizeRoomLayout>) {
  if (!layoutRooms.length) return DEFAULT_BOUNDS;
  const minX = Math.min(...layoutRooms.map((r) => r.layoutX));
  const maxX = Math.max(...layoutRooms.map((r) => r.layoutX + r.width));
  const minZ = Math.min(...layoutRooms.map((r) => r.layoutY));
  const maxZ = Math.max(...layoutRooms.map((r) => r.layoutY + r.height));
  return { minX, maxX, minZ, maxZ };
}

export function compute3DPoints(
  points: Plan2dPoint[],
  layoutRooms: ReturnType<typeof normalizeRoomLayout>,
  config?: EstimateBlueprintConfig | null
) {
  return points.map((point) => {
    const room = layoutRooms.find((item) => item.id === point.roomId);
    const roomPoints = points.filter((item) => item.roomId === point.roomId);
    const indexInRoom = roomPoints.findIndex((item) => item.id === point.id);

    let xVal = 0;
    let zVal = 0;

    if (room) {
      if (point.x != null && point.y != null) {
        xVal = room.layoutX + point.x * room.width;
        zVal = room.layoutY + point.y * room.height;
      } else {
        const cols = Math.max(2, Math.ceil(Math.sqrt(indexInRoom + 1)));
        const col = indexInRoom % cols;
        const row = Math.floor(indexInRoom / cols);
        xVal = room.layoutX + 0.35 + col * 0.55;
        zVal = room.layoutY + 0.35 + row * 0.55;
      }
    }

    const meta = getPointTypeMeta(point.type, config);

    return {
      id: point.id,
      roomId: point.roomId,
      type: point.type,
      label: point.label ?? meta.label,
      x: xVal,
      z: zVal,
      elevation: point.elevation ?? 1.05,
      color: meta.color,
    };
  });
}
