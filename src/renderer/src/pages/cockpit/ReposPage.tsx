import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  FolderGit2,
  GitBranch,
  GitCommitHorizontal,
  Plus,
  RefreshCw,
  Search,
  SquareTerminal,
  Trash2,
  Workflow
} from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { EmptyState, FilterChips, StatTile } from '@renderer/widgets'
import { cn } from '@renderer/lib/utils'
import { useCockpitStore, useCockpitTotals, useRepos } from '@renderer/stores/cockpit-store'
import type { Repo } from '../../../../shared/cockpit-types'

/**
 * Repos — the workspace front door.
 *
 * Every number on this page comes from `git` in the main process. There is no
 * fixture data: an empty workspace renders a designed empty state and an
 * invitation to add a real repo, and a repo that fails to read renders its
 * actual git error inline instead of silently disappearing.
 */

type Filter = 'all' | 'dirty' | 'clean' | 'ahead'

function relativeTime(iso: string | null): string {
  if (!iso) return '—'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return '—'
  const seconds = Math.round((Date.now() - then) / 1000)
  if (seconds < 60) return `${Math.max(seconds, 0)}s ago`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

function shortHash(hash: string): string {
  return hash ? hash.slice(0, 7) : '—'
}

/** A small mono metric used inside the repo rows. */
function Metric({
  icon: Icon,
  value,
  tone = 'muted',
  title
}: {
  icon: typeof GitBranch
  value: string | number
  tone?: 'muted' | 'warn' | 'danger'
  title: string
}): React.JSX.Element {
  const color =
    tone === 'danger'
      ? 'hsl(var(--destructive))'
      : tone === 'warn'
        ? 'hsl(var(--warning))'
        : 'hsl(var(--muted-foreground))'
  return (
    <span
      className="mono inline-flex items-center gap-1 text-[11px]"
      style={{ color }}
      title={title}
    >
      <Icon className="h-3 w-3" />
      {value}
    </span>
  )
}

function RepoRow({ repo, selected }: { repo: Repo; selected: boolean }): React.JSX.Element {
  const { selectRepo, openTerminal, removeRepo } = useCockpitStore()
  const [confirming, setConfirming] = useState(false)

  const startBuild = async (script: string): Promise<void> => {
    try {
      await window.api.cockpit.startBuild(repo.id, script)
    } catch {
      /* main logs the refusal into the activity rail */
    }
  }

  return (
    <div
      className={cn(
        'group flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors',
        selected ? 'bg-accent/50' : 'hover:bg-accent/25'
      )}
      style={{
        borderBottom: '1px solid hsl(var(--border))',
        boxShadow: selected ? 'inset 2px 0 0 0 hsl(var(--primary))' : undefined
      }}
      onClick={() => selectRepo(repo.id)}
    >
      {/* identity */}
      <div className="flex min-w-0 flex-[2] items-center gap-2.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          style={{
            background: 'hsl(var(--primary) / 0.14)',
            color: 'hsl(var(--primary))'
          }}
        >
          <FolderGit2 className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px] font-semibold">{repo.name}</span>
            {repo.githubSlug && (
              <span className="mono shrink-0 text-[10px] text-muted-foreground">
                {repo.githubSlug}
              </span>
            )}
          </div>
          <div className="mono mt-0.5 flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
            <GitBranch className="h-2.5 w-2.5" />
            <span className="truncate">{repo.branch}</span>
            <span className="opacity-40">·</span>
            <span>{shortHash(repo.head)}</span>
          </div>
        </div>
      </div>

      {/* live metrics */}
      <div className="hidden min-w-0 flex-[2] items-center gap-3 lg:flex">
        <Metric
          icon={GitCommitHorizontal}
          value={`${repo.dirtyCount} changed`}
          tone={repo.dirtyCount > 0 ? 'warn' : 'muted'}
          title={`${repo.stagedCount} staged · ${repo.untrackedCount} untracked`}
        />
        <Metric
          icon={Workflow}
          value={`${repo.worktrees.length} wt`}
          title={
            repo.worktrees.map((w: { branch: string }) => w.branch).join(', ') || 'no worktrees'
          }
        />
        {repo.ahead > 0 && (
          <Metric icon={ArrowUp} value={repo.ahead} title="commits ahead of upstream" />
        )}
        {repo.behind > 0 && (
          <Metric
            icon={ArrowDown}
            value={repo.behind}
            tone="danger"
            title="commits behind upstream"
          />
        )}
      </div>

      {/* last commit */}
      <div className="hidden min-w-0 flex-[2] xl:block">
        {repo.lastCommit ? (
          <>
            <p className="truncate text-[11.5px] text-muted-foreground">
              {repo.lastCommit.subject}
            </p>
            <p className="mono mt-0.5 text-[10px] text-muted-foreground/70">
              {relativeTime(repo.lastCommit.date)}
            </p>
          </>
        ) : (
          <p className="text-[11.5px] text-muted-foreground/60">no commits yet</p>
        )}
      </div>

      {/* actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {repo.scripts.slice(0, 2).map((script: string) => (
          <Button
            key={script}
            size="sm"
            variant="ghost"
            className="mono h-6 px-2 text-[10.5px]"
            title={`npm run ${script}`}
            onClick={(e) => {
              e.stopPropagation()
              void startBuild(script)
            }}
          >
            {script}
          </Button>
        ))}
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          title="Open a terminal in this repo"
          onClick={(e) => {
            e.stopPropagation()
            openTerminal(repo.id)
          }}
        >
          <SquareTerminal className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          title={confirming ? 'Click again to remove' : 'Remove from workspace'}
          onClick={(e) => {
            e.stopPropagation()
            if (confirming) void removeRepo(repo.id)
            else {
              setConfirming(true)
              setTimeout(() => setConfirming(false), 2500)
            }
          }}
          style={confirming ? { color: 'hsl(var(--destructive))' } : undefined}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function ReposPage(): React.JSX.Element {
  const repos = useRepos()
  const totals = useCockpitTotals()
  const { refresh, addRepo, loading, githubBusy, selectedRepoId, snapshot } = useCockpitStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  // A first paint with no data yet still needs a snapshot pull.
  useEffect(() => {
    if (!snapshot) void refresh(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return repos.filter((r) => {
      if (q && !`${r.name} ${r.path} ${r.githubSlug ?? ''} ${r.branch}`.toLowerCase().includes(q))
        return false
      if (filter === 'dirty') return r.dirtyCount > 0
      if (filter === 'clean') return r.dirtyCount === 0
      if (filter === 'ahead') return r.ahead > 0 || r.behind > 0
      return true
    })
  }, [repos, filter, query])

  const failing = repos.filter((r) => r.error).length

  return (
    <div className="mx-auto flex h-full max-w-[1180px] flex-col gap-4 p-5">
      {/* KPI strip — all four values are live */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Repositories"
          value={String(totals.repos)}
          delta={totals.repos ? `${totals.worktrees} worktrees` : 'none yet'}
          progress={totals.repos ? 100 : 0}
        />
        <StatTile
          label="Uncommitted"
          value={String(totals.dirty)}
          delta={totals.dirty ? 'needs a commit' : 'all clean'}
          progress={totals.repos ? (totals.dirty / Math.max(totals.repos, 1)) * 100 : 0}
        />
        <StatTile
          label="Open PRs"
          value={String(totals.prs)}
          delta={snapshot?.github.available ? 'live from gh' : 'gh offline'}
          progress={snapshot?.github.available ? 100 : 0}
        />
        <StatTile
          label="Builds running"
          value={String(totals.running)}
          delta={totals.failing ? `${totals.failing} CI failing` : 'queue idle'}
          progress={totals.running ? 60 : 0}
        />
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, path, remote or branch…"
            className="h-8 pl-8 text-[12.5px]"
          />
        </div>
        <FilterChips
          options={['all', 'dirty', 'clean', 'ahead']}
          value={filter}
          onChange={(id) => setFilter(id as Filter)}
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          disabled={loading}
          onClick={() => void refresh(false)}
          title="Re-scan every repository with git"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          Rescan
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          disabled={githubBusy}
          onClick={() => void refresh(true)}
          title="Query GitHub for pull requests and CI runs via the gh CLI"
        >
          <Workflow className={cn('h-3.5 w-3.5', githubBusy && 'animate-spin')} />
          Sync GitHub
        </Button>
        <Button size="sm" className="h-8" onClick={() => void addRepo()}>
          <Plus className="h-3.5 w-3.5" />
          Add repo
        </Button>
      </div>

      {/* list */}
      <div
        className="glass min-h-0 flex-1 overflow-hidden"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <div
          className="flex items-center gap-3 px-3 py-2"
          style={{ borderBottom: '1px solid hsl(var(--border))' }}
        >
          <span className="mono flex-[2] text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Repository
          </span>
          <span className="mono hidden flex-[2] text-[10px] uppercase tracking-[0.14em] text-muted-foreground lg:block">
            Working tree
          </span>
          <span className="mono hidden flex-[2] text-[10px] uppercase tracking-[0.14em] text-muted-foreground xl:block">
            Last commit
          </span>
          <span className="w-[150px] shrink-0" />
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={FolderGit2}
                title={repos.length ? 'No repository matches this filter' : 'No repositories yet'}
                hint={
                  repos.length
                    ? 'Clear the filter or the search box to see the rest of the workspace.'
                    : 'Add a folder that contains a .git directory — the cockpit reads real git state from it.'
                }
                action={
                  repos.length ? null : (
                    <Button size="sm" className="mt-3" onClick={() => void addRepo()}>
                      <Plus className="h-3.5 w-3.5" />
                      Add your first repo
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            filtered.map((repo) => (
              <RepoRow key={repo.id} repo={repo} selected={repo.id === selectedRepoId} />
            ))
          )}
        </div>
      </div>

      {/* failures are surfaced, never hidden */}
      {failing > 0 && (
        <div
          className="flex items-start gap-2 rounded-md px-3 py-2"
          style={{
            background: 'hsl(var(--destructive) / 0.08)',
            border: '1px solid hsl(var(--destructive) / 0.25)'
          }}
        >
          <AlertTriangle
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
            style={{ color: 'hsl(var(--destructive))' }}
          />
          <div className="min-w-0 text-[11.5px]">
            <p className="font-medium">
              {failing} repositor{failing === 1 ? 'y' : 'ies'} could not be read
            </p>
            <p className="mono mt-0.5 truncate text-muted-foreground">
              {repos.find((r) => r.error)?.name}: {repos.find((r) => r.error)?.error}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
