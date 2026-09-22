# AGENTS.md — the agent guide to this repo

> **This file is the contract.** If you are an AI agent working in this repo, read
> it fully before writing code. It is the single source of truth for how this
> repo is meant to be extended, and it outranks your general instincts about
> Electron, React, or app architecture.
>
> `AGENTS.md` (this file) is written for agents. `README.md` is written for
> humans. When they disagree, this file wins.

---

## 1. What this repo is

A **reusable Electron app-shell framework** — a platform, not an app. It ships the
chrome (merged top bar, collapsible sidebars, tab bar), a two-layer theming
system, an 11-component widget kit, and **ten app templates**.

An app is built by **adding pages** or **applying a template**. You do not
scaffold an Electron project, wire a build, or design a layout system. All of
that exists and is designed to be left alone.

**Stack:** Electron 44 · React 19 · TypeScript · Tailwind v4 · electron-vite ·
zustand · Vitest + Playwright

**Shape:** pure desktop. In production the renderer loads from `file://`. There is
no server and there is not meant to be one.

### The skillset

This repo ships an `agent-skills/` directory — drop-in `SKILL.md` files for
Claude Code, Hermes Agent, Cursor, and any tool that reads the SKILL.md
convention. Load the relevant one before starting a task; each is written to be
self-contained.

| Skill                               | Use it when                                        |
| ----------------------------------- | -------------------------------------------------- |
| `electron-shell-framework`          | Starting any work in this repo — the entry point   |
| `electron-shell-page-authoring`     | Adding or changing a page                          |
| `electron-shell-theming`            | Presets, tokens, light/dark, "make it look like X" |
| `electron-shell-template-authoring` | Adding an 11th template                            |
| `electron-shell-packaging`          | Building, signing, or releasing                    |

`agent-skills/` is the same kit under its conventional name; `skills/` is the
Hermes-native layout. Keep them in sync when you edit one.

---

## 2. The job this repo exists for

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

`buildRecipe(t)` is your implementation brief. It names the template's
**`dataShape`** — what the template deliberately does _not_ provide, and what the
client must wire. Read it before writing a line of code.

Full catalog, the evidence behind each template, and the lazy-loading
architecture: **`docs/APP-TEMPLATES.md`**.

---

## 3. The two extension axes

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

## 4. The two-layer theme model

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

## 5. Preset decision table — choose by job, not by color

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

## 6. Adding a page (the classic extension point)

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

Deeper walkthrough: `agent-skills/electron-shell-page-authoring/`.

---

## 7. Use the widget kit, don't rebuild it

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
  EmptyState,
  DataTable
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

## 8. What NOT to do

- Do not add a second styling system, CSS-in-JS theme, or a rival token file.
- Do not hardcode hex colors in components. Tokens only.
- Do not edit `AppShell`, `Sidebar`, `TabBar`, `RightPanel` to make one page work.
- Do not add a backend — the renderer is pure `file://` desktop. Backends hook
  into the IPC contract (`src/main/ipc.ts` + `src/preload/index.ts`).
- Do not add eager template imports to `templates/manifest.ts` — it would make the
  gallery drag every template's code into the boot bundle.
- Do not claim a template ships a backend. Templates ship UI and structure only;
  the `dataShape` field says what to wire, the data source is the client's.
- Do not disable the security posture (`sandbox`, `contextIsolation`, fuses).
- Do not promise a signed release clears SmartScreen on other people's machines.
  Read `docs/CODE-SIGNING.md` first; a self-signed cert does not.

---

## 9. Windows code signing

Signing is a solved step here, not a support ticket. Three scripts, all tested:

```bash
node scripts/shell-cli.js sign demo     # self-signed demo cert → .signing/
node scripts/shell-cli.js sign check    # verify everything in release/
pwsh scripts/signing/sign.ps1 -PfxPath .signing/demo-codesign.pfx -Password <pw> -Path release
pwsh scripts/signing/sign.ps1 -Thumbprint <thumbprint> -Path release   # token/HSM certs
```

**The trap:** a self-signed certificate teaches you the pipeline for free but
will **never** clear SmartScreen on a stranger's machine — that requires a CA
chain plus accumulated reputation. Full pricing and the 2023 hardware-token
change that breaks naive CI setups: **`docs/CODE-SIGNING.md`**.

Never commit `.pfx` / `.p12` (gitignored), never put a signing password in the
repo, and always keep timestamps (`sign.ps1` does).

---

## 10. Verify before claiming done

```bash
npm run typecheck   # both workspaces
npm run lint
npm test            # vitest
npm run build       # electron-vite
```

A UI change is not done until the app actually renders it: `npm start` builds and
launches the real Electron window.

**Report the four results explicitly.** Never claim a UI change works without
having launched it, and never claim a release is signed without running
`sign check`.

---

## 11. Where things live

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
  blocks/               framework UI blocks (recharts, zod + react-hook-form)
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
skills/                 Hermes-native skill kit
agent-skills/           the same kit, drop-in SKILL.md convention
docs/
  APP-TEMPLATES.md      the ten templates + the evidence for each
  CODE-SIGNING.md       Windows signing: what works, what it costs
  THEMES.md             the theming system in depth
```

Prefer `GlassCard` + existing primitives + tokens. If you find yourself writing
more than ~20 lines of styling, you are probably rebuilding something that exists.

---

## 12. Working with an agent in this repo

If you are the agent: state which skill you loaded and why, before you start.
If you are the human: the shortest useful prompt is

> _Build a `<app shape>` using the `<template>` template. Check AGENTS.md first._

Everything after that — the question about templates, the recipe read, the
widget-kit reuse, the four verification commands — should happen without you
having to ask for it.
