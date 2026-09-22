import { app } from 'electron'
import { join } from 'node:path'
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { configStore } from '../config-store'
import { log } from '../logging'
import { inspectRepo } from './git'
import type {
  CockpitEvent,
  CockpitSnapshot,
  GithubState,
  Heartbeat,
  LogLevel,
  LogLine,
  Repo
} from '../../shared/cockpit-types'
import { getCachedGithub, refreshGithub } from './github'
import { annotateCloned, fetchAllRemoteRepos, getCachedRemoteRepos } from './remote'

/**
 * The cockpit's single source of truth, owned by the MAIN process.
 *
 * The renderer never holds authoritative state: it renders snapshots and
 * receives events. That is what lets the footer's daemon dot, the build queue
 * and the activity rail stay truthful across a renderer reload.
 */

const CONFIG_KEY = 'cockpit:repos'
const MAX_LOGS = 500
const HEARTBEAT_MS = 2000

export type EventSink = (event: CockpitEvent) => void

class CockpitStore {
  private sinks = new Set<EventSink>()
  private repos: Repo[] = []
  private logs: LogLine[] = []
  private logSeq = 0
  private github: GithubState = { available: false, message: 'Not checked yet', checkedAt: null }
  private refreshedAt: string | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private startedAt = Date.now()

  /** Supplied by the terminal + build supervisors so the heartbeat is real. */
  counters = { terminals: 0, builds: 0 }

  /** Wired by the build supervisor at startup to avoid a circular import. */
  buildsProvider: (() => CockpitSnapshot['builds']) | null = null

  /* ---------------------------------------------------------------- events */

  subscribe(sink: EventSink): () => void {
    this.sinks.add(sink)
    return () => this.sinks.delete(sink)
  }

  emit(event: CockpitEvent): void {
    for (const sink of this.sinks) {
      try {
        sink(event)
      } catch (err) {
        log.warn('[cockpit] sink failed:', String(err))
      }
    }
  }

  /* ------------------------------------------------------------------ logs */

  addLog(
    text: string,
    level: LogLevel = 'info',
    repoId: string | null = null,
    buildId: string | null = null
  ): LogLine {
    const line: LogLine = {
      id: ++this.logSeq,
      timestamp: new Date().toISOString(),
      repoId,
      buildId,
      level,
      text: text.length > 2000 ? `${text.slice(0, 2000)}…` : text
    }
    this.logs.push(line)
    if (this.logs.length > MAX_LOGS) this.logs.splice(0, this.logs.length - MAX_LOGS)
    this.emit({ type: 'log', line })
    return line
  }

  getLogs(): LogLine[] {
    return this.logs
  }

  /* --------------------------------------------------------------- heartbeat */

  heartbeat(): Heartbeat {
    return {
      pid: process.pid,
      uptimeSeconds: Math.round((Date.now() - this.startedAt) / 1000),
      timestamp: new Date().toISOString(),
      terminalCount: this.counters.terminals,
      runningBuilds: this.counters.builds,
      repoCount: this.repos.length
    }
  }

  startHeartbeat(): void {
    if (this.heartbeatTimer) return
    this.heartbeatTimer = setInterval(() => {
      this.emit({ type: 'heartbeat', heartbeat: this.heartbeat() })
    }, HEARTBEAT_MS)
    this.heartbeatTimer.unref?.()
  }

  stopHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
    this.heartbeatTimer = null
  }

  /* ------------------------------------------------------------------ repos */

  /** Persisted repo paths — the encrypted config holds paths, never content. */
  getRepoPaths(): string[] {
    const stored = configStore.get<unknown[]>(CONFIG_KEY, [])
    if (!Array.isArray(stored)) return []
    return stored.filter((p): p is string => typeof p === 'string')
  }

  /**
   * On a first launch there is nothing configured. Rather than showing an empty
   * shell, seed paths that exist on THIS machine — the working directory and a
   * conventional projects folder. Nothing is fabricated: each path is verified
   * to exist and be a git repo during refresh, and unreadable ones are dropped.
   */
  private seedPaths(): string[] {
    const candidates = [process.cwd(), join(app.getPath('home'), 'codex', 'electron_app')]
    const seen = new Set<string>()
    const out: string[] = []
    for (const candidate of candidates) {
      try {
        if (!existsSync(candidate) || !statSync(candidate).isDirectory()) continue
        const norm = candidate.replace(/\\/g, '/').toLowerCase()
        if (seen.has(norm)) continue
        seen.add(norm)
        out.push(candidate)
      } catch {
        /* unreadable path — skip it */
      }
    }
    return out
  }

  private savePaths(paths: string[]): void {
    configStore.set(CONFIG_KEY as never, paths as never)
  }

  addRepoPath(path: string): void {
    const norm = path.replace(/\\/g, '/').toLowerCase()
    const paths = this.getRepoPaths()
    if (paths.some((p) => p.replace(/\\/g, '/').toLowerCase() === norm)) return
    paths.push(path)
    this.savePaths(paths)
  }

  removeRepoPath(id: string): string | null {
    const target = this.repos.find((r) => r.id === id)
    if (!target) return null
    this.savePaths(this.getRepoPaths().filter((p) => p !== target.path))
    return target.path
  }

  getRepos(): Repo[] {
    return this.repos
  }

  findRepo(id: string): Repo | null {
    return this.repos.find((r) => r.id === id) ?? null
  }

  /* ---------------------------------------------------------------- refresh */

  /**
   * Re-inspect every configured repo. GitHub data is opt-in because it shells
   * out to `gh` (network + rate limits); the local git scan stays instant.
   */
  async refresh(includeGithub: boolean): Promise<CockpitSnapshot> {
    const configured = this.getRepoPaths()
    const paths = configured.length ? configured : this.seedPaths()
    if (!configured.length && paths.length) {
      this.savePaths(paths)
      this.addLog(`Seeded ${paths.length} repo path(s) found on this machine`, 'info')
    }

    const results = await Promise.all(
      paths.map(async (path) => {
        try {
          return await inspectRepo(path)
        } catch (err) {
          log.warn('[cockpit] inspect failed:', path, String(err))
          return null
        }
      })
    )

    const fresh = results.filter((r): r is Repo => r !== null)
    const dropped = paths.length - fresh.length
    this.repos = fresh
    this.refreshedAt = new Date().toISOString()

    this.addLog(
      `Scanned ${fresh.length} repo${fresh.length === 1 ? '' : 's'}` +
        (dropped ? ` · ${dropped} skipped (not a git repository)` : ''),
      'info'
    )

    if (includeGithub) await this.refreshGithub()
    return this.snapshot()
  }

  private async refreshGithub(): Promise<void> {
    const slugs = this.repos.map((r) => r.githubSlug).filter((s): s is string => !!s)
    this.github = await refreshGithub(slugs, (text, level) => this.addLog(text, level))
  }

  snapshot(): CockpitSnapshot {
    const remote = getCachedRemoteRepos()
    return {
      repos: this.repos,
      remote: {
        repos: annotateCloned(
          remote.repos,
          this.repos.map((r) => r.githubSlug).filter((s): s is string => !!s)
        ),
        total: remote.total,
        fetchedAt: remote.fetchedAt ? new Date(remote.fetchedAt).toISOString() : null,
        error: remote.error
      },
      prs: getCachedGithub().prs,
      runs: getCachedGithub().runs,
      builds: this.buildsProvider ? this.buildsProvider() : [],
      logs: this.logs,
      github: this.github,
      refreshedAt: this.refreshedAt,
      heartbeat: this.heartbeat(),
      configPath: configFilePath(),
      cloneRoot: cloneRoot()
    }
  }

  /**
   * List every GitHub repo for the account — one GraphQL call, no clones.
   * Opt-in from the UI, and cached for two minutes so paging around the list
   * does not re-hit the API.
   */
  async listRemoteRepos(force: boolean): Promise<CockpitSnapshot> {
    const before = getCachedRemoteRepos().repos.length
    await fetchAllRemoteRepos((text, level) => this.addLog(text, level), force)
    const after = getCachedRemoteRepos().repos.length
    if (force && after !== before) {
      this.addLog(`Remote repo list refreshed (${after} repos)`, 'info')
    }
    return this.snapshot()
  }

  /** Register a freshly cloned path so it appears as a local repo immediately. */
  adoptClonedRepo(path: string): void {
    this.addRepoPath(path)
  }

  emitSnapshot(): void {
    this.emit({ type: 'snapshot', snapshot: this.snapshot() })
  }
}

/** The encrypted config file location, shown on the Settings page. */
export function configFilePath(): string | null {
  try {
    const dir = app.getPath('userData')
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    const file = join(dir, 'config.json')
    if (!existsSync(file)) writeFileSync(file, '{}', { flag: 'wx' })
    return file
  } catch {
    return null
  }
}

/**
 * Where a one-click clone lands. Defaults to a `GitHub` folder under the user's
 * home — the conventional location, and a path the user can change by picking a
 * different parent in the UI. Never written to inside a repo we already track.
 */
const CLONE_ROOT_KEY = 'cockpit:cloneRoot'

export function cloneRoot(): string {
  const stored = configStore.get<string | null>(CLONE_ROOT_KEY, null)
  if (stored && existsSync(stored)) return stored
  return join(app.getPath('home'), 'GitHub')
}

export function setCloneRoot(dir: string): void {
  if (existsSync(dir)) configStore.set(CLONE_ROOT_KEY as never, dir as never)
}

export const store = new CockpitStore()
