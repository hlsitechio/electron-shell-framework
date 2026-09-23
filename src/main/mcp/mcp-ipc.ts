import { BrowserWindow, ipcMain } from 'electron'
import type { McpActionLogItem, McpServerStatus } from '../../shared/mcp-types'

let cachedState: any = null
let mcpStatusGetter: (() => McpServerStatus) | null = null

const pendingActionResolvers = new Map<
  string,
  {
    resolve: (value: any) => void
    reject: (reason: any) => void
    timeout: NodeJS.Timeout
  }
>()

export function registerMcpIpc(getStatus: () => McpServerStatus): void {
  mcpStatusGetter = getStatus

  if (typeof ipcMain !== 'undefined' && ipcMain?.on) {
    // Renderer pushes live store state to Main
    ipcMain.on('mcp:push-state', (_e, state) => {
      cachedState = state
    })

    // Renderer returns action execution result
    ipcMain.on(
      'mcp:action-result',
      (_e, payload: { id: string; success: boolean; result?: any; error?: string }) => {
        const pending = pendingActionResolvers.get(payload.id)
        if (pending) {
          clearTimeout(pending.timeout)
          pendingActionResolvers.delete(payload.id)
          if (payload.success) {
            pending.resolve(payload.result)
          } else {
            pending.reject(new Error(payload.error || 'MCP action failed in renderer'))
          }
        }
      }
    )

    // Renderer asks for MCP server status
    ipcMain.handle('mcp:get-status', () => {
      if (mcpStatusGetter) return mcpStatusGetter()
      return {
        running: false,
        port: 3920,
        sseUrl: 'http://127.0.0.1:3920/sse',
        clientCount: 0,
        uptimeSeconds: 0,
        totalInvocations: 0
      }
    })
  }
}

export function getCachedPlatformState(): any {
  return cachedState
}

export async function captureWindowScreenshot(): Promise<string> {
  const win = BrowserWindow.getAllWindows()[0]
  if (!win || win.isDestroyed()) {
    throw new Error('No active Electron window found to capture')
  }
  const image = await win.webContents.capturePage()
  return image.toDataURL()
}

export async function broadcastActionLogToRenderer(logItem: McpActionLogItem): Promise<void> {
  const win = BrowserWindow.getAllWindows()[0]
  if (win && !win.isDestroyed()) {
    win.webContents.send('mcp:action-log', logItem)
  }
}

export function dispatchActionToRenderer(
  toolName: string,
  params: Record<string, any>
): Promise<any> {
  const win = BrowserWindow.getAllWindows()[0]
  if (!win || win.isDestroyed()) {
    return Promise.reject(new Error('Cannot dispatch MCP action: Electron window is not available'))
  }

  const actionId = `mcp-act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingActionResolvers.delete(actionId)
      reject(new Error(`Timeout executing MCP action "${toolName}" (5000ms exceeded)`))
    }, 5000)

    pendingActionResolvers.set(actionId, { resolve, reject, timeout })

    try {
      win.webContents.send('mcp:invoke-action', {
        id: actionId,
        toolName,
        params
      })
    } catch (err) {
      clearTimeout(timeout)
      pendingActionResolvers.delete(actionId)
      reject(err)
    }
  })
}
