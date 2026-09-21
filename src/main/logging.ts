import electronLog from 'electron-log/main'
import { app, type WebContents } from 'electron'

/**
 * Structured file logging for all three processes.
 *
 * Why this exists: without it, a packaged client app is undebuggable. There is
 * no terminal attached and no way for an agent — or the client — to see what
 * went wrong. electron-log writes rotating files to the OS log directory:
 *
 *   Windows  %USERPROFILE%\AppData\Roaming\<app>\logs\main.log
 *   Linux    ~/.config/<app>/logs/main.log
 *
 * Renderer and preload lines are forwarded into the same file via IPC, so one
 * artifact contains the whole story.
 *
 * Read them from the app: Settings shows the log path; the footer has a
 * "copy diagnostics" affordance. From a shell:
 *   node scripts/shell-cli.js logs
 */

let initialized = false

export function initLogging(): void {
  if (initialized) return
  initialized = true

  electronLog.initialize()
  electronLog.transports.file.level = 'info'
  electronLog.transports.console.level = app.isPackaged ? false : 'debug'

  // Rotate so a long-running client install cannot fill the disk.
  electronLog.transports.file.maxSize = 5 * 1024 * 1024

  // Capture the boot line with everything a support ticket needs.
  electronLog.info('── app start ─────────────────────────────')
  electronLog.info('version   :', app.getVersion())
  electronLog.info('packaged  :', app.isPackaged)
  electronLog.info('electron  :', process.versions.electron)
  electronLog.info('chrome    :', process.versions.chrome)
  electronLog.info('node      :', process.versions.node)
  electronLog.info('platform  :', `${process.platform} ${process.arch}`)
  electronLog.info('userData  :', app.getPath('userData'))
  electronLog.info('logFile   :', electronLog.transports.file.getFile().path)

  // Renderer + preload lines land in the same file.
  electronLog.errorHandler.startCatching({
    showDialog: false,
    onError: ({ error, processType }) => {
      electronLog.error(`[${processType}] uncaught:`, error)
    }
  })
}

export function logFilePath(): string {
  return electronLog.transports.file.getFile().path
}

/**
 * Forward renderer console output into the main log file.
 * Call once per window, after the page has loaded.
 */
export function attachRendererLogging(wc: WebContents): void {
  wc.on('console-message', (_event, level, message, line, sourceId) => {
    // level: 0 verbose, 1 info, 2 warning, 3 error
    const line_no = sourceId ? ` (${sourceId}:${line})` : ''
    if (level >= 2) electronLog.warn(`[renderer] ${message}${line_no}`)
    else electronLog.info(`[renderer] ${message}${line_no}`)
  })
}

export const log = electronLog
