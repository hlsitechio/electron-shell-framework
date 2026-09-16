import { BrowserWindow, Rectangle, screen } from 'electron'
import { configStore } from './config-store'

interface WindowState extends Rectangle {
  isMaximized: boolean
}

/**
 * Remembers window bounds + maximized state across restarts, and makes sure
 * a restored window is still visible on some display.
 */
export function windowStateKeeper(name: string): {
  x: number
  y: number
  width: number
  height: number
  track: (win: BrowserWindow) => void
} {
  const key = `window:${name}`
  const saved = configStore.get<WindowState>(key, {
    x: 0,
    y: 0,
    width: 1280,
    height: 800,
    isMaximized: false
  })

  let win: BrowserWindow | null = null

  const isVisibleOnSomeDisplay = (state: WindowState): boolean =>
    screen.getAllDisplays().some((d) => {
      const bounds = d.workArea
      return (
        state.x < bounds.x + bounds.width &&
        state.x + state.width > bounds.x &&
        state.y < bounds.y + bounds.height &&
        state.y + state.height > bounds.y
      )
    })

  const save = (): void => {
    if (!win) return
    if (win.isDestroyed()) return
    if (win.isMaximized() || win.isMinimized() || win.isFullScreen()) return
    const bounds = win.getBounds()
    configStore.set(key, { ...bounds, isMaximized: win.isMaximized() })
  }

  return {
    x: saved.x,
    y: saved.y,
    width: saved.width,
    height: saved.height,
    track(w) {
      win = w
      if (!isVisibleOnSomeDisplay(saved)) {
        win.setBounds({ x: 0, y: 0, width: 1280, height: 800 })
      }
      win.on('resize', save)
      win.on('move', save)
    }
  }
}
