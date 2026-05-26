import { useState } from 'react';
import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { downloadFile } from '@/api/files';
import {
  Panel,
  PanelHeader,
  EmptyState,
  SoftBadge,
} from '@/components/cabinet/cabinet-ui';
import { useUpdatePortalEstimateMutation, usePortalEstimateQuery } from '@/features/portal/api/usePortal';
import { downloadPortalEstimatePdf } from '@/features/estimates/api/useEstimates';
import type { PortalDashboardDto } from '@/features/portal/api/usePortal';
import type { EstimateProjectListDto, EstimateStageDto } from '@/types/estimates';
import {
  ESTIMATE_STATUS,
  ESTIMATE_STATUS_TONES,
  PORTAL_ESTIMATE_ACTION,
  type PortalEstimateActionStatus,
} from '@/constants/estimateStatus.constants';
import { getErrorMessage } from '@/utils/errors';
import { getTranslatedCategoryName } from '@/utils/translateCityCategory';
import { estimateStatusLabel } from '@/utils/i18nStatusLabels';

export function PortalEstimatesSection({ data }: { data: PortalDashboardDto }) {
  const { t } = useTranslation();
  const updateEstimate = useUpdatePortalEstimateMutation();
  const { estimates } = data;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { data: estimateDetail, isLoading: detailLoading } = usePortalEstimateQuery(
    expandedId ?? '',
    !!expandedId,
  );

  const handleEstimateStatus = async (estimateId: string, status: PortalEstimateActionStatus) => {
    const confirmKey =
      status === PORTAL_ESTIMATE_ACTION.ACCEPT
        ? 'portal.estimatesSection.confirmAccept'
        : 'portal.estimatesSection.confirmReject';
    if (!confirm(t(confirmKey))) return;
    try {
      await updateEstimate.mutateAsync({ id: estimateId, status });
      toast.success(
        status === PORTAL_ESTIMATE_ACTION.ACCEPT
          ? t('portal.estimatesSection.toastAccepted')
          : t('portal.estimatesSection.toastRejected'),
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('portal.estimatesSection.toastError')));
    }
  };

  const handleDownloadPdf = async (estimateId: string, number: string) => {
    setDownloadingId(estimateId);
    try {
      await downloadPortalEstimatePdf(estimateId, `${number}.pdf`);
      toast.success(t('portal.estimatesSection.toastPdfDownloaded'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('portal.estimatesSection.toastPdfError')));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Panel>
      <PanelHeader
        title={t('portal.estimatesSection.title')}
        description={t('portal.estimatesSection.description')}
        meta={
          <span className="text-xs text-gray-400">
            {t('portal.estimatesSection.meta', { count: estimates.length })}
          </span>
        }
      />
      {estimates.length === 0 ? (
        <EmptyState message={t('portal.estimatesSection.empty')} />
      ) : (
        <ul className="space-y-3">
          {estimates.map((item: EstimateProjectListDto) => (
            <li
              key={item.id}
              className="rounded-2xl bg-white/60 px-4 py-4 hover:bg-violet-50/30 transition-colors space-y-3"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {item.number}
                  </span>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {getTranslatedCategoryName(t, item.category)}
                  </p>
                  <p className="font-black text-violet-700 text-lg mt-1 tracking-tight">
                    {Number(item.grandTotal).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                  </p>
                </div>
                <SoftBadge tone={ESTIMATE_STATUS_TONES[item.status] ?? 'gray'}>
                  {estimateStatusLabel(item.status, t)}
                </SoftBadge>
              </div>
              {item.status === ESTIMATE_STATUS.SENT ? (
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleEstimateStatus(item.id, PORTAL_ESTIMATE_ACTION.REJECT)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    {t('portal.estimatesSection.decline')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEstimateStatus(item.id, PORTAL_ESTIMATE_ACTION.ACCEPT)}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    {t('portal.estimatesSection.accept')}
                  </button>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2 justify-end border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-violet-700 hover:bg-violet-50 transition-colors"
                >
                  {expandedId === item.id
                    ? t('portal.estimatesSection.hideDetails')
                    : t('portal.estimatesSection.showDetails')}
                </button>
                <button
                  type="button"
                  disabled={downloadingId === item.id}
                  onClick={() => handleDownloadPdf(item.id, item.number)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {downloadingId === item.id
                    ? t('portal.estimatesSection.downloading')
                    : t('portal.estimatesSection.pdf')}
                </button>
              </div>
              {expandedId === item.id ? (
                <div className="rounded-xl bg-slate-50/80 p-4 space-y-3">
                  {detailLoading ? (
                    <p className="text-xs text-gray-400">{t('portal.estimatesSection.loadingDetails')}</p>
                  ) : estimateDetail ? (
                    <>
                      {(estimateDetail.stages as EstimateStageDto[]).map((stage) => (
                        <div key={stage.id} className="space-y-1">
                          <p className="text-xs font-bold text-gray-800">{stage.name}</p>
                          <ul className="text-xs text-gray-600 space-y-1.5 mt-2">
                            {(stage.lines ?? []).map((line) => {
                              const isLabor =
                                line.unit === 'ore' ||
                                line.unit === 'h' ||
                                line.description.toLowerCase().includes('manoperă') ||
                                line.description.toLowerCase().includes('manopera');
                              return (
                                <li
                                  key={line.id}
                                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/70 p-2.5 shadow-xs border border-slate-100"
                                >
                                  <div>
                                    <p className="font-semibold text-slate-800">{line.description}</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                      {Number(line.qty)} {line.unit} ·{' '}
                                      {Number(line.lineTotal ?? 0).toLocaleString('ro-MD')} MDL
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {!isLabor && line.materialStore && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-200">
                                        {t('portal.estimatesSection.storeLabel', {
                                          store: line.materialStore,
                                        })}
                                      </span>
                                    )}
                                    {!isLabor && line.receiptFileKey && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          downloadFile(
                                            line.receiptFileKey!,
                                            `Bon-${line.description.replace(/\s+/g, '_')}.pdf`,
                                          )
                                        }
                                        className="inline-flex items-center gap-1 rounded-xl bg-violet-600 hover:bg-violet-700 px-2.5 py-1 text-[9px] font-extrabold text-white transition-all shadow-xs cursor-pointer"
                                      >
                                        <Eye className="w-3 h-3" /> {t('portal.estimatesSection.receipt')}
                                      </button>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">{t('portal.estimatesSection.detailsUnavailable')}</p>
                  )}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
