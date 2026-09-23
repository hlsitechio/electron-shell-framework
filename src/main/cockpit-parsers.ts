import type {
  Worktree,
  GitCommitSummary,
  DiffFileSummary,
  BranchInfo,
  FileDiffStatus
} from '../shared/cockpit-types'

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

/**
 * Parse incoming commits from `git log HEAD..@{u} --pretty=format:%H%x1f%s%x1f%an%x1f%cI`.
 *
 * Each commit is unit-separator delimited, one per line.
 */
export function parseIncomingCommits(output: string): GitCommitSummary[] {
  const text = output.trim()
  if (!text) return []

  const lines = text.split('\n')
  const commits: GitCommitSummary[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const [hash, subject, author, date] = trimmed.split('\u001f')
    if (!hash) continue
    commits.push({
      hash,
      shortHash: hash.slice(0, 7),
      subject: subject || 'No commit message',
      author: author || 'Unknown',
      date: date || new Date().toISOString()
    })
  }

  return commits
}

const DEPENDENCY_FILE_REGEX =
  /(?:^|[/\\])(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|npm-shrinkwrap\.json|bun\.lockb)$/i

/**
 * Check whether any modified file in the diff is a package manifest or lockfile.
 */
export function detectDependencyChanges(rawFiles: string | string[]): {
  dependenciesChanged: boolean
  files: string[]
} {
  const fileList = Array.isArray(rawFiles)
    ? rawFiles
    : rawFiles
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean)

  const matched = fileList.filter((f) => DEPENDENCY_FILE_REGEX.test(f))
  return {
    dependenciesChanged: matched.length > 0,
    files: matched
  }
}

/**
 * Clean and resolve upstream branch name from `git rev-parse --abbrev-ref @{u}`.
 */
export function parseUpstreamBranch(output: string): string | null {
  const trimmed = output.trim()
  if (!trimmed || trimmed.includes('fatal:') || trimmed.includes('@{u}')) return null
  return trimmed.split('\n')[0]?.trim() || null
}

/**
 * Parse unified diffs and status records into per-file diff summaries.
 */
export function parseDiffFiles(
  statusZ: string,
  unstagedDiff: string = '',
  stagedDiff: string = ''
): DiffFileSummary[] {
  const records = statusZ.split('\0')
  records.shift() // skip header if present

  const parseDiffSections = (raw: string): Map<string, string> => {
    const map = new Map<string, string>()
    const sections = raw.split(/^diff --git /m)
    for (const section of sections) {
      if (!section.trim()) continue
      const headerLine = section.split('\n')[0] || ''
      const match = headerLine.match(/a\/(.*?)\s+b\/(.*)/)
      const path = match?.[2] || match?.[1] || headerLine.split(' ').pop() || ''
      if (path) {
        map.set(path.trim(), `diff --git ${section}`.trim())
      }
    }
    return map
  }

  const unstagedMap = parseDiffSections(unstagedDiff)
  const stagedMap = parseDiffSections(stagedDiff)

  const files: DiffFileSummary[] = []
  const seen = new Set<string>()

  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    if (!record || record.length < 3) continue
    const x = record[0]
    const y = record[1]
    let filePath = record.slice(3).trim()

    let oldPath: string | undefined
    if (x === 'R' || x === 'C' || y === 'R' || y === 'C') {
      oldPath = filePath
      i++
      const newPath = records[i]?.trim()
      if (newPath) filePath = newPath
    }

    if (seen.has(filePath)) continue
    seen.add(filePath)

    const isStaged = x !== ' ' && x !== '?'
    let status: FileDiffStatus = 'modified'
    if (x === '?' && y === '?') status = 'untracked'
    else if (x === 'D' || y === 'D') status = 'deleted'
    else if (x === 'A' || y === 'A') status = 'staged'
    else if (x === 'R' || y === 'R') status = 'renamed'

    const patch = stagedMap.get(filePath) || unstagedMap.get(filePath) || ''

    let additions = 0
    let deletions = 0
    for (const line of patch.split('\n')) {
      if (line.startsWith('+') && !line.startsWith('+++')) additions++
      else if (line.startsWith('-') && !line.startsWith('---')) deletions++
    }

    files.push({
      path: filePath,
      oldPath,
      status,
      staged: isStaged,
      additions,
      deletions,
      diff: patch,
      diffLines: patch ? patch.split('\n') : []
    })
  }

  return files
}

/**
 * Parse `git branch -a -vv --no-color` output into structured branch list.
 */
export function parseBranchList(rawOutput: string): BranchInfo[] {
  const lines = rawOutput.split('\n')
  const branches: BranchInfo[] = []
  const seenNames = new Set<string>()

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const current = line.startsWith('*')
    const cleanLine = trimmed.replace(/^[*+]\s+/, '')
    const parts = cleanLine.split(/\s+/)
    const rawName = parts[0]
    if (!rawName || rawName === '->' || rawName.includes('HEAD')) continue

    const isRemote = rawName.startsWith('remotes/')
    const name = rawName.replace(/^remotes\/origin\//, '').replace(/^remotes\//, '')

    if (seenNames.has(name) && isRemote) continue
    seenNames.add(name)

    const trackingMatch = cleanLine.match(/\[([^\]]+)\]/)
    let upstream: string | null = null
    let ahead = 0
    let behind = 0

    if (trackingMatch) {
      const trackingContent = trackingMatch[1]
      const upParts = trackingContent.split(':')
      upstream = upParts[0]?.trim() || null
      if (upParts[1]) {
        const aheadMatch = upParts[1].match(/ahead (\d+)/)
        const behindMatch = upParts[1].match(/behind (\d+)/)
        if (aheadMatch) ahead = parseInt(aheadMatch[1], 10) || 0
        if (behindMatch) behind = parseInt(behindMatch[1], 10) || 0
      }
    }

    const commitSha = parts[1] || ''
    const subject =
      cleanLine
        .split(commitSha)[1]
        ?.replace(/\[[^\]]+\]/, '')
        .trim() || ''

    branches.push({
      name,
      current,
      remote: isRemote,
      upstream,
      ahead,
      behind,
      merged: false,
      subject
    })
  }

  return branches
}
