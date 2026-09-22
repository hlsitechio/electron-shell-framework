import type { ComponentType } from 'react'
import type { PageDefinition } from '@renderer/types/pages'

/**
 * An APP TEMPLATE — a complete app you can start from.
 *
 * A template is not a color scheme and not a snippet: it ships the pages,
 * the layout (which shell surfaces are open and how wide) and the color
 * preset that suits the job. Applying one turns the bare shell into a
 * working Finance / Chat / IDE app in a single click.
 */
export interface AppTemplate {
  id: string
  name: string
  /** one line, shown in the gallery */
  tagline: string
  description: string
  /** lucide icon for the gallery card */
  icon: ComponentType<{ className?: string }>
  /** the pages this app registers — becomes the sidebar + tabs + content */
  pages: PageDefinition[]
  /** which page opens on launch */
  home: string
  /** shell layout applied with the template */
  layout: Partial<{
    leftCollapsed: boolean
    rightOpen: boolean
    rightWidth: number
    leftWidth: number
    tabsCollapsed: boolean
    bottomOpen: boolean
  }>
  /**
   * Shell composition mode this template wants. Omit for `dashboard`.
   *
   * A writing/notes app sets `studio` so it gets a navigation tree and a
   * document action bar instead of a tab strip — which is the difference
   * between using the shell and forking it.
   */
  mode?: 'dashboard' | 'studio' | 'compact'
  /** the color preset this app pairs with (see lib/presets.ts) */
  preset: string
  /** the shape of the data this app expects — the agent contract */
  dataShape: string
  /** what to build next when extending this app */
  extendWith: string[]
}
