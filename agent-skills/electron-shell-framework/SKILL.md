---
name: electron-shell-framework
description: Build Electron desktop apps on this reusable shell.
version: 1.0.0
author: hlsitechio, Hermes Agent
license: MIT
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [electron, desktop, react, app-shell, templates, theming]
    related_skills:
      [
        electron-shell-page-authoring,
        electron-shell-theming,
        electron-shell-template-authoring,
        electron-shell-packaging
      ]
---

# Electron Shell Framework

Build a production Electron desktop app by dropping **pages** into an existing
shell — never by rewriting the shell. This skill covers the entry path: pick a
template or go from scratch, then work the extension points.

The framework ships the chrome (top bar, sidebars, tab bar), a two-layer theming
system, an 11-component widget kit, and 11 app templates.

## When to Use

- The user asks to build, extend, or modify an app in `electron-shell-framework`
- The user describes an app they want ("a finance dashboard", "a notes app") and
  has this repo cloned
- You are adding a page, template, preset, or widget to this repo
- Don't use for: general Electron questions unrelated to this framework, or
  apps that need a server backend (this is `file://` desktop only)

## Prerequisites

- Node ≥ 20, npm, git
- `npm install` has been run (electron + electron-vite)
- Read `AGENTS.md` at the repo root **before** writing code — it is the
  authoritative contract for this repo and outranks this skill

## The first question — always ask it

When the user requests an app, ask **exactly one** question before building:

> Do you want to build on one of the eleven app templates already in this repo, or
> should I build it from scratch?

Then match their words to templates and **offer 2–3 choices. Never pick
silently.**

```ts
import { resolveTemplateId } from '@renderer/templates'
resolveTemplateId('financial dashboard') // → 'finance'
```

## Quick Reference

```bash
node scripts/shell-cli.js install    # IRM: preflight → deps → checks → build → run → package
npm run dev                          # dev with HMR
npm run build                        # production bundle → out/
npm start                            # build + launch the real app
npm run typecheck && npm run lint    # required before claiming done
npm test                             # vitest
npm run test:e2e                     # playwright (launches the real app)
npm run dist:win                     # NSIS installer + portable exe
node scripts/shell-cli.js sign demo  # self-signed cert for signing practice
node scripts/shell-cli.js sign check # verify signatures in release/
```

## Procedure

1. **Confirm the repo is set up.** Run `npm run typecheck`. It passes → continue.
   It fails → fix the environment before touching code.

2. **Ask the template-or-scratch question** (above) and get an answer. Completion:
   the user has picked a template id or said "from scratch".

3. **If a template:** apply it and read the recipe it prints.

   ```ts
   import { applyTemplate, buildRecipe } from '@renderer/lib/apps'
   const t = await applyTemplate('finance', { setPreset })
   console.log(buildRecipe(t)) // id, preset, dataShape, pages, rules, ship steps
   ```

   Completion: you can state the template's `dataShape` — that is what the
   template does _not_ provide and what must be wired.

4. **If from scratch:** register pages in `src/renderer/src/pages/registry.tsx`
   following the `PageDefinition` contract in `src/renderer/src/types/pages.ts`.
   Completion: `showInSidebar: true` pages appear in the sidebar with no shell edits.

5. **Build the UI from the widget kit** — import from `@renderer/widgets`. Every
   widget renders a sane demo with zero props. Completion: no new card/table/
   chart component was written where one already existed.

6. **Verify.** Run `npm run typecheck`, `npm run lint`, `npm test`, `npm start`.
   Completion: all four green **and** the app window actually renders the change.
   A UI change is not done until it renders.

## The 10 templates

| Template    | Shape                                | Default preset   |
| ----------- | ------------------------------------ | ---------------- |
| `editor`    | Code editor / IDE                    | `carbon`         |
| `media`     | Media library / player               | `poiesis-purple` |
| `notes`     | Notes / knowledge base               | `winter-woods`   |
| `devtools`  | Database GUI + API client + terminal | `poiesis-blue`   |
| `chat`      | Chat / messaging client              | `shadow-peonies` |
| `dashboard` | Admin dashboard                      | `muted-violet`   |
| `tasks`     | Kanban / task manager                | `noguchi`        |
| `workspace` | All-in-one web wrapper               | `frost`          |
| `reader`    | RSS / ebook reader                   | `winter-woods`   |
| `finance`   | Finance / budget / portfolio         | `dark-indigo`    |

Full catalog and the evidence behind each: `docs/APP-TEMPLATES.md`.

## Non-negotiables

- **Never edit the shell** (`AppShell`, `Sidebar`, `TabBar`, `RightPanel`) to make
  one page work. Add a page instead.
- **Never hardcode a color.** Use tokens: `hsl(var(--card))`, `bg-card`,
  `text-muted-foreground`. Ten presets must keep working.
- **Never add a second styling system** or a rival token file.
- **Never add eager template imports to `templates/manifest.ts`** — it drags every
  template's code into the boot bundle and breaks the lazy-loading design.
- **Never add a backend.** The renderer is pure `file://` desktop. Backends hook
  in through the IPC contract (`src/main/ipc.ts` + `src/preload/index.ts`).
- **Never disable the security posture** (`sandbox`, `contextIsolation`, fuses).
- **Never claim a template ships a backend.** Templates ship UI and structure only.

## Pitfalls

- `manifest.ts` is display metadata only. If you import a component into it, the
  gallery loads all ten templates at boot — the exact thing the architecture
  avoids.
- Both `data-theme` and `data-preset` attributes are always present, and selectors
  are written `[data-theme='dark'][data-preset='x']` so specificity never depends
  on source order. Don't write single-attribute selectors.
- A preset defines **both** light and dark token sets. A preset is not a mode;
  never treat one as the other.
- If you're writing more than ~20 lines of styling, you're probably rebuilding
  something that already exists in `widgets/`. Search the kit first.
- `npm start` builds _and_ launches — if you only want the bundle, use `npm run build`.
- Windows code signing: a self-signed cert does **not** clear SmartScreen for
  other people. See `docs/CODE-SIGNING.md` before promising a signed release.

## Verification

1. `npm run typecheck` — both workspaces clean
2. `npm run lint` — clean
3. `npm test` — vitest passes
4. `npm start` — the app window opens and shows the change

Report the four results explicitly. Do not claim a UI change works without
having launched it.

## Related skills

- `electron-shell-page-authoring` — the page contract in depth
- `electron-shell-theming` — presets, tokens, light/dark
- `electron-shell-template-authoring` — add a new template (12th+)
- `electron-shell-packaging` — build, sign, release
