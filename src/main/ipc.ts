import { BrowserWindow, app, ipcMain } from 'electron'
import { configStore } from './config-store'
import { checkForUpdates, getUpdateStatus, quitAndInstall } from './updater'

/**
 * The framework IPC contract.
 *
 * Every channel the renderer may call lives here. Renderer code accesses it
 * through `window.api` (see src/preload/index.ts). Future backends (HTTP,
 * WebSocket, DB…) hook in here and expose their own namespaced channels —
 * the shell never changes.
 */
export function registerIpc(): void {
  // ---- config ----
  ipcMain.handle('config:get', (_e, key: string) => configStore.get(key, null))
  ipcMain.handle('config:set', (_e, key: string, value: unknown) => {
    configStore.set(key, value as never)
    return true
  })
  ipcMain.handle('config:has', (_e, key: string) => configStore.has(key))

  // ---- app ----
  ipcMain.handle('app:getVersion', () => app.getVersion())
  ipcMain.handle('app:ping', () => ({ pong: true, platform: process.platform }))

  // ---- auto-update ----
  ipcMain.handle('update:getStatus', () => getUpdateStatus())
  ipcMain.handle('update:check', () => checkForUpdates())
  ipcMain.on('update:quitAndInstall', () => quitAndInstall())

  // ---- window chrome ----
  ipcMain.on('window:minimize', (e) => BrowserWindow.fromWebContents(e.sender)?.minimize())
  ipcMain.on('window:maximize', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    if (!win) return
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
  })
  ipcMain.on('window:close', (e) => BrowserWindow.fromWebContents(e.sender)?.close())
  ipcMain.on('window:setOpacity', (e, value: number) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    if (!win) return
    const clamped = Math.min(1, Math.max(0.3, Number(value) || 1))
    win.setOpacity(clamped)
    configStore.set('settings:opacity', clamped)
  })
}
