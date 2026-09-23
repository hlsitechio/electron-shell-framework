import { BrowserWindow, app, ipcMain, type IpcMainInvokeEvent } from 'electron'
import { configStore } from './config-store'
import { checkForUpdates, getUpdateStatus, quitAndInstall } from './updater'
import { log, logFilePath } from './logging'

/**
 * The framework IPC contract.
 *
 * Every channel the renderer may call lives here. Renderer code accesses it
 * through `window.api` (see src/preload/index.ts). Future backends (HTTP,
 * WebSocket, DB…) hook in here and expose their own namespaced channels —
 * the shell never changes.
 *
 * SECURITY: every handler goes through `guard`, which verifies the sender is
 * the main frame of a window we created, on our own origin. A typed contract
 * only names the channels; this is what makes them *authorized*.
 */

/**
 * Is this message from our own renderer's top frame?
 *
 * `event.senderFrame` is the frame that sent the message. A compromised
 * renderer, an injected iframe or a devtools-driven call should not be able to
 * reach `config:set` and friends.
 */
function isTrustedSender(event: IpcMainInvokeEvent): boolean {
  const frame = event.senderFrame
  // No frame info = not trustworthy (can happen on teardown).
  if (!frame) return false

  // The sender must be the TOP frame, not a nested iframe.
  if (frame.parent !== null) {
    log.warn('[ipc] rejected: sender is a subframe')
    return false
  }

  // The URL must be OUR document: the packaged file:// renderer, or the
  // electron-vite dev server during development.
  const url = frame.url || ''
  const devUrl = process.env['ELECTRON_RENDERER_URL']
  const ownDocument = url.startsWith('file://') || (devUrl ? url.startsWith(devUrl) : false)

  if (!ownDocument) {
    log.warn('[ipc] rejected: untrusted origin', url)
    return false
  }
  return true
}

/** Wrap ipcMain.handle with the sender check. */
function handle(
  channel: string,
  fn: (event: IpcMainInvokeEvent, ...args: never[]) => unknown
): void {
  ipcMain.handle(channel, (event, ...args) => {
    if (!isTrustedSender(event)) throw new Error(`[ipc] unauthorized sender on ${channel}`)
    return fn(event, ...(args as never[]))
  })
}

/** Wrap ipcMain.on with the sender check (fire-and-forget channels). */
function on(channel: string, fn: (event: Electron.IpcMainEvent, ...args: never[]) => void): void {
  ipcMain.on(channel, (event, ...args) => {
    // ipcMainEvent.senderFrame is the same shape; reuse the policy.
    const frame = event.senderFrame
    const devUrl = process.env['ELECTRON_RENDERER_URL']
    const url = frame?.url || ''
    const trusted =
      !!frame &&
      frame.parent === null &&
      (url.startsWith('file://') || (devUrl ? url.startsWith(devUrl) : false))
    if (!trusted) {
      log.warn('[ipc] rejected (on):', channel, url)
      return
    }
    fn(event, ...(args as never[]))
  })
}

/** config keys are namespaced 'group:name' — reject anything else. */
function isSafeConfigKey(key: unknown): key is string {
  return (
    typeof key === 'string' && key.length > 0 && key.length <= 128 && /^[a-zA-Z0-9:_-]+$/.test(key)
  )
}

export function registerIpc(): void {
  // ---- config ----
  handle('config:get', (_e, key: string) => {
    if (!isSafeConfigKey(key)) return null
    return configStore.get(key, null)
  })
  handle('config:set', (_e, key: string, value: unknown) => {
    if (!isSafeConfigKey(key)) return false
    configStore.set(key, value as never)
    return true
  })
  handle('config:has', (_e, key: string) => (isSafeConfigKey(key) ? configStore.has(key) : false))

  // ---- app ----
  handle('app:getVersion', () => app.getVersion())
  handle('app:ping', () => ({ pong: true, platform: process.platform }))

  /** Where the log file lives — the Settings UI shows this to the user. */
  handle('app:logPath', () => logFilePath())

  // ---- auto-update ----
  handle('update:getStatus', () => getUpdateStatus())
  handle('update:check', () => checkForUpdates())
  on('update:quitAndInstall', () => quitAndInstall())

  // ---- window chrome ----
  handle('window:isMaximized', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    return win?.isMaximized() ?? false
  })

  let dragOffset: { x: number; y: number } | null = null

  on('window:drag-start', (e, { screenX, screenY }: { screenX: number; screenY: number }) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    if (!win) return

    if (win.isMaximized()) {
      const [maxWidth] = win.getSize()
      const [currentX] = win.getPosition()
      const ratio = Math.min(Math.max((screenX - currentX) / (maxWidth || 1), 0.1), 0.9)

      win.unmaximize()

      const [normalWidth] = win.getSize()
      const newOffsetX = Math.round(normalWidth * ratio)
      const newOffsetY = 24
      dragOffset = { x: newOffsetX, y: newOffsetY }
      win.setPosition(Math.round(screenX - newOffsetX), Math.round(screenY - newOffsetY))
    } else {
      const [winX, winY] = win.getPosition()
      dragOffset = { x: screenX - winX, y: screenY - winY }
    }
  })

  on('window:drag-move', (e, { screenX, screenY }: { screenX: number; screenY: number }) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    if (!win || !dragOffset) return

    if (win.isMaximized()) {
      win.unmaximize()
    }

    win.setPosition(Math.round(screenX - dragOffset.x), Math.round(screenY - dragOffset.y))
  })

  on('window:drag-end', () => {
    dragOffset = null
  })

  on('window:minimize', (e) => BrowserWindow.fromWebContents(e.sender)?.minimize())
  on('window:maximize', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    if (!win) return
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
  })
  on('window:close', (e) => BrowserWindow.fromWebContents(e.sender)?.close())
  on('window:setOpacity', (e, value: number) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    if (!win) return
    const clamped = Math.min(1, Math.max(0.3, Number(value) || 1))
    win.setOpacity(clamped)
    configStore.set('settings:opacity', clamped)
  })
}
