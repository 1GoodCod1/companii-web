import { useState } from 'react';
import { Eye } from 'lucide-react';
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
  ESTIMATE_STATUS_LABELS,
  ESTIMATE_STATUS_TONES,
  PORTAL_ESTIMATE_ACTION,
  type PortalEstimateActionStatus,
} from '@/constants/estimateStatus.constants';
import { getErrorMessage } from '@/utils/errors';

export function PortalEstimatesSection({ data }: { data: PortalDashboardDto }) {
  const updateEstimate = useUpdatePortalEstimateMutation();
  const { estimates } = data;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { data: estimateDetail, isLoading: detailLoading } = usePortalEstimateQuery(
    expandedId ?? '',
    !!expandedId,
  );

  const handleEstimateStatus = async (estimateId: string, status: PortalEstimateActionStatus) => {
    const word = status === PORTAL_ESTIMATE_ACTION.ACCEPT ? 'acceptați' : 'respingeți';
    if (!confirm(`Sigur doriți să ${word} această smetă?`)) return;
    try {
      await updateEstimate.mutateAsync({ id: estimateId, status });
      toast.success(status === PORTAL_ESTIMATE_ACTION.ACCEPT ? 'Smeta a fost acceptată!' : 'Smeta a fost respinsă.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Eroare la actualizarea smetei.'));
    }
  };

  const handleDownloadPdf = async (estimateId: string, number: string) => {
    setDownloadingId(estimateId);
    try {
      await downloadPortalEstimatePdf(estimateId, `${number}.pdf`);
      toast.success('PDF descărcat.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Eroare la descărcarea PDF.'));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Panel>
      <PanelHeader
        title="Smete de aprobat"
        description="Acceptă sau respinge smetele primite de la companie."
        meta={<span className="text-xs text-gray-400">{estimates.length} smete</span>}
      />
      {estimates.length === 0 ? (
        <EmptyState message="Nu ai smete în curs de aprobare." />
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
                  <p className="text-xs text-gray-500 mt-0.5">{item.category.name}</p>
                  <p className="font-black text-violet-700 text-lg mt-1 tracking-tight">
                    {Number(item.grandTotal).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                  </p>
                </div>
                <SoftBadge tone={ESTIMATE_STATUS_TONES[item.status] ?? 'gray'}>
                  {ESTIMATE_STATUS_LABELS[item.status] ?? item.status}
                </SoftBadge>
              </div>
              {item.status === ESTIMATE_STATUS.SENT ? (
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleEstimateStatus(item.id, PORTAL_ESTIMATE_ACTION.REJECT)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Declină
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEstimateStatus(item.id, PORTAL_ESTIMATE_ACTION.ACCEPT)}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    Acceptă
                  </button>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2 justify-end border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-violet-700 hover:bg-violet-50 transition-colors"
                >
                  {expandedId === item.id ? 'Ascunde detalii' : 'Vezi detalii'}
                </button>
                <button
                  type="button"
                  disabled={downloadingId === item.id}
                  onClick={() => handleDownloadPdf(item.id, item.number)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {downloadingId === item.id ? 'Se descarcă...' : 'PDF'}
                </button>
              </div>
              {expandedId === item.id ? (
                <div className="rounded-xl bg-slate-50/80 p-4 space-y-3">
                  {detailLoading ? (
                    <p className="text-xs text-gray-400">Se încarcă detaliile...</p>
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
                                        Magazin: {line.materialStore}
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
                                        <Eye className="w-3 h-3" /> Bon Fiscal
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
                    <p className="text-xs text-gray-400">Detaliile nu sunt disponibile.</p>
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
