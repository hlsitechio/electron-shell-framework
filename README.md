# Electron Shell Framework

A reusable Electron desktop app-shell — a **platform**, not an app. Dark/light theming, a single merged top bar (tabs + window controls), collapsible sidebars, dynamic compact tabs, page registry, native SVGL brand kit, encrypted config storage, framework UI blocks, auto-update, and 11 production app templates. Build a new app by dropping in pages — never rewrite the shell.

![App Shell Dashboard Preview](docs/dashboard-preview.png)

**Pure desktop**: no web attach, no server. In production the renderer loads via `file://`.

## Stack

| Layer            | Tech                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| Process shell    | **Electron 44.1** (electron-vite 5, electron-builder 26)                         |
| UI               | React 19 + TypeScript + Tailwind CSS v4                                          |
| Primitives       | Radix-based shadcn-style components (`src/renderer/src/components/ui`)           |
| State            | zustand (`leftCollapsed`, `rightOpen`, active tab)                               |
| Persistence      | Electron `safeStorage`-encrypted JSON at `%APPDATA%/<app>/config.json`           |
| Framework blocks | recharts (charts), zod + react-hook-form (forms) — see `src/renderer/src/blocks` |
| Updates          | electron-updater (GitHub releases), Settings → Updates                           |
| Quality          | Vitest (unit) + Playwright (e2e) + ESLint + Prettier + Husky/lint-staged         |

## Quick start — the shell-cli (one command, step by step)

```bash
node scripts/shell-cli.js install   # IRM: preflight → deps → checks → build → run → package
```

Or the manual path:

```bash
npm install          # first time
npm run dev          # dev with HMR (electron-vite serve)
npm run build        # production bundle → out/
npm start            # build + launch the pure desktop app (no server)
npm run typecheck    # tsc both workspaces
npm run lint         # eslint
npm test             # vitest unit tests
npm run test:e2e     # playwright e2e (launches the real app)
npm run dist:win     # electron-builder → NSIS installer + portable exe in release/
```

### shell-cli commands

| Command   | What it does                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------- |
| `install` | Full step-by-step install (IRM): preflight → deps → typecheck/lint/test → build → run → package |
| `check`   | Environment preflight only (Node ≥ 20, npm, git)                                                |
| `dev`     | Start the dev server (HMR)                                                                      |
| `build`   | Production build to `out/`                                                                      |
| `run`     | Build then launch the app                                                                       |
| `test`    | Unit tests + e2e tests (builds first)                                                           |
| `package` | Build NSIS installer + portable exe                                                             |
| `help`    | Command help                                                                                    |

The CLI is zero-dependency (Node stdlib only) — it works even before `npm install`.

## Shell Layout Architecture

![Framework Shell Architecture](docs/themes/theme-stack-3d-trio-clean.png)

The framework ships **three native layout engines** (`src/renderer/src/types/shell.ts`), allowing you to build dashboards, writing studios, or compact utilities without forking the shell:

| Mode                      | Best For                               | Navigation                              | Top Bar                                  | Right Dock             |
| :------------------------ | :------------------------------------- | :-------------------------------------- | :--------------------------------------- | :--------------------- |
| **`dashboard`** (Default) | Operations, analytics, multi-page apps | Collapsible sidebar + dynamic tabs      | Merged top bar (tabs + controls)         | Per-page inspector     |
| **`studio`**              | Writing, documents, IDEs, canvas tools | Hierarchical tree (workspace $\to$ doc) | Document action bar (breadcrumb + tools) | Contextual review dock |
| **`compact`**             | Single-purpose utilities, focus tools  | Folded segmented top bar                | Unified slim bar with menu               | Optional utility dock  |

### Core Shell Invariants

- **Single Top Bar** — Tab strip and native window controls share one unified 40px bar. The `⇅` toggle collapses tabs into a slim active-title strip.
- **Dynamic Responsive Tabs** — On narrow viewports or container resize, tabs automatically collapse to centered icon-only mode with floating tooltips.
- **Collapsible Sidebar** — Smoothly switches between 250px expanded and 64px icon rail with centered vertical tool stack and zero border collision.
- **Native SVGL Brand Kit** — Built-in integration with [svgl.app](https://svgl.app) for tech & brand logos (`icon: 'electron'`) with offline caching and light/dark theme switching.
- **Right Inspector Panel** — Contextual activity and inspector drawer with per-page customization.
- **Bottom Panel** — Collapsible terminal or logs drawer.
- **Full-Width Status Footer** — Persistent status frame with health indicators, engine telemetry, and versioning.

_Read [docs/SHELL-MODES.md](docs/SHELL-MODES.md) for full layout slot documentation._

## Create a new app in 5 steps

1. **Clone** this repo (or copy the folder) → `my-app/`.
2. **Pages**: create `src/renderer/src/pages/MyPage.tsx`.
3. **Register**: add an entry to the array in `src/renderer/src/pages/registry.tsx`:

```tsx
{
  id: 'my-tool',
  label: 'My Tool',
  icon: WrenchIcon,
  component: MyPage,
  rightPanel: MyPageInspector // optional per-page side panel
}
```

4. **Rename**: update `name` in `package.json` (or set it in Settings → Branding at runtime).
5. `npm run dev` — your page now gets a sidebar icon, a tab, and (if provided) a right panel. No shell edits.

## Framework blocks

`src/renderer/src/blocks/` ships two copy-paste demo blocks (wired to the theme tokens so they follow dark/light):

- **`ExampleChart.tsx`** — recharts area chart (replace the demo data with your metrics).
- **`ExampleForm.tsx`** — zod + react-hook-form typed form with inline validation.

## IPC contract

Renderer talks to main through `window.api` only (contextIsolation on, sandbox on).

| API                                           | Channel              | Purpose                           |
| --------------------------------------------- | -------------------- | --------------------------------- |
| `window.api.config.get/set/has(key)`          | `config:*`           | Encrypted config store            |
| `window.api.app.version()/ping()`             | `app:*`              | Version + platform health check   |
| `window.api.window.minimize/maximize/close()` | `window:*`           | Frameless window controls         |
| `window.api.window.setOpacity(v)`             | `window:setOpacity`  | Native window opacity (persisted) |
| `window.api.update.check()/quitAndInstall()`  | `update:*`           | Auto-update (GitHub releases)     |
| `window.api.update.onStatus(fn)`              | push `update:status` | Live update events → Settings UI  |

Extend in `src/main/ipc.ts` + `src/preload/index.ts` — both are the only contract files a future backend touches.

## Packaging & updates

- `npm run dist:win` → `release/<version>/` with a **NSIS installer** (`App Shell-Setup-<version>.exe`, custom install dir, desktop + start-menu shortcuts) and a **portable exe**.
- Auto-update is wired through `electron-updater` and the GitHub `publish` provider in `electron-builder.yml`. Tag a release as `vX.Y.Z` and push — packaged installs pick it up via Settings → Updates → Check for updates.
- `scripts/generate-icon.js` creates the app icon (PNG + ICO) — run `npm run icon` after restyling.

## Theming

![10 Theme Presets Stack Showcase](docs/themes/theme-stack-showcase.png)

All colors are CSS variables in `src/renderer/src/styles/theme.css`
(`--background`, `--foreground`, `--primary`, `--sidebar-*`, `--chart-*`, …) with a `[data-theme='dark']` block, mapped into Tailwind v4 via `@theme inline` so utilities like `bg-card`, `border-input`, `text-muted-foreground` work. To brand an app: restyle the variables — every component picks them up automatically.

## Project map

```
scripts/       shell-cli.js (IRM install CLI), generate-icon.js
src/
  main/        Electron main: window lifecycle, IPC, encrypted config, updater, window-state
  preload/     contextBridge → window.api (the typed contract)
  shared/      Types shared between main and renderer (UpdateStatus)
  renderer/
    src/
      blocks/  Copy-paste framework blocks: recharts chart, zod+RHF form
      components/
        shell/     AppShell, Sidebar, TabBar (merged top bar), RightPanel, BottomPanel, …
        ui/        shadcn-style primitives: button, card, dialog, select, switch, tabs, …
        theme/     ThemeProvider + theme toggle
      pages/       registry.tsx (THE extension point) + demo pages
      stores/      zustand: ui layout state, active tab
      styles/      theme.css (all design tokens)
      lib/         cn(), theme helpers, branding hook
      types/       PageDefinition (the page contract)
e2e/           Playwright smoke tests (launch real app, assert chrome)
```

## Roadmap (not in v1)

- Backend integration (HTTP/WebSocket/DB) through the IPC contract
- Dynamic/closeable tabs, splash screen, i18n
