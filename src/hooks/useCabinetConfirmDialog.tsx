import { useCallback, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CabinetConfirmDialog } from '@/components/cabinet/CabinetConfirmDialog';

export type CabinetConfirmRequest = {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void | Promise<void>;
};

export type AskCabinetConfirm = (request: CabinetConfirmRequest) => void;

export function useCabinetConfirmDialog() {
  const { t } = useTranslation();
  const [pending, setPending] = useState<CabinetConfirmRequest | null>(null);
  const [confirming, setConfirming] = useState(false);

  const ask = useCallback((request: CabinetConfirmRequest) => {
    setPending(request);
  }, []);

  const close = useCallback(() => {
    if (confirming) return;
    setPending(null);
  }, [confirming]);

  const handleConfirm = useCallback(async () => {
    if (!pending) return;
    setConfirming(true);
    try {
      await pending.onConfirm();
      setPending(null);
    } finally {
      setConfirming(false);
    }
  }, [pending]);

  const dialog = (
    <CabinetConfirmDialog
      open={!!pending}
      onClose={close}
      title={pending?.title ?? ''}
      confirmLabel={pending?.confirmLabel ?? t('cabinet.common.delete')}
      variant={pending?.variant ?? 'danger'}
      confirming={confirming}
      onConfirm={() => void handleConfirm()}
    >
      {pending?.message ?? null}
    </CabinetConfirmDialog>
  );

  return { ask, dialog, close };
}
