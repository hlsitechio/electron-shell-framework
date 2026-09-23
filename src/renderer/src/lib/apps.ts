import { useTemplateStore, FRAMEWORK_ID, loadTemplate, getMeta } from '@renderer/templates'
import { useUiStore } from '@renderer/stores/ui-store'
import { useTabsStore } from '@renderer/stores/tabs-store'
import { getPreset } from '@renderer/lib/presets'
import type { AppTemplate } from '@renderer/templates/types'
import { getPageLabel } from '@renderer/types/pages'

/**
 * Applying an app template — the ONE function that turns the shell into an app.
 *
 * The Apps page, a CLI action and an agent all go through here, so they
 * behave identically. It is async because templates are lazily imported:
 * the code chunk is fetched, then the store is set, then the layout lands.
 */
export async function applyTemplate(
  id: string,
  opts: { setPreset?: (id: string) => void } = {}
): Promise<AppTemplate | null> {
  const t = await loadTemplate(id)
  if (!t) return null

  useTemplateStore.getState().setActive(t.id, t)
  opts.setPreset?.(t.preset)
  useTabsStore.getState().setActive(t.home)

  const ui = useUiStore.getState()
  ui.setLeftCollapsed(t.layout.leftCollapsed ?? false)
  ui.setRightOpen(t.layout.rightOpen ?? false)
  ui.setLeftWidth(t.layout.leftWidth ?? 220)
  ui.setRightWidth(t.layout.rightWidth ?? 260)
  ui.setTabsCollapsed(t.layout.tabsCollapsed ?? false)
  const wantBottom = t.layout.bottomOpen ?? false
  if (useUiStore.getState().bottomOpen !== wantBottom) useUiStore.getState().toggleBottom()

  return t
}

export function exitToFramework(): void {
  useTemplateStore.getState().reset()
  useTabsStore.getState().setActive('dashboard')
}

/**
 * A ready-to-paste recipe for the app build.
 *
 * This is what an agent (or a human) actually needs after picking a
 * template: which files to touch, in what order, and what to check before
 * claiming the client's app is done.
 */
export function buildRecipe(t: AppTemplate): string {
  const preset = getPreset(t.preset)
  const files = t.pages.map(
    (p) => `  - ${getPageLabel(p)} (id: ${p.id}${p.id === t.home ? ' — HOME' : ''})`
  )

  return [
    `# ${t.name} — build recipe`,
    ``,
    `Template:  ${t.id}`,
    `Preset:    ${t.preset} (${preset.name} — ${preset.tagline})`,
    `Home page: ${t.home}`,
    `Layout:    left ${t.layout.leftWidth ?? 220}px, right ${
      t.layout.rightOpen ? `open ${t.layout.rightWidth ?? 260}px` : 'closed'
    }, tabs ${t.layout.tabsCollapsed ? 'collapsed' : 'expanded'}, bottom ${
      t.layout.bottomOpen ? 'open' : 'closed'
    }`,
    ``,
    `## 1. Use it as-is`,
    `   npm start  →  Apps tab  →  click "${t.name}"`,
    ``,
    `## 2. Wire real data`,
    `   Data shape this app expects:`,
    `   ${t.dataShape}`,
    ``,
    `   Pages to edit:`,
    ...files,
    ``,
    `   Rules:`,
    `   - Replace the demo arrays with your data; keep the widget props.`,
    `   - Every widget already renders with zero props — never restyle one.`,
    `   - Add pages to the template's pages[] array; do not edit the shell.`,
    `   - One page per file: the shell needs nothing else.`,
    ``,
    `## 3. Rebrand`,
    `   - package.json "name" + electron-builder.yml "productName"`,
    `   - Settings → Branding for the in-app name/logo`,
    `   - Restyle only the tokens in styles/presets.css if the client has colors`,
    ``,
    `## 4. Ship`,
    `   npm run dist:win   → NSIS installer + portable exe in release/`,
    `   Tag vX.Y.Z and push → GitHub release → in-app auto-update`,
    ``,
    `## 5. Extend next (ranked)`,
    ...t.extendWith.map((e, i) => `   ${i + 1}. ${e}`)
  ].join('\n')
}

/** Resolve free text ("financial dashboard") to catalog metadata, no code load. */
export function describeAsk(query: string): { id: string; name: string; tagline: string } | null {
  const meta = getMeta(query)
  if (meta) return { id: meta.id, name: meta.name, tagline: meta.tagline }
  return null
}

export { FRAMEWORK_ID }
