import { useEffect, useMemo, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const MODAL_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1607472586897-f84ec1296b41?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1920&q=80',
] as const;

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
  backgroundIndex,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: AppModalSize;
  backgroundIndex?: number;
}) {
  const { t } = useTranslation();
  const bgIndex = useMemo(() => {
    if (backgroundIndex !== undefined) {
      return backgroundIndex % MODAL_BACKGROUNDS.length;
    }
    let hash = 0;
    for (let i = 0; i < title.length; i += 1) {
      hash = (hash + title.charCodeAt(i) * (i + 1)) % MODAL_BACKGROUNDS.length;
    }
    return hash;
  }, [backgroundIndex, title]);

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
        className="absolute inset-0 cursor-default border-0 p-0"
        onClick={onClose}
      >
        <span
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: `url(${MODAL_BACKGROUNDS[bgIndex]})` }}
        />
        <span className="absolute inset-0 bg-slate-950/80 backdrop-blur-[3px]" />
      </button>

      <div
        className={cn(
          'relative z-10 flex max-h-[min(92vh,900px)] w-full flex-col overflow-hidden rounded-none border border-white/30 bg-white/95 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl animate-modal-in',
          SIZE_CLASSES[size],
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 py-5 sm:px-8">
          <h3 className="text-lg font-black tracking-tight text-gray-900 sm:text-xl">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-none text-xl font-medium text-gray-400 transition-colors hover:bg-slate-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white/90 px-6 py-6 sm:px-8">{children}</div>

        {footer ? (
          <div className="shrink-0 border-t border-slate-200/80 bg-slate-50/90 px-6 py-4 sm:px-8">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
