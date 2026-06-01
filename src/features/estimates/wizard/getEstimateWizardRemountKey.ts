import type { EstimateProjectDto } from '@/types/estimates';

function readClientFeedback(
  raw: EstimateProjectDto['clientFeedback'],
): Array<{ kind?: string; createdAt?: string }> {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw as string);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Forces wizard remount when server-side estimate revision changes (e.g. client feedback). */
export function getEstimateWizardRemountKey(
  project: Pick<EstimateProjectDto, 'id' | 'status' | 'clientFeedback'>,
): string {
  const feedback = readClientFeedback(project.clientFeedback);
  const last = feedback.at(-1);
  return `${project.id}:${project.status}:${feedback.length}:${last?.createdAt ?? ''}:${last?.kind ?? ''}`;
}
