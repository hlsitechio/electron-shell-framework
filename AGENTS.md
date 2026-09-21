# Agent guide — building in this repo

**Read this before writing code.** This repo is a reusable Electron **app shell**.
It ships the chrome, the theming system, a widget kit, and **ten app templates**.
An app is built by adding **pages** or **applying a template**.

If you are an AI agent working here, your job is to make the result look like it
belongs — not to invent a second design system next to the one already present.

---

## 0. The job this repo exists for

A user clones this repo, tells you _"build the financial dashboard our client
asked for, use the template inside"_, and expects to ship fast.

**When a user asks for an app, ask exactly one question first:**

> Do you want to build on one of the ten app templates already in this repo, or
> should I build it from scratch?

Then **match their words to the nearest templates and offer 2–3 choices. Do not
pick silently.**

```ts
import { resolveTemplateId } from '@renderer/templates'

resolveTemplateId('financial dashboard') // → 'finance'
resolveTemplateId('kanban for the team') // → 'tasks'
```

Then apply it and read the recipe it prints:

```ts
import { applyTemplate, buildRecipe } from '@renderer/lib/apps'
const t = await applyTemplate('finance', { setPreset })
console.log(buildRecipe(t)) // template id, preset, data shape, pages, rules, ship steps
```

Full catalog, the evidence behind each template, and the lazy-loading
architecture: **`docs/APP-TEMPLATES.md`**.

---

## 1. The two extension axes

| Axis             | What it changes                                     | Where                                 |
| ---------------- | --------------------------------------------------- | ------------------------------------- |
| **App template** | pages + layout + color preset — the whole app shape | `src/renderer/src/templates/`         |
| **Color preset** | tokens only — the look                              | `src/renderer/src/styles/presets.css` |

They are independent. A finance app can run on any of the ten presets; the
template just ships a sensible default (finance → `dark-indigo`).

Templates are **lazily imported** — each is its own bundle chunk. `manifest.ts`
carries display metadata only, so the gallery renders all ten previews without
loading any template code. **Do not add eager template imports to `manifest.ts`.**

---

## 2. The two-layer theme model

```
<html data-theme="dark" data-preset="shadow-peonies">
      └── mode          └── one of 10 app shells
```

- `data-theme` → `light | dark`. Base tokens live in `src/renderer/src/styles/theme.css`.
- `data-preset` → one of the 10 ids. Overrides live in `src/renderer/src/styles/presets.css`.
- **Both attributes are always present.** Selectors are written as
  `[data-theme='dark'][data-preset='x']` so specificity never depends on source order.
- Every preset defines **both** a dark and a light token set. A preset is not a mode.

Access it in React:

```tsx
import { useTheme } from '@renderer/components/theme/ThemeProvider'

const { theme, setTheme, toggleTheme, preset, presetMeta, setPreset } = useTheme()
```

In plain CSS or anywhere else, just use the tokens — never hardcode a color:

```tsx
style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--card-border))' }}
```

Tailwind utilities already map to these tokens: `bg-card`, `text-muted-foreground`,
`border-input`, `ring-ring`, `bg-sidebar-bg`, `bg-topbar-bg`.

---

## 3. Preset decision table — choose by job, not by color

| The user is building…                | Preset id         | Why                                      |
| ------------------------------------ | ----------------- | ---------------------------------------- |
| An AI chat / agent UI                | `shadow-peonies`  | blue-violet, calm for long conversations |
| A SaaS dashboard, client work        | `muted-violet`    | the house default, muted, no neon        |
| A data-dense admin / internal tool   | `noguchi`         | neutral ramp, doesn't fight the data     |
| Monitoring, logs, infrastructure     | `poiesis-blue`    | cold steel-blue, instrument-panel feel   |
| A B2B / finance / enterprise app     | `dark-indigo`     | institutional, trust-forward indigo      |
| Creative work, media, galleries      | `poiesis-purple`  | the moodiest preset in the set           |
| Writing, reading, long-form, focus   | `winter-woods`    | lowest chroma — the shell disappears     |
| A hero screen / launch / analytics   | `midnight-purple` | deep purple drama, still not neon        |
| Daytime productivity, light-first UI | `frost`           | translucent white glass, airy            |
| Terminal, code editor, utility       | `carbon`          | pure monochrome, zero hue                |

If the user says "make it look like X" and X is not in the table, read
`src/renderer/src/lib/presets.ts` — every preset carries `mood`, `bestFor` and
`source` fields describing exactly what it is for.

---

## 4. Adding a page (the classic extension point)

1. Create `src/renderer/src/pages/<name>/<Name>Page.tsx`.
2. Register it in `src/renderer/src/pages/registry.tsx` (framework demo) or in a
   template's `pages[]` array (when building an app):

```tsx
{
  id: 'my-tool',
  label: 'My Tool',
  description: 'One line',
  category: 'Tools',        // groups pages into a sub-tab cluster
  icon: WrenchIcon,          // from lucide-react
  component: MyToolPage,
  rightPanel: MyToolInspector, // optional per-page right panel
  showInSidebar: true
}
```

That is the whole contract — `PageDefinition` in `src/renderer/src/types/pages.ts`.
The shell gives you the sidebar entry, the tab and the content area automatically.
**Never edit the shell to add a page.**

---

## 5. Use the widget kit, don't rebuild it

`src/renderer/src/widgets/` — import from the barrel:

```tsx
import {
  GlassCard,
  StatTile,
  AgentCard,
  CapabilityBars,
  ChartWidget,
  ChatWidget,
  TerminalWidget,
  Pipeline,
  FilterChips,
  EmptyState
} from '@renderer/widgets'
```

Every widget renders a sane demo with **zero props**, and takes real data through
props. If something close already exists, use it and pass data — do not write a
new card component.

House rules these widgets encode (follow them in new components too):

- **Glass over flat fills.** Use `.glass` (blur + top gloss sweep + inset
  highlight + hairline) rather than a solid background.
- **Accent surfaces use `.gloss-accent`** — layered gradient with a light top edge.
- **Numbers instead of sentences.** `.stat-number` for the figure, `.mono` for
  labels, codes and values. Tiny uppercase tracking-wide labels.
- **Chat bubbles:** `.bubble--them` (left, glass) and `.bubble--you` (right, accent).
- **Empty states are designed** — `.hatched` or `<EmptyState />`, never a blank box.
- **No green** except the `--success` status role. No pure black. No neon.
- **Scrollbars are never default** — already handled globally in `widgets.css`.

---

## 6. What NOT to do

- Do not add a second styling system, CSS-in-JS theme, or a rival token file.
- Do not hardcode hex colors in components. Tokens only.
- Do not edit `AppShell`, `Sidebar`, `TabBar`, `RightPanel` to make one page work.
- Do not add a backend — the renderer is pure `file://` desktop. Backends hook
  into the IPC contract (`src/main/ipc.ts` + `src/preload/index.ts`).
- Do not add eager template imports to `templates/manifest.ts` — it would make the
  gallery drag every template's code into the boot bundle.
- Do not claim a template ships a backend. Templates ship UI and structure only;
  the `dataShape` field says what to wire, the data source is the client's.
- Do not disable the security posture (`sandbox`, `contextIsolation`).

---

## 7. Verify before claiming done

```bash
npm run typecheck   # both workspaces
npm run lint
npm test            # vitest
npm run build       # electron-vite
```

A UI change is not done until the app actually renders it: `npm start` builds and
launches the real Electron window.

---

## 8. Where things live

```
src/renderer/src/
  styles/theme.css      base tokens (light/dark)
  styles/presets.css    the 10 color presets (generated ramps)
  styles/widgets.css    glass/gloss primitives + widget internals
  lib/presets.ts        preset metadata + apply/get helpers
  lib/apps.ts           applyTemplate / buildRecipe / exitToFramework
  lib/theme.ts          mode helpers
  components/theme/     ThemeProvider, ThemeToggle, PresetSwitcher
  components/shell/     AppShell, Sidebar, TabBar, RightPanel, BottomPanel, FooterBar
  components/ui/        shadcn-style primitives (button, card, dialog, select…)
  widgets/              the widget kit (11 components)
  templates/
    types.ts            AppTemplate contract
    manifest.ts         CATALOG — display metadata only, no page imports
    catalog.ts          lazy loaders (id → () => import('./x'))
    store.ts            the live template (holds the loaded object)
    notes.tsx … finance.tsx   one file per template
  pages/
    registry.tsx        THE framework extension point
    templates/          the Apps catalog page
    themes/             ThemesPage (gallery + live token inspector)
    widgets/            WidgetsPage (the kit, rendered)
```

Prefer `GlassCard` + existing primitives + tokens. If you find yourself writing
more than ~20 lines of styling, you are probably rebuilding something that exists.
