export function readNumber(
  source: Record<string, unknown> | null | undefined,
  key: string,
): number | undefined {
  const value = source?.[key];
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

export function readBoolean(
  source: Record<string, unknown> | null | undefined,
  key: string,
): boolean {
  const value = source?.[key];
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return false;
}

export function readSelect(
  source: Record<string, unknown> | null | undefined,
  key: string,
): string {
  const value = source?.[key];
  if (typeof value === 'string' && value.trim() !== '') return value.trim();
  return '';
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}