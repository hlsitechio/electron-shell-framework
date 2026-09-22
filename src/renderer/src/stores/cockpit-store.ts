import { create } from 'zustand'
import { useMemo } from 'react'
import type {
  BuildRun,
  CockpitEvent,
  CockpitSnapshot,
  Heartbeat,
  LogLine,
  PullRequest,
  Repo,
  CiRun
} from '../../../shared/cockpit-types'

/**
 * Renderer-side cockpit state.
 *
 * The MAIN process owns the truth; this store mirrors it. The renderer never
 * invents a repo, a build or a log line — it renders what main sends.
 *
 * Terminal output is deliberately NOT held here: xterm keeps its own
 * scrollback, and duplicating it in React state would re-render the page on
 * every byte a shell writes.
 */

interface CockpitState {
  snapshot: CockpitSnapshot | null
  heartbeat: Heartbeat | null
  logs: LogLine[]
  builds: BuildRun[]
  connected: boolean
  loading: boolean
  githubBusy: boolean
  error: string | null

  /** repo id the bottom-panel PTY is attached to */
  terminalRepoId: string | null

  /** repo selected in the repo list, shared across pages */
  selectedRepoId: string | null

  init: () => () => void
  refresh: (includeGithub?: boolean) => Promise<void>
  addRepo: () => Promise<void>
  removeRepo: (repoId: string) => Promise<void>
  createWorktree: (repoId: string, branch: string) => Promise<void>
  pruneWorktrees: (repoId: string) => Promise<void>
  selectRepo: (repoId: string | null) => void
  openTerminal: (repoId: string) => void
  setTerminalRepoId: (repoId: string | null) => void
  clearError: () => void
}

const MAX_LOGS = 400

export const useCockpitStore = create<CockpitState>((set, get) => ({
  snapshot: null,
  heartbeat: null,
  logs: [],
  builds: [],
  connected: false,
  loading: false,
  githubBusy: false,
  error: null,
  terminalRepoId: null,
  selectedRepoId: null,

  /**
   * Subscribe to main, then pull the first snapshot. Idempotent: calling it
   * twice (React strict-mode double-mount) is safe because each call returns
   * its own unsubscribe.
   */
  init: () => {
    const api = window.api?.cockpit
    if (!api) {
      set({ error: 'Cockpit bridge unavailable — the preload script did not load.' })
      return () => undefined
    }

    const unsubscribe = api.onEvent((event: CockpitEvent) => {
      switch (event.type) {
        case 'snapshot':
          set({
            snapshot: event.snapshot,
            heartbeat: event.snapshot.heartbeat,
            logs: event.snapshot.logs,
            builds: event.snapshot.builds
          })
          break
        case 'log':
          set((s) => ({ logs: [...s.logs, event.line].slice(-MAX_LOGS) }))
          break
        case 'build':
          set((s) => {
            const others = s.builds.filter((b) => b.id !== event.build.id)
            return { builds: [event.build, ...others] }
          })
          break
        case 'heartbeat':
          set({ heartbeat: event.heartbeat, connected: true })
          break
        default:
          break
      }
    })

    set({ connected: true })

    void api
      .snapshot()
      .then((snapshot) => {
        set({
          snapshot,
          heartbeat: snapshot.heartbeat,
          logs: snapshot.logs,
          builds: snapshot.builds,
          selectedRepoId: get().selectedRepoId ?? snapshot.repos[0]?.id ?? null
        })
      })
      .catch((err: unknown) => set({ error: String(err) }))

    return unsubscribe
  },

  refresh: async (includeGithub = false) => {
    const api = window.api?.cockpit
    if (!api) return
    set({ loading: true, githubBusy: includeGithub, error: null })
    try {
      const snapshot = await api.refresh(includeGithub)
      set((s) => ({
        snapshot,
        heartbeat: snapshot.heartbeat,
        logs: snapshot.logs,
        builds: snapshot.builds,
        selectedRepoId: s.selectedRepoId ?? snapshot.repos[0]?.id ?? null
      }))
    } catch (err) {
      set({ error: String(err) })
    } finally {
      set({ loading: false, githubBusy: false })
    }
  },

  addRepo: async () => {
    const api = window.api?.cockpit
    if (!api) return
    set({ loading: true })
    try {
      const snapshot = await api.addRepo()
      set({ snapshot, logs: snapshot.logs })
    } catch (err) {
      set({ error: String(err) })
    } finally {
      set({ loading: false })
    }
  },

  removeRepo: async (repoId) => {
    const api = window.api?.cockpit
    if (!api) return
    try {
      const snapshot = await api.removeRepo(repoId)
      set((s) => ({
        snapshot,
        logs: snapshot.logs,
        selectedRepoId:
          s.selectedRepoId === repoId ? (snapshot.repos[0]?.id ?? null) : s.selectedRepoId,
        terminalRepoId: s.terminalRepoId === repoId ? null : s.terminalRepoId
      }))
    } catch (err) {
      set({ error: String(err) })
    }
  },

  selectRepo: (repoId) => set({ selectedRepoId: repoId }),
  openTerminal: (repoId) => set({ terminalRepoId: repoId, selectedRepoId: repoId }),
  setTerminalRepoId: (repoId) => set({ terminalRepoId: repoId }),

  /**
   * Worktree commands are owned by main (they run real git); the store just
   * forwards and adopts the refreshed snapshot that comes back.
   */
  createWorktree: async (repoId, branch) => {
    const api = window.api?.cockpit
    if (!api) return
    try {
      const snapshot = await api.createWorktree(repoId, branch)
      set({ snapshot, logs: snapshot.logs })
    } catch (err) {
      set({ error: String(err) })
    }
  },

  pruneWorktrees: async (repoId) => {
    const api = window.api?.cockpit
    if (!api) return
    try {
      const snapshot = await api.pruneWorktrees(repoId)
      set({ snapshot, logs: snapshot.logs })
    } catch (err) {
      set({ error: String(err) })
    }
  },

  clearError: () => set({ error: null })
}))

/* -------------------------------------------------------------- selectors */

/**
 * Stable empty references.
 *
 * A selector that returns a NEW `[]` (or a fresh object literal) on every call
 * makes `useSyncExternalStore` re-render forever — React surfaces that as
 * "Maximum update depth exceeded" (#185). Fallbacks must be module-level
 * constants, and derived objects must be memoized in the component instead of
 * computed inside the selector.
 */
const EMPTY_REPOS: Repo[] = []
const EMPTY_BUILDS: BuildRun[] = []
const EMPTY_LOGS: LogLine[] = []
const EMPTY_PRS: PullRequest[] = []
const EMPTY_RUNS: CiRun[] = []

export function useRepos(): Repo[] {
  return useCockpitStore((s) => s.snapshot?.repos ?? EMPTY_REPOS)
}

export function useSelectedRepo(): Repo | null {
  const repos = useCockpitStore((s) => s.snapshot?.repos ?? EMPTY_REPOS)
  const selectedRepoId = useCockpitStore((s) => s.selectedRepoId)
  return useMemo(
    () => repos.find((r) => r.id === selectedRepoId) ?? repos[0] ?? null,
    [repos, selectedRepoId]
  )
}

export function useBuilds(): BuildRun[] {
  return useCockpitStore((s) => s.builds ?? EMPTY_BUILDS)
}

export function useLogs(): LogLine[] {
  return useCockpitStore((s) => s.logs ?? EMPTY_LOGS)
}

/** Totals for the dashboard tiles — derived from live data, never hardcoded. */
export function useCockpitTotals(): {
  repos: number
  dirty: number
  worktrees: number
  prs: number
  failing: number
  running: number
} {
  const repos = useCockpitStore((s) => s.snapshot?.repos ?? EMPTY_REPOS)
  const prs = useCockpitStore((s) => s.snapshot?.prs ?? EMPTY_PRS)
  const runs = useCockpitStore((s) => s.snapshot?.runs ?? EMPTY_RUNS)
  const builds = useCockpitStore((s) => s.builds ?? EMPTY_BUILDS)

  return useMemo(
    () => ({
      repos: repos.length,
      dirty: repos.filter((r) => r.dirtyCount > 0).length,
      worktrees: repos.reduce((sum, r) => sum + r.worktrees.length, 0),
      prs: prs.length,
      failing: runs.filter((r) => r.conclusion === 'failure').length,
      running: builds.filter((b) => b.status === 'running').length
    }),
    [repos, prs, runs, builds]
  )
}
