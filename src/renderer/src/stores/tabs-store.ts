import { create } from 'zustand'

export interface TabState {
  activeId: string
  setActive: (id: string) => void
}

export const useTabsStore = create<TabState>((set) => ({
  activeId: 'dashboard',
  setActive: (id) => set({ activeId: id })
}))
