/**
 * Frontend mirror of backend deriveOknaDveriMeasurements (windows-doors-measurements.util.ts).
 * Diagnostic-only (no plan2d). Closes the preview gap for install-labor counts,
 * sills, slopes, foam and removal quantities.
 */

function readNumber(source: Record<string, unknown> | null | undefined, key: string): number | undefined {
  const value = source?.[key];
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function readBoolean(source: Record<string, unknown> | null | undefined, key: string): boolean {
  const value = source?.[key];
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return false;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function resolveInstallationMultiplier(installationType: unknown): number {
  const n = String(installationType ?? 'standard').trim().toLowerCase().replace(/_/g, '-');
  if (n === 'warm-installation' || n === 'warm') return 1.35;
  if (n === 'renovation') return 1.2;
  return 1.0;
}

export type DerivedMeasurements = Record<string, number>;

export function deriveOknaDveriMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
): DerivedMeasurements {
  const m: DerivedMeasurements = {};
  if (!diagnostic) return m;

  m.windowCount = Math.max(0, readNumber(diagnostic, 'windowCount') ?? 0);
  m.doorCount = Math.max(0, readNumber(diagnostic, 'doorCount') ?? 0);

  const openingCount = m.windowCount + m.doorCount;
  m.foamTubes = Math.ceil(openingCount * 0.7);

  const sillCount = readNumber(diagnostic, 'sillCount') ?? m.windowCount;
  m.sillCount = sillCount;
  m.sillLengthM = round2(sillCount * 1.2);
  m.mosquitoNetCount = readNumber(diagnostic, 'mosquitoNetCount') ?? 0;

  const installationMultiplier = resolveInstallationMultiplier(diagnostic.installationType);
  m.installationMultiplier = installationMultiplier;
  m.windowCountLabor = round2(m.windowCount * installationMultiplier);
  m.doorCountLabor = round2(m.doorCount * installationMultiplier);

  m.oldRemovalQty = readBoolean(diagnostic, 'oldFrameRemoval') ? openingCount : 0;
  m.disposalQty = m.oldRemovalQty;

  const installationType = String(diagnostic.installationType ?? 'standard').toLowerCase();
  m.warmInstallationUnits =
    installationType === 'warm_installation' || installationType === 'warm-installation'
      ? openingCount
      : 0;

  m.measurementUnits = openingCount > 0 ? 1 : 0;
  m.slopesLengthM = m.sillLengthM;
  m.regulationUnits = openingCount;

  return m;
}
