import { basename, join } from 'node:path'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import type {
  Repo,
  GitCommitSummary,
  GitUpdateCheckResult,
  GitUpdateApplyOptions,
  GitUpdateApplyResult,
  GitUpdateProgressEvent,
  GitUpdateStep,
  DiffFileSummary,
  BranchInfo
} from '../../shared/cockpit-types'
import { run, hashId } from './exec'
import {
  parseCommitLine,
  parseGithubSlug,
  parseStatusZ,
  parseWorktreesZ,
  parseIncomingCommits,
  detectDependencyChanges,
  parseUpstreamBranch,
  parseDiffFiles,
  parseBranchList
} from '../cockpit-parsers'

/**
 * Git layer — the only place that shells out to `git`.
 *
 * Every value the UI shows comes from a real invocation; there is no sample
 * data anywhere in the main process. Parsing lives in `cockpit-parsers.ts` so
 * it can be unit-tested without spawning a process.
 *
 * Argument ordering matters: global flags (like `-C`) go BEFORE the
 * subcommand, subcommand flags after it.
 */

function git(path: string, args: string[], timeoutMs = 20000): ReturnType<typeof run> {
  return run('git', ['-C', path, ...args], { timeoutMs })
}

/** `git rev-parse --show-toplevel` — resolves a nested path to the repo root. */
export async function resolveRoot(path: string): Promise<string | null> {
  const res = await git(path, ['rev-parse', '--show-toplevel'])
  if (!res.ok) return null
  const root = res.stdout.trim().split('\n')[0]?.trim()
  return root || null
}

/** Is this path inside a git work tree? */
export async function isRepo(path: string): Promise<boolean> {
  return (await resolveRoot(path)) !== null
}

/** Read npm script names — the "run a build" affordance is built from these. */
async function readScripts(root: string): Promise<string[]> {
  try {
    const raw = await readFile(join(root, 'package.json'), 'utf8')
    const parsed = JSON.parse(raw) as { scripts?: Record<string, string> }
    return Object.keys(parsed.scripts ?? {})
  } catch {
    return []
  }
}

/**
 * Collect one repo's live state. The git calls run concurrently; a single
 * failure (a shallow clone with no upstream, say) degrades that field only.
 */
export async function inspectRepo(inputPath: string): Promise<Repo> {
  const root = (await resolveRoot(inputPath)) ?? inputPath
  const id = hashId(root)
  const name = basename(root)

  const [statusRes, remoteRes, worktreeRes, stashRes, logRes, scripts] = await Promise.all([
    git(root, ['status', '--porcelain=v1', '-z', '--branch', '--untracked-files=all']),
    git(root, ['remote', 'get-url', 'origin']),
    git(root, ['worktree', 'list', '--porcelain', '-z']),
    git(root, ['stash', 'list']),
    git(root, ['log', '-1', '--pretty=format:%H%x1f%s%x1f%cI']),
    readScripts(root)
  ])

  if (!statusRes.ok) {
    return {
      id,
      name,
      path: root,
      branch: 'unknown',
      head: '',
      dirtyCount: 0,
      stagedCount: 0,
      untrackedCount: 0,
      ahead: 0,
      behind: 0,
      stashCount: 0,
      lastCommit: null,
      remote: null,
      githubSlug: null,
      scripts,
      worktrees: [],
      error: (statusRes.stderr || statusRes.error || 'git status failed').trim().slice(0, 300)
    }
  }

  const status = parseStatusZ(statusRes.stdout)
  const headRes = await git(root, ['rev-parse', 'HEAD'])
  const head = headRes.ok ? headRes.stdout.trim() : ''

  const remote = remoteRes.ok ? remoteRes.stdout.trim() || null : null
  const stashCount = stashRes.ok ? stashRes.stdout.split('\n').filter((l) => l.trim()).length : 0

  return {
    id,
    name,
    path: root,
    branch: status.branch,
    head,
    dirtyCount: status.dirtyCount,
    stagedCount: status.stagedCount,
    untrackedCount: status.untrackedCount,
    ahead: status.ahead,
    behind: status.behind,
    stashCount,
    lastCommit: parseCommitLine(logRes.ok ? logRes.stdout : ''),
    remote,
    githubSlug: parseGithubSlug(remote),
    scripts,
    worktrees: worktreeRes.ok ? parseWorktreesZ(worktreeRes.stdout, root) : []
  }
}

/** Create a worktree in a sibling directory of the repo root. */
export async function addWorktree(
  root: string,
  branch: string
): Promise<{ ok: boolean; message: string }> {
  const slug = branch.replace(/[^a-zA-Z0-9._-]+/g, '-')
  const target = join(root, '..', `${basename(root)}--${slug}`)
  const res = await git(root, ['worktree', 'add', '-b', branch, target], 60000)
  if (res.ok) return { ok: true, message: `Created worktree at ${target}` }
  return {
    ok: false,
    message: (res.stderr || res.error || 'worktree add failed').trim().slice(0, 300)
  }
}

/** `git worktree prune` — drops bookkeeping for deleted worktree folders. */
export async function pruneWorktrees(root: string): Promise<{ ok: boolean; message: string }> {
  const res = await git(root, ['worktree', 'prune', '-v'])
  return {
    ok: res.ok,
    message: (res.stdout || res.stderr || '').trim().slice(0, 300) || 'Nothing to prune'
  }
}

/**
 * Clone ONE remote repo on demand.
 *
 * Default is a **blobless partial clone** (`--filter=blob:none`) at depth 1:
 * it fetches commit and tree metadata but not file contents, materialising blobs
 * lazily when something actually reads them. For a multi-gigabyte repo this is
 * the difference between a 15 MB and a 3.4 GB download, and it stays a fully
 * functional git checkout — `git log`, `status` and `checkout` all work.
 *
 * `full: true` is the escape hatch for anyone who wants every blob up front.
 */
export async function cloneRepo(
  slug: string,
  parentDir: string,
  full: boolean,
  onProgress: (text: string) => void
): Promise<{ ok: boolean; path: string | null; message: string }> {
  const name = slug.split('/')[1] ?? slug
  const target = join(parentDir, name)

  if (existsSync(target)) {
    return { ok: false, path: null, message: `${target} already exists — refusing to overwrite` }
  }

  const url = `https://github.com/${slug}.git`
  const args = full
    ? ['clone', '--progress', url, target]
    : ['clone', '--progress', '--filter=blob:none', '--depth', '1', url, target]

  onProgress(`git ${args.join(' ')}`)

  return new Promise((resolve) => {
    const child = spawn('git', args, {
      windowsHide: true,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
    })

    let lastLine = ''
    const handle = (chunk: Buffer): void => {
      const text = chunk.toString('utf8')
      // git progress is carriage-return delimited; surface the last segment.
      const parts = text.split(/[\r\n]/).filter((s) => s.trim())
      const tail = parts[parts.length - 1]
      if (tail && tail !== lastLine) {
        lastLine = tail
        onProgress(tail.trim())
      }
    }

    child.stdout?.on('data', handle)
    child.stderr?.on('data', handle)

    child.on('error', (err) => {
      resolve({ ok: false, path: null, message: `spawn failed: ${err.message}` })
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ ok: true, path: target, message: `Cloned to ${target}` })
      } else {
        resolve({
          ok: false,
          path: null,
          message: `git clone exited ${code}${lastLine ? ` — ${lastLine}` : ''}`
        })
      }
    })
  })
}

/**
 * Check for remote git updates on origin/upstream, detect incoming commits,
 * and check if dependencies (package.json / lockfiles) changed.
 */
export async function gitCheckUpdate(inputPath: string): Promise<GitUpdateCheckResult> {
  const root = (await resolveRoot(inputPath)) ?? inputPath
  const repoName = basename(root)

  if (!(await isRepo(root))) {
    return {
      ok: false,
      repoPath: root,
      repoName,
      branch: 'unknown',
      upstream: null,
      remoteUrl: null,
      ahead: 0,
      behind: 0,
      hasUpdate: false,
      incomingCommits: [],
      dependenciesChanged: false,
      changedFiles: [],
      isDirty: false,
      error: 'Not a git repository'
    }
  }

  // Inspect local branch, remote url, status, and tracking upstream branch
  const [branchRes, remoteRes, statusRes, upstreamRes] = await Promise.all([
    git(root, ['rev-parse', '--abbrev-ref', 'HEAD']),
    git(root, ['remote', 'get-url', 'origin']),
    git(root, ['status', '--porcelain=v1', '-z', '--untracked-files=all']),
    git(root, ['rev-parse', '--abbrev-ref', '@{u}'])
  ])

  const branch = branchRes.ok ? branchRes.stdout.trim() : 'HEAD'
  const remoteUrl = remoteRes.ok ? remoteRes.stdout.trim() || null : null
  const isDirty = statusRes.ok && Boolean(statusRes.stdout.trim())
  let upstream = parseUpstreamBranch(upstreamRes.stdout)

  // Fetch latest remote refs from remote (default origin)
  const remoteName = upstream?.split('/')[0] || 'origin'
  const fetchRes = await git(root, ['fetch', '--prune', remoteName], 35000)

  if (!upstream) {
    // If no upstream was set, check if origin/<branch> exists now
    const checkTracking = await git(root, ['rev-parse', '--verify', `${remoteName}/${branch}`])
    if (checkTracking.ok) {
      upstream = `${remoteName}/${branch}`
    }
  }

  if (!upstream) {
    return {
      ok: true,
      repoPath: root,
      repoName,
      branch,
      upstream: null,
      remoteUrl,
      ahead: 0,
      behind: 0,
      hasUpdate: false,
      incomingCommits: [],
      dependenciesChanged: false,
      changedFiles: [],
      isDirty,
      error: fetchRes.ok
        ? 'No upstream tracking branch configured'
        : fetchRes.stderr || fetchRes.error || 'Fetch failed'
    }
  }

  // Count ahead / behind
  const [behindRes, aheadRes] = await Promise.all([
    git(root, ['rev-list', '--count', `HEAD..${upstream}`]),
    git(root, ['rev-list', '--count', `${upstream}..HEAD`])
  ])

  const behind = behindRes.ok ? parseInt(behindRes.stdout.trim(), 10) || 0 : 0
  const ahead = aheadRes.ok ? parseInt(aheadRes.stdout.trim(), 10) || 0 : 0

  let incomingCommits: GitCommitSummary[] = []
  let changedFiles: string[] = []
  let dependenciesChanged = false

  if (behind > 0) {
    const [logRes, diffRes] = await Promise.all([
      git(root, ['log', `HEAD..${upstream}`, '--pretty=format:%H%x1f%s%x1f%an%x1f%cI', '-n', '50']),
      git(root, ['diff', '--name-only', `HEAD..${upstream}`])
    ])

    if (logRes.ok) {
      incomingCommits = parseIncomingCommits(logRes.stdout)
    }
    if (diffRes.ok) {
      const depCheck = detectDependencyChanges(diffRes.stdout)
      dependenciesChanged = depCheck.dependenciesChanged
      changedFiles = depCheck.files
    }
  }

  return {
    ok: true,
    repoPath: root,
    repoName,
    branch,
    upstream,
    remoteUrl,
    ahead,
    behind,
    hasUpdate: behind > 0,
    incomingCommits,
    dependenciesChanged,
    changedFiles,
    isDirty,
    error: fetchRes.ok ? undefined : fetchRes.stderr || fetchRes.error || 'Fetch warning'
  }
}

function npmRunner(): string {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm'
}

/**
 * Apply git update by pulling remote changes, running npm install if requested,
 * and optionally rebuilding.
 */
export async function gitApplyUpdate(
  inputPath: string,
  options: GitUpdateApplyOptions = {},
  onProgress?: (event: GitUpdateProgressEvent) => void
): Promise<GitUpdateApplyResult> {
  const root = (await resolveRoot(inputPath)) ?? inputPath
  const logs: string[] = []

  const logLine = (
    step: GitUpdateStep,
    message: string,
    outputChunk?: string,
    error?: string
  ): void => {
    logs.push(outputChunk ? `${message}: ${outputChunk}` : message)
    onProgress?.({ repoPath: root, step, message, outputChunk, error })
  }

  if (!(await isRepo(root))) {
    logLine('error', 'Not a git repository')
    return {
      ok: false,
      repoPath: root,
      pulledCommits: 0,
      dependenciesInstalled: false,
      buildRun: false,
      logs,
      error: 'Not a git repository'
    }
  }

  logLine('pulling', 'Pulling latest changes from remote…')

  // Step 1: Git Pull (try --ff-only first for safety)
  let pullRes = await git(root, ['pull', '--ff-only'], 40000)
  if (!pullRes.ok) {
    pullRes = await git(root, ['pull'], 40000)
  }

  if (!pullRes.ok) {
    const errMsg = (pullRes.stderr || pullRes.error || pullRes.stdout || 'git pull failed').trim()
    logLine('error', `Git pull failed: ${errMsg}`, undefined, errMsg)
    return {
      ok: false,
      repoPath: root,
      pulledCommits: 0,
      dependenciesInstalled: false,
      buildRun: false,
      logs,
      error: errMsg
    }
  }

  logLine('pulling', `Git pull completed: ${pullRes.stdout.trim() || 'Already up to date'}`)

  // Step 2: Install dependencies if requested or package.json exists
  let dependenciesInstalled = false
  const hasPackageJson = existsSync(join(root, 'package.json'))

  if (options.installDeps !== false && hasPackageJson) {
    logLine('installing_deps', 'Installing dependencies with npm install…')

    const npmRes = await new Promise<{ ok: boolean; error?: string }>((resolve) => {
      const child = spawn(npmRunner(), ['install'], {
        cwd: root,
        windowsHide: true,
        env: { ...process.env, npm_config_loglevel: 'notice' }
      })

      child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString('utf8').trim()
        if (text) {
          logLine('installing_deps', 'npm install', text)
        }
      })

      child.stderr?.on('data', (data: Buffer) => {
        const text = data.toString('utf8').trim()
        if (text) {
          logLine('installing_deps', 'npm install', text)
        }
      })

      child.on('error', (err) => {
        resolve({ ok: false, error: err.message })
      })

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ ok: true })
        } else {
          resolve({ ok: false, error: `npm install exited with code ${code}` })
        }
      })
    })

    if (!npmRes.ok) {
      logLine('error', `Dependency installation failed: ${npmRes.error}`)
      return {
        ok: false,
        repoPath: root,
        pulledCommits: 1,
        dependenciesInstalled: false,
        buildRun: false,
        logs,
        error: npmRes.error
      }
    }

    dependenciesInstalled = true
    logLine('installing_deps', 'Dependencies installed successfully.')
  }

  // Step 3: Run build if requested
  let buildRun = false
  if (options.runBuild && hasPackageJson) {
    logLine('building', 'Building project with npm run build…')

    const buildRes = await new Promise<{ ok: boolean; error?: string }>((resolve) => {
      const child = spawn(npmRunner(), ['run', 'build'], {
        cwd: root,
        windowsHide: true,
        env: process.env
      })

      child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString('utf8').trim()
        if (text) {
          logLine('building', 'npm run build', text)
        }
      })

      child.stderr?.on('data', (data: Buffer) => {
        const text = data.toString('utf8').trim()
        if (text) {
          logLine('building', 'npm run build', text)
        }
      })

      child.on('error', (err) => {
        resolve({ ok: false, error: err.message })
      })

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ ok: true })
        } else {
          resolve({ ok: false, error: `npm run build exited with code ${code}` })
        }
      })
    })

    if (!buildRes.ok) {
      logLine('error', `Build failed: ${buildRes.error}`)
      return {
        ok: false,
        repoPath: root,
        pulledCommits: 1,
        dependenciesInstalled,
        buildRun: false,
        logs,
        error: buildRes.error
      }
    }

    buildRun = true
    logLine('building', 'Build completed successfully.')
  }

  logLine('done', 'Update and dependency installation completed successfully!')

  return {
    ok: true,
    repoPath: root,
    pulledCommits: 1,
    dependenciesInstalled,
    buildRun,
    logs
  }
}

/** Get list of changed files with diff contents */
export async function gitDiffFiles(inputPath: string): Promise<DiffFileSummary[]> {
  const root = (await resolveRoot(inputPath)) ?? inputPath
  const [statusRes, unstagedRes, stagedRes] = await Promise.all([
    git(root, ['status', '--porcelain=v1', '-z', '--untracked-files=all']),
    git(root, ['diff', '-p', '--no-color']),
    git(root, ['diff', '--cached', '-p', '--no-color'])
  ])

  if (!statusRes.ok) return []
  return parseDiffFiles(statusRes.stdout, unstagedRes.stdout, stagedRes.stdout)
}

/** Stage or unstage a single file or all files */
export async function gitStageFile(
  inputPath: string,
  filePath: string,
  stage: boolean
): Promise<boolean> {
  const root = (await resolveRoot(inputPath)) ?? inputPath
  const args = stage
    ? ['add', filePath === '.' ? '--all' : filePath]
    : ['restore', '--staged', filePath === '.' ? '.' : filePath]
  const res = await git(root, args)
  return res.ok
}

/** Discard changes in an uncommitted file */
export async function gitDiscardFile(inputPath: string, filePath: string): Promise<boolean> {
  const root = (await resolveRoot(inputPath)) ?? inputPath
  // Try restore tracked changes
  const res1 = await git(root, ['restore', filePath])
  if (res1.ok) return true
  // If untracked, clean file
  const res2 = await git(root, ['clean', '-f', filePath])
  return res2.ok
}

/** Commit staged files with message */
export async function gitCommit(inputPath: string, message: string): Promise<boolean> {
  const root = (await resolveRoot(inputPath)) ?? inputPath
  if (!message.trim()) return false
  const res = await git(root, ['commit', '-m', message.trim()])
  return res.ok
}

/** Git stash operations */
export async function gitStash(
  inputPath: string,
  action: 'save' | 'pop' | 'list',
  message?: string
): Promise<string[]> {
  const root = (await resolveRoot(inputPath)) ?? inputPath
  if (action === 'save') {
    const args = message ? ['stash', 'push', '-m', message] : ['stash']
    const res = await git(root, args)
    return [res.stdout || res.stderr]
  }
  if (action === 'pop') {
    const res = await git(root, ['stash', 'pop'])
    return [res.stdout || res.stderr]
  }
  // action === 'list'
  const res = await git(root, ['stash', 'list'])
  return res.ok ? res.stdout.split('\n').filter(Boolean) : []
}

/** List all local and remote branches */
export async function gitListBranches(inputPath: string): Promise<BranchInfo[]> {
  const root = (await resolveRoot(inputPath)) ?? inputPath
  const res = await git(root, ['branch', '-a', '-vv', '--no-color'])
  if (!res.ok) return []
  return parseBranchList(res.stdout)
}

/** Checkout branch */
export async function gitCheckoutBranch(inputPath: string, branchName: string): Promise<boolean> {
  const root = (await resolveRoot(inputPath)) ?? inputPath
  const res = await git(root, ['checkout', branchName])
  return res.ok
}

/** Create and checkout branch */
export async function gitCreateBranch(inputPath: string, branchName: string): Promise<boolean> {
  const root = (await resolveRoot(inputPath)) ?? inputPath
  const res = await git(root, ['checkout', '-b', branchName])
  return res.ok
}

/** Clean up branches merged into main/default branch */
export async function gitCleanupMergedBranches(inputPath: string): Promise<string[]> {
  const root = (await resolveRoot(inputPath)) ?? inputPath
  const headRes = await git(root, ['rev-parse', '--abbrev-ref', 'origin/HEAD'])
  const defaultBranch = headRes.ok ? headRes.stdout.trim().replace(/^origin\//, '') : 'main'

  const mergedRes = await git(root, ['branch', '--merged', defaultBranch])
  if (!mergedRes.ok) return []

  const deleted: string[] = []
  const lines = mergedRes.stdout.split('\n')
  for (const l of lines) {
    const name = l.trim().replace(/^[*+]\s+/, '')
    if (
      !name ||
      name === defaultBranch ||
      name === 'main' ||
      name === 'master' ||
      name.startsWith('remotes/')
    )
      continue
    const delRes = await git(root, ['branch', '-d', name])
    if (delRes.ok) deleted.push(name)
  }

  return deleted
}
