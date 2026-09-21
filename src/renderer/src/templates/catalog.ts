import type { AppTemplate } from './types'
import { CATALOG, type TemplateMeta } from './manifest'

export type { TemplateMeta } from './manifest'
export { CATALOG, getMeta, resolveTemplateId } from './manifest'

/**
 * Template loading is lazy on purpose.
 *
 * The framework core (shell + widgets + presets) must boot without any
 * template's page code. Each template is its own chunk, fetched the first
 * time someone opens or applies it — which is what keeps the boot bundle
 * lean as the catalog grows.
 */
const LOADERS: Record<string, () => Promise<AppTemplate>> = {
  notes: () => import('./notes').then((m) => m.notesTemplate),
  editor: () => import('./editor').then((m) => m.editorTemplate),
  media: () => import('./media').then((m) => m.mediaTemplate),
  devtools: () => import('./devtools').then((m) => m.devtoolsTemplate),
  chat: () => import('./chat').then((m) => m.chatTemplate),
  dashboard: () => import('./dashboard').then((m) => m.dashboardTemplate),
  tasks: () => import('./tasks').then((m) => m.tasksTemplate),
  workspace: () => import('./workspace').then((m) => m.workspaceTemplate),
  reader: () => import('./reader').then((m) => m.readerTemplate),
  finance: () => import('./finance').then((m) => m.financeTemplate)
}

const cache = new Map<string, AppTemplate>()

export async function loadTemplate(id: string): Promise<AppTemplate | null> {
  if (cache.has(id)) return cache.get(id)!
  const loader = LOADERS[id]
  if (!loader) return null
  const t = await loader()
  cache.set(id, t)
  return t
}

/** Ids that actually have code behind them (guards a stale catalog entry). */
export function isLoadable(id: string): boolean {
  return id in LOADERS
}

/** Every catalog entry that can be loaded. */
export function loadableCatalog(): TemplateMeta[] {
  return CATALOG.filter((m) => isLoadable(m.id))
}
