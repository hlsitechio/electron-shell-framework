import { useMemo, useState } from 'react'
import {
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
  GitBranch,
  RefreshCw,
  Timer,
  XCircle
} from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { EmptyState, FilterChips } from '@renderer/widgets'
import { cn } from '@renderer/lib/utils'
import { useCockpitStore } from '@renderer/stores/cockpit-store'
import type { CiRun } from '../../../../shared/cockpit-types'

/** Stable empty reference — a fresh `[]` per render breaks memo deps. */
const EMPTY_RUNS: CiRun[] = []

/**
 * CI runs — real data from `gh run list`.
 *
 * Conclusion strings come straight from GitHub, so the grouping here follows
 * what the API actually returns (success / failure / cancelled / skipped /
 * null while in flight) rather than an invented status model.
 */

type Tone = { color: string; badgeClass: string; icon: typeof CheckCircle2; label: string }

function toneOf(run: CiRun): Tone {
  if (run.status !== 'completed') {
    return {
      color: 'hsl(var(--warning))',
      badgeClass: 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400',
      icon: Clock,
      label: run.status.replace(/_/g, ' ')
    }
  }
  switch (run.conclusion) {
    case 'success':
      return {
        color: 'hsl(var(--success))',
        badgeClass:
          'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        icon: CheckCircle2,
        label: 'success'
      }
    case 'failure':
    case 'timed_out':
    case 'action_required':
      return {
        color: 'hsl(var(--destructive))',
        badgeClass: 'border-destructive/25 bg-destructive/10 text-destructive',
        icon: XCircle,
        label: run.conclusion.replace(/_/g, ' ')
      }
    case 'cancelled':
      return {
        color: 'hsl(var(--muted-foreground))',
        badgeClass: 'border-border bg-secondary/40 text-muted-foreground',
        icon: XCircle,
        label: 'cancelled'
      }
    default:
      return {
        color: 'hsl(var(--muted-foreground))',
        badgeClass: 'border-border bg-secondary/40 text-muted-foreground',
        icon: Activity,
        label: run.conclusion ?? 'unknown'
      }
  }
}

function relative(iso: string): string {
  if (!iso) return '—'
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '—'
  const mins = Math.round((Date.now() - t) / 60000)
  if (mins < 60) return `${Math.max(mins, 0)}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

/** Duration between createdAt and updatedAt — real times, not estimates. */
function duration(run: CiRun): string {
  const a = new Date(run.createdAt).getTime()
  const b = new Date(run.updatedAt).getTime()
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return '—'
  const secs = Math.round((b - a) / 1000)
  if (secs < 60) return `${secs}s`
  return `${Math.floor(secs / 60)}m ${secs % 60}s`
}

export function CiRunsPage(): React.JSX.Element {
  const { snapshot, refresh, githubBusy } = useCockpitStore()
  const [filter, setFilter] = useState('all')

  const runs = useMemo(() => snapshot?.runs ?? EMPTY_RUNS, [snapshot])
  const github = snapshot?.github

  const counts = useMemo(
    () => ({
      all: runs.length,
      failing: runs.filter((r) => toneOf(r).label.includes('failure') || r.conclusion === 'failure')
        .length,
      running: runs.filter((r) => r.status !== 'completed').length,
      passing: runs.filter((r) => r.conclusion === 'success').length
    }),
    [runs]
  )

  const filterOptions = useMemo(
    () => [
      { label: 'All', value: 'all', count: counts.all },
      { label: 'Failing', value: 'failing', count: counts.failing },
      { label: 'In Flight', value: 'running', count: counts.running },
      { label: 'Passing', value: 'passing', count: counts.passing }
    ],
    [counts]
  )

  const filtered = useMemo(() => {
    if (filter === 'failing') return runs.filter((r) => r.conclusion === 'failure')
    if (filter === 'running') return runs.filter((r) => r.status !== 'completed')
    if (filter === 'passing') return runs.filter((r) => r.conclusion === 'success')
    return runs
  }, [runs, filter])

  return (
    <div className="mx-auto flex h-full max-w-[1240px] flex-col gap-5 p-6">
      {/* summary strip & toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Activity className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-foreground">
                CI / Actions Runs
              </h1>
              <div className="flex items-center gap-1.5 pl-1">
                <span className="mono inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {counts.passing}
                </span>
                {counts.failing > 0 && (
                  <span className="mono inline-flex items-center gap-1 rounded-full border border-destructive/25 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                    <XCircle className="h-3 w-3" />
                    {counts.failing}
                  </span>
                )}
                {counts.running > 0 && (
                  <span className="mono inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    <Clock className="h-3 w-3 animate-pulse" />
                    {counts.running}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Recent workflow execution history from connected repository pipelines
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterChips options={filterOptions} value={filter} onChange={setFilter} />
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-border/80 bg-background/50 text-xs font-medium hover:bg-accent/40"
            disabled={githubBusy}
            onClick={() => void refresh(true)}
          >
            <RefreshCw className={cn('h-3.5 w-3.5', githubBusy && 'animate-spin')} />
            <span>Sync GitHub</span>
          </Button>
        </div>
      </div>

      {github && !github.available && (
        <div
          className="rounded-lg px-3.5 py-2.5 text-xs"
          style={{
            background: 'hsl(var(--warning) / 0.08)',
            border: '1px solid hsl(var(--warning) / 0.25)'
          }}
        >
          <p className="font-medium text-foreground">GitHub is offline for this app</p>
          <p className="mono mt-0.5 text-muted-foreground">{github.message}</p>
        </div>
      )}

      {/* runs list */}
      <div className="min-h-0 flex-1 overflow-auto pr-0.5">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Activity}
            title={github?.available ? 'No workflow runs in this filter' : 'Waiting on GitHub'}
            hint={
              github?.available
                ? 'Runs appear once a repository in your workspace has GitHub Actions history.'
                : 'Authenticate the gh CLI and press Sync GitHub to read real workflow runs.'
            }
          />
        ) : (
          <div className="glass overflow-hidden rounded-lg border border-border/70">
            {/* table header */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 bg-secondary/30 text-muted-foreground"
              style={{ borderBottom: '1px solid hsl(var(--border))' }}
            >
              <span className="mono w-[95px] shrink-0 text-[10px] font-semibold uppercase tracking-wider">
                Status
              </span>
              <span className="mono flex-[3] text-[10px] font-semibold uppercase tracking-wider">
                Workflow & Target
              </span>
              <span className="mono hidden flex-[2] text-[10px] font-semibold uppercase tracking-wider md:block">
                Branch / Ref
              </span>
              <span className="mono w-[80px] shrink-0 text-right text-[10px] font-semibold uppercase tracking-wider">
                Duration
              </span>
              <span className="mono w-[80px] shrink-0 text-right text-[10px] font-semibold uppercase tracking-wider">
                Triggered
              </span>
              <span className="w-5 shrink-0" />
            </div>

            {/* rows */}
            <div className="divide-y divide-border/60">
              {filtered.map((run) => {
                const tone = toneOf(run)
                const ToneIcon = tone.icon
                return (
                  <div
                    key={run.id}
                    onClick={() => void window.api.cockpit.openPath(run.url)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        void window.api.cockpit.openPath(run.url)
                      }
                    }}
                    className="group flex cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-accent/25"
                  >
                    <div className="w-[95px] shrink-0">
                      <span
                        className={cn(
                          'mono inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium capitalize',
                          tone.badgeClass
                        )}
                      >
                        <ToneIcon className="h-3 w-3 shrink-0" />
                        <span className="truncate">{tone.label}</span>
                      </span>
                    </div>

                    <div className="min-w-0 flex-[3]">
                      <p className="truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                        {run.name}
                      </p>
                      <p className="mono mt-0.5 truncate text-[11px] text-muted-foreground">
                        {run.title || run.repoName}
                      </p>
                    </div>

                    <div className="hidden min-w-0 flex-[2] md:block">
                      {run.branch ? (
                        <div className="mono inline-flex items-center gap-1 rounded bg-secondary/40 px-1.5 py-0.5 text-[10.5px] text-muted-foreground">
                          <GitBranch className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate">{run.branch}</span>
                        </div>
                      ) : (
                        <span className="mono text-[10.5px] text-muted-foreground/60">—</span>
                      )}
                    </div>

                    <div className="mono flex w-[80px] shrink-0 items-center justify-end gap-1 text-[11px] text-muted-foreground">
                      <Timer className="h-2.5 w-2.5 opacity-60" />
                      <span>{duration(run)}</span>
                    </div>

                    <div className="mono flex w-[80px] shrink-0 items-center justify-end gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5 opacity-60" />
                      <span>{relative(run.createdAt)}</span>
                    </div>

                    <div className="flex w-5 shrink-0 justify-end text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
