import type { ComponentType, CSSProperties } from 'react'

/** A registerable shell page. Adding one here = tab + sidebar item + content. */
export interface PageDefinition {
  id: string
  label: string
  description?: string
  /** Rendered in the left sidebar (collapsed mode shows icon only). */
  icon: ComponentType<{ className?: string; size?: number | string; style?: CSSProperties }>
  component: ComponentType
  /** Optional right-panel view for this page (chat inspectors, detail panes…). */
  rightPanel?: ComponentType
  /** Groups this page under a category in the tab bar (rendered as a sub-tab). */
  category?: string
  /** When false the page hides from the sidebar (e.g. settings). */
  showInSidebar?: boolean
}
