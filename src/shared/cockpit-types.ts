/**
 * Repo Cockpit — shared contract between main and renderer.
 *
 * This is the app's data shape. Nothing here touches Node or React, so it is
 * safe to import from the renderer, the main process, and tests alike.
 *
 * SECURITY NOTE: `CockpitApi` is deliberately an *allowlist*. There is no
 * generic `invoke(channel, args)`, no filesystem read/write, and no method that
 * accepts an executable name or an arbitrary path from the renderer.
 */

export type BuildStatus = 'running' | 'passed' | 'failed' | 'cancelled'
export type ChecksState = 'passing' | 'failing' | 'pending' | 'none'
export type LogLevel = 'info' | 'success' | 'error' | 'warn'

export interface Worktree {
  path: string
  /** short branch name, or 'detached HEAD' */
  branch: string
  head: string
  bare: boolean
  locked: boolean
  prunable: boolean
  /** true when this worktree is the repo's main checkout */
  isMain: boolean
}

export interface CommitInfo {
  hash: string
  subject: string
  date: string
}

export interface Repo {
  /** sha1(path).slice(0,16) — stable across restarts */
  id: string
  name: string
  path: string
  branch: string
  head: string
  dirtyCount: number
  stagedCount: number
  untrackedCount: number
  ahead: number
  behind: number
  stashCount: number
  lastCommit: CommitInfo | null
  remote: string | null
  githubSlug: string | null
  /** npm script names discovered in package.json */
  scripts: string[]
  worktrees: Worktree[]
  /** human-readable failure — shown inline instead of silently dropping the repo */
  error?: string
}

export interface PullRequest {
  id: string
  repoId: string
  repoName: string
  number: number
  title: string
  url: string
  author: string
  branch: string
  baseBranch: string
  draft: boolean
  reviewDecision: string
  updatedAt: string
  checks: ChecksState
}

export interface CiRun {
  id: string
  repoId: string
  repoName: string
  name: string
  title: string
  branch: string
  status: string
  conclusion: string | null
  createdAt: string
  updatedAt: string
  url: string
}

export interface BuildRun {
  id: string
  repoId: string
  repoName: string
  script: string
  status: BuildStatus
  startedAt: string
  finishedAt: string | null
  exitCode: number | null
  pid: number | null
  /** captured output lines — the right rail streams these */
  lineCount: number
}

export interface LogLine {
  id: number
  timestamp: string
  repoId: string | null
  buildId: string | null
  level: LogLevel
  text: string
}

/** Main-process vitals — the footer dot is bound to this, not a static string. */
export interface Heartbeat {
  pid: number
  uptimeSeconds: number
  timestamp: string
  terminalCount: number
  runningBuilds: number
  repoCount: number
}

export interface GithubState {
  available: boolean
  message: string
  checkedAt: string | null
}

export interface CockpitSnapshot {
  repos: Repo[]
  prs: PullRequest[]
  runs: CiRun[]
  builds: BuildRun[]
  logs: LogLine[]
  github: GithubState
  refreshedAt: string | null
  heartbeat: Heartbeat
  /** absolute path to the encrypted config file — shown in Settings */
  configPath: string | null
}

export type CockpitEvent =
  | { type: 'snapshot'; snapshot: CockpitSnapshot }
  | { type: 'log'; line: LogLine }
  | { type: 'build'; build: BuildRun }
  | { type: 'terminal-data'; repoId: string; data: string; sequence: number; pid: number }
  | { type: 'terminal-exit'; repoId: string; exitCode: number }
  | { type: 'heartbeat'; heartbeat: Heartbeat }

export interface TerminalSession {
  repoId: string
  pid: number
  shell: string
  cwd: string
  cols: number
  rows: number
}

export interface BuildResult {
  buildId: string
  status: BuildStatus
  exitCode: number | null
}

/**
 * Renderer-facing API. Every method is a real main-process operation.
 */
export interface CockpitApi {
  snapshot(): Promise<CockpitSnapshot>
  refresh(includeGithub: boolean): Promise<CockpitSnapshot>
  addRepo(): Promise<CockpitSnapshot>
  removeRepo(repoId: string): Promise<CockpitSnapshot>
  revealRepo(repoId: string): Promise<boolean>
  openPath(target: string): Promise<boolean>
  createWorktree(repoId: string, branch: string): Promise<CockpitSnapshot>
  pruneWorktrees(repoId: string): Promise<CockpitSnapshot>
  startBuild(repoId: string, script: string): Promise<BuildRun>
  stopBuild(buildId: string): Promise<boolean>
  buildOutput(buildId: string): Promise<string>
  terminalAttach(repoId: string, cols: number, rows: number): Promise<TerminalSession>
  terminalWrite(repoId: string, data: string): Promise<boolean>
  terminalResize(repoId: string, cols: number, rows: number): Promise<boolean>
  terminalClose(repoId: string): Promise<boolean>
  writeClipboard(text: string): Promise<boolean>
  heartbeat(): Promise<Heartbeat>
  onEvent(callback: (event: CockpitEvent) => void): () => void
}
