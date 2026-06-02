'use client';

import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface MobileSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
  className?: string;
}

export function MobileSheet({
  open,
  onClose,
  children,
  side = 'left',
  className,
}: MobileSheetProps) {
  const overlayRef = useRef<HTMLButtonElement>(null);
  const animatingRef = useRef(false);
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
      animatingRef.current = true;
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
      animatingRef.current = false;
    };
  }, [open]);

  if (!open) return null;

  const translateClass = side === 'left' ? 'translate-x-0' : 'translate-x-0';

  return (
    <dialog
      aria-label="Mobile menu"
      className={cn(
        'fixed inset-0 z-50 m-0 flex size-full max-h-none max-w-none border-0 bg-transparent p-0',
        side === 'left' ? 'justify-start' : 'justify-end',
      )}
    >
      <button
        type="button"
        ref={overlayRef}
        aria-label="Close menu"
        onClick={handleOverlayClick}
        className={cn(
          'absolute inset-0 border-0 bg-black/40 transition-colors duration-250 cursor-pointer',
        )}
      />
      <div
        className={cn(
          'relative z-10 h-full w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col',
          'transition-transform duration-250 ease-out',
          translateClass,
          className,
        )}
      >
        {children}
      </div>
    </dialog>
  );
}