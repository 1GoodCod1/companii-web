import { useCallback, useState } from 'react';

export function useEntitySelection<TId extends string = string>() {
  const [selectedId, setSelectedId] = useState<TId | null>(null);

  const select = useCallback((id: TId) => {
    setSelectedId(id);
  }, []);

  const clear = useCallback(() => {
    setSelectedId(null);
  }, []);

  const isSelected = useCallback((id: TId) => selectedId === id, [selectedId]);

  return {
    selectedId,
    select,
    clear,
    isSelected,
    setSelectedId,
  };
}
