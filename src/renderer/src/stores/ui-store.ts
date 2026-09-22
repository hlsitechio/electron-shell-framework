import { create } from 'zustand'

export type SidebarMode = 'expanded' | 'collapsed'

interface UiState {
  leftCollapsed: boolean
  rightOpen: boolean
  rightWidth: number
  leftWidth: number
  tabsCollapsed: boolean
  bottomOpen: boolean
  toggleLeft: () => void
  setLeftCollapsed: (v: boolean) => void
  toggleRight: () => void
  setRightOpen: (v: boolean) => void
  setLeftWidth: (w: number) => void
  setRightWidth: (w: number) => void
  toggleTabs: () => void
  setTabsCollapsed: (v: boolean) => void
  toggleBottom: () => void
}

export const useUiStore = create<UiState>((set) => ({
  leftCollapsed: false,
  rightOpen: true,
  rightWidth: 260,
  leftWidth: 220,
  tabsCollapsed: false,
  bottomOpen: true,
  toggleLeft: () => set((s) => ({ leftCollapsed: !s.leftCollapsed })),
  setLeftCollapsed: (v) => set({ leftCollapsed: v }),
  toggleRight: () => set((s) => ({ rightOpen: !s.rightOpen })),
  setRightOpen: (v) => set({ rightOpen: v }),
  setLeftWidth: (w) => set({ leftWidth: Math.min(320, Math.max(150, w)) }),
  setRightWidth: (w) => set({ rightWidth: Math.min(420, Math.max(240, w)) }),
  toggleTabs: () => set((s) => ({ tabsCollapsed: !s.tabsCollapsed })),
  setTabsCollapsed: (v) => set({ tabsCollapsed: v }),
  toggleBottom: () => set((s) => ({ bottomOpen: !s.bottomOpen }))
}))
