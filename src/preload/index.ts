import { contextBridge, ipcRenderer } from 'electron'
import type { UpdateStatus } from '../shared/updater-types'

/** Typed renderer→main bridge. Exposed as `window.api`. */
const api = {
  config: {
    get: (key: string): Promise<unknown> => ipcRenderer.invoke('config:get', key),
    set: (key: string, value: unknown): Promise<boolean> =>
      ipcRenderer.invoke('config:set', key, value),
    has: (key: string): Promise<boolean> => ipcRenderer.invoke('config:has', key)
  },
  app: {
    version: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),
    ping: (): Promise<{ pong: boolean; platform: string }> => ipcRenderer.invoke('app:ping'),
    logPath: (): Promise<string> => ipcRenderer.invoke('app:logPath')
  },
  update: {
    getStatus: (): Promise<UpdateStatus> => ipcRenderer.invoke('update:getStatus'),
    check: (): Promise<UpdateStatus> => ipcRenderer.invoke('update:check'),
    quitAndInstall: (): void => ipcRenderer.send('update:quitAndInstall'),
    onStatus: (fn: (s: UpdateStatus) => void): (() => void) => {
      const listener = (_e: unknown, s: UpdateStatus): void => fn(s)
      ipcRenderer.on('update:status', listener)
      return () => ipcRenderer.removeListener('update:status', listener)
    }
  },
  window: {
    minimize: (): void => ipcRenderer.send('window:minimize'),
    maximize: (): void => ipcRenderer.send('window:maximize'),
    close: (): void => ipcRenderer.send('window:close'),
    setOpacity: (value: number): void => ipcRenderer.send('window:setOpacity', value)
  }
}

export type Api = typeof api

contextBridge.exposeInMainWorld('api', api)
