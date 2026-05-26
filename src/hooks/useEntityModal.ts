import { useCallback, useState } from 'react';

export function useEntityModal<T = void>(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);
  const [entity, setEntity] = useState<T | null>(null);

  const openModal = useCallback((item?: T) => {
    setEntity(item ?? null);
    setOpen(true);
  }, []);

  const openCreate = useCallback(() => {
    setEntity(null);
    setOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setEntity(item);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setEntity(null);
  }, []);

  return {
    open,
    entity,
    isEditing: entity != null,
    openModal,
    openCreate,
    openEdit,
    closeModal,
    setOpen,
  };
}
