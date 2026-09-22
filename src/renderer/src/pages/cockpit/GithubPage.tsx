import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Cloud,
  Clock,
  Download,
  ExternalLink,
  FolderGit2,
  FolderOpen,
  Globe,
  HardDrive,
  Loader2,
  Lock,
  RefreshCw,
  Search
} from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { EmptyState, FilterChips, StatTile } from '@renderer/widgets'
import { cn } from '@renderer/lib/utils'
import { RepoOpenView } from '@renderer/pages/cockpit/RepoOpenView'
import { useCockpitStore } from '@renderer/stores/cockpit-store'
import type { RemoteRepo } from '../../../../shared/cockpit-types'

/**
 * GitHub — every repository you own, listed without cloning any of them.
 *
 * One `gh api graphql` request returns the whole account (pagination is handled
 * in main, 100 repos per page): default branch, HEAD commit, last message and
 * date, size, language and open-PR count. Nothing is fetched to disk until you
 * press Clone on a specific row.
 *
 * Cloning uses a **blobless partial clone at depth 1** (`--filter=blob:none`),
 * so a 3.4 GB repo pulls ~15 MB of commit/tree metadata and materialises file
 * contents lazily on demand. It stays a normal checkout — `git log`, `status`
 * and `checkout` all work.
 */

type Filter = 'mine' | 'all' | 'cloned' | 'uncloned' | 'private' | 'forks' | 'active'

function relative(iso: string): string {
  if (!iso) return '—'
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '—'
  const mins = Math.round((Date.now() - t) / 60000)
  if (mins < 60) return `${Math.max(mins, 0)}m ago`
  const h = Math.round(mins / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 30) return `${d}d ago`
  return `${Math.round(d / 30)}mo ago`
}

/** GitHub reports diskUsage in KB. */
function size(kb: number): string {
  if (!kb) return '—'
  if (kb < 1024) return `${kb} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`
  return `${(mb / 1024).toFixed(1)} GB`
}

function RepoCard({
  repo,
  onOpen,
  active
}: {
  repo: RemoteRepo
  onOpen: (slug: string) => void
  active: boolean
}): React.JSX.Element {
  const { cloneRepo, cloning } = useCockpitStore()
  const progress = cloning[repo.slug]
  const busy = progress !== undefined

  return (
    <div
      className={cn(
        'glass flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors',
        active ? 'bg-accent/40' : 'hover:bg-accent/20'
      )}
      style={repo.cloned ? { boxShadow: 'inset 2px 0 0 0 hsl(var(--success))' } : undefined}
      onClick={() => onOpen(repo.slug)}
      title="Open this repository for reading — no clone"
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{
          background: repo.cloned ? 'hsl(var(--success) / 0.14)' : 'hsl(var(--primary) / 0.14)',
          color: repo.cloned ? 'hsl(var(--success))' : 'hsl(var(--primary))'
        }}
      >
        {repo.cloned ? <HardDrive className="h-3.5 w-3.5" /> : <Cloud className="h-3.5 w-3.5" />}
      </span>

      {/* identity */}
      <div className="min-w-0 flex-[3]">
        <div className="flex items-center gap-2">
          <span className="truncate text-[12.5px] font-semibold">{repo.name}</span>
          {repo.isPrivate && (
            <span className="mono inline-flex shrink-0 items-center gap-1 text-[9.5px] text-muted-foreground">
              <Lock className="h-2.5 w-2.5" /> private
            </span>
          )}
          {repo.isFork && (
            <span
              className="mono shrink-0 rounded px-1.5 py-0.5 text-[9.5px] text-muted-foreground"
              style={{ background: 'hsl(var(--muted) / 0.6)' }}
            >
              fork
            </span>
          )}
          {repo.openPrs > 0 && (
            <span
              className="mono shrink-0 rounded px-1.5 py-0.5 text-[9.5px]"
              style={{ background: 'hsl(var(--primary) / 0.16)', color: 'hsl(var(--primary))' }}
            >
              {repo.openPrs} PR
            </span>
          )}
        </div>
        <p className="mono mt-0.5 truncate text-[10.5px] text-muted-foreground">
          {repo.headMessage || 'no commits'}
        </p>
      </div>

      {/* metadata */}
      <div className="mono hidden shrink-0 items-center gap-3 text-[10.5px] text-muted-foreground lg:flex">
        <span title={`default branch: ${repo.defaultBranch}`}>{repo.defaultBranch || '—'}</span>
        <span title="repository size on GitHub">{size(repo.sizeKb)}</span>
        {repo.language && <span>{repo.language}</span>}
        <span title={repo.headDate}>{relative(repo.headDate)}</span>
      </div>

      {/* action */}
      <div className="flex shrink-0 items-center gap-1">
        {busy ? (
          <span
            className="mono flex max-w-[240px] items-center gap-1.5 truncate text-[10.5px]"
            style={{ color: 'hsl(var(--warning))' }}
            title={progress}
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            {progress}
          </span>
        ) : repo.cloned ? (
          <span
            className="mono inline-flex items-center gap-1 text-[10.5px]"
            style={{ color: 'hsl(var(--success))' }}
          >
            <FolderGit2 className="h-3 w-3" /> in workspace
          </span>
        ) : (
          <Button
            size="sm"
            className="h-6 px-2 text-[10.5px]"
            title="Blobless partial clone at depth 1 — metadata only, blobs fetched on demand"
            onClick={(e) => {
              // The row opens the repo; the button must not also do that.
              e.stopPropagation()
              void cloneRepo(repo.slug, false)
            }}
          >
            <Download className="h-3 w-3" />
            Clone
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          title="Open on GitHub"
          onClick={(e) => {
            e.stopPropagation()
            void window.api.cockpit.openPath(repo.url)
          }}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function GithubPage(): React.JSX.Element {
  const { snapshot, listRemoteRepos, githubBusy, cloning, refresh, pickCloneParent, cloneRepo } =
    useCockpitStore()
  const [filter, setFilter] = useState<Filter>('mine')
  const [query, setQuery] = useState('')
  /** slug of the repo opened for reading (null = list view) */
  const [openSlug, setOpenSlug] = useState<string | null>(null)

  /**
   * `Date.now()` inside a `useMemo` is impure — the lint rule is right, and it
   * also stops the "active" filter from recomputing on unrelated renders.
   * Capture the clock once per minute instead.
   */
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const remote = snapshot?.remote
  const repos = useMemo(() => remote?.repos ?? [], [remote])
  const cloneRoot = snapshot?.cloneRoot ?? ''

  // Listing is explicit: it is the only call in the app that touches the network,
  // so it never happens behind the user's back.
  const listed = repos.length > 0

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return repos.filter((r) => {
      if (
        q &&
        !`${r.name} ${r.slug} ${r.language ?? ''} ${r.headMessage}`.toLowerCase().includes(q)
      )
        return false
      if (filter === 'mine') return !r.isFork
      if (filter === 'cloned') return r.cloned
      if (filter === 'uncloned') return !r.cloned && !r.isFork
      if (filter === 'private') return r.isPrivate
      if (filter === 'forks') return r.isFork
      if (filter === 'active') return now - new Date(r.pushedAt || 0).getTime() < 30 * 864e5
      return true
    })
  }, [repos, filter, query, now])

  const stats = useMemo(() => {
    const mine = repos.filter((r) => !r.isFork)
    const forks = repos.filter((r) => r.isFork)
    /** Repos on this machine that map to a GitHub repo — i.e. actually fetched. */
    const clonedHere = repos.filter((r) => r.cloned).length
    /** Workspace repos with no GitHub remote at all (local working copies). */
    const local = snapshot?.repos.length ?? 0
    return {
      total: remote?.total ?? repos.length,
      mine: mine.length,
      forks: forks.length,
      clonedHere,
      localOnly: Math.max(0, local - clonedHere),
      local,
      /** total size of YOUR repos not yet on disk — what a "clone all" would cost */
      pendingGb: mine.filter((r) => !r.cloned).reduce((s, r) => s + r.sizeKb, 0) / 1024 / 1024
    }
  }, [repos, remote, snapshot])

  const busyCount = Object.keys(cloning).length

  return (
    <div className="flex h-full min-h-0 w-full gap-3 p-4">
      <div className="mx-auto flex min-w-0 flex-1 flex-col gap-4">
        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="Your repos"
            value={listed ? String(stats.mine) : '—'}
            delta={listed ? `${stats.forks} forks hidden` : 'not listed yet'}
            progress={listed ? 100 : 0}
          />
          <StatTile
            label="Cloned here"
            value={String(stats.clonedHere)}
            delta={
              stats.clonedHere
                ? 'cloned on this machine'
                : listed
                  ? 'nothing cloned yet'
                  : 'not listed yet'
            }
            progress={stats.mine ? (stats.clonedHere / Math.max(stats.mine, 1)) * 100 : 0}
          />
          <StatTile
            label="Cloning"
            value={String(busyCount)}
            delta={busyCount ? 'in progress' : 'idle'}
            progress={busyCount ? 55 : 0}
          />
          <StatTile
            label="Would download"
            value={listed ? `${stats.pendingGb.toFixed(1)} GB` : '—'}
            delta="your repos, full clones"
            progress={0}
          />
        </div>

        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[190px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name, language or last commit…"
              className="h-8 pl-8 text-[12.5px]"
            />
          </div>
          <FilterChips
            options={['mine', 'all', 'uncloned', 'active', 'cloned', 'private', 'forks']}
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            disabled={githubBusy}
            onClick={() => void listRemoteRepos(listed)}
            title={
              listed
                ? 'Re-list every repo from GitHub (1 request per 100 repos, no clones)'
                : 'List every GitHub repo — one API call, nothing is downloaded'
            }
          >
            {githubBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : listed ? (
              <RefreshCw className="h-3.5 w-3.5" />
            ) : (
              <Globe className="h-3.5 w-3.5" />
            )}
            {listed ? 'Re-list' : 'List my repos'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => void refresh(false)}
            title="Re-scan the repositories already on this machine"
          >
            <HardDrive className="h-3.5 w-3.5" />
            Rescan local
          </Button>
        </div>

        {/* clone destination — one row, always visible, so the cost is never a surprise */}
        <div
          className="mono flex flex-wrap items-center gap-2 rounded-md px-3 py-1.5 text-[10.5px] text-muted-foreground"
          style={{ background: 'hsl(var(--muted) / 0.4)' }}
        >
          <FolderOpen className="h-3 w-3 shrink-0" />
          <span className="shrink-0">
            {stats.clonedHere > 0 ? `${stats.clonedHere} cloned` : 'clones'} into
          </span>
          <span className="min-w-0 truncate text-foreground">{cloneRoot || '—'}</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-5 px-1.5 text-[10.5px]"
            onClick={() => void pickCloneParent()}
            title="Choose where future clones land (saved)"
          >
            change
          </Button>
          <div className="flex-1" />
          <span className="shrink-0">
            Blobless partial fetch — file contents download on demand.
          </span>
        </div>

        {/* the list was restored from disk and is old — say so, don't hide it */}
        {listed && remote?.stale && (
          <div
            className="flex flex-wrap items-center gap-2 rounded-md px-3 py-1.5 text-[11px]"
            style={{
              background: 'hsl(var(--warning) / 0.08)',
              border: '1px solid hsl(var(--warning) / 0.22)'
            }}
          >
            <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: 'hsl(var(--warning))' }} />
            <span>
              Restored from your last sync
              {remote.fetchedAt ? ` (${relative(remote.fetchedAt)})` : ''} — it survived the
              restart.
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-5 px-1.5 text-[10.5px]"
              disabled={githubBusy}
              onClick={() => void listRemoteRepos(true)}
            >
              Refresh now
            </Button>
          </div>
        )}

        {/* error from the API, verbatim */}
        {remote?.error && (
          <div
            className="flex items-start gap-2 rounded-md px-3 py-2"
            style={{
              background: 'hsl(var(--destructive) / 0.08)',
              border: '1px solid hsl(var(--destructive) / 0.25)'
            }}
          >
            <AlertCircle
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              style={{ color: 'hsl(var(--destructive))' }}
            />
            <div className="min-w-0 text-[11.5px]">
              <p className="font-medium">Could not list your repositories</p>
              <p className="mono mt-0.5 truncate text-muted-foreground">{remote.error}</p>
            </div>
          </div>
        )}

        {/* list */}
        <div className="min-h-0 flex-1 overflow-auto">
          {!listed ? (
            <EmptyState
              icon={Cloud}
              title="Your whole GitHub account, without cloning it"
              hint="Listing reads repository metadata only — one API request per 100 repos, zero downloads. Clone a repo when you actually want it on disk."
              action={
                <Button size="sm" className="mt-3" onClick={() => void listRemoteRepos(false)}>
                  <Globe className="h-3.5 w-3.5" />
                  List my repos
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No repository matches this filter"
              hint="Clear the filter or the search box to see the rest of the account."
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((repo) => (
                <RepoCard
                  key={repo.slug}
                  repo={repo}
                  onOpen={setOpenSlug}
                  active={repo.slug === openSlug}
                />
              ))}
            </div>
          )}
        </div>

        {listed && (
          <p className="mono shrink-0 text-[10px] text-muted-foreground">
            {filtered.length} of {repos.length} shown · {stats.mine} yours · {stats.forks} forks ·{' '}
            {stats.clonedHere} cloned here
            {stats.localOnly > 0 ? ` · ${stats.localOnly} local non-GitHub` : ''}
            {remote?.fetchedAt ? ` · listed ${relative(remote.fetchedAt)}` : ''}
          </p>
        )}
      </div>

      {/* Open mode — read a repo without cloning it */}
      {openSlug && (
        <div
          className="glass flex w-[520px] min-w-[380px] shrink-0 flex-col overflow-hidden"
          style={{ minHeight: 0 }}
        >
          <RepoOpenView
            slug={openSlug}
            onClose={() => setOpenSlug(null)}
            onClone={(s, full) => void cloneRepo(s, full)}
            cloning={cloning[openSlug]}
          />
        </div>
      )}
    </div>
  )
}
