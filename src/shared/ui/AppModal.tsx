import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const SIZE_CLASSES = {
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const;

export type AppModalSize = keyof typeof SIZE_CLASSES;

export function AppModal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'lg',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: AppModalSize;
}) {
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
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
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
        className={cn(
          'relative z-10 flex max-h-[min(92vh,900px)] w-full flex-col overflow-hidden rounded-none border border-gray-200 bg-white shadow-xl animate-modal-in',
          SIZE_CLASSES[size],
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-5 sm:px-8">
          <h3 className="text-lg font-black tracking-tight text-gray-900 sm:text-xl">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-none text-xl font-medium text-gray-400 transition-colors hover:bg-slate-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">{children}</div>

        {footer ? (
          <div className="shrink-0 border-t border-gray-100 bg-gray-50/80 px-6 py-4 sm:px-8">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
