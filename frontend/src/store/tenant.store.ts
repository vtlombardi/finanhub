import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TenantState {
  tenantId: string | null;
  tenantName: string | null;
  setTenant: (id: string, name: string) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      tenantId: null,
      tenantName: null,
      setTenant: (id, name) => set({ tenantId: id, tenantName: name }),
      clearTenant: () => set({ tenantId: null, tenantName: null }),
    }),
    {
      name: 'finanhub-tenant-storage', // salva no localStorage nativamente
    }
  )
);
