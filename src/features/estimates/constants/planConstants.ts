export const CATEGORY_THEME_COLORS: Record<string, { floor: string; border: string; grid: string }> = {
  santehnika: { floor: '#0f172a', border: '#38bdf8', grid: '#0ea5e9' }, // Blue plumbing vibe
  elektrika: { floor: '#0b1329', border: '#a855f7', grid: '#c084fc' }, // Cyber-violet electrical vibe
  plitka: { floor: '#1e293b', border: '#10b981', grid: '#34d399' }, // Emerald tile alignment vibe
  'kondicionery-otoplenie': { floor: '#111827', border: '#f97316', grid: '#fb923c' }, // Orange heating vibe
  default: { floor: '#0f172a', border: '#6366f1', grid: '#818cf8' }, // Indigo default
};

export const DEFAULT_BOUNDS = { minX: 0, maxX: 8, minZ: 0, maxZ: 6 };
