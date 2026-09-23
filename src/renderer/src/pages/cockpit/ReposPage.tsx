import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Download,
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
import { IdeLauncherButton } from '@renderer/components/ide/IdeLauncherButton'
import { cn } from '@renderer/lib/utils'
import { useCockpitStore, useCockpitTotals, useRepos } from '@renderer/stores/cockpit-store'
import { useUiStore } from '@renderer/stores/ui-store'
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
  const { openDiff, openBranchSwitchboard, openGitUpdate } = useUiStore()
  const [confirming, setConfirming] = useState(false)

  const startBuild = async (script: string): Promise<void> => {
    try {
      await window.api.cockpit.startBuild(repo.id, script)
    } catch {
      /* main logs the refusal into the activity rail */
    }
  }

  const isDirty = repo.dirtyCount > 0

  return (
    <div
      className={cn(
        'group flex cursor-pointer items-center gap-3 px-3.5 py-3 transition-all border-b select-none',
        selected ? 'bg-accent/40 shadow-xs' : 'hover:bg-accent/20'
      )}
      style={{
        borderColor: 'hsl(var(--border) / 0.6)',
        boxShadow: selected ? 'inset 3px 0 0 0 hsl(var(--primary))' : undefined
      }}
      onClick={() => selectRepo(repo.id)}
    >
      {/* identity */}
      <div className="flex min-w-0 flex-[2.2] items-center gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-2xs"
          style={{
            background: isDirty ? 'hsl(var(--warning) / 0.14)' : 'hsl(var(--primary) / 0.14)',
            color: isDirty ? 'hsl(var(--warning))' : 'hsl(var(--primary))'
          }}
        >
          <FolderGit2 className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="truncate text-[13.5px] font-semibold tracking-tight">{repo.name}</span>
            {repo.githubSlug && (
              <span className="mono shrink-0 text-[10.5px] text-muted-foreground/80">
                {repo.githubSlug}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                openBranchSwitchboard(repo)
              }}
              className="mono inline-flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.2 text-[10.5px] font-medium border border-border/50 text-foreground hover:bg-primary/10 hover:border-primary/40 transition-colors cursor-pointer"
              title="Click to open Branch Switchboard (checkout, new branch, prune)"
            >
              <GitBranch className="h-3 w-3 text-primary" />
              <span className="truncate max-w-[120px]">{repo.branch}</span>
            </button>
            <span
              className="mono text-[10px] text-muted-foreground/70"
              title={`HEAD: ${repo.head}`}
            >
              {shortHash(repo.head)}
            </span>
          </div>
        </div>
      </div>

      {/* live metrics */}
      <div className="hidden min-w-0 flex-[2] items-center gap-2.5 lg:flex">
        {isDirty ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              openDiff(repo)
            }}
            className="mono inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10.5px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 transition-colors cursor-pointer"
            title={`${repo.stagedCount} staged · ${repo.untrackedCount} untracked — click to open Visual Diff & Staging`}
          >
            <GitCommitHorizontal className="h-3 w-3" />
            {repo.dirtyCount} changed
          </button>
        ) : (
          <span className="mono inline-flex items-center gap-1 text-[11px] text-emerald-500/90 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            clean
          </span>
        )}

        <Metric
          icon={Workflow}
          value={`${repo.worktrees.length} wt`}
          title={
            repo.worktrees.map((w: { branch: string }) => w.branch).join(', ') || 'no worktrees'
          }
        />
        {repo.ahead > 0 && (
          <Metric icon={ArrowUp} value={repo.ahead} title="commits ahead of upstream" tone="warn" />
        )}
        {repo.behind > 0 && (
          <button
            type="button"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              openGitUpdate(repo)
            }}
            title={`${repo.behind} commits behind upstream — click to update`}
          >
            <Metric
              icon={ArrowDown}
              value={`${repo.behind} pull`}
              tone="danger"
              title={`${repo.behind} commits behind upstream — click to update`}
            />
          </button>
        )}
      </div>

      {/* last commit */}
      <div className="hidden min-w-0 flex-[2] xl:block">
        {repo.lastCommit ? (
          <>
            <p className="truncate text-[12px] text-foreground/80 leading-snug">
              {repo.lastCommit.subject}
            </p>
            <p className="mt-0.5 text-[10.5px] text-muted-foreground/70">
              {relativeTime(repo.lastCommit.date)}
            </p>
          </>
        ) : (
          <p className="text-[11.5px] text-muted-foreground/60 italic">no commits yet</p>
        )}
      </div>

      {/* actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <IdeLauncherButton
          repoPath={repo.path}
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 rounded-md"
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 rounded-md"
          title="Check & pull Git updates"
          onClick={(e) => {
            e.stopPropagation()
            openGitUpdate(repo)
          }}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
        {repo.scripts.slice(0, 2).map((script: string) => (
          <Button
            key={script}
            size="sm"
            variant="outline"
            className="mono h-6.5 px-2 text-[10.5px] rounded-md"
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
          className="h-7 w-7 p-0 rounded-md"
          title="Open a terminal in this repo"
          onClick={(e) => {
            e.stopPropagation()
            openTerminal(repo.id)
          }}
        >
          <SquareTerminal className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 rounded-md"
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
  const { openDiff, openBranchSwitchboard, openGitUpdate } = useUiStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  // A first paint with no data yet still needs a snapshot pull.
  useEffect(() => {
    if (!snapshot) void refresh(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedRepo = useMemo(
    () => repos.find((r) => r.id === selectedRepoId) ?? repos[0] ?? null,
    [repos, selectedRepoId]
  )

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

  const filterOptions = useMemo(
    () => [
      { id: 'all', label: 'All', count: repos.length },
      { id: 'dirty', label: 'Dirty', count: repos.filter((r) => r.dirtyCount > 0).length },
      { id: 'clean', label: 'Clean', count: repos.filter((r) => r.dirtyCount === 0).length },
      {
        id: 'ahead',
        label: 'Ahead / Behind',
        count: repos.filter((r) => r.ahead > 0 || r.behind > 0).length
      }
    ],
    [repos]
  )

  const failing = repos.filter((r) => r.error).length

  return (
    <div className="mx-auto flex h-full max-w-[1240px] flex-col gap-4.5 p-6">
      {/* KPI strip — all four values are live */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatTile
          label="Repositories"
          value={String(totals.repos)}
          delta={totals.repos ? `${totals.worktrees} worktrees` : 'none yet'}
          progress={totals.repos ? 100 : 0}
          icon={FolderGit2}
        />
        <StatTile
          label="Uncommitted"
          value={String(totals.dirty)}
          delta={totals.dirty ? `${totals.dirty} changed files` : 'working tree clean'}
          progress={totals.repos ? (totals.dirty / Math.max(totals.repos, 1)) * 100 : 0}
          icon={GitCommitHorizontal}
        />
        <StatTile
          label="Open PRs"
          value={String(totals.prs)}
          delta={snapshot?.github.available ? 'live from GitHub' : 'gh offline'}
          progress={snapshot?.github.available ? 100 : 0}
          icon={Workflow}
        />
        <StatTile
          label="Builds running"
          value={String(totals.running)}
          delta={totals.failing ? `${totals.failing} CI failing` : 'queue idle'}
          progress={totals.running ? 60 : 0}
          icon={SquareTerminal}
        />
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, path, remote or branch…"
            className="h-8.5 pl-9 text-[13px] rounded-lg bg-card/60 border-border/80"
          />
        </div>
        <FilterChips
          options={filterOptions}
          value={filter}
          onChange={(id) => setFilter(id as Filter)}
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8.5 px-3 rounded-lg"
          disabled={loading}
          onClick={() => void refresh(false)}
          title="Re-scan every repository with git (Ctrl+R)"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          Rescan
        </Button>
        {selectedRepo && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-8.5 px-3 rounded-lg gap-1.5"
              onClick={() => openDiff(selectedRepo)}
              title="Open Visual Diff & Staging for selected repo"
            >
              <GitCommitHorizontal className="h-3.5 w-3.5 text-primary" />
              Diff & Stage
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8.5 px-3 rounded-lg gap-1.5"
              onClick={() => openBranchSwitchboard(selectedRepo)}
              title="Open Branch Switchboard for selected repo"
            >
              <GitBranch className="h-3.5 w-3.5 text-primary" />
              Branches
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8.5 px-3 rounded-lg gap-1.5"
              onClick={() => openGitUpdate(selectedRepo)}
              title="Check and pull updates from remote git"
            >
              <Download className="h-3.5 w-3.5" />
              Git Update
            </Button>
          </>
        )}
        <Button
          size="sm"
          variant="outline"
          className="h-8.5 px-3 rounded-lg"
          disabled={githubBusy}
          onClick={() => void refresh(true)}
          title="Query GitHub for pull requests and CI runs via the gh CLI"
        >
          <Workflow className={cn('h-3.5 w-3.5', githubBusy && 'animate-spin')} />
          Sync GitHub
        </Button>
        <Button
          size="sm"
          className="h-8.5 px-3.5 rounded-lg shadow-sm"
          onClick={() => void addRepo()}
        >
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
          className="flex items-center gap-3 px-3.5 py-2.5 bg-muted/30 border-b select-none"
          style={{ borderColor: 'hsl(var(--border) / 0.7)' }}
        >
          <span className="flex-[2.2] text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Repository
          </span>
          <span className="hidden flex-[2] text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/80 lg:block">
            Working tree
          </span>
          <span className="hidden flex-[2] text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/80 xl:block">
            Last commit
          </span>
          <span className="w-[150px] shrink-0 text-right pr-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Actions
          </span>
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
