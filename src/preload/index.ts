import { contextBridge, ipcRenderer } from 'electron'
import type { UpdateStatus } from '../shared/updater-types'
import type {
  CockpitEvent,
  CockpitSnapshot,
  CloneResult,
  Heartbeat,
  TerminalSession,
  BuildRun
} from '../shared/cockpit-types'

/**
 * Typed renderer→main bridge. Exposed as `window.api`.
 *
 * The cockpit namespace mirrors `CockpitApi` in shared/cockpit-types.ts — a
 * closed list of real operations. Deliberately absent: a generic
 * `invoke(channel, args)`, any fs read/write, and anything that takes a binary
 * name or arbitrary path.
 */

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
  },

  /* ------------------------------------------------------------- Repo Cockpit */

  cockpit: {
    snapshot: (): Promise<CockpitSnapshot> => ipcRenderer.invoke('cockpit:snapshot'),
    refresh: (includeGithub = false): Promise<CockpitSnapshot> =>
      ipcRenderer.invoke('cockpit:refresh', includeGithub),
    heartbeat: (): Promise<Heartbeat> => ipcRenderer.invoke('cockpit:heartbeat'),

    addRepo: (): Promise<CockpitSnapshot> => ipcRenderer.invoke('cockpit:addRepo'),
    removeRepo: (repoId: string): Promise<CockpitSnapshot> =>
      ipcRenderer.invoke('cockpit:removeRepo', repoId),
    revealRepo: (repoId: string): Promise<boolean> =>
      ipcRenderer.invoke('cockpit:revealRepo', repoId),
    openPath: (target: string): Promise<boolean> => ipcRenderer.invoke('cockpit:openPath', target),

    /** One GraphQL call lists every GitHub repo — nothing is cloned. */
    listRemoteRepos: (force = false): Promise<CockpitSnapshot> =>
      ipcRenderer.invoke('cockpit:listRemoteRepos', force),
    /** Fetch exactly one repo, on demand (blobless + shallow unless `full`). */
    cloneRepo: (slug: string, parentDir: string | null, full = false): Promise<CloneResult> =>
      ipcRenderer.invoke('cockpit:cloneRepo', slug, parentDir, full),
    pickCloneParent: (): Promise<string | null> => ipcRenderer.invoke('cockpit:pickCloneParent'),

    createWorktree: (repoId: string, branch: string): Promise<CockpitSnapshot> =>
      ipcRenderer.invoke('cockpit:createWorktree', repoId, branch),
    pruneWorktrees: (repoId: string): Promise<CockpitSnapshot> =>
      ipcRenderer.invoke('cockpit:pruneWorktrees', repoId),

    startBuild: (repoId: string, script: string): Promise<BuildRun> =>
      ipcRenderer.invoke('cockpit:startBuild', repoId, script),
    stopBuild: (buildId: string): Promise<boolean> =>
      ipcRenderer.invoke('cockpit:stopBuild', buildId),
    buildOutput: (buildId: string): Promise<string> =>
      ipcRenderer.invoke('cockpit:buildOutput', buildId),

    terminalAttach: (repoId: string, cols: number, rows: number): Promise<TerminalSession> =>
      ipcRenderer.invoke('cockpit:terminalAttach', repoId, cols, rows),
    terminalWrite: (repoId: string, data: string): Promise<boolean> =>
      ipcRenderer.invoke('cockpit:terminalWrite', repoId, data),
    terminalResize: (repoId: string, cols: number, rows: number): Promise<boolean> =>
      ipcRenderer.invoke('cockpit:terminalResize', repoId, cols, rows),
    terminalClose: (repoId: string): Promise<boolean> =>
      ipcRenderer.invoke('cockpit:terminalClose', repoId),

    writeClipboard: (text: string): Promise<boolean> =>
      ipcRenderer.invoke('cockpit:clipboardWrite', text),
    configPath: (): Promise<string | null> => ipcRenderer.invoke('cockpit:configPath'),
    lastTerminalRepo: (): Promise<string | null> => ipcRenderer.invoke('cockpit:lastTerminalRepo'),

    /** One subscription for the whole app — snapshots, logs, builds, PTY data. */
    onEvent: (callback: (event: CockpitEvent) => void): (() => void) => {
      const listener = (_e: unknown, payload: CockpitEvent): void => callback(payload)
      ipcRenderer.on('cockpit:event', listener)
      ipcRenderer.send('cockpit:subscribe')
      return () => ipcRenderer.removeListener('cockpit:event', listener)
    }
  }
}

export type Api = typeof api

contextBridge.exposeInMainWorld('api', api)
