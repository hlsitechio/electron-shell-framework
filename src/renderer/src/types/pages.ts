import type { ComponentType, CSSProperties } from 'react'

export type PageIcon =
  | ComponentType<{
      className?: string
      size?: number | string
      style?: CSSProperties
      'aria-hidden'?: boolean | 'true' | 'false'
    }>
  | string

/** A registerable shell page. Adding one here = tab + sidebar item + content. */
export interface PageDefinition {
  id: string
  /**
   * Human-readable label for navigation, tabs, and tooltips.
   * If omitted, the shell automatically derives it from the `id` (e.g. 'audit-logs' -> 'Audit Logs').
   */
  label?: string
  description?: string
  /** Rendered in the left sidebar and tabs (supports Lucide components or SVGL name string/svgl() helper). */
  icon: PageIcon
  component: ComponentType
  /** Optional right-panel view for this page (chat inspectors, detail panes…). */
  rightPanel?: ComponentType
  /** Groups this page under a category in the tab bar (rendered as a sub-tab). */
  category?: string
  /** When false the page hides from the sidebar (e.g. settings). */
  showInSidebar?: boolean
}

/** Resolves the human-readable label for a page, automatically deriving one if omitted or empty. */
export function getPageLabel(page: { id: string; label?: string }): string {
  if (page.label && page.label.trim().length > 0) {
    return page.label.trim()
  }
  return page.id
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
