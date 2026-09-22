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

/**
 * A repository as GitHub knows it — listed from ONE GraphQL call, without
 * cloning. `cloned` is filled in by matching against the local working copies,
 * which is what lets the UI show all 88 repos and only fetch the ones you ask
 * for.
 */
export interface RemoteRepo {
  slug: string
  name: string
  owner: string
  isPrivate: boolean
  /** true when this repo is a fork of someone else's — excluded by the "mine" view */
  isFork: boolean
  pushedAt: string
  /** GitHub reports diskUsage in kilobytes */
  sizeKb: number
  language: string | null
  defaultBranch: string
  headOid: string
  headMessage: string
  headDate: string
  openPrs: number
  url: string
  /** true when this repo also exists as a working copy on this machine */
  cloned: boolean
  /** repo description (filled by the detail fetch) */
  description?: string
  stars?: number
  watchers?: number
  license?: string | null
  topics?: string[]
}

/** One entry in a repo's root tree. */
export interface RemoteTreeEntry {
  path: string
  type: 'file' | 'dir' | 'submodule' | 'symlink'
  size: number
  sha: string
}

/** A file's decoded content, fetched on demand. */
export interface RemoteFile {
  path: string
  size: number
  /** utf-8 text when the file is text and small enough; null for binary/oversized */
  text: string | null
  truncated: boolean
  /** true when GitHub reports a non-text encoding (images, archives…) */
  binary: boolean
  /** present when the file could not be read at all */
  error?: string
}

export interface RemoteCommit {
  sha: string
  message: string
  author: string
  date: string
}

export interface RemoteBranch {
  name: string
  sha: string
  isDefault: boolean
}

/**
 * Everything needed to render a repo in full WITHOUT cloning it — one request
 * per facet, all against the GitHub API.
 */
export interface RepoDetail {
  slug: string
  readme: { name: string; text: string } | null
  tree: RemoteTreeEntry[]
  commits: RemoteCommit[]
  branches: RemoteBranch[]
  description: string
  stars: number
  watchers: number
  license: string | null
  topics: string[]
  defaultBranch: string
  /** how many requests this view cost — shown so the cost is never a mystery */
  requests: number
  error: string | null
}

export interface RemoteRepoState {
  repos: RemoteRepo[]
  total: number
  fetchedAt: string | null
  error: string | null
  /** true when the list was restored from disk and is old — offer a refresh */
  stale: boolean
}

export interface CloneResult {
  ok: boolean
  slug: string
  path: string | null
  message: string
}

export interface CockpitSnapshot {
  repos: Repo[]
  remote: RemoteRepoState
  prs: PullRequest[]
  runs: CiRun[]
  builds: BuildRun[]
  logs: LogLine[]
  github: GithubState
  refreshedAt: string | null
  heartbeat: Heartbeat
  /** absolute path to the encrypted config file — shown in Settings */
  configPath: string | null
  /** clone root offered by default when cloning a remote repo */
  cloneRoot: string
}

export type CockpitEvent =
  | { type: 'snapshot'; snapshot: CockpitSnapshot }
  | { type: 'log'; line: LogLine }
  | { type: 'build'; build: BuildRun }
  | { type: 'terminal-data'; repoId: string; data: string; sequence: number; pid: number }
  | { type: 'terminal-exit'; repoId: string; exitCode: number }
  | { type: 'heartbeat'; heartbeat: Heartbeat }
  | { type: 'clone-progress'; slug: string; text: string }

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
  /** List every GitHub repo for the account — one GraphQL call, no clones. */
  listRemoteRepos(force: boolean): Promise<CockpitSnapshot>
  /** Fetch ONE repo on demand (blobless + shallow unless `full`). */
  cloneRepo(slug: string, parentDir: string | null, full: boolean): Promise<CloneResult>
  pickCloneParent(): Promise<string | null>
  /** Open a repo for READING without cloning it — metadata, tree, readme. */
  repoDetail(slug: string): Promise<RepoDetail>
  /** Read one file's text straight from GitHub, no clone. */
  repoFile(slug: string, path: string, ref: string | null): Promise<RemoteFile>
  terminalAttach(repoId: string, cols: number, rows: number): Promise<TerminalSession>
  terminalWrite(repoId: string, data: string): Promise<boolean>
  terminalResize(repoId: string, cols: number, rows: number): Promise<boolean>
  terminalClose(repoId: string): Promise<boolean>
  writeClipboard(text: string): Promise<boolean>
  heartbeat(): Promise<Heartbeat>
  onEvent(callback: (event: CockpitEvent) => void): () => void
}
