import { Link } from 'react-router-dom';
import { Check, Eye, FileText, Hammer, Paperclip, Plus, Send, Trash2 } from 'lucide-react';
import {
  Panel,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import { downloadFile } from '@/api/files';
import type { EstimateStageDto } from '@/types/estimates';
import type { EstimateWizardApi } from '../useEstimateWizard';

type Props = {
  wizard: EstimateWizardApi;
};

export function ReviewStep({ wizard }: Props) {
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
  } = wizard;

  return (
    <div className="space-y-4">
      <Panel className="p-6">
        <h3 className="font-bold text-gray-900 mb-4">Rezumat smetă</h3>
        {(activeCustomPricing.customUnitPriceSqm ||
          activeCustomPricing.customDurationDays ||
          activeCustomPricing.customLaborHours ||
          activeCustomPricing.customLaborTotal) && (
          <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-sm text-gray-700 space-y-1">
            <p className="font-bold text-gray-900">Tarife personalizate aplicate</p>
            {activeCustomPricing.customUnitPriceSqm ? (
              <p>Preț / m²: {activeCustomPricing.customUnitPriceSqm.toLocaleString('ro-MD')} MDL</p>
            ) : null}
            {activeCustomPricing.customLaborTotal ? (
              <p>Preț total fix manoperă: {activeCustomPricing.customLaborTotal.toLocaleString('ro-MD')} MDL</p>
            ) : null}
            {activeCustomPricing.customDurationDays ? (
              <p>Durată: {activeCustomPricing.customDurationDays} zile</p>
            ) : null}
            {activeCustomPricing.customLaborHours ? (
              <p>Ore manoperă: {activeCustomPricing.customLaborHours}</p>
            ) : null}
          </div>
        )}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">Manoperă</p>
            <p className="text-xl font-black text-gray-900">{Number(project.laborTotal).toLocaleString('ro-MD')} MDL</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">Materiale</p>
            <p className="text-xl font-black text-gray-900">{Number(project.materialTotal).toLocaleString('ro-MD')} MDL</p>
          </div>
          <div className="rounded-2xl bg-violet-50 p-4 border border-violet-100">
            <p className="text-xs text-violet-600">Total cu marjă {Number(project.marginPct)}%</p>
            <p className="text-2xl font-black text-violet-700">{Number(project.grandTotal).toLocaleString('ro-MD')} MDL</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {canSendEstimate ? (
            <button
              type="button"
              onClick={handleSendEstimate}
              disabled={sendEstimate.isPending}
              className={cabinetBtnPrimary}
            >
              <Send className="w-4 h-4" /> {sendEstimate.isPending ? 'Se trimite...' : 'Trimite smeta clientului'}
            </button>
          ) : null}
          <button type="button" onClick={handleGenerateQuote} disabled={!!project.quote || generateQuote.isPending} className={cabinetBtnPrimary}>
            <FileText className="w-4 h-4" /> Generează deviz
          </button>
          {canConvertEstimate ? (
            <>
              <button type="button" onClick={() => handleConvert('single')} className={cabinetBtnSecondary}>
                <Hammer className="w-4 h-4" /> O lucrare
              </button>
              <button type="button" onClick={() => handleConvert('by-stage')} className={cabinetBtnSecondary}>
                <Send className="w-4 h-4" /> Câte o lucrare / etapă
              </button>
            </>
          ) : (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              Convertirea în lucrări este disponibilă după ce clientul acceptă smeta în portal.
            </p>
          )}
          {project.quote && (
            <Link to="/company/oferte" className={cabinetBtnSecondary}>
              Vezi deviz {project.quote.number}
            </Link>
          )}
        </div>
      </Panel>

      <Panel className="p-6">
        <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2 mb-1">
          <Paperclip className="w-5 h-5 text-violet-600 animate-pulse" /> Detalii materiale, prețuri și bonuri de plată
        </h3>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          Mărește precizia smetei ajustând prețurile reale din magazine, adăugând denumirea magazinului de achiziție și atașând chitanțele / bonurile fiscale pentru transparență totală față de client.
        </p>

        <div className="space-y-6">
          {(project.stages as EstimateStageDto[]).map((stage) => {
            const materialLines = (stage.lines ?? []).filter((l) => l.source !== 'stage-default');
            if (materialLines.length === 0) return null;

            return (
              <div key={stage.id} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-3 shadow-xs">
                <div className="font-extrabold text-sm text-gray-800 border-b border-gray-100/80 pb-2 flex items-center justify-between">
                  <span className="text-gray-900 font-bold text-sm">Etapa: {stage.name}</span>
                  <span className="text-xs font-semibold text-violet-600">Total etapă: {Number(stage.stageTotal).toLocaleString('ro-MD')} MDL</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="py-2">Descriere</th>
                        <th className="py-2 w-20">Cantitate</th>
                        <th className="py-2 w-20">Unitate</th>
                        <th className="py-2 w-28">Preț Unitar</th>
                        <th className="py-2 w-28">Total</th>
                        <th className="py-2">Magazin / Sursă</th>
                        <th className="py-2 text-right">Bon de Casă / Chec</th>
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
                            <td className="py-3 font-semibold text-gray-700">{line.description}</td>
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
                                className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium"
                              />
                            </td>
                            <td className="py-3 text-gray-500 font-medium">{line.unit}</td>
                            <td className="py-3">
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
                                <span className="text-[10px] text-gray-400 italic">Serviciu / Manoperă</span>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    placeholder="Ex: Supraten, Leroy"
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
                                        <Eye className="w-3.5 h-3.5" /> Vizualizează
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
                                        <span className="animate-pulse">Se încarcă...</span>
                                      ) : (
                                        <>
                                          <Plus className="w-3 h-3" /> Atașează Bon
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
    </div>
  );
}
