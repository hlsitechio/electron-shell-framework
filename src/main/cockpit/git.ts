import { basename, join } from 'node:path'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import type { Repo } from '../../shared/cockpit-types'
import { run, hashId } from './exec'
import { parseCommitLine, parseGithubSlug, parseStatusZ, parseWorktreesZ } from '../cockpit-parsers'

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
