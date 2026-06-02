import { Link } from 'react-router-dom';
import { Copy, Download, FileText, Hammer, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SaveTemplateModal } from '@/features/estimates/components/SaveTemplateModal';
import {
  Panel,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/widgets/cabinet/cabinet-ui';
import { LeadBudgetGauge } from '@/features/estimates/components/LeadBudgetGauge';
import { useDownloadEstimatePdf } from '@/features/estimates/api/useEstimates';
import { EstimateVersionHistory } from '@/features/estimates/components/EstimateVersionHistory';
import { EstimateCommentThread } from '@/features/estimates/components/EstimateCommentThread';
import type { EstimateWizardApi } from '../useEstimateWizard';
import { ReviewInterventions } from './review/ReviewInterventions';
import { ReviewScopeSummary } from './review/ReviewScopeSummary';
import { ReviewMaterialStages } from './review/ReviewMaterialStages';

type Props = {
  wizard: EstimateWizardApi;
};

export function ReviewStep({ wizard }: Props) {
  const { t } = useTranslation();
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const {
    project,
    activeCustomPricing,
    canSendEstimate,
    canConvertEstimate,
    sendEstimate,
    generateQuote,
    handleSendEstimate,
    handleGenerateQuote,
    handleConvert,
    scopeSummary,
    previewTotals,
    previewVsBackendDiff,
    previewIsStale,
    sanityWarnings,
    isReadOnly,
  } = wizard;

  const downloadPdf = useDownloadEstimatePdf();
  const [pdfLang, setPdfLang] = useState<'ro' | 'ru'>(
    (typeof window !== 'undefined'
      ? (localStorage.getItem('companii_lang') as 'ro' | 'ru')
      : 'ro') === 'ru'
      ? 'ru'
      : 'ro',
  );

  const handleDownloadPdf = () => {
    downloadPdf.download(project.id, `${project.number}.pdf`, pdfLang);
  };

  const showPreview = previewTotals.hasContent;
  const backendCalculated = Number(project.grandTotal ?? 0) > 0;

  const reviewCurrentTotal =
    Number(project.grandTotal ?? 0) || previewTotals?.grandTotal || 0;

  return (
    <div className="space-y-4">
      {project.sourceLead?.estimatedBudget && (
        <LeadBudgetGauge
          budget={project.sourceLead.estimatedBudget}
          currentTotal={reviewCurrentTotal}
        />
      )}
      {sanityWarnings.length > 0 && (
        <Panel className="p-4 border border-amber-200 bg-amber-50/60 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-800">
            {t('company.estimateWizard.reviewStep.sanityTitle')}
          </p>
          <ul className="space-y-1">
            {sanityWarnings.map((w) => (
              <li
                key={w.key}
                className={`text-xs font-semibold flex items-start gap-2 ${
                  w.severity === 'warning' ? 'text-rose-700' : 'text-amber-700'
                }`}
              >
                <span aria-hidden>{w.severity === 'warning' ? '⚠' : 'ℹ'}</span>
                <span>{w.message}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <ReviewInterventions project={project} />

      {showPreview && (
        <Panel className="p-5 border border-amber-100 bg-amber-50/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                {t('company.estimateWizard.preview.label')}
              </span>
              <p className="text-xs text-gray-600 leading-snug">
                {t('company.estimateWizard.preview.hint')}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-600">
                {t('company.estimateWizard.preview.lines', { count: previewTotals.lineCount })}
              </span>
              <span className="font-bold text-amber-900">
                {previewTotals.grandTotal.toLocaleString('ro-MD')} MDL
              </span>
              {backendCalculated && previewIsStale && (
                <span className="text-rose-700">
                  Δ {previewVsBackendDiff > 0 ? '+' : ''}
                  {previewVsBackendDiff.toLocaleString('ro-MD')} MDL
                </span>
              )}
            </div>
          </div>
        </Panel>
      )}

      <ReviewScopeSummary scopeSummary={scopeSummary} />

      <Panel className="p-6">
        <h3 className="font-bold text-gray-900 mb-4">{t('company.estimateWizard.reviewStep.summaryTitle')}</h3>
        {(activeCustomPricing.customUnitPriceSqm ||
          activeCustomPricing.customDurationDays ||
          activeCustomPricing.customLaborHours ||
          activeCustomPricing.customLaborTotal) && (
          <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-sm text-amber-950 space-y-1">
            <p className="font-bold text-amber-950">{t('company.estimateWizard.reviewStep.customPricingApplied')}</p>
            {activeCustomPricing.customUnitPriceSqm ? (
              <p>{t('company.estimateWizard.reviewStep.pricePerSqm', { value: activeCustomPricing.customUnitPriceSqm.toLocaleString('ro-MD') })}</p>
            ) : null}
            {activeCustomPricing.customLaborTotal ? (
              <p>{t('company.estimateWizard.reviewStep.fixedLaborTotal', { value: activeCustomPricing.customLaborTotal.toLocaleString('ro-MD') })}</p>
            ) : null}
            {activeCustomPricing.customDurationDays ? (
              <p>{t('company.estimateWizard.reviewStep.durationDays', { count: activeCustomPricing.customDurationDays })}</p>
            ) : null}
            {activeCustomPricing.customLaborHours ? (
              <p>{t('company.estimateWizard.reviewStep.laborHours', { count: activeCustomPricing.customLaborHours })}</p>
            ) : null}
          </div>
        )}
        {project.tvaRate !== null && Number(project.tvaRate) > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
              <div className="rounded-2xl bg-gray-50 p-3 sm:p-4">
                <p className="text-[11px] sm:text-xs text-gray-500">{t('company.estimateWizard.reviewStep.labor')}</p>
                <p className="text-base sm:text-xl font-black text-gray-900">{Number(project.laborTotal).toLocaleString('ro-MD')} MDL</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3 sm:p-4">
                <p className="text-[11px] sm:text-xs text-gray-500">{t('company.estimateWizard.reviewStep.materials')}</p>
                <p className="text-base sm:text-xl font-black text-gray-900">{Number(project.materialTotal).toLocaleString('ro-MD')} MDL</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3 sm:p-4 border border-slate-100 col-span-2 sm:col-span-1">
                <p className="text-[11px] sm:text-xs text-gray-500">
                  {t('company.estimateWizard.reviewStep.totalWithMargin', { margin: Number(project.marginPct) })}
                </p>
                <p className="text-base sm:text-xl font-black text-gray-900">{Number(project.grandTotal).toLocaleString('ro-MD')} MDL</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
                <p className="text-xs text-amber-700">{t('company.estimateWizard.reviewStep.tva', 'Suma TVA')}</p>
                <p className="text-xl font-black text-amber-800">{Number(project.tvaAmount ?? 0).toLocaleString('ro-MD')} MDL</p>
              </div>
              <div className="rounded-2xl bg-violet-50 p-4 border border-violet-100">
                <p className="text-xs text-violet-600">
                  {t('company.estimateWizard.reviewStep.totalWithVat', 'Total spre plată (cu TVA)')}
                </p>
                <p className="text-2xl font-black text-violet-700">{Number(project.grandTotalWithVat ?? project.grandTotal).toLocaleString('ro-MD')} MDL</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
              <div className="rounded-2xl bg-gray-50 p-3 sm:p-4">
                <p className="text-[11px] sm:text-xs text-gray-500">{t('company.estimateWizard.reviewStep.labor')}</p>
                <p className="text-base sm:text-xl font-black text-gray-900">{Number(project.laborTotal).toLocaleString('ro-MD')} MDL</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3 sm:p-4">
                <p className="text-[11px] sm:text-xs text-gray-500">{t('company.estimateWizard.reviewStep.materials')}</p>
                <p className="text-base sm:text-xl font-black text-gray-900">{Number(project.materialTotal).toLocaleString('ro-MD')} MDL</p>
              </div>
              <div className="rounded-2xl bg-violet-50 p-3 sm:p-4 border border-violet-100 col-span-2 sm:col-span-1">
                <p className="text-[11px] sm:text-xs text-violet-600">
                  {t('company.estimateWizard.reviewStep.totalWithMargin', { margin: Number(project.marginPct) })}
                </p>
                <p className="text-base sm:text-2xl font-black text-violet-700">{Number(project.grandTotal).toLocaleString('ro-MD')} MDL</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 mb-6 leading-relaxed">
              ⚠️ {t('company.estimateWizard.reviewStep.tvaExemptNote', 'Fără TVA. Compania nu este înregistrată ca plătitor TVA conform Codului Fiscal al RM (art. 112).')}
            </p>
          </>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {!isReadOnly && canSendEstimate ? (
              <button
                type="button"
                onClick={handleSendEstimate}
                disabled={sendEstimate.isPending}
                className={cabinetBtnPrimary}
              >
                <Send className="size-4 flex-shrink-0" />{' '}
                <span className="truncate">
                  {sendEstimate.isPending
                    ? t('company.estimateWizard.reviewStep.sending')
                    : t('company.estimateWizard.reviewStep.sendToClient')}
                </span>
              </button>
            ) : null}
            {!isReadOnly && (
              <button
                type="button"
                onClick={handleGenerateQuote}
                disabled={!!project.quote || generateQuote.isPending}
                className={cabinetBtnPrimary}
              >
                <FileText className="size-4 flex-shrink-0" />{' '}
                <span className="truncate">{t('company.estimateWizard.reviewStep.generateQuote')}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {project.status !== 'IN_EXECUTION' && (
              <>
                {canConvertEstimate ? (
                  <>
                    <button type="button" onClick={() => handleConvert('single')} className={cabinetBtnSecondary}>
                      <Hammer className="size-4 flex-shrink-0" />{' '}
                      <span className="truncate">{t('company.estimateWizard.reviewStep.convertSingle')}</span>
                    </button>
                    <button type="button" onClick={() => handleConvert('by-stage')} className={cabinetBtnSecondary}>
                      <Send className="size-4 flex-shrink-0" />{' '}
                      <span className="truncate">{t('company.estimateWizard.reviewStep.convertByStage')}</span>
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 w-full sm:w-auto">
                    {t('company.estimateWizard.reviewStep.convertUnavailable')}
                  </p>
                )}
              </>
            )}
            {project.quote && (
              <Link to="/company/oferte" className={cabinetBtnSecondary}>
                {t('company.estimateWizard.reviewStep.viewQuote', { number: project.quote.number })}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setSaveTemplateOpen(true)}
              className={cabinetBtnSecondary}
            >
              <Copy className="size-4 flex-shrink-0 text-violet-500" />{' '}
              <span className="truncate">{t('company.estimatesTemplatesPage.saveAsTemplate')}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
            <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50/80 p-0.5 gap-0.5 flex-shrink-0">
              {(['ro', 'ru'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setPdfLang(lang)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold uppercase transition-colors ${
                    pdfLang === lang
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadPdf.isDownloading}
              className={cn(cabinetBtnSecondary, 'flex-1 sm:flex-none')}
            >
              <Download className="size-4 flex-shrink-0" />{' '}
              {downloadPdf.isDownloading
                ? t('company.estimateWizard.wizard.toasts.pdfDownloading', 'Se descarcă...')
                : t('company.estimateWizard.reviewStep.downloadEstimatePdf', 'Descarcă PDF')}
            </button>
          </div>
        </div>
      </Panel>

      <ReviewMaterialStages wizard={wizard} />

      <div className="mt-6">
        <EstimateVersionHistory projectId={project.id} />
      </div>

      <div className="mt-6">
        <EstimateCommentThread projectId={project.id} isPortal={false} />
      </div>

      <SaveTemplateModal
        open={saveTemplateOpen}
        onClose={() => setSaveTemplateOpen(false)}
        projectId={project.id}
      />
    </div>
  );
}
