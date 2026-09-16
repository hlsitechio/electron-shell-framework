# Electron Shell Framework

A reusable Electron desktop app-shell — a **platform**, not an app. Dark/light theming, a single merged top bar (tabs + window controls), collapsible sidebars, a page registry, encrypted config storage, framework UI blocks, auto-update, and a one-command installation CLI. Build a new app (chat, dashboard, tools) by dropping in pages — never rewrite the shell.

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

## Layout

```
┌──────────┬───────────────────────────────────────────┬──────────┐
│          │ TabBar — ONE top bar:                      │          │
│   Left   │ [⇅] [ Dashboard | Settings | Communication│   Right  │
│ Sidebar  │      Chat | Documents ]   [–][□][×]        │   Panel  │
│ (nav,    ├───────────────────────────────────────────┤ (bell/   │
│  collaps.)│ Content — active page                     │   log)   │
│          │                                            │          │
└──────────┴───────────────────────────────────────────┴──────────┘
┌───────────────────────────────────────────────────────────────────┐
│ FooterBar — full-width status frame (version · platform · app name)│
└───────────────────────────────────────────────────────────────────┘
```

- **Single top bar** — the tab strip and the window controls (min/max/close at 60% opacity) share one 40px bar. The `⇅` toggle collapses the tabs; the bar stays as a slim strip with the active page name.
- **Left sidebar** — collapsible, drag-resizable; profile + collapse + settings footer.
- **Right panel** — Notifications + Activity log views (toast composer demo included), collapsible to an arrow-only rail.
- **Bottom panel** — collapsible terminal-style strip.
- **Theme** — dark/light, both sidebars included, persisted.

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
