import { run } from './exec'
import type { RemoteRepo } from '../../shared/cockpit-types'

/**
 * Remote repository layer — GitHub metadata without cloning anything.
 *
 * The local git layer (`git.ts`) only knows about repositories that exist on
 * disk. That is the wrong ceiling for a workspace: an account can hold a hundred
 * repos and checking them all out is absurd — a few are multi-gigabyte.
 *
 * `gh api graphql` answers for the WHOLE account in a single request: default
 * branch, HEAD oid, last commit message and date, privacy, size, language and
 * open-PR count. No clone, no fetch, no local disk. Local detail is then
 * fetched only for the repos actually checked out, and the two lists are merged
 * by `owner/repo` slug.
 *
 * `diskUsage` comes back in kilobytes (GitHub's own unit).
 */

const PAGE_SIZE = 100
const CACHE_TTL_MS = 120_000

/**
 * One page of the repository query, with retries.
 *
 * GitHub's GraphQL endpoint sits behind a gateway that intermittently answers
 * 502/504 for a query this heavy — the request is fine, the response is not.
 * A single flaky hop should not make the whole repo list empty, so retry with
 * backoff before reporting failure.
 */
async function fetchPage(
  cursor: string | null,
  report: (text: string, level: 'info' | 'success' | 'error' | 'warn') => void
): Promise<{ ok: true; json: GqlResponse } | { ok: false; error: string }> {
  const args: string[] = ['api', 'graphql', '-f', `query=${GQL_QUERY}`, '-F', `first=${PAGE_SIZE}`]
  if (cursor) args.push('-F', `cursor=${cursor}`)

  let lastDetail = 'unknown error'

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await run('gh', args, { timeoutMs: 60000 })

    if (res.ok) {
      try {
        return { ok: true, json: JSON.parse(res.stdout) as GqlResponse }
      } catch {
        lastDetail = 'gh returned unparseable JSON'
      }
    } else {
      const detail = `${res.stderr}${res.stdout}`.trim().split('\n')[0] ?? 'unknown error'
      lastDetail = detail.slice(0, 200)
      // Retry only transport/gateway failures — a 401/403/404 will not heal.
      const retryable = /HTTP 5\d\d|timeout|socket|ECONN|EAI_AGAIN|502|503|504/i.test(lastDetail)
      if (!retryable) return { ok: false, error: lastDetail }
    }

    if (attempt < MAX_ATTEMPTS) {
      const waitMs = RETRY_BACKOFF_MS * attempt
      report(
        `GitHub request failed (${lastDetail}) — retry ${attempt}/${MAX_ATTEMPTS - 1}…`,
        'warn'
      )
      await new Promise((r) => setTimeout(r, waitMs))
    }
  }

  return { ok: false, error: lastDetail }
}

const GQL_QUERY = `
query($first: Int!, $cursor: String) {
  viewer {
    repositories(
      first: $first
      after: $cursor
      orderBy: { field: PUSHED_AT, direction: DESC }
      ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]
    ) {
      pageInfo { hasNextPage endCursor }
      totalCount
      nodes {
        name
        nameWithOwner
        url
        isPrivate
        isFork
        pushedAt
        diskUsage
        primaryLanguage { name }
        defaultBranchRef {
          name
          target { ... on Commit { oid messageHeadline committedDate } }
        }
        pullRequests(states: OPEN) { totalCount }
      }
    }
  }
}`

const MAX_ATTEMPTS = 4
const RETRY_BACKOFF_MS = 900

interface GqlNode {
  name: string
  nameWithOwner: string
  url: string
  isPrivate: boolean
  isFork: boolean
  pushedAt: string | null
  diskUsage: number | null
  primaryLanguage: { name: string } | null
  defaultBranchRef: {
    name: string
    target: { oid?: string; messageHeadline?: string; committedDate?: string } | null
  } | null
  pullRequests: { totalCount: number }
}

interface GqlResponse {
  data?: {
    viewer?: {
      repositories?: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null }
        totalCount: number
        nodes: GqlNode[]
      }
    }
  }
  errors?: Array<{ message: string }>
}

interface Cache {
  repos: RemoteRepo[]
  fetchedAt: number
  total: number
  /** set when the last attempt failed, so the UI can show why */
  error: string | null
}

const cache: Cache = { repos: [], fetchedAt: 0, total: 0, error: null }

export function getCachedRemoteRepos(): Cache {
  return cache
}

export function remoteCacheFresh(): boolean {
  return cache.repos.length > 0 && Date.now() - cache.fetchedAt < CACHE_TTL_MS
}

/**
 * Fetch every repository the account can see, following pagination.
 *
 * One `gh` process per page (100 repos/page) — an 88-repo account is a single
 * process, and a 500-repo account is five. The call is never made implicitly:
 * `refreshGithub` is opt-in from the UI, so a local rescan stays instant.
 */
export async function fetchAllRemoteRepos(
  report: (text: string, level: 'info' | 'success' | 'error' | 'warn') => void,
  force = false
): Promise<Cache> {
  if (!force && remoteCacheFresh()) return cache

  const all: RemoteRepo[] = []
  let cursor: string | null = null
  let page = 0
  /** GitHub's reported total across the account (from the last page fetched). */
  let accountTotal: number | undefined

  for (;;) {
    page += 1

    const attempt = await fetchPage(cursor, report)
    if (!attempt.ok) {
      cache.error = attempt.error
      report(`GitHub repo list failed: ${cache.error}`, 'error')
      return cache
    }
    const parsed = attempt.json

    if (parsed.errors?.length) {
      cache.error = parsed.errors[0].message.slice(0, 200)
      report(`GitHub GraphQL error: ${cache.error}`, 'error')
      return cache
    }

    const conn = parsed.data?.viewer?.repositories
    if (!conn) {
      cache.error = 'no repository data in the response'
      report(cache.error, 'error')
      return cache
    }

    accountTotal = conn.totalCount
    for (const node of conn.nodes) {
      const owner = node.nameWithOwner.split('/')[0]
      all.push({
        slug: node.nameWithOwner,
        name: node.name,
        owner: owner ?? '',
        isPrivate: node.isPrivate,
        isFork: Boolean(node.isFork),
        pushedAt: node.pushedAt ?? '',
        sizeKb: node.diskUsage ?? 0,
        language: node.primaryLanguage?.name ?? null,
        defaultBranch: node.defaultBranchRef?.name ?? '',
        headOid: node.defaultBranchRef?.target?.oid ?? '',
        headMessage: node.defaultBranchRef?.target?.messageHeadline ?? '',
        headDate: node.defaultBranchRef?.target?.committedDate ?? '',
        openPrs: node.pullRequests.totalCount,
        url: node.url,
        cloned: false
      })
    }

    if (!conn.pageInfo.hasNextPage || !conn.pageInfo.endCursor) break
    cursor = conn.pageInfo.endCursor
    if (page > 20) break // hard stop — never loop forever on a bad cursor
  }

  cache.repos = all
  cache.total = accountTotal || all.length
  cache.fetchedAt = Date.now()
  cache.error = null

  report(
    `GitHub: ${all.length} repositor${all.length === 1 ? 'y' : 'ies'} listed` +
      (all.length < (accountTotal || all.length) ? ` of ${accountTotal}` : '') +
      ` (${page} request${page === 1 ? '' : 's'}, no clones)`,
    'success'
  )

  return cache
}

/**
 * Mark which remote repos also exist locally, by normalised slug.
 * Matching is case-insensitive: GitHub slugs are, Windows paths are too.
 */
export function annotateCloned(repos: RemoteRepo[], localSlugs: string[]): RemoteRepo[] {
  const have = new Set(localSlugs.map((s) => s.toLowerCase()))
  for (const repo of repos) repo.cloned = have.has(repo.slug.toLowerCase())
  return repos
}
