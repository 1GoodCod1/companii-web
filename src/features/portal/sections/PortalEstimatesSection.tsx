import { useState, useMemo } from 'react';
import { EyeIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { downloadFile } from '@/shared/api/files';
import { EstimateCommentThread } from '@/features/estimates';
import {
  Panel,
  PanelHeader,
  EmptyState,
  SoftBadge,
} from '@/widgets/cabinet/cabinet-ui';
import {
  useUpdatePortalEstimateMutation,
  usePortalEstimateQuery,
  useRequestPortalEstimateChangesMutation,
} from '@/features/portal/api/usePortal';
import { downloadPortalEstimatePdf } from '@/features/estimates';
import type { PortalDashboardDto } from '@/features/portal/api/usePortal';
import type { EstimateProjectListDto, EstimateStageDto } from '@/entities/estimate/model/estimates';
import {
  ESTIMATE_STATUS,
  ESTIMATE_STATUS_TONES,
  PORTAL_ESTIMATE_ACTION,
  type PortalEstimateActionStatus,
} from '@/entities/estimate/model/estimateStatus.constants';
import { getErrorMessage } from '@/shared/utils/errors';
import { getTranslatedCategoryName } from '@/shared/utils/translateCityCategory';
import { estimateStatusLabel } from '@/entities/estimate/model/i18nStatusLabels';
import { buildScopeSummary } from '@/features/estimates';
import { filterStagesForClientDisplay } from '@/features/estimates';
import { isEstimateLaborLine } from '@/features/estimates';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';
import {
  findPricingRuleForLine,
  formatPricingRuleExplanation,
} from '@/features/estimates';

export function PortalEstimatesSection(props: { data: PortalDashboardDto }) {
  return usePortalEstimatesSectionView(props);
}

function usePortalEstimatesSectionView({ data }: { data: PortalDashboardDto }) {
  const { t } = useTranslation();
  const updateEstimate = useUpdatePortalEstimateMutation();
  const requestChanges = useRequestPortalEstimateChangesMutation();
  const { ask, dialog } = useCabinetConfirmDialog();
  const { estimates } = data;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const estimatesMeta = useMemo(
    () => (
      <span className="text-xs text-gray-400">
        {t('portal.estimatesSection.meta', { count: estimates.length })}
      </span>
    ),
    [estimates.length, t],
  );
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const { data: estimateDetail, isLoading: detailLoading } = usePortalEstimateQuery(
    expandedId ?? '',
    !!expandedId,
  );

  const handleEstimateStatus = (estimateId: string, status: PortalEstimateActionStatus) => {
    const confirmKey =
      status === PORTAL_ESTIMATE_ACTION.ACCEPT
        ? 'portal.estimatesSection.confirmAccept'
        : 'portal.estimatesSection.confirmReject';
    ask({
      title: t('cabinet.common.confirmAction'),
      confirmLabel: t('cabinet.common.confirmAction'),
      variant: status === PORTAL_ESTIMATE_ACTION.ACCEPT ? 'primary' : 'danger',
      message: t(confirmKey),
      onConfirm: async () => {
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
      },
    });
  };

  const handleRequestChanges = async (estimateId: string) => {
    if (!commentText.trim()) {
      toast.error(t('portal.estimatesSection.commentRequired', 'Comentariul este obligatoriu'));
      return;
    }
    try {
      await requestChanges.mutateAsync({ id: estimateId, comment: commentText });
      toast.success(t('portal.estimatesSection.toastFeedbackSent', 'Feedback trimis cu succes!'));
      setCommentingId(null);
      setCommentText('');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('portal.estimatesSection.toastError')));
    }
  };

  const handleDownloadPdf = async (estimateId: string, number: string) => {
    setDownloadingId(estimateId);
    try {
      const lang = (typeof window !== 'undefined'
        ? (localStorage.getItem('companii_lang') as 'ro' | 'ru')
        : 'ro') === 'ru'
        ? 'ru'
        : 'ro';
      await downloadPortalEstimatePdf(estimateId, `${number}.pdf`, lang);
      toast.success(t('portal.estimatesSection.toastPdfDownloaded'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('portal.estimatesSection.toastPdfError')));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <Panel>
        <PanelHeader
          title={t('portal.estimatesSection.title')}
          description={t('portal.estimatesSection.description')}
          meta={estimatesMeta}
        />
        {estimates.length === 0 ? (
          <EmptyState message={t('portal.estimatesSection.empty')} />
        ) : (
          <ul className="space-y-3">
            {estimates.map((item: EstimateProjectListDto) => (
              <li
                key={item.id}
                className="rounded-2xl bg-white/60 p-4 hover:bg-violet-50/30 transition-colors space-y-3"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {item.number}
                    </span>
                    {item.company?.name ? (
                      <p className="text-[11px] text-violet-600 font-semibold mt-0.5">{item.company.name}</p>
                    ) : null}
                    <p className="font-bold text-gray-800 text-sm mt-0.5">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {getTranslatedCategoryName(t, item.category)}
                    </p>
                    <p className="font-black text-violet-700 text-lg mt-1 tracking-tight">
                      {Number(item.grandTotalWithVat ?? item.grandTotal).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                    </p>
                  </div>
                  <SoftBadge tone={ESTIMATE_STATUS_TONES[item.status] ?? 'gray'}>
                    {estimateStatusLabel(item.status, t)}
                  </SoftBadge>
                </div>

                {item.status === ESTIMATE_STATUS.SENT ? (
                  <div className="flex gap-2 justify-end items-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (commentingId === item.id) {
                          setCommentingId(null);
                        } else {
                          setCommentingId(item.id);
                          setCommentText('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-violet-700 hover:bg-violet-50 transition-colors"
                    >
                      {t('portal.estimatesSection.requestChanges', 'Solicită modificări')}
                    </button>
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

                {commentingId === item.id ? (
                  <div className="rounded-xl bg-violet-50/50 p-4 border border-violet-100 space-y-3 animate-fade-in">
                    <p className="text-xs font-bold text-slate-700">
                      {t('portal.estimatesSection.requestChangesTitle', 'Introduceți modificările solicitate')}
                    </p>
                    <textarea
                      rows={3}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={t('portal.estimatesSection.commentPlaceholder', 'Descrieți modificările dorite...')}
                      aria-label={t('portal.estimatesSection.commentPlaceholder', 'Descrieți modificările dorite...')}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setCommentingId(null)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        {t('cabinet.common.cancel')}
                      </button>
                      <button
                        type="button"
                        disabled={requestChanges.isPending}
                        onClick={() => handleRequestChanges(item.id)}
                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                      >
                        {requestChanges.isPending ? t('cabinet.common.saving') : t('cabinet.common.send')}
                      </button>
                    </div>
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
                  <div className="rounded-xl bg-slate-50/80 p-4 space-y-4">
                    {detailLoading ? (
                      <p className="text-xs text-gray-400">{t('portal.estimatesSection.loadingDetails')}</p>
                    ) : estimateDetail ? (
                      <>
                        {/* 1. Project details breakdown */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-white/70 rounded-xl border border-slate-100 text-xs shadow-xs">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              {t('portal.estimatesSection.address', 'Adresă')}
                            </p>
                            <p className="font-semibold text-slate-700 mt-0.5">{estimateDetail.address || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              {t('portal.estimatesSection.validUntil', 'Valabilitate')}
                            </p>
                            <p className="font-semibold text-slate-700 mt-0.5">
                              {estimateDetail.validUntil
                                ? new Date(estimateDetail.validUntil).toLocaleDateString('ro-MD')
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              {t('portal.estimatesSection.createdAt', 'Data creării')}
                            </p>
                            <p className="font-semibold text-slate-700 mt-0.5">
                              {estimateDetail.createdAt
                                ? new Date(estimateDetail.createdAt).toLocaleDateString('ro-MD')
                                : '-'}
                            </p>
                          </div>
                        </div>

                        {/* 1.5 Totals and TVA Breakdown */}
                        <div className="p-4 bg-violet-50/50 border border-violet-100/80 rounded-xl space-y-2 text-xs shadow-xs">
                          <div className="flex justify-between font-semibold text-slate-600">
                            <span>{t('portal.estimatesSection.subtotal', 'Cost lucrare (fără TVA)')}</span>
                            <span>{Number(estimateDetail.grandTotal).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}</span>
                          </div>
                          {estimateDetail.tvaRate !== null && Number(estimateDetail.tvaRate) > 0 ? (
                            <>
                              <div className="flex justify-between font-semibold text-amber-700">
                                <span>{t('portal.estimatesSection.tvaAmount', 'Suma TVA (20%)')}</span>
                                <span>{Number(estimateDetail.tvaAmount ?? 0).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}</span>
                              </div>
                              <div className="flex justify-between font-black text-sm text-violet-800 border-t border-violet-200/50 pt-2">
                                <span>{t('portal.estimatesSection.totalWithVat', 'Total de plată (cu TVA)')}</span>
                                <span>{Number(estimateDetail.grandTotalWithVat ?? estimateDetail.grandTotal).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between items-center border-t border-violet-200/50 pt-2 text-[11px] text-gray-500 font-semibold italic">
                              <span>{t('portal.estimatesSection.tvaExempt', '⚠️ Fără TVA. Compania nu aplică TVA.')}</span>
                              <span className="font-black text-slate-700 text-xs">{Number(estimateDetail.grandTotal).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}</span>
                            </div>
                          )}
                        </div>

                        {/* 2. Included / Excluded Scope (O-03) */}
                        {(() => {
                          const scope = buildScopeSummary(
                            estimateDetail.blueprint?.config,
                            estimateDetail.diagnosticAnswers?.enabledWorkModules ?? [],
                            estimateDetail.stages,
                          );
                          if (scope.included.length === 0) return null;
                          return (
                            <div className="space-y-2">
                              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                {t('company.estimateWizard.scopeSummary.title', 'Conținutul calculului de preț')}
                              </p>
                              <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3 space-y-1.5 shadow-xs">
                                <p className="text-[10px] font-bold uppercase text-emerald-800 flex items-center gap-1">
                                  <CheckCircleIcon className="size-3.5 text-emerald-600" />
                                  {t('company.estimateWizard.scopeSummary.included', 'Inclus')}
                                </p>
                                <ul className="space-y-1 text-xs text-emerald-950 font-medium">
                                  {scope.included.map((m) => (
                                    <li key={m.key}>
                                      • {m.label} (
                                      {t('company.estimateWizard.scopeSummary.moduleLineCount', {
                                        count: m.lineCount,
                                        amount: m.amount.toLocaleString('ro-MD'),
                                      })}
                                      )
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          );
                        })()}

                        {/* 3. Detailed stages list — billable stages only */}
                        <div className="space-y-2.5">
                          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            {t('portal.estimatesSection.breakdown', 'Detaliere etape')}
                          </p>
                          {filterStagesForClientDisplay(estimateDetail.stages as EstimateStageDto[]).map(
                            (stage) => (
                            <div key={stage.id} className="space-y-1.5 bg-white/50 border border-slate-100 rounded-xl p-3 shadow-xs">
                              <div className="flex justify-between items-center">
                                <p className="text-xs font-bold text-slate-800">{stage.name}</p>
                                {stage.stageTotal && Number(stage.stageTotal) > 0 ? (
                                  <p className="text-xs font-bold text-violet-700">
                                    {Number(stage.stageTotal).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                                  </p>
                                ) : null}
                              </div>
                              <ul className="text-xs text-gray-600 space-y-1.5 mt-2">
                                {(stage.lines ?? []).map((line) => {
                                  const pricingRule = findPricingRuleForLine(
                                    estimateDetail.blueprint?.config,
                                    stage,
                                    line,
                                  );
                                  const lineExplanation = formatPricingRuleExplanation(
                                    pricingRule,
                                    line,
                                    estimateDetail.measurements,
                                  );
                                  const isLabor = isEstimateLaborLine({
                                    unit: line.unit,
                                    description: line.description,
                                    stageKind: stage.kind,
                                  });
                                  return (
                                    <li
                                      key={line.id}
                                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/70 p-2.5 shadow-xs border border-slate-100/50"
                                    >
                                      <div>
                                        <p className="font-semibold text-slate-800">{line.description}</p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                          {Number(line.qty)} {line.unit} ·{' '}
                                          {Number(line.lineTotal ?? 0).toLocaleString('ro-MD')} MDL
                                        </p>
                                        {lineExplanation && (
                                          <p className="text-[10px] text-slate-500 font-medium mt-1 max-w-xl">
                                            {lineExplanation}
                                          </p>
                                        )}
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
                                            <EyeIcon className="size-3.5" /> {t('portal.estimatesSection.receipt')}
                                          </button>
                                        )}
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ),
                          )}
                        </div>
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

      {/* V-06: Comment Thread */}
      {expandedId && (
        <div className="mt-6">
          <EstimateCommentThread projectId={expandedId} isPortal={true} />
        </div>
      )}
      {dialog}
    </>
  );
}
