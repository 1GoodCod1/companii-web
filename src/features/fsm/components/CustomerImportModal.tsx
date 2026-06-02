import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Download, FileSpreadsheet, Upload } from 'lucide-react';
import { AppModal } from '@/shared/ui/AppModal';
import { getErrorMessage } from '@/shared/utils/errors';
import {
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetLabelClass,
  EmptyState,
  SoftBadge,
} from '@/widgets/cabinet/cabinet-ui';
import {
  CUSTOMER_IMPORT_ACTION_TONES,
  type CustomerImportAction,
} from '@/entities/fsm/model/customerImport.constants';
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

function importActionLabel(action: CustomerImportAction, t: (key: string) => string): string {
  return t(`company.fsm.customers.import.actions.${action}`);
}

export function CustomerImportModal({ open, onClose }: Props) {
  const { t } = useTranslation();
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
      toast.success(
        t('company.fsm.customers.import.toast.templateDownloaded', { format: format.toUpperCase() }),
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.customers.import.toast.templateError')));
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
        toast.error(
          t('company.fsm.customers.import.toast.previewErrors', { count: result.summary.error }),
        );
      } else {
        toast.success(t('company.fsm.customers.import.toast.previewReady'));
      }
    } catch (err: unknown) {
      setPreview(null);
      toast.error(getErrorMessage(err, t('company.fsm.customers.import.toast.previewError')));
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
      toast.error(t('company.fsm.customers.import.toast.noValidRows'));
      return;
    }

    try {
      const result = await confirmImport.mutateAsync(rows);
      toast.success(
        t('company.fsm.customers.import.toast.completed', {
          created: result.created,
          updated: result.updated,
          skipped: result.skipped,
        }),
      );
      handleClose();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.customers.import.toast.failed')));
    }
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title={t('company.fsm.customers.import.title')}
      size="xl"
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 space-y-3">
          <p className="text-sm font-semibold text-violet-900">{t('company.fsm.customers.import.step1.title')}</p>
          <p className="text-xs text-violet-800/80 leading-relaxed">
            {t('company.fsm.customers.import.step1.description')}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleDownload('xlsx')}
              className={`${cabinetBtnPrimary} inline-flex items-center gap-2`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {t('company.fsm.customers.import.step1.downloadXlsx')}
            </button>
            <button
              type="button"
              onClick={() => void handleDownload('csv')}
              className={`${cabinetBtnSecondary} inline-flex items-center gap-2`}
            >
              <Download className="h-4 w-4" />
              {t('company.fsm.customers.import.step1.downloadCsv')}
            </button>
          </div>
        </div>

        <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
          {t('company.fsm.customers.import.or')}
        </p>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-900">{t('company.fsm.customers.import.step2.title')}</p>
          <label className={cabinetLabelClass}>{t('company.fsm.customers.import.step2.fileLabel')}</label>
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
              {previewImport.isPending
                ? t('company.fsm.customers.import.step2.analyzing')
                : t('company.fsm.customers.import.step2.selectFile')}
            </button>
            {fileName ? <span className="text-xs text-gray-500 truncate max-w-xs">{fileName}</span> : null}
          </div>
        </div>

        {preview ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <SoftBadge tone="violet">
                {t('company.fsm.customers.import.summary.total', { count: preview.summary.total })}
              </SoftBadge>
              <SoftBadge tone="emerald">
                {t('company.fsm.customers.import.summary.create', { count: preview.summary.create })}
              </SoftBadge>
              <SoftBadge tone="blue">
                {t('company.fsm.customers.import.summary.update', { count: preview.summary.update })}
              </SoftBadge>
              <SoftBadge tone="gray">
                {t('company.fsm.customers.import.summary.skip', { count: preview.summary.skip })}
              </SoftBadge>
              <SoftBadge tone="amber">
                {t('company.fsm.customers.import.summary.error', { count: preview.summary.error })}
              </SoftBadge>
            </div>

            <div className="max-h-72 overflow-auto rounded-xl border border-gray-100">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-gray-50 text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="p-2">{t('company.fsm.customers.import.preview.columns.row')}</th>
                    <th className="p-2">{t('company.fsm.customers.import.preview.columns.name')}</th>
                    <th className="p-2">{t('company.fsm.customers.import.preview.columns.phone')}</th>
                    <th className="p-2">{t('company.fsm.customers.import.preview.columns.address')}</th>
                    <th className="p-2">{t('company.fsm.customers.import.preview.columns.action')}</th>
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
                          {importActionLabel(row.action, t)}
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
          <EmptyState message={t('company.fsm.customers.import.preview.empty')} />
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button type="button" onClick={handleClose} className={cabinetBtnSecondary}>
            {t('cabinet.common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!preview || confirmImport.isPending || preview.summary.create + preview.summary.update === 0}
            className={cabinetBtnPrimary}
          >
            {confirmImport.isPending
              ? t('company.fsm.customers.import.confirming')
              : t('company.fsm.customers.import.confirm')}
          </button>
        </div>
      </div>
    </AppModal>
  );
}
