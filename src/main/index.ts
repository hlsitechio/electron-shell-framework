import { BrowserWindow, app, nativeImage, shell } from 'electron'
import { join } from 'node:path'
import { configStore } from './config-store'
import { registerIpc } from './ipc'
import { initUpdater } from './updater'
import { windowStateKeeper } from './window-state'

/**
 * Single-instance lock: a second launch focuses the existing window
 * instead of spawning a duplicate process/window.
 */
const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
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
        nodeIntegration: false
      }
    })

    stateKeeper.track(win)

    // Restore saved window opacity (0.3 - 1)
    const savedOpacity = configStore.get<number>('settings:opacity', 1)
    if (savedOpacity >= 0.3 && savedOpacity <= 1) {
      win.setOpacity(savedOpacity)
    }

    win.on('ready-to-show', () => win.show())

    // External links → default browser. Everything else stays in-app.
    win.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('https://') || url.startsWith('http://')) {
        shell.openExternal(url)
      }
      return { action: 'deny' }
    })

    // Dev: HMR via electron-vite dev server. Prod: pure file:// — no server, no network.
    if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
      win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      win.loadFile(join(__dirname, '../renderer/index.html'))
    }
  }

  app.whenReady().then(() => {
    registerIpc()
    initUpdater()
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
