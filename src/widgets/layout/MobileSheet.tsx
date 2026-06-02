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
  const overlayRef = useRef<HTMLDivElement>(null);
  const animatingRef = useRef(false);
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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
  }, [open, onClose]);

  if (!open) return null;

  const translateClass = side === 'left' ? 'translate-x-0' : 'translate-x-0';

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={cn(
        'fixed inset-0 z-50 flex',
        side === 'left' ? 'justify-start' : 'justify-end',
        'bg-black/40 transition-colors duration-250',
      )}
    >
      <div
        className={cn(
          'h-full w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col',
          'transition-transform duration-250 ease-out',
          translateClass,
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}