import { ApiError } from './apiError';
import type { ApiEnvelope } from './types';

export function pathOnly(apiPath: string): string {
  return apiPath.split('?')[0] ?? apiPath;
}

export function composeAbortSignal(
  external: AbortSignal | null | undefined,
  timeoutMs: number,
): { signal: AbortSignal; cancelTimer: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new DOMException('Request timeout', 'TimeoutError')),
    timeoutMs,
  );
  const onExternalAbort = () => controller.abort(external?.reason);
  if (external) {
    if (external.aborted) controller.abort(external.reason);
    else external.addEventListener('abort', onExternalAbort, { once: true });
  }
  const cancelTimer = () => {
    clearTimeout(timer);
    external?.removeEventListener('abort', onExternalAbort);
  };
  return { signal: controller.signal, cancelTimer };
}

export async function throwIfNotOk(res: Response): Promise<void> {
  if (res.ok) return;

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = undefined;
  }

  const raw =
    typeof body === 'object' && body && 'message' in body
      ? (body as { message: string | string[] }).message
      : undefined;
  const message = Array.isArray(raw) ? raw.join(', ') : raw ? String(raw) : res.statusText;
  throw new ApiError(message, res.status, body);
}

export function unwrapEnvelope<T>(json: unknown): T {
  const envelope = json as ApiEnvelope<T>;
  if (json && typeof json === 'object' && envelope.success === true && 'data' in envelope) {
    return envelope.data as T;
  }
  return json as T;
}
