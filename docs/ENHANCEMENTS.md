# Enhancement proposal

Ten concrete improvements to `electron-shell-framework`, in priority order.
Each one is grounded in friction hit while building a real consumer app
(Repo Cockpit) on this shell, not in speculation.

Priority key: **P0** blocks adoption, **P1** high value, **P2** polish.

---

## 1. Slot parity: a dock for every chrome region — P0

`ShellSlots` already exposes `sidebarHeader`, `sidebarTree`, `sidebarFooter`,
`breadcrumb`, `topBarActions`, `content` and `rightDock`. The **bottom panel had
no slot at all**, so an app that wanted a terminal, a log tail or a job queue
there had to fork `BottomPanel` — exactly the outcome the mode system exists to
prevent. `rightDock` was also dead weight: `RightPanel` accepted `children` but
rendered them in a small box pinned under its demo views.

_Proposed in `feat/app-shell-dock-slots`._ Adds `ShellSlots.bottomDock`, wires
`<BottomPanel>{slots?.bottomDock}</BottomPanel>`, and gives `rightDock`
precedence over the per-page `rightPanel`. Both default to the previous
behaviour, so no existing app changes.

**Still to do:** a matching `topDock`, and a per-page dock override so one page
can claim the bottom panel while others leave it to the app.

---

## 2. Demo content must yield to app content — P0

A framework that ships demo data inside a shell region will eventually render
that demo **next to real data**, which reads as fabricated content. `RightPanel`
did exactly this: its "Welcome to the shell — this is a test toast" notice
stayed on screen while an app's own rail was squeezed beneath it.

The rule: any chrome component that holds demo state must take a `demo` prop (or
detect supplied children, as done here) and step aside. Ship a
`gallery` mode that mounts the demos explicitly for the Themes/Widgets pages.

---

## 3. Tests must assert the contract, not the demo — P1

`registry.test.ts` asserted `PAGES[0].id === 'dashboard'`. That is a fact about
the _demo page set_, not about the registry contract — and it fails for every
consumer app, since replacing the array is the documented way to build an app.
Assert invariants instead: unique ids, a well-formed `PageDefinition`, non-empty
array, `pages[0]` usable as the fallback route.

---

## 4. Onboarding dies on npm's install-script gate — P0

`npm install` on Windows silently blocks the postinstall that downloads
Electron's binary, plus `esbuild`'s and `node-pty`'s native builds. The app then
cannot launch at all, and the failure surfaces far from the cause ("Electron
failed to install correctly"). This is the single biggest adoption cliff, and it
is invisible in the docs.

Add to `scripts/shell-cli.js`:

- a preflight that detects blocked install scripts and prints the exact
  remediation (`npm install-scripts approve esbuild electron-winstaller node-pty`
  then `npm rebuild esbuild node-pty`);
- a verification step that asserts `./node_modules/.bin/electron --version`
  actually prints a version before declaring install successful — right now
  `install` can report success with no runnable binary on disk;
- the same check in CI, so a blocked postinstall fails the build instead of
  shipping.

---

## 5. Layout state should survive a relaunch — P1

`ui-store` holds `leftCollapsed`, `leftWidth`, `rightWidth`, `bottomOpen` and
`tabsCollapsed` in memory only. The app already persists window bounds, opacity
and the theme through the encrypted config, so layout is the odd one out: every
launch resets the workspace the user arranged.

Persist the ui-store (debounced) under a `settings:layout` key, restoring in the
same boot path that re-applies theme and preset. Keep the store's API identical;
this is a storage adapter, not a redesign.

---

## 6. One error boundary per region — P1

`App.tsx` wraps the whole shell in a single `ErrorBoundary`. A throw inside one
page therefore blanks the entire chrome — sidebar, tabs and window controls
included — leaving the user with a frameless window and nothing to click.

Scope boundaries: one around the page/content region, one around each dock, one
around the sidebar. A crashing page should degrade to an inline error card while
the shell stays usable and the user can navigate away.

---

## 7. Type-safe IPC by default — P1

The IPC layer is well guarded (`guard` verifies sender + top frame + origin), but
the _payloads_ are untyped: every handler casts `...args as never[]` and trusts
the caller. Adding a channel means hand-writing the preload entry and hoping the
shapes line up.

Adopt a schema-per-channel contract — zod at the boundary, or `tipc-electron`
for a tRPC-style typed bridge with subscriptions. Either way the win is the
same: a mismatch becomes a startup error naming the channel, and main-process
handlers receive validated, typed arguments. `ipc.ts` and `preload/index.ts`
stay the only contract files.

---

## 8. Bundle budget + page-level code splitting — P1

The renderer bundle is a single ~2.5 MB chunk. Templates are already lazily
loaded (correctly), but pages are not, so every app pays for every page it
ships, including hidden ones.

- `React.lazy` the registry's page components with a `Suspense` fallback that
  matches the shell's own loading treatment;
- add a size budget to CI (fail over N KB gzipped for the entry chunk), reported
  per-chunk so a regression names the culprit;
- note that `templates/manifest.ts` must stay import-free — the lazy-loading
  rule already exists and is easy to break.

---

## 9. Accessibility pass on the chrome — P1

The shell is keyboard-reachable in places but not consistently:

- the tab strip needs `role="tablist"` / `role="tab"` with `aria-selected`, and
  arrow-key traversal between tabs;
- collapse toggles need `aria-expanded` reflecting state, not just a label;
- the drag-resize handles are mouse-only — add keyboard resize (arrow keys with
  a step) and `role="separator"` with `aria-valuenow`;
- respect `prefers-reduced-motion` for the 160 ms width/height transitions;
- move focus into a panel when it opens, and restore it to the toggle on close.

---

## 10. Diagnostics the user can actually send — P2

When something breaks, the app knows a lot (log path, versions, platform,
fuses, config location) and the user can see almost none of it. Settings already
reads some of this; make it an explicit **Copy diagnostics** action that builds a
redacted text block (versions, platform, active preset, log path, last N log
lines — never config values). It turns "it doesn't work" into a report, with no
telemetry and no network call.

---

## Also worth doing

- **Release provenance.** The signing toolkit is genuinely ahead of comparable
  projects, but a self-signed cert never clears SmartScreen. Ship the
  `sign check` output as a release artifact so a downloaded installer's
  signing state is auditable.
- **`docs/SHELL-MODES.md` is referenced from `types/shell.ts`.** Confirm the
  file exists before the next publish — a doc comment pointing at a missing file
  is the kind of thing that erodes trust in the rest.
- **One `useBranding` default.** `DEFAULT_BRANDING.appName` is `'App Shell'`
  while `AppShell`'s `title` defaults to `'App Shell'` too — two independent
  fallbacks for one string. Fine today, a bug the moment they disagree.

---

## What is already ahead of the field

Worth stating, because the list above can read as a critique:

- **The page registry + layout modes.** No comparable project combines a
  registry, a merged top bar with window controls, and named layout
  compositions. Nothing here needs changing.
- **Two-layer theming.** Mode (`data-theme`) × preset (`data-preset`), with both
  applied on `<html>` and specificity independent of source order. Ten presets
  each defining both modes is a genuinely correct design.
- **The security posture.** `sandbox`, `contextIsolation`, fuses and a
  sender-verified IPC guard are all in place at v0.1, which is unusual.
- **`AGENTS.md`.** A repo that states its extension points, its forbidden
  patterns and its verification commands in one file is a real advantage for
  agentic workflows.
