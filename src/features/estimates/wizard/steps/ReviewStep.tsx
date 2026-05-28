import { Link } from 'react-router-dom';
import { CheckCircle2, Check, CircleDashed, Eye, FileText, Hammer, Paperclip, Plus, PlusCircle, Send, Trash2, Download, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SaveTemplateModal } from '@/features/estimates/components/SaveTemplateModal';
import {
  Panel,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import { downloadFile } from '@/api/files';
import { EstimateLineSourceBadge } from '@/features/estimates/components/EstimateLineSourceBadge';
import { LeadBudgetGauge } from '@/features/estimates/components/LeadBudgetGauge';
import { useDownloadEstimatePdf } from '@/features/estimates/api/useEstimates';
import { EstimateVersionHistory } from '@/features/estimates/components/EstimateVersionHistory';
import { EstimateCommentThread } from '@/features/estimates/components/EstimateCommentThread';
import type { EstimateStageDto } from '@/types/estimates';
import type { EstimateWizardApi } from '../useEstimateWizard';

type Props = {
  wizard: EstimateWizardApi;
};

type ScopeEntry = {
  key: string;
  label: string;
  hint: string;
  tone: 'emerald' | 'amber' | 'slate';
};

const SCOPE_TONE: Record<ScopeEntry['tone'], string> = {
  emerald: 'border-emerald-100 bg-emerald-50/40 text-emerald-900',
  amber: 'border-amber-100 bg-amber-50/40 text-amber-900',
  slate: 'border-slate-100 bg-slate-50/60 text-slate-700',
};

function ScopeColumn({
  icon,
  title,
  entries,
  emptyMessage,
}: {
  icon: React.ReactNode;
  title: string;
  entries: ScopeEntry[];
  emptyMessage?: string;
}) {
  return (
    <div className="rounded-2xl bg-white/60 p-4 space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-700">
        {icon} {title}
      </div>
      {entries.length === 0 ? (
        emptyMessage ? (
          <p className="text-[11px] text-gray-400 italic">{emptyMessage}</p>
        ) : null
      ) : (
        <ul className="space-y-1.5">
          {entries.map((e) => (
            <li
              key={e.key}
              className={`rounded-xl border px-3 py-2 text-xs ${SCOPE_TONE[e.tone]}`}
            >
              <p className="font-semibold">{e.label}</p>
              <p className="text-[11px] opacity-80 mt-0.5">{e.hint}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
    editingStore,
    setEditingStore,
    uploadingLineId,
    handleUpdateLineQtyOrPrice,
    handleSaveStore,
    handleUploadReceipt,
    handleDeleteReceipt,
    scopeSummary,
    previewTotals,
    previewVsBackendDiff,
    previewIsStale,
    sanityWarnings,
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

  const showScope =
    scopeSummary.included.length > 0 ||
    scopeSummary.enabledWithoutLines.length > 0 ||
    scopeSummary.available.length > 0;

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

      {showScope && (
        <Panel className="p-6">
          <h3 className="font-bold text-gray-900 mb-3">
            {t('company.estimateWizard.scopeSummary.title')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <ScopeColumn
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              title={t('company.estimateWizard.scopeSummary.included')}
              entries={scopeSummary.included.map((m) => ({
                key: m.key,
                label: m.label,
                hint: t('company.estimateWizard.scopeSummary.moduleLineCount', {
                  count: m.lineCount,
                  amount: m.amount.toLocaleString('ro-MD'),
                }),
                tone: 'emerald',
              }))}
              emptyMessage={t('company.estimateWizard.scopeSummary.emptyIncluded')}
            />
            <ScopeColumn
              icon={<CircleDashed className="w-4 h-4 text-amber-600" />}
              title={t('company.estimateWizard.scopeSummary.enabledWithoutLines')}
              entries={scopeSummary.enabledWithoutLines.map((m) => ({
                key: m.key,
                label: m.label,
                hint:
                  m.missingFieldLabels && m.missingFieldLabels.length > 0
                    ? t('company.estimateWizard.scopeSummary.moduleMissingFields', {
                        fields: m.missingFieldLabels.join(', '),
                        defaultValue: 'Completați: {{fields}}',
                      })
                    : t('company.estimateWizard.scopeSummary.moduleEnabledNoLines'),
                tone: 'amber',
              }))}
            />
            <ScopeColumn
              icon={<PlusCircle className="w-4 h-4 text-slate-500" />}
              title={t('company.estimateWizard.scopeSummary.available')}
              entries={scopeSummary.available.map((m) => ({
                key: m.key,
                label: m.label,
                hint: t('company.estimateWizard.scopeSummary.moduleAvailableHint'),
                tone: 'slate',
              }))}
            />
          </div>
        </Panel>
      )}

      <Panel className="p-6">
        <h3 className="font-bold text-gray-900 mb-4">{t('company.estimateWizard.reviewStep.summaryTitle')}</h3>
        {(activeCustomPricing.customUnitPriceSqm ||
          activeCustomPricing.customDurationDays ||
          activeCustomPricing.customLaborHours ||
          activeCustomPricing.customLaborTotal) && (
          <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-sm text-gray-700 space-y-1">
            <p className="font-bold text-gray-900">{t('company.estimateWizard.reviewStep.customPricingApplied')}</p>
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
          {/* Primary actions */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {canSendEstimate ? (
              <button
                type="button"
                onClick={handleSendEstimate}
                disabled={sendEstimate.isPending}
                className={cabinetBtnPrimary}
              >
                <Send className="w-4 h-4 flex-shrink-0" />{' '}
                <span className="truncate">
                  {sendEstimate.isPending
                    ? t('company.estimateWizard.reviewStep.sending')
                    : t('company.estimateWizard.reviewStep.sendToClient')}
                </span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleGenerateQuote}
              disabled={!!project.quote || generateQuote.isPending}
              className={cabinetBtnPrimary}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />{' '}
              <span className="truncate">{t('company.estimateWizard.reviewStep.generateQuote')}</span>
            </button>
          </div>

          {/* Secondary actions */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {canConvertEstimate ? (
              <>
                <button type="button" onClick={() => handleConvert('single')} className={cabinetBtnSecondary}>
                  <Hammer className="w-4 h-4 flex-shrink-0" />{' '}
                  <span className="truncate">{t('company.estimateWizard.reviewStep.convertSingle')}</span>
                </button>
                <button type="button" onClick={() => handleConvert('by-stage')} className={cabinetBtnSecondary}>
                  <Send className="w-4 h-4 flex-shrink-0" />{' '}
                  <span className="truncate">{t('company.estimateWizard.reviewStep.convertByStage')}</span>
                </button>
              </>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 w-full sm:w-auto">
                {t('company.estimateWizard.reviewStep.convertUnavailable')}
              </p>
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
              <Copy className="w-4 h-4 flex-shrink-0 text-violet-500" />{' '}
              <span className="truncate">{t('company.estimatesTemplatesPage.saveAsTemplate')}</span>
            </button>
          </div>

          {/* PDF download with language toggle — full width on mobile */}
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
              <Download className="w-4 h-4 flex-shrink-0" />{' '}
              {downloadPdf.isDownloading
                ? t('company.estimateWizard.wizard.toasts.pdfDownloading', 'Se descarcă...')
                : t('company.estimateWizard.reviewStep.downloadEstimatePdf', 'Descarcă PDF')}
            </button>
          </div>
        </div>
      </Panel>

      <Panel className="p-6">
        <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2 mb-1">
          <Paperclip className="w-5 h-5 text-violet-600 animate-pulse" /> {t('company.estimateWizard.reviewStep.materialsTitle')}
        </h3>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          {t('company.estimateWizard.reviewStep.materialsDescription')}
        </p>

        <div className="space-y-6">
          {(project.stages as EstimateStageDto[]).map((stage) => {
            const materialLines = (stage.lines ?? []).filter((l) => l.source !== 'stage-default');
            if (materialLines.length === 0) return null;

            return (
              <div key={stage.id} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-3 shadow-xs">
                <div className="font-extrabold text-sm text-gray-800 border-b border-gray-100/80 pb-2 flex items-center justify-between">
                  <span className="text-gray-900 font-bold text-sm">
                    {t('company.estimateWizard.reviewStep.stageLabel', { name: stage.name })}
                  </span>
                  <span className="text-xs font-semibold text-violet-600">
                    {t('company.estimateWizard.reviewStep.stageTotal', {
                      total: Number(stage.stageTotal).toLocaleString('ro-MD'),
                    })}
                  </span>
                </div>

                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="min-w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="py-2 pr-2">{t('company.estimateWizard.reviewStep.colDescription')}</th>
                        <th className="py-2 w-16 sm:w-20">{t('company.estimateWizard.reviewStep.colQty')}</th>
                        <th className="py-2 hidden sm:table-cell w-16 sm:w-20">{t('company.estimateWizard.reviewStep.colUnit')}</th>
                        <th className="py-2 hidden sm:table-cell w-24 sm:w-28">{t('company.estimateWizard.reviewStep.colUnitPrice')}</th>
                        <th className="py-2 w-24 sm:w-28">{t('company.estimateWizard.reviewStep.colTotal')}</th>
                        <th className="py-2 pr-2">{t('company.estimateWizard.reviewStep.colStore')}</th>
                        <th className="py-2 text-right">{t('company.estimateWizard.reviewStep.colReceipt')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50">
                      {materialLines.map((line) => {
                        const isLabor =
                          line.unit === 'ore' ||
                          line.unit === 'h' ||
                          line.description.toLowerCase().includes('manoperă') ||
                          line.description.toLowerCase().includes('manopera');
                        return (
                          <tr key={line.id} className="hover:bg-violet-50/20 transition-colors">
                            <td className="py-3 font-semibold text-gray-700">
                              <span className="inline-flex items-center gap-1.5">
                                {line.description}
                                <EstimateLineSourceBadge source={line.source} />
                              </span>
                            </td>
                            <td className="py-3">
                              <input
                                type="number"
                                defaultValue={Number(line.qty)}
                                onBlur={(e) =>
                                  handleUpdateLineQtyOrPrice(
                                    line.id,
                                    stage.id,
                                    'qty',
                                    Number(e.target.value),
                                  )
                                }
                                className="w-14 sm:w-16 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium"
                              />
                            </td>
                            <td className="py-3 text-gray-500 font-medium hidden sm:table-cell">{line.unit}</td>
                            <td className="py-3 hidden sm:table-cell">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  defaultValue={Number(line.unitPrice)}
                                  onBlur={(e) =>
                                    handleUpdateLineQtyOrPrice(
                                      line.id,
                                      stage.id,
                                      'unitPrice',
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium"
                                />
                                <span className="text-[10px] text-gray-400">MDL</span>
                              </div>
                            </td>
                            <td className="py-3 font-extrabold text-gray-900">
                              {Number(line.lineTotal).toLocaleString('ro-MD')} MDL
                            </td>
                            <td className="py-3">
                              {isLabor ? (
                                <span className="text-[10px] text-gray-400 italic">
                                  {t('company.estimateWizard.reviewStep.laborService')}
                                </span>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    placeholder={t('company.estimateWizard.reviewStep.storePlaceholder')}
                                    value={
                                      editingStore?.lineId === line.id
                                        ? editingStore.value
                                        : line.materialStore || ''
                                    }
                                    onChange={(e) =>
                                      setEditingStore({ lineId: line.id, value: e.target.value })
                                    }
                                    onBlur={() => handleSaveStore(line.id, stage.id)}
                                    className="w-36 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium"
                                  />
                                  {editingStore?.lineId === line.id && (
                                    <button
                                      type="button"
                                      onMouseDown={() => handleSaveStore(line.id, stage.id)}
                                      className="rounded-md bg-emerald-100 p-1 text-emerald-700 hover:bg-emerald-200 transition-colors"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-3 text-right">
                              {isLabor ? null : (
                                <div className="inline-flex items-center gap-2">
                                  {line.receiptFileKey ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          downloadFile(
                                            line.receiptFileKey!,
                                            `Bon-${line.description.replace(/\s+/g, '_')}.pdf`,
                                          )
                                        }
                                        className="inline-flex items-center gap-1 rounded-xl bg-violet-50 border border-violet-100 px-2 py-1 text-[10px] font-bold text-violet-700 hover:bg-violet-100 transition-colors"
                                      >
                                        <Eye className="w-3.5 h-3.5" /> {t('company.estimateWizard.reviewStep.viewReceipt')}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteReceipt(line.id, stage.id)}
                                        className="rounded-xl bg-red-50 border border-red-100 p-1 text-red-600 hover:bg-red-100 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <label className="relative cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                                      {uploadingLineId === line.id ? (
                                        <span className="animate-pulse">{t('cabinet.common.loading')}</span>
                                      ) : (
                                        <>
                                          <Plus className="w-3 h-3" /> {t('company.estimateWizard.reviewStep.attachReceipt')}
                                        </>
                                      )}
                                      <input
                                        type="file"
                                        className="sr-only"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleUploadReceipt(line.id, stage.id, file);
                                        }}
                                      />
                                    </label>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* V-05: Version History */}
      <div className="mt-6">
        <EstimateVersionHistory projectId={project.id} />
      </div>

      {/* V-06: Comment Thread */}
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
