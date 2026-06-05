import { useTranslation } from 'react-i18next';
import { CheckCircleIcon, CloudSlashIcon, CircleNotchIcon, ArrowsCounterClockwiseIcon, WifiSlashIcon } from '@phosphor-icons/react';
import type { OfflineSyncState } from '../offline/useEstimateOfflineCache';

type Props = {
  online: boolean;
  syncState: OfflineSyncState;
  pendingMutations: number;
  lastSavedAt?: number;
  lastSyncedAt?: number;
  onSyncNow?: () => void;
  syncing?: boolean;
};

function formatTime(ts: number | undefined): string {
  if (!ts) return '—';
  const date = new Date(ts);
  return date.toLocaleTimeString('ro-MD', { hour: '2-digit', minute: '2-digit' });
}

export function OfflineBanner({
  online,
  syncState,
  pendingMutations,
  lastSavedAt,
  lastSyncedAt,
  onSyncNow,
  syncing,
}: Props) {
  const { t } = useTranslation();
  const isError = syncState === 'error';
  const offline = !online;
  const hasPending = pendingMutations > 0;

  if (!offline && !hasPending && !isError && syncState !== 'syncing') {
    if (!lastSavedAt) return null;
    return (
      <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700">
        <CheckCircleIcon className="size-3.5" />
        <span>
          {t('company.estimateWizard.offline.savedAt', { time: formatTime(lastSavedAt) })}
        </span>
      </div>
    );
  }

  const tone = offline
    ? 'border-amber-200 bg-amber-50 text-amber-900'
    : isError
      ? 'border-rose-200 bg-rose-50 text-rose-900'
      : 'border-violet-200 bg-violet-50 text-violet-900';

  const Icon = offline
    ? WifiSlashIcon
    : isError
      ? CloudSlashIcon
      : syncState === 'syncing'
        ? CircleNotchIcon
        : CheckCircleIcon;

  const message = offline
    ? t('company.estimateWizard.offline.offline')
    : isError
      ? t('company.estimateWizard.offline.error', { count: pendingMutations })
      : syncState === 'syncing'
        ? t('company.estimateWizard.offline.syncing', { count: pendingMutations })
        : t('company.estimateWizard.offline.savedAt', { time: formatTime(lastSavedAt) });

  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs ${tone}`}>
      <div className="inline-flex items-center gap-2">
        <Icon className={`size-4 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
        <span className="font-semibold">{message}</span>
        {lastSyncedAt && !offline && (
          <span className="opacity-70">
            · {t('company.estimateWizard.offline.lastSync', { time: formatTime(lastSyncedAt) })}
          </span>
        )}
      </div>
      {(offline || isError || hasPending) && onSyncNow && online && (
        <button
          type="button"
          onClick={onSyncNow}
          disabled={syncing}
          className="inline-flex items-center gap-1 rounded-lg border border-current/30 px-2 py-1 text-[11px] font-semibold transition-colors hover:bg-white/40 disabled:opacity-60"
        >
          <ArrowsCounterClockwiseIcon className={`size-3 ${syncing ? 'animate-spin' : ''}`} />
          {t('company.estimateWizard.offline.syncNow')}
        </button>
      )}
    </div>
  );
}
