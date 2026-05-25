import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompanyContextState {
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string | null) => void;
}

export const useCompanyContextStore = create<CompanyContextState>()(
  persist(
    (set) => ({
      activeCompanyId: null,
      setActiveCompanyId: (id) => set({ activeCompanyId: id }),
    }),
    { name: 'companii-active-company' },
  ),
);
