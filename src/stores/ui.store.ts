// stores/ui.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIState = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean | ((p: boolean) => boolean)) => void;

  hoverOpen: boolean;
  setHoverOpen: (v: boolean) => void;
  hoverEnabled: boolean;
  setHoverEnabled: (v: boolean) => void;

  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (v: boolean | ((p: boolean) => boolean)) => void;
};

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (v) =>
        set((s) => ({
          sidebarCollapsed: typeof v === "function" ? (v as any)(s.sidebarCollapsed) : v,
        })),
      hoverOpen: false,
      setHoverOpen: (v) => set({ hoverOpen: v }),
      hoverEnabled: false,
      setHoverEnabled: (v) => set({ hoverEnabled: v }),

      mobileSidebarOpen: false,
      setMobileSidebarOpen: (v) =>
        set((s) => ({
          mobileSidebarOpen: typeof v === "function" ? (v as any)(s.mobileSidebarOpen) : v,
        })),
    }),
    { name: "gm_ui" }
  )
);
