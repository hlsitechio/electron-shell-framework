import { app, session, shell, type BrowserWindow, type WebContents } from 'electron'

/**
 * Security policy for the main process — one module, applied at startup.
 *
 * Everything here follows Electron's own security checklist. The defaults in
 * Electron are permissive; this file is where the app becomes closed by
 * default instead. Call `hardenApp()` once, right after `app.whenReady()`,
 * and `hardenWindow()` for every window you create.
 *
 * Windows + Linux only (no macOS code paths).
 */

/** Schemes we are willing to hand to the OS. Everything else is dropped. */
const EXTERNAL_SCHEMES = new Set(['https:', 'mailto:'])

/** Permission types the app will never need. Anything not listed is denied. */
const ALLOWED_PERMISSIONS = new Set<string>([])

/**
 * The production CSP. `connect-src` is intentionally narrow — a client app
 * that adds an API host should extend this list rather than widen it to '*'.
 */
function contentSecurityPolicy(isDev: boolean): string {
  const dev = isDev ? " 'unsafe-inline' 'unsafe-eval' ws://localhost:* http://localhost:*" : ''
  return [
    "default-src 'self'",
    `script-src 'self'${dev}`,
    `style-src 'self' 'unsafe-inline'${dev}`,
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${isDev ? ' ws://localhost:* http://localhost:*' : ''}`,
    "media-src 'self' data: blob:",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'"
  ].join('; ')
}

/**
 * Open a URL in the user's browser — but only if we trust the scheme.
 *
 * `shell.openExternal` with unvalidated input is a well-known code-execution
 * vector (`file:`, `smb:`, custom OS handlers). Every external link in the
 * app must go through this function; never call shell.openExternal directly.
 */
export function openExternalSafely(rawUrl: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return false
  }
  if (!EXTERNAL_SCHEMES.has(parsed.protocol)) return false
  void shell.openExternal(parsed.toString())
  return true
}

/**
 * App-wide policy: CSP header injection + a permission deny-list.
 * Run once, before any window is created.
 */
export function hardenApp(): void {
  const isDev = !app.isPackaged
  const csp = contentSecurityPolicy(isDev)

  // CSP as a real response header. A <meta> tag alone is bypassable and easy
  // to forget on a new page; this covers every response uniformly.
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    })
  })

  // Deny every device permission by default. Add to ALLOWED_PERMISSIONS if a
  // template genuinely needs one (the app should prompt in its own UI first).
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(ALLOWED_PERMISSIONS.has(permission))
  })
  session.defaultSession.setPermissionCheckHandler((_wc, permission) =>
    ALLOWED_PERMISSIONS.has(permission)
  )
}

/**
 * Per-window policy: no navigation away, no popups, external links only.
 * Call for every BrowserWindow you create.
 */
export function hardenWindow(win: BrowserWindow): void {
  const wc: WebContents = win.webContents

  // Deny top-level navigation. The renderer is a bundled SPA — it has no
  // legitimate reason to leave its own document. Without this, one stray
  // link or redirect can take the whole window to remote content.
  wc.on('will-navigate', (event, url) => {
    const devUrl = process.env['ELECTRON_RENDERER_URL']
    const isOwnDocument = url.startsWith('file://') || (devUrl ? url.startsWith(devUrl) : false)
    if (!isOwnDocument) {
      event.preventDefault()
      // Hand genuinely external navigations to the browser instead of dropping
      // them silently — otherwise links in client content look broken.
      openExternalSafely(url)
    }
  })

  // No new windows, ever. Links go to the OS browser via the allowlist above.
  wc.setWindowOpenHandler(({ url }) => {
    openExternalSafely(url)
    return { action: 'deny' }
  })

  // No <webview> may attach without our knowledge.
  wc.on('will-attach-webview', (event) => {
    event.preventDefault()
  })

  // DevTools are a dev affordance only. In a packaged build there is no
  // keyboard path to them, and no remote debugging port is opened.
  if (app.isPackaged) {
    wc.on('devtools-opened', () => wc.closeDevTools())
  }
}
