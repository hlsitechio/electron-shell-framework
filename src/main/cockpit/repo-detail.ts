import { run } from './exec'
import type {
  RemoteBranch,
  RemoteCommit,
  RemoteFile,
  RemoteRepo,
  RemoteTreeEntry,
  RepoDetail
} from '../../shared/cockpit-types'

/**
 * Read a repository WITHOUT cloning it.
 *
 * Every facet below is one GitHub API request against `repos/{owner}/{repo}`:
 * metadata, the root tree, the README, recent commits, branches, and — on demand
 * — any single file's text. Nothing touches the local disk, so opening a 62 GB
 * repo costs the same as opening a 60 KB one.
 *
 * Text is capped so a stray minified bundle cannot stall the renderer, and a
 * non-text file is reported as `binary` rather than rendered as mojibake.
 */

/** Files bigger than this are not requested as text. */
const MAX_TEXT_BYTES = 400_000

interface ApiCall {
  ok: boolean
  status?: number
  text: string
  error?: string
  /** true when the failure is a 404, which callers treat as "absent", not broken */
  notFound?: boolean
}

/**
 * `gh api <path>` — returns the raw body.
 *
 * `gh` already holds the user's auth, so private repos work with no token of
 * our own. The path is built from a validated slug plus a fixed suffix; the
 * only caller-supplied segment is a file path, which is URL-encoded.
 */
async function api(path: string): Promise<ApiCall> {
  const res = await run('gh', ['api', path], { timeoutMs: 30000 })
  if (res.ok) return { ok: true, text: res.stdout }

  const detail = `${res.stderr}${res.stdout}`.trim()
  const statusMatch = detail.match(/HTTP (\d{3})/)
  const status = statusMatch ? Number(statusMatch[1]) : undefined
  return {
    ok: false,
    status,
    text: '',
    error: detail.split('\n')[0].slice(0, 200),
    notFound: status === 404
  }
}

function parseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

interface RawRepoMeta {
  description: string | null
  stargazers_count: number
  subscribers_count: number
  license: { spdx_id?: string | null; name?: string } | null
  topics?: string[]
  default_branch: string
  size: number
}

/**
 * `repos/{slug}/contents/` returns a flat ARRAY of entries (unlike
 * `git/trees`, which wraps them in `{ tree: [...] }` — parsing one as the other
 * silently yields an empty listing).
 */
interface RawContentEntry {
  name: string
  path: string
  type: string
  size?: number
  sha: string
}

interface RawReadme {
  name: string
  content?: string
  encoding?: string
  size?: number
}

interface RawCommit {
  sha: string
  commit: { message: string; author: { name: string; date: string } | null }
}

interface RawBranch {
  name: string
  commit: { sha: string }
}

/** Decode GitHub's base64 file content (it wraps lines every 60 chars). */
function decodeBase64(content: string): string {
  try {
    return Buffer.from(content.replace(/\s/g, ''), 'base64').toString('utf8')
  } catch {
    return ''
  }
}

/**
 * Fetch everything the "open" view needs, concurrently. Each facet degrades
 * independently: a repo with no README still shows its tree and commits.
 */
export async function fetchRepoDetail(slug: string): Promise<RepoDetail> {
  const [metaRes, treeRes, readmeRes, commitsRes, branchesRes] = await Promise.all([
    api(`repos/${slug}`),
    api(`repos/${slug}/contents/`),
    api(`repos/${slug}/readme`),
    api(`repos/${slug}/commits?per_page=15`),
    api(`repos/${slug}/branches?per_page=30`)
  ])

  if (!metaRes.ok && metaRes.notFound) {
    return emptyDetail(slug, `GitHub says ${slug} does not exist (or the token cannot see it)`)
  }
  if (!metaRes.ok) {
    return emptyDetail(slug, metaRes.error ?? 'Could not read this repository')
  }

  const meta = parseJson<RawRepoMeta>(metaRes.text)
  const contentsRaw = parseJson<RawContentEntry[]>(treeRes.text)
  const readmeRaw = parseJson<RawReadme>(readmeRes.text)
  const commitsRaw = parseJson<RawCommit[]>(commitsRes.text)
  const branchesRaw = parseJson<RawBranch[]>(branchesRes.text)

  // `contents/` gives the root listing as an array. `git/trees/HEAD` would list
  // everything RECURSIVELY, which is the wrong shape for a browsable root.
  const tree: RemoteTreeEntry[] = (Array.isArray(contentsRaw) ? contentsRaw : []).map((entry) => ({
    path: entry.path || entry.name,
    type: (entry.type as RemoteTreeEntry['type']) ?? 'file',
    size: entry.size ?? 0,
    sha: entry.sha
  }))

  const readme =
    readmeRaw && readmeRaw.content
      ? { name: readmeRaw.name, text: decodeBase64(readmeRaw.content).slice(0, 200_000) }
      : null

  const commits: RemoteCommit[] = (commitsRaw ?? []).map((c) => ({
    sha: c.sha,
    message: c.commit.message.split('\n')[0].slice(0, 300),
    author: c.commit.author?.name ?? 'unknown',
    date: c.commit.author?.date ?? ''
  }))

  const defaultBranch = meta?.default_branch ?? ''
  const branches: RemoteBranch[] = (branchesRaw ?? []).map((b) => ({
    name: b.name,
    sha: b.commit.sha,
    isDefault: b.name === defaultBranch
  }))

  return {
    slug,
    readme,
    tree: tree.sort((a, b) => {
      // directories first, then name — the convention every file browser uses
      if (a.type === 'dir' && b.type !== 'dir') return -1
      if (a.type !== 'dir' && b.type === 'dir') return 1
      return a.path.localeCompare(b.path)
    }),
    commits,
    branches,
    description: meta?.description ?? '',
    stars: meta?.stargazers_count ?? 0,
    watchers: meta?.subscribers_count ?? 0,
    license: meta?.license?.spdx_id ?? meta?.license?.name ?? null,
    topics: meta?.topics ?? [],
    defaultBranch,
    requests: 5,
    error: null
  }
}

function emptyDetail(slug: string, error: string): RepoDetail {
  return {
    slug,
    readme: null,
    tree: [],
    commits: [],
    branches: [],
    description: '',
    stars: 0,
    watchers: 0,
    license: null,
    topics: [],
    defaultBranch: '',
    requests: 0,
    error
  }
}

/** Read one file's text at a ref, without cloning. */
export async function fetchRepoFile(
  slug: string,
  path: string,
  ref: string | null
): Promise<RemoteFile> {
  const encoded = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  const query = ref ? `?ref=${encodeURIComponent(ref)}` : ''

  const res = await api(`repos/${slug}/contents/${encoded}${query}`)
  if (!res.ok) {
    return {
      path,
      size: 0,
      text: null,
      truncated: false,
      binary: false,
      error: res.notFound ? `Not found: ${path}` : (res.error ?? 'Could not read this file')
    }
  }

  const raw = parseJson<RawReadme>(res.text)
  if (!raw) {
    return {
      path,
      size: 0,
      text: null,
      truncated: false,
      binary: false,
      error: 'Unparseable response'
    }
  }

  const size = raw.size ?? 0
  // `encoding: none` means GitHub declined to inline it — an image, an archive,
  // or a file past its own 1 MB inline limit.
  if (raw.encoding !== 'base64' || !raw.content) {
    return { path, size, text: null, truncated: false, binary: true }
  }

  const text = decodeBase64(raw.content)
  if (text.includes('\u0000')) {
    return { path, size, text: null, truncated: false, binary: true }
  }

  const truncated = text.length > MAX_TEXT_BYTES
  return {
    path,
    size,
    text: truncated ? text.slice(0, MAX_TEXT_BYTES) : text,
    truncated,
    binary: false
  }
}

/**
 * Merge a freshly fetched detail's metadata back onto the cached repo row, so
 * the list shows description/stars for repos that have been opened.
 */
export function applyDetailToRepo(repo: RemoteRepo, detail: RepoDetail): RemoteRepo {
  return {
    ...repo,
    description: detail.description,
    stars: detail.stars,
    watchers: detail.watchers,
    license: detail.license,
    topics: detail.topics,
    defaultBranch: detail.defaultBranch || repo.defaultBranch
  }
}
