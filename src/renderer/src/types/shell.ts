import type { ComponentType, ReactNode } from 'react'
import type { PageDefinition } from '@renderer/types/pages'

/**
 * Shell layout modes.
 *
 * The framework used to have exactly one shape — sidebar + tab bar + page
 * registry + right panel, which is a *dashboard*. Every other kind of app
 * (writing studio, media library, chat client) had to fork the shell to exist,
 * and a fork means losing the grid, the theming and every future fix.
 *
 * A mode is a named composition of chrome. Adding one is adding a component,
 * not editing this file's call sites.
 *
 * - `dashboard` — the original. Tabs ARE the navigation; pages come from a
 *   registry. Right panel is the page's own inspector.
 * - `studio`    — sidebar tree is the navigation; the top bar is a document
 *   action bar. For writing, note, and canvas apps.
 * - `compact`   — navigation hidden behind the top bar; full-bleed content.
 *   For single-purpose utilities and focus modes.
 */
export type ShellMode = 'dashboard' | 'studio' | 'compact'

/**
 * A layout mode implementation.
 *
 * `chrome` is the full render — a mode owns the entire composition, because a
 * studio's sidebar and top bar are structurally different from a dashboard's,
 * not merely re-arranged. `slots` are the pieces an app fills.
 */
export interface ShellLayout {
  id: ShellMode
  label: string
  description: string
  /** Default preset suggested for this mode (see lib/presets.ts). */
  defaultPreset: string
}

export const SHELL_LAYOUTS: Record<ShellMode, ShellLayout> = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Tabs as navigation, page registry, per-page right inspector.',
    defaultPreset: 'muted-violet'
  },
  studio: {
    id: 'studio',
    label: 'Studio',
    description: 'Sidebar tree as navigation, document action bar, content-first canvas.',
    defaultPreset: 'carbon'
  },
  compact: {
    id: 'compact',
    label: 'Compact',
    description: 'Navigation behind the top bar, full-bleed content.',
    defaultPreset: 'frost'
  }
}

/** Props every mode receives from AppShell. */
export interface ShellModeProps {
  pages: PageDefinition[]
  activeId: string
  onSelect: (id: string) => void
  title: string
  platform?: string
  /** Mode-specific content, supplied by the app via AppShell slots. */
  slots?: ShellSlots
}

/** App-supplied content for mode-specific regions. */
export interface ShellSlots {
  /** studio: brand / workspace switcher at the top of the sidebar. */
  sidebarHeader?: ReactNode
  /** studio: the navigation tree. */
  sidebarTree?: ReactNode
  /** studio: profile card + actions above the collapse toggle. */
  sidebarFooter?: ReactNode
  /** studio: breadcrumb / document path in the top bar. */
  breadcrumb?: ReactNode
  /** studio: document actions (word count, revisions, export). */
  topBarActions?: ReactNode
  /** Any mode: override the main content. Falls back to the active page. */
  content?: ReactNode
  /** Any mode: right dock content. */
  rightDock?: ReactNode
}

/** Convenience alias for a mode's component signature. */
export type ShellModeComponent = ComponentType<ShellModeProps>
