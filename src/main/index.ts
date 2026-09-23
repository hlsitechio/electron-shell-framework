import { BrowserWindow, app, nativeImage, shell } from 'electron'
import { join } from 'node:path'
import { configStore } from './config-store'
import { registerIpc } from './ipc'
import { registerCockpitIpc } from './cockpit/ipc-cockpit'
import { ownWindow } from './ipc-policy'
import { initUpdater } from './updater'
import { windowStateKeeper } from './window-state'
import { attachRendererLogging, initLogging, log, logFilePath } from './logging'
import { hardenApp, hardenWindow, openExternalSafely } from './security'
import { mcpServer } from './mcp/mcp-server'

/**
 * Single-instance lock: a second launch focuses the existing window
 * instead of spawning a duplicate process/window.
 */
const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  // Logging first — so anything that goes wrong after this point is on disk.
  initLogging()

  /**
   * Last-resort error sinks. Without these a rejected promise in the main
   * process is silent: the window simply never appears and nothing is written.
   */
  process.on('uncaughtException', (err) => {
    log.error('[main] uncaughtException:', err)
  })
  process.on('unhandledRejection', (reason) => {
    log.error('[main] unhandledRejection:', reason)
  })

  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()
      win.moveTop()
      win.setAlwaysOnTop(true)
      setTimeout(() => {
        if (!win.isDestroyed()) win.setAlwaysOnTop(false)
      }, 500)
    }
  })

  function createWindow(): void {
    const stateKeeper = windowStateKeeper('main')

    const win = new BrowserWindow({
      x: stateKeeper.x,
      y: stateKeeper.y,
      width: stateKeeper.width,
      height: stateKeeper.height,
      minWidth: 940,
      minHeight: 600,
      show: false,
      autoHideMenuBar: true,
      frame: false,
      backgroundColor: '#121212', // neutral grey — no window chrome flash
      icon: nativeImage.createFromPath(join(__dirname, '../../build/icon.png')),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
        // explicit secure defaults (Electron's are permissive in places)
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false
      }
    })

    stateKeeper.track(win)

    // Register this window as OURS — the cockpit IPC gate only accepts
    // messages from a window we created. Must happen before any renderer call.
    ownWindow(win)

    // Navigation, popups, webviews, devtools, external links — one call.
    hardenWindow(win)

    // Renderer console lines land in the same log file as main.
    attachRendererLogging(win.webContents)

    // Restore saved window opacity (0.3 - 1)
    const savedOpacity = configStore.get<number>('settings:opacity', 1)
    if (savedOpacity >= 0.3 && savedOpacity <= 1) {
      win.setOpacity(savedOpacity)
    }

    win.on('maximize', () => {
      if (!win.isDestroyed()) win.webContents.send('window:state-changed', { isMaximized: true })
    })
    win.on('unmaximize', () => {
      if (!win.isDestroyed()) win.webContents.send('window:state-changed', { isMaximized: false })
    })

    log.info('[main] createWindow bounds:', {
      x: stateKeeper.x,
      y: stateKeeper.y,
      width: stateKeeper.width,
      height: stateKeeper.height
    })

    const showWindow = (): void => {
      if (win.isDestroyed()) return
      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()
      win.moveTop()
      log.info(
        '[main] window shown, visible:',
        win.isVisible(),
        'bounds:',
        JSON.stringify(win.getBounds())
      )
    }

    win.once('ready-to-show', () => {
      log.info('[main] ready-to-show event fired')
      showWindow()
      if (!win.isMaximized()) {
        win.center()
      }
      win.setAlwaysOnTop(true)
      win.focus()
      setTimeout(() => {
        if (!win.isDestroyed()) {
          win.setAlwaysOnTop(false)
          win.focus()
        }
      }, 500)
    })

    win.webContents.on('did-finish-load', () => {
      log.info('[main] did-finish-load event fired')
      if (!win.isVisible()) {
        log.info('[main] showing window from did-finish-load')
        showWindow()
      }
    })

    setTimeout(() => {
      if (!win.isDestroyed() && !win.isVisible()) {
        log.warn('[main] ready-to-show timed out, force showing window')
        showWindow()
      }
    }, 1500)

    win.on('close', () => {
      log.info('[main] window close event fired')
    })
    win.on('closed', () => {
      log.info('[main] window closed event fired')
    })

    // A renderer that dies leaves a blank frameless window with no way out.
    // Log it and reload once, so a transient GPU crash is not fatal.
    win.webContents.on('render-process-gone', (_e, details) => {
      log.error('[main] render-process-gone:', details.reason, details.exitCode)
      if (details.reason !== 'clean-exit') win.reload()
    })

    win.webContents.on('did-fail-load', (_e, code, desc, url) => {
      log.error(`[main] did-fail-load ${code} ${desc} ${url}`)
    })

    // Dev: HMR via electron-vite dev server. Prod: pure file:// — no server, no network.
    const targetFile = join(__dirname, '../renderer/index.html')
    log.info('[main] targetFile to load:', targetFile)
    if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
      log.info('[main] loading URL:', process.env['ELECTRON_RENDERER_URL'])
      win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      log.info('[main] loading file:', targetFile)
      win.loadFile(targetFile)
    }

    // Force show right away in case ready-to-show is delayed
    setTimeout(() => {
      if (!win.isDestroyed()) {
        log.info('[main] fallback show timeout')
        win.show()
        win.focus()
      }
    }, 500)
  }

  app.whenReady().then(() => {
    // App-wide policy before any window exists: CSP headers + permission deny-list.
    hardenApp()
    registerIpc()
    const cockpit = registerCockpitIpc()
    initUpdater()

    // Start Native Model Context Protocol (MCP) Server for AI agents
    mcpServer.start().catch((err) => {
      log.error('[main] Failed to start native MCP Server:', err)
    })

    createWindow()

    // Clean up PTY, build children, and MCP server before quitting
    app.on('before-quit', () => {
      cockpit.dispose()
      mcpServer.stop().catch(() => {})
    })

    log.info('ready — log file:', logFilePath())

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    log.info('[main] window-all-closed fired')
    // Windows + Linux: closing the last window quits the app.
    app.quit()
  })

  // Exported so the IPC layer and future windows reuse the same audited path.
  void shell
  void openExternalSafely
}
