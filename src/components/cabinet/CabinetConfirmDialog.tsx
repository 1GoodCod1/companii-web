import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { cabinetBtnPrimary, cabinetBtnSecondary } from '@/components/cabinet/cabinet-ui';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  confirming?: boolean;
  variant?: 'danger' | 'primary';
};

export function CabinetConfirmDialog({
  open,
  onClose,
  title,
  children,
  confirmLabel,
  onConfirm,
  confirming = false,
  variant = 'danger',
}: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.classList.add('modal-open');
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label={t('cabinet.common.closeAria')}
        className="absolute inset-0 cursor-default border-0 bg-black/40 p-0"
        onClick={onClose}
      />

      <div
        className="relative z-10 w-full max-w-md border border-gray-200 bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
        </div>

        <div className="px-5 py-4">{children}</div>

        <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50/80 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className={cabinetBtnSecondary}
          >
            {t('cabinet.common.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className={
              variant === 'primary'
                ? `${cabinetBtnPrimary} disabled:opacity-50`
                : 'inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-none font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer'
            }
          >
            {confirming ? t('cabinet.common.loading') : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
