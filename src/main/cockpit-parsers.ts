import type { Worktree } from '../shared/cockpit-types'

/**
 * Pure parsers — no I/O, no Node builtins, no git.
 *
 * Every one of these takes the raw stdout of a git/gh command and returns a
 * value. Keeping them pure is what makes the git layer unit-testable without
 * spawning a process or needing a fixture repository.
 */

export interface StatusSummary {
  branch: string
  dirtyCount: number
  stagedCount: number
  untrackedCount: number
  ahead: number
  behind: number
}

/**
 * `git status --porcelain=v1 -z --branch --untracked-files=all`
 *
 * `-z` separates records with NUL, the only form that survives paths
 * containing spaces, quotes or newlines. The header record carries the branch
 * plus ahead/behind counts.
 */
export function parseStatusZ(output: string): StatusSummary {
  const records = output.split('\0')
  const header = records.shift() ?? ''

  const headerBranch = header
    .replace(/^## (?:No commits yet on |Initial commit on )?/, '')
    .split('...')[0]
    .split(' [')[0]
    .trim()

  let dirtyCount = 0
  let stagedCount = 0
  let untrackedCount = 0

  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    if (!record || record.length < 2) continue
    dirtyCount++
    const x = record[0]
    const y = record[1]
    if (x === '?') untrackedCount++
    else if (x !== ' ') stagedCount++
    // A rename/copy record carries a SECOND path field. Skip it, or the file
    // gets counted twice.
    if (x === 'R' || x === 'C' || y === 'R' || y === 'C') i++
  }

  return {
    branch: headerBranch.startsWith('HEAD') ? 'detached HEAD' : headerBranch || 'unborn',
    dirtyCount,
    stagedCount,
    untrackedCount,
    ahead: Number(header.match(/ahead (\d+)/)?.[1] ?? 0),
    behind: Number(header.match(/behind (\d+)/)?.[1] ?? 0)
  }
}

/** Windows paths differ only by case and separator — compare normalized. */
export function normalizePath(p: string): string {
  return p.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()
}

/** `git worktree list --porcelain -z` */
export function parseWorktreesZ(output: string, mainRoot: string): Worktree[] {
  const trees: Worktree[] = []
  let current: Worktree | null = null

  const flush = (): void => {
    if (current) {
      current.isMain = normalizePath(current.path) === normalizePath(mainRoot)
      trees.push(current)
    }
    current = null
  }

  for (const line of output.split('\0')) {
    if (!line) continue
    if (line.startsWith('worktree ')) {
      flush()
      current = {
        path: line.slice('worktree '.length),
        branch: 'detached HEAD',
        head: '',
        bare: false,
        locked: false,
        prunable: false,
        isMain: false
      }
    } else if (current) {
      if (line.startsWith('HEAD ')) current.head = line.slice(5).trim()
      else if (line.startsWith('branch '))
        current.branch = line
          .slice(7)
          .trim()
          .replace(/^refs\/heads\//, '')
      else if (line === 'bare') current.bare = true
      else if (line.startsWith('detached')) current.branch = 'detached HEAD'
      else if (line.startsWith('locked')) current.locked = true
      else if (line.startsWith('prunable')) current.prunable = true
    }
  }
  flush()
  return trees
}

/** Accepts https, git@, ssh:// and git:// github remotes; returns `owner/repo`. */
export function parseGithubSlug(remote: string | null): string | null {
  if (!remote) return null
  const match = remote
    .trim()
    .match(
      /^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/|git:\/\/github\.com\/)([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/i
    )
  return match?.[1] ?? null
}

/**
 * Collapse GitHub's `statusCheckRollup` array into one state.
 *
 * The rollup mixes Check Runs (`conclusion`/`status`) and legacy Status
 * Contexts (`state`), so read whichever field is present.
 */
export function checkSummary(checks: unknown): 'passing' | 'failing' | 'pending' | 'none' {
  if (!Array.isArray(checks) || checks.length === 0) return 'none'
  const states = checks.map((check) =>
    String(
      (check as { conclusion?: string; state?: string; status?: string }).conclusion ||
        (check as { state?: string }).state ||
        (check as { status?: string }).status ||
        ''
    ).toUpperCase()
  )
  if (
    states.some((state) =>
      ['FAILURE', 'ERROR', 'CANCELLED', 'TIMED_OUT', 'ACTION_REQUIRED'].includes(state)
    )
  )
    return 'failing'
  if (states.some((state) => !['SUCCESS', 'NEUTRAL', 'SKIPPED'].includes(state))) return 'pending'
  return 'passing'
}

/** `git log -1 --pretty=format:%H%x1f%s%x1f%cI` (unit-separator delimited). */
export function parseCommitLine(
  output: string
): { hash: string; subject: string; date: string } | null {
  const line = output.trim()
  if (!line) return null
  const [hash, subject, date] = line.split('\u001f')
  if (!hash) return null
  return { hash, subject: subject ?? '', date: date ?? '' }
}
