import { useEffect, useRef } from 'react';

export function useModalLockAndEscape(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
      }
    };

    document.body.classList.add('modal-open');
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);
}
