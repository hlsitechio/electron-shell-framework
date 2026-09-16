# Electron Shell Framework — Security & Architecture Report

Date: 2026-09-15 · Audit basis: live repo scan + Electron official security checklist, fuses docs, electron-builder v27 hardening docs, current release track.

Current stack: electron-vite 5 + Electron 44.1.1 + React 19, frameless shell, safeStorage config store, sandbox+contextIsolation preload bridge.

---

## 1. What's already right (keep it)

| Control                                                                               | Status                                       |
| ------------------------------------------------------------------------------------- | -------------------------------------------- |
| `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`                   | ✅ exactly the official baseline             |
| CSP present in index.html                                                             | ✅ present, needs tightening (below)         |
| `setWindowOpenHandler` → `deny`                                                       | ✅ good — but see openExternal note          |
| Preload exposes **only** a namespaced `window.api` (no raw `ipcRenderer` passthrough) | ✅ excellent — no arbitrary-channel exposure |
| Config encrypted with `safeStorage` (DPAPI / Keychain)                                | ✅ good                                      |
| Frameless window, minimal chrome                                                      | ✅ smaller attack surface                    |

## 2. Priority gaps (P0 — do before v0.2)

1. **Electron 44.1.1 is 11 majors behind.** Current stable: 44.3.0 (Chromium 152, Node 24.20). Only supported lines today are 43–44; 33 is long-EOL with unpatched Chromium/Node CVEs. Pin to the newest stable (or 43.x for one-major grace). Update regularly — Electron's own #1 recommendation.
2. **No fuses flipped.** Defaults leave `ELECTRON_RUN_AS_NODE`, `--inspect`, `NODE_OPTIONS` enabled — classic "living off the land" vectors. Flip before code signing with `@electron/fuses` (via electron-builder plugin or CLI after build):
   - `RunAsNode: false`
   - `EnableNodeCliInspectArguments: false`
   - `EnableNodeOptionsEnvironmentVariable: false`
   - `EnableCookieEncryption: true` (one-way — enable before first release to users)
   - `EnableEmbeddedAsarIntegrityValidation: true`
   - `OnlyLoadAppFromAsar: true` (binds app to verified asar)
   - `GrantFileProtocolExtraPrivileges: false` (only once you move off `file://` — see P1)
   - Verify in CI: `npx @electron/fuses read --app <build-out>`
3. **IPC sender is never validated.** Official checklist #17: every `ipcMain.handle/on` must verify `event.senderFrame` is the _main frame_ of a window you created, and the URL is your own renderer (`file://` packaged or the electron-vite dev URL). A compromised renderer or an injected subframe can call `config:set` etc. today. Add a `guard.ts` wrapper (sender check + per-channel argument allowlist — arity/type, ideally Zod/Valibot at the boundary). No channel takes unvalidated input.
4. **No navigation restriction.** Add `webContents.on('will-navigate', e => e.preventDefault())` (allow only dev-server URL / your own protocol). Official checklist #13.
5. **`shell.openExternal` on any http(s) URL.** Tighten to an explicit allowlist of known-safe origins; never pass user-controlled strings blindly. Official checklist #15.
6. **No `setPermissionRequestHandler`.** If you ever load remote content (embeds, OAuth, iframe), gate camera/mic/geo/notifications centrally (checklist #5). Cheap to install now on the default session.

## 3. P1 — structural hardening

7. **Move off `file://` to a custom privileged protocol** (`app://`), official checklist #18. `protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, codeCache: true } }])` then `protocol.handle('app', …)` serving **only** the packaged renderer dir, with path confinement (reject `..`, absolute escapes). This kills the `file://` file-reading XSS class and lets you flip `GrantFileProtocolExtraPrivileges: false`.
   - electron-vite note: with a custom protocol you can drop `ELECTRON_RENDERER_URL` loading entirely in prod and keep dev HMR.
8. **Tighten CSP.** Prod: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`. The current `ws://localhost:*` in `connect-src` is only needed for dev HMR — inject it conditionally, don't ship it (it's a localhost trust anchor in every prod build).
9. **Config store robustness.** (a) atomic writes (write `config.json.tmp` then rename) so a crash mid-write can't corrupt the store; (b) make the plaintext fallback (headless Linux, no keyring) **explicit opt-in** via env/flag, warn loudly; (c) consider scoping secrets vs. prefs — secrets should be per-key encrypted, prefs can stay fast.
10. **Single-instance lock** — `app.requestSingleInstanceLock()` + focus existing window on second launch. Standard posture, prevents multi-instance confusion and is expected by updaters.
11. **App identity & crash reporting** — `app.setAppUserModelId()` (Windows notifications/taskbar), `crashReporter.start()` in a release-only module (or a lightweight external sink), and main-process `uncaughtException`/`unhandledRejection` handlers that log then exit cleanly. Renderer: React error boundary that resets state, never leaves a blank window.

## 4. P2 — release pipeline (packaging, updates, signing)

12. **electron-builder config (v27 schema):** explicit `appId` (`dev.hlsitechio.<app>`), `artifactName`, `asar: true` (integrity is on by default in v27 — don't disable), NSIS + portable for Windows, DMG with `hardenedRuntime: true` + notarization for macOS, AppImage/deb for Linux. Exclude everything but `out/**` + `package.json` from the asar.
13. **Auto-update: electron-updater against GitHub Releases (or your own HTTPS feed).** v27 defaults already hardened (`disableWebInstaller: true`). Add `win.verifyUpdateCodeSignature: true` + `publisherName` matching your cert CN — this is what stops a hijacked update feed from installing an arbitrary binary. Never call `setFeedURL` with user input; let the build write `app-update.yml`.
14. **Code signing is mandatory for production trust:** Windows OV/EV Authenticode (private key must live on a token/HSM/cloud signing service since 2023), Apple Developer ID + notarization + stapling. CI-only, secrets in GitHub Actions secrets. Linux: distribution-repo signing or GPG.
15. **Dependency hygiene:** `npm audit` in CI, keep `package-lock.json` committed, minimize _production_ deps in package.json (electron-builder only ships deps, not devDeps, into the asar — your UI stack is bundled by vite anyway, so most of `dependencies` can move to `devDependencies`).
16. **Health checks:** CI job runs typecheck, lint, audit, build, then fuse read-back + `electron . --version` smoke on the packaged output.

## 5. Recommended folder structure (ready-to-go framework)

```
src/
  shared/            # single source of truth: IPC channel contract,
                     # payload types + zod schemas (imported by main, preload, renderer)
  main/
    index.ts         # thin bootstrap only: lock, fuse-safe init, lifecycle
    security/
      protocol.ts    # app:// registration + handler (path-confined)
      guard.ts       # IPC wrapper: main-frame sender check + arg validation
      permissions.ts # setPermissionRequestHandler
      navigation.ts  # will-navigate / window-open policy + openExternal allowlist
      csp.ts         # CSP string builder (dev vs prod)
    ipc/             # one module per domain (config.ipc.ts, app.ipc.ts, window.ipc.ts)
                     # — all registered through guard.ts, no raw ipcMain.handle
    services/        # config-store (atomic), window-state, updater, crash-reporter
  preload/
    index.ts         # single bundled CommonJS file (sandbox-compatible);
                     # builds window.api ONLY from the shared contract
  renderer/src/
    lib/ipc.ts       # typed client mirroring the shared contract
    ...              # existing shell/pages/stores stay as-is
```

Rules of thumb baked into the structure:

- Main process = the trust boundary. All validation lives there, never in types.
- Renderer never receives a generic `invoke`/`send`/`on` — only statically-declared wrappers (your current design, keep it).
- One IPC module per domain, each returning a `Disposable` so hot-reload/tests can unregister cleanly.
- Sandboxed preloads must stay CommonJS — bundle, don't split (ESM preload would force `sandbox: false`).

## 6. Suggested sequence

1. Bump Electron → 44.3.0 (fix API drift, re-run typecheck/tests first)
2. Add `src/main/security/` guard + navigation + permission modules (P0 items 3–6)
3. Add fuses via electron-builder `fuses` config or post-build `@electron/fuses` + CI verification
4. Custom `app://` protocol + tightened CSP (P1 items 7–8)
5. Config-store atomicity + single-instance lock + crash reporter (items 9–11)
6. electron-builder + updater + signing config, CI audit/build/verify (P2)
