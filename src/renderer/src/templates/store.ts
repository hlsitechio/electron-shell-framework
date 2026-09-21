import { create } from 'zustand'
import type { AppTemplate } from './types'

/**
 * Which app template is live.
 *
 * The store keeps the LOADED template object (not just its id) because
 * templates are lazily imported: the shell needs the pages as soon as the
 * import resolves, and holding it here avoids re-fetching on every render.
 *
 * Applying a template swaps the page set, the shell layout and the color
 * preset together — that is what makes it an "app" and not a theme.
 *
 * The default is the framework's own demo registry (FRAMEWORK_ID), so a
 * fresh clone opens on the shell showcase rather than a random app.
 */
export const FRAMEWORK_ID = 'framework'

interface TemplateState {
  /** the live template id, or FRAMEWORK_ID for the demo registry */
  activeId: string
  /** the loaded template (null while the lazy import is in flight) */
  active: AppTemplate | null
  setActive: (id: string, template: AppTemplate | null) => void
  reset: () => void
}

export const useTemplateStore = create<TemplateState>((set) => ({
  activeId: FRAMEWORK_ID,
  active: null,
  setActive: (id, template) => set({ activeId: id, active: template }),
  reset: () => set({ activeId: FRAMEWORK_ID, active: null })
}))
