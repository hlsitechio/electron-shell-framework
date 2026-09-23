import { create } from 'zustand'

export interface TabState {
  activeId: string
  setActive: (id: string) => void
}

export const useTabsStore = create<TabState>((set) => ({
  /**
   * The landing page. A consumer app replaces the page registry, so this must
   * match that app's first page — the shell routes an unknown id to `pages[0]`,
   * but starting on a wrong-yet-valid id is a silent misroute, not an error.
   * Keep it in sync with `pages/registry.tsx`.
   */
  activeId: 'reframe',
  setActive: (id) => set({ activeId: id })
}))
