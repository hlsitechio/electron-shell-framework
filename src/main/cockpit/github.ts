import { run } from './exec'
import { checkSummary } from '../cockpit-parsers'
import type { CiRun, GithubState, PullRequest } from '../../shared/cockpit-types'

/**
 * GitHub layer, driven by the `gh` CLI.
 *
 * `gh` reuses the machine's existing login, so this app never stores a token,
 * never asks for one, and never touches the network unless the user explicitly
 * refreshes. If `gh` is missing or logged out, the feature degrades with a
 * readable message instead of an exception.
 */

interface Cache {
  prs: PullRequest[]
  runs: CiRun[]
}

const cache: Cache = { prs: [], runs: [] }

export function getCachedGithub(): Cache {
  return cache
}

const PR_FIELDS =
  'number,title,url,author,headRefName,baseRefName,isDraft,reviewDecision,updatedAt,statusCheckRollup'
const RUN_FIELDS =
  'databaseId,name,displayTitle,headBranch,status,conclusion,createdAt,updatedAt,url'

/** Is `gh` present and authenticated? */
export async function ghAvailable(): Promise<GithubState> {
  const version = await run('gh', ['--version'], { timeoutMs: 10000 })
  if (!version.ok) {
    return {
      available: false,
      message: 'gh CLI not found — install GitHub CLI to enable the PR queue and CI runs',
      checkedAt: new Date().toISOString()
    }
  }

  const auth = await run('gh', ['auth', 'status'], { timeoutMs: 15000 })
  if (!auth.ok) {
    const detail =
      `${auth.stdout}${auth.stderr}`.split('\n').find((l) => l.trim()) ?? 'not logged in'
    return {
      available: false,
      message: `gh is installed but not authenticated — run "gh auth login" (${detail.trim()})`,
      checkedAt: new Date().toISOString()
    }
  }

  return { available: true, message: 'gh CLI authenticated', checkedAt: new Date().toISOString() }
}

interface RawPr {
  number: number
  title: string
  url: string
  author?: { login?: string }
  headRefName?: string
  baseRefName?: string
  isDraft?: boolean
  reviewDecision?: string | null
  updatedAt?: string
  statusCheckRollup?: unknown
}

/** Fetch open PRs for one `owner/repo` slug. */
export async function fetchPrs(
  slug: string,
  repoId: string,
  repoName: string
): Promise<PullRequest[]> {
  const res = await run(
    'gh',
    ['pr', 'list', '--repo', slug, '--state', 'open', '--limit', '30', '--json', PR_FIELDS],
    { timeoutMs: 45000 }
  )
  if (!res.ok) return []

  let parsed: RawPr[]
  try {
    parsed = JSON.parse(res.stdout) as RawPr[]
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []

  return parsed.map((pr) => ({
    id: `${repoId}#${pr.number}`,
    repoId,
    repoName,
    number: pr.number,
    title: pr.title,
    url: pr.url,
    author: pr.author?.login ?? 'unknown',
    branch: pr.headRefName ?? '',
    baseBranch: pr.baseRefName ?? '',
    draft: Boolean(pr.isDraft),
    reviewDecision: pr.reviewDecision ?? 'REVIEW_REQUIRED',
    updatedAt: pr.updatedAt ?? '',
    checks: checkSummary(pr.statusCheckRollup)
  }))
}

interface RawRun {
  databaseId?: number
  name?: string
  displayTitle?: string
  headBranch?: string
  status?: string
  conclusion?: string | null
  createdAt?: string
  updatedAt?: string
  url?: string
}

/** Fetch recent workflow runs for one `owner/repo` slug. */
export async function fetchRuns(slug: string, repoId: string, repoName: string): Promise<CiRun[]> {
  const res = await run(
    'gh',
    ['run', 'list', '--repo', slug, '--limit', '20', '--json', RUN_FIELDS],
    { timeoutMs: 45000 }
  )
  if (!res.ok) return []

  let parsed: RawRun[]
  try {
    parsed = JSON.parse(res.stdout) as RawRun[]
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []

  return parsed.map((r) => ({
    id: `${repoId}#${r.databaseId ?? r.url ?? Math.random()}`,
    repoId,
    repoName,
    name: r.name ?? 'workflow',
    title: r.displayTitle ?? '',
    branch: r.headBranch ?? '',
    status: r.status ?? 'unknown',
    conclusion: r.conclusion ?? null,
    createdAt: r.createdAt ?? '',
    updatedAt: r.updatedAt ?? '',
    url: r.url ?? ''
  }))
}

/**
 * Refresh PRs + runs across every repo that has a GitHub remote.
 * `report` streams progress into the activity log so a slow `gh` call is
 * visible rather than a frozen UI.
 */
export async function refreshGithub(
  slugs: string[],
  report: (text: string, level: 'info' | 'success' | 'error' | 'warn') => void
): Promise<GithubState> {
  const state = await ghAvailable()
  if (!state.available) {
    report(state.message, 'warn')
    return state
  }
  if (!slugs.length) {
    const none: GithubState = {
      available: true,
      message: 'No repository has a GitHub remote',
      checkedAt: new Date().toISOString()
    }
    report(none.message, 'info')
    return none
  }

  report(`Querying GitHub for ${slugs.length} repo${slugs.length === 1 ? '' : 's'}…`, 'info')

  const prs: PullRequest[] = []
  const runs: CiRun[] = []

  for (const slug of slugs) {
    const res = await run('gh', ['repo', 'view', slug, '--json', 'nameWithOwner'], {
      timeoutMs: 20000
    })
    if (!res.ok) {
      report(
        `GitHub: cannot read ${slug} — ${(res.stderr || res.error || '').trim().slice(0, 160)}`,
        'warn'
      )
      continue
    }
    const [repoPrs, repoRuns] = await Promise.all([
      fetchPrs(slug, slug, slug.split('/')[1] ?? slug),
      fetchRuns(slug, slug, slug.split('/')[1] ?? slug)
    ])
    prs.push(...repoPrs)
    runs.push(...repoRuns)
    report(`GitHub: ${slug} → ${repoPrs.length} open PR(s), ${repoRuns.length} run(s)`, 'success')
  }

  prs.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
  runs.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
  cache.prs = prs
  cache.runs = runs

  return {
    available: true,
    message: `Live — ${prs.length} open PR(s), ${runs.length} run(s) across ${slugs.length} repo(s)`,
    checkedAt: new Date().toISOString()
  }
}
