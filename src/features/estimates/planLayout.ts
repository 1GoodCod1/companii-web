import type { EstimateBlueprintConfig, Plan2dData, Plan2dPoint, Plan2dRoom } from './types';

export const PX_PER_M = 44;
const ROOM_GAP_M = 0.6;
const WALL_HEIGHT_M = 2.7;

export type LayoutRoom = Plan2dRoom & {
  layoutX: number;
  layoutY: number;
};

export type Plan3dPreview = {
  rooms: Array<{
    id: string;
    name: string;
    width: number;
    depth: number;
    height: number;
    x: number;
    z: number;
    color: string;
  }>;
  points: Array<{
    id: string;
    roomId?: string;
    type: string;
    label?: string;
    x: number;
    z: number;
    elevation: number;
    color: string;
  }>;
};

const ROOM_WALL = ['#6366f1', '#2563eb', '#16a34a', '#d97706', '#dc2626', '#ea580c'];

const CATEGORY_ROOM_TEMPLATES: Record<string, Array<{ name: string; width: number; height: number }>> = {
  santehnika: [
    { name: 'Baie', width: 2.4, height: 2.2 },
    { name: 'Bucătărie', width: 3.2, height: 2.8 },
  ],
  elektrika: [
    { name: 'Living', width: 5, height: 4.2 },
    { name: 'Dormitor', width: 3.6, height: 3.4 },
    { name: 'Hol', width: 2.2, height: 1.8 },
  ],
  plitka: [
    { name: 'Baie', width: 2.6, height: 2.4 },
    { name: 'Bucătărie', width: 3.5, height: 3 },
  ],
  'kondicionery-otoplenie': [
    { name: 'Living', width: 4.5, height: 4 },
    { name: 'Dormitor', width: 3.5, height: 3.2 },
  ],
  'otdelochnye-raboty': [
    { name: 'Cameră principală', width: 4.8, height: 4.5 },
    { name: 'Cameră secundară', width: 3.2, height: 3 },
  ],
};

export function getPointTypeMeta(
  type: string,
  config?: EstimateBlueprintConfig | null,
): { label: string; color: string } {
  const match = config?.planPointTypes.find((item) => item.type === type);
  return {
    label: match?.label ?? type,
    color: match?.color ?? '#6366f1',
  };
}

export function defaultRoomsForCategory(categorySlug?: string): Plan2dRoom[] {
  const templates =
    (categorySlug && CATEGORY_ROOM_TEMPLATES[categorySlug]) ||
    [{ name: 'Cameră 1', width: 4, height: 3.5 }];

  let cursorX = 0;
  return templates.map((template) => {
    const room: Plan2dRoom = {
      id: crypto.randomUUID(),
      name: template.name,
      width: template.width,
      height: template.height,
      x: cursorX,
      y: 0,
      unit: 'm',
    };
    cursorX += template.width + ROOM_GAP_M;
    return room;
  });
}

export function normalizeRoomLayout(rooms: Plan2dRoom[]): LayoutRoom[] {
  let cursorX = 0;
  return rooms.map((room) => {
    const layoutX = room.x ?? cursorX;
    const layoutY = room.y ?? 0;
    cursorX = Math.max(cursorX, layoutX + room.width + ROOM_GAP_M);
    return { ...room, layoutX, layoutY };
  });
}

export function layoutBounds(rooms: LayoutRoom[]): { width: number; height: number } {
  if (!rooms.length) return { width: 8, height: 6 };
  const maxX = Math.max(...rooms.map((room) => room.layoutX + room.width));
  const maxY = Math.max(...rooms.map((room) => room.layoutY + room.height));
  return {
    width: Math.max(8, maxX + 1.2),
    height: Math.max(6, maxY + 1.2),
  };
}

export function pointPositionInRoom(
  room: LayoutRoom,
  point: Plan2dPoint,
  indexInRoom: number,
): { x: number; y: number } {
  if (point.x != null && point.y != null) {
    return {
      x: room.layoutX + point.x * room.width,
      y: room.layoutY + point.y * room.height,
    };
  }

  const cols = Math.max(2, Math.ceil(Math.sqrt(indexInRoom + 1)));
  const col = indexInRoom % cols;
  const row = Math.floor(indexInRoom / cols);
  return {
    x: room.layoutX + 0.35 + col * 0.55,
    y: room.layoutY + 0.35 + row * 0.55,
  };
}

export function buildClientPlan3d(
  plan2d: Plan2dData,
  config?: EstimateBlueprintConfig | null,
): Plan3dPreview | null {
  if (!plan2d.rooms.length) return null;

  const layout = normalizeRoomLayout(plan2d.rooms);

  return {
    rooms: layout.map((room, index) => ({
      id: room.id,
      name: room.name,
      width: room.width,
      depth: room.height,
      height: WALL_HEIGHT_M,
      x: room.layoutX,
      z: room.layoutY,
      color: ROOM_WALL[index % ROOM_WALL.length],
    })),
    points: plan2d.points.map((point) => {
      const room = layout.find((item) => item.id === point.roomId);
      const roomPoints = plan2d.points.filter((item) => item.roomId === point.roomId);
      const indexInRoom = roomPoints.findIndex((item) => item.id === point.id);
      const position = room
        ? pointPositionInRoom(room, point, Math.max(0, indexInRoom))
        : { x: 0.5, y: 0.5 };
      const meta = getPointTypeMeta(point.type, config);
      return {
        id: point.id,
        roomId: point.roomId,
        type: point.type,
        label: point.label ?? meta.label,
        x: position.x,
        z: position.y,
        elevation: 1.05,
        color: meta.color,
      };
    }),
  };
}

export function summarizePlan(plan2d: Plan2dData, config?: EstimateBlueprintConfig | null) {
  const area = plan2d.rooms.reduce((acc, room) => acc + room.width * room.height, 0);
  const counts = new Map<string, number>();
  for (const point of plan2d.points) {
    counts.set(point.type, (counts.get(point.type) ?? 0) + 1);
  }

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
