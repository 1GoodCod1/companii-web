import { Link } from 'react-router-dom';
import { CopyIcon, DownloadIcon, FileTextIcon, HammerIcon, PaperPlaneRightIcon } from '@phosphor-icons/react';
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
import { EstimateRelatedProjectsSection } from '@/features/estimates/components/EstimateRelatedProjectsSection';

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

  const hasCustomPricing = !!(
    activeCustomPricing.customUnitPriceSqm ||
    activeCustomPricing.customDurationDays ||
    activeCustomPricing.customLaborHours ||
    activeCustomPricing.customLaborTotal
  );

  const hasTva = project.tvaRate !== null && Number(project.tvaRate) > 0;

  return (
    <div className="space-y-4">
      <EstimateRelatedProjectsSection project={project} readOnly={isReadOnly} />
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

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-4">
          <ReviewInterventions project={project} />
          <ReviewScopeSummary scopeSummary={scopeSummary} />
          <ReviewMaterialStages wizard={wizard} />
          <EstimateVersionHistory projectId={project.id} />
          <EstimateCommentThread projectId={project.id} isPortal={false} />
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6">
          <Panel className="p-5">
            <h3 className="font-bold text-gray-900 mb-4">
              {t('company.estimateWizard.reviewStep.summaryTitle')}
            </h3>

            {hasCustomPricing && (
              <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-sm text-amber-950 space-y-1">
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

            <dl className="space-y-2.5 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-gray-500">{t('company.estimateWizard.reviewStep.labor')}</dt>
                <dd className="font-bold text-gray-900 tabular-nums">
                  {Number(project.laborTotal).toLocaleString('ro-MD')} MDL
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-gray-500">{t('company.estimateWizard.reviewStep.materials')}</dt>
                <dd className="font-bold text-gray-900 tabular-nums">
                  {Number(project.materialTotal).toLocaleString('ro-MD')} MDL
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-gray-100 pt-2.5">
                <dt className="text-gray-600 font-semibold">
                  {t('company.estimateWizard.reviewStep.totalWithMargin', { margin: Number(project.marginPct) })}
                </dt>
                <dd className="font-black text-gray-900 tabular-nums">
                  {Number(project.grandTotal).toLocaleString('ro-MD')} MDL
                </dd>
              </div>

              {hasTva ? (
                <>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-amber-700">{t('company.estimateWizard.reviewStep.tva', 'Suma TVA')}</dt>
                    <dd className="font-bold text-amber-800 tabular-nums">
                      {Number(project.tvaAmount ?? 0).toLocaleString('ro-MD')} MDL
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-violet-50 border border-violet-100 px-4 py-3">
                    <p className="text-xs text-violet-600">
                      {t('company.estimateWizard.reviewStep.totalWithVat', 'Total spre plată (cu TVA)')}
                    </p>
                    <p className="text-2xl font-black text-violet-700 tabular-nums">
                      {Number(project.grandTotalWithVat ?? project.grandTotal).toLocaleString('ro-MD')} MDL
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl bg-violet-50 border border-violet-100 px-4 py-3">
                    <p className="text-xs text-violet-600">
                      {t('company.estimateWizard.reviewStep.totalWithMargin', { margin: Number(project.marginPct) })}
                    </p>
                    <p className="text-2xl font-black text-violet-700 tabular-nums">
                      {Number(project.grandTotal).toLocaleString('ro-MD')} MDL
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 leading-relaxed">
                    ⚠️ {t('company.estimateWizard.reviewStep.tvaExemptNote', 'Fără TVA. Compania nu este înregistrată ca plătitor TVA conform Codului Fiscal al RM (art. 112).')}
                  </p>
                </>
              )}
            </dl>
          </Panel>

          <Panel className="p-5 space-y-2">
            {!isReadOnly && canSendEstimate ? (
              <button
                type="button"
                onClick={handleSendEstimate}
                disabled={sendEstimate.isPending}
                className={cn(cabinetBtnPrimary, 'w-full justify-center')}
              >
                <PaperPlaneRightIcon className="size-4 flex-shrink-0" />{' '}
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
                className={cn(cabinetBtnPrimary, 'w-full justify-center')}
              >
                <FileTextIcon className="size-4 flex-shrink-0" />{' '}
                <span className="truncate">{t('company.estimateWizard.reviewStep.generateQuote')}</span>
              </button>
            )}

            {project.status !== 'IN_EXECUTION' && (
              <>
                {canConvertEstimate ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleConvert('single')}
                      className={cn(cabinetBtnSecondary, 'w-full justify-center')}
                    >
                      <HammerIcon className="size-4 flex-shrink-0" />{' '}
                      <span className="truncate">{t('company.estimateWizard.reviewStep.convertSingle')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConvert('by-stage')}
                      className={cn(cabinetBtnSecondary, 'w-full justify-center')}
                    >
                      <PaperPlaneRightIcon className="size-4 flex-shrink-0" />{' '}
                      <span className="truncate">{t('company.estimateWizard.reviewStep.convertByStage')}</span>
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                    {t('company.estimateWizard.reviewStep.convertUnavailable')}
                  </p>
                )}
              </>
            )}
            {project.quote && (
              <Link to="/company/oferte" className={cn(cabinetBtnSecondary, 'w-full justify-center')}>
                {t('company.estimateWizard.reviewStep.viewQuote', { number: project.quote.number })}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setSaveTemplateOpen(true)}
              className={cn(cabinetBtnSecondary, 'w-full justify-center')}
            >
              <CopyIcon className="size-4 flex-shrink-0 text-violet-500" />{' '}
              <span className="truncate">{t('company.estimatesTemplatesPage.saveAsTemplate')}</span>
            </button>

            <div className="flex items-center gap-2 border-t border-gray-100 pt-3 mt-1">
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
                className={cn(cabinetBtnSecondary, 'flex-1 justify-center')}
              >
                <DownloadIcon className="size-4 flex-shrink-0" />{' '}
                {downloadPdf.isDownloading
                  ? t('company.estimateWizard.wizard.toasts.pdfDownloading', 'Se descarcă...')
                  : t('company.estimateWizard.reviewStep.downloadEstimatePdf', 'Descarcă PDF')}
              </button>
            </div>
          </Panel>
        </aside>
      </div>

      <SaveTemplateModal
        open={saveTemplateOpen}
        onClose={() => setSaveTemplateOpen(false)}
        projectId={project.id}
      />
    </div>
  );
}
