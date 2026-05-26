import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, FileSpreadsheet, Upload } from 'lucide-react';
import { AppModal } from '@/components/ui/AppModal';
import { getErrorMessage } from '@/utils/errors';
import {
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetLabelClass,
  EmptyState,
  SoftBadge,
} from '@/components/cabinet/cabinet-ui';
import {
  CUSTOMER_IMPORT_ACTION_LABELS,
  CUSTOMER_IMPORT_ACTION_TONES,
} from '@/constants/customerImport.constants';
import {
  downloadCustomerImportTemplate,
  useConfirmCustomerImportMutation,
  usePreviewCustomerImportMutation,
  type CustomerImportPreviewResult,
} from '@/features/fsm/api/useCustomerImport';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CustomerImportModal({ open, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewImport = usePreviewCustomerImportMutation();
  const confirmImport = useConfirmCustomerImportMutation();
  const [preview, setPreview] = useState<CustomerImportPreviewResult | null>(null);
  const [fileName, setFileName] = useState('');

  const reset = () => {
    setPreview(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDownload = async (format: 'xlsx' | 'csv') => {
    try {
      await downloadCustomerImportTemplate(format);
      toast.success(format === 'xlsx' ? 'Șablon Excel descărcat.' : 'Șablon CSV descărcat.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut descărca șablonul.'));
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    try {
      const result = await previewImport.mutateAsync(file);
      setPreview(result);
      if (result.summary.error > 0) {
        toast.error(`${result.summary.error} rânduri cu erori — verificați previzualizarea.`);
      } else {
        toast.success('Fișier analizat. Verificați previzualizarea înainte de import.');
      }
    } catch (err: unknown) {
      setPreview(null);
      toast.error(getErrorMessage(err, 'Nu s-a putut analiza fișierul.'));
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;

    const rows = preview.rows
      .filter((row) => row.action === 'create' || row.action === 'update')
      .map((row) => ({
        action: row.action as 'create' | 'update',
        fullName: row.fullName,
        phone: row.phone,
        email: row.email,
        address: row.address,
        notes: row.notes,
        existingCustomerId: row.existingCustomerId,
      }));

    if (!rows.length) {
      toast.error('Nu există rânduri valide de importat.');
      return;
    }

    try {
      const result = await confirmImport.mutateAsync(rows);
      toast.success(
        `Import finalizat: ${result.created} noi, ${result.updated} actualizați${result.skipped ? `, ${result.skipped} omise` : ''}.`,
      );
      handleClose();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Importul a eșuat.'));
    }
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Import clienți din Excel / CSV"
      size="xl"
      backgroundIndex={1}
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 space-y-3">
          <p className="text-sm font-semibold text-violet-900">Pasul 1 — Descarcă șablonul Faber</p>
          <p className="text-xs text-violet-800/80 leading-relaxed">
            Șablonul Excel include foaie de instrucțiuni, antet profesional și exemple. Coloane
            obligatorii: <strong>Nume complet</strong>, <strong>Telefon</strong>,{' '}
            <strong>Adresă</strong>.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleDownload('xlsx')}
              className={`${cabinetBtnPrimary} inline-flex items-center gap-2`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Șablon Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={() => void handleDownload('csv')}
              className={`${cabinetBtnSecondary} inline-flex items-center gap-2`}
            >
              <Download className="h-4 w-4" />
              Șablon CSV
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-900">Pasul 2 — Încarcă fișierul completat</p>
          <label className={cabinetLabelClass}>Fișier .xlsx sau .csv</label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              onChange={(e) => void handleFileChange(e)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={previewImport.isPending}
              className={`${cabinetBtnSecondary} inline-flex items-center gap-2`}
            >
              <Upload className="h-4 w-4" />
              {previewImport.isPending ? 'Se analizează…' : 'Selectează fișier'}
            </button>
            {fileName ? <span className="text-xs text-gray-500 truncate max-w-xs">{fileName}</span> : null}
          </div>
        </div>

        {preview ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <SoftBadge tone="violet">{preview.summary.total} total</SoftBadge>
              <SoftBadge tone="emerald">{preview.summary.create} noi</SoftBadge>
              <SoftBadge tone="blue">{preview.summary.update} actualizări</SoftBadge>
              <SoftBadge tone="gray">{preview.summary.skip} omise</SoftBadge>
              <SoftBadge tone="amber">{preview.summary.error} erori</SoftBadge>
            </div>

            <div className="max-h-72 overflow-auto rounded-xl border border-gray-100">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-gray-50 text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Nume</th>
                    <th className="p-2">Telefon</th>
                    <th className="p-2">Adresă</th>
                    <th className="p-2">Acțiune</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.rows.map((row) => (
                    <tr key={row.rowNumber} className="align-top">
                      <td className="p-2 text-gray-400">{row.rowNumber}</td>
                      <td className="p-2 font-semibold text-gray-900">{row.fullName}</td>
                      <td className="p-2">{row.phone}</td>
                      <td className="p-2 text-gray-600 max-w-[180px] truncate" title={row.address}>
                        {row.address}
                      </td>
                      <td className="p-2 space-y-1">
                        <SoftBadge tone={CUSTOMER_IMPORT_ACTION_TONES[row.action]}>
                          {CUSTOMER_IMPORT_ACTION_LABELS[row.action]}
                        </SoftBadge>
                        {row.reason ? (
                          <p className="text-[10px] text-gray-400 leading-snug">{row.reason}</p>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState message="Încarcă un fișier pentru previzualizare înainte de import." />
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button type="button" onClick={handleClose} className={cabinetBtnSecondary}>
            Anulează
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!preview || confirmImport.isPending || preview.summary.create + preview.summary.update === 0}
            className={cabinetBtnPrimary}
          >
            {confirmImport.isPending ? 'Se importă…' : 'Confirmă importul'}
          </button>
        </div>
      </div>
    </AppModal>
  );
}
