import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import type { EstimateVersionConflict } from '../offline/conflictResolution';

type Props = {
  conflict: EstimateVersionConflict;
  busy?: boolean;
  onDiscardLocal: () => void;
  onKeepLocal: () => void;
  onClose: () => void;
};

export function ConflictDialog({
  conflict,
  busy,
  onDiscardLocal,
  onKeepLocal,
  onClose,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-rose-100 p-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <h3 className="font-bold text-gray-900 text-base">
              {t('company.estimateWizard.conflict.title')}
            </h3>
            <p className="text-sm text-gray-600 leading-snug">
              {t('company.estimateWizard.conflict.description', {
                number: conflict.number,
                title: conflict.title,
              })}
            </p>
            <p className="text-[11px] text-gray-400">
              {t('company.estimateWizard.conflict.versions', {
                expected: conflict.expectedVersion,
                server: conflict.serverVersion,
              })}
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          <button
            type="button"
            onClick={onKeepLocal}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-60 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
            {t('company.estimateWizard.conflict.keepLocal')}
          </button>
          <button
            type="button"
            onClick={onDiscardLocal}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-60 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {t('company.estimateWizard.conflict.discardLocal')}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
          >
            {t('company.estimateWizard.conflict.dismiss')}
          </button>
        </div>
      </div>
    </div>
  );
}
