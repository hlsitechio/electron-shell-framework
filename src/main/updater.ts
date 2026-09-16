import { app } from 'electron'
import { BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import type { UpdateStatus } from '../shared/updater-types'

/**
 * Auto-update wiring (electron-updater + GitHub releases).
 *
 * Only active in a PACKAGED build — dev mode reports 'dev' and does
 * nothing. `publish` config (github provider) lives in
 * electron-builder.yml, so `ELECTRON_BUILDER_*` metadata is available
 * at runtime.
 */

let status: UpdateStatus = { state: 'idle' }
const listeners = new Set<(s: UpdateStatus) => void>()

function emit(s: UpdateStatus) {
  status = s
  for (const fn of listeners) fn(s)
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('update:status', s)
  }
}

/** Subscribe to update status changes (renderer side uses this). */
export function onUpdateStatus(fn: (s: UpdateStatus) => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Current status snapshot (for late subscribers / IPC read). */
export function getUpdateStatus(): UpdateStatus {
  return status
}

export async function checkForUpdates(): Promise<UpdateStatus> {
  if (!app.isPackaged) {
    emit({ state: 'dev' })
    return status
  }

  emit({ state: 'checking' })

  try {
    // checkForUpdates + autoDownload=true → electron-updater fetches
    // the latest.yml from GitHub releases and downloads when found.
    await autoUpdater.checkForUpdates()
  } catch (err) {
    emit({ state: 'error', message: err instanceof Error ? err.message : String(err) })
  }
  return status
}

export function quitAndInstall(): void {
  if (!app.isPackaged) return
  autoUpdater.quitAndInstall()
}

/* ---------- wire autoUpdater events once ---------- */
let wired = false

export function initUpdater(): void {
  if (wired) return
  wired = true

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => emit({ state: 'checking' }))
  autoUpdater.on('update-available', (info) => {
    emit({ state: 'available', version: info.version })
  })
  autoUpdater.on('update-not-available', (info) => {
    emit({ state: 'not-available', version: info?.version })
  })
  autoUpdater.on('download-progress', (p) => {
    emit({ state: 'downloading', percent: Math.round(p.percent) })
  })
  autoUpdater.on('update-downloaded', (info) => {
    emit({ state: 'downloaded', version: info.version })
  })
  autoUpdater.on('error', (err) => {
    emit({ state: 'error', message: err?.message ?? String(err) })
  })
}
