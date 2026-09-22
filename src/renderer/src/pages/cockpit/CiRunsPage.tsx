import { useMemo, useState } from 'react'
import { Activity, CheckCircle2, Clock, ExternalLink, RefreshCw, XCircle } from 'lucide-react'
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

type Tone = { color: string; icon: typeof CheckCircle2; label: string }

function toneOf(run: CiRun): Tone {
  if (run.status !== 'completed') {
    return { color: 'hsl(var(--warning))', icon: Clock, label: run.status.replace(/_/g, ' ') }
  }
  switch (run.conclusion) {
    case 'success':
      return { color: 'hsl(var(--success))', icon: CheckCircle2, label: 'success' }
    case 'failure':
    case 'timed_out':
    case 'action_required':
      return {
        color: 'hsl(var(--destructive))',
        icon: XCircle,
        label: run.conclusion.replace(/_/g, ' ')
      }
    case 'cancelled':
      return { color: 'hsl(var(--muted-foreground))', icon: XCircle, label: 'cancelled' }
    default:
      return {
        color: 'hsl(var(--muted-foreground))',
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
      failing: runs.filter((r) => toneOf(r).label.includes('failure') || r.conclusion === 'failure')
        .length,
      running: runs.filter((r) => r.status !== 'completed').length,
      passing: runs.filter((r) => r.conclusion === 'success').length
    }),
    [runs]
  )

  const filtered = useMemo(() => {
    if (filter === 'failing') return runs.filter((r) => r.conclusion === 'failure')
    if (filter === 'running') return runs.filter((r) => r.status !== 'completed')
    if (filter === 'passing') return runs.filter((r) => r.conclusion === 'success')
    return runs
  }, [runs, filter])

  return (
    <div className="mx-auto flex h-full max-w-[1100px] flex-col gap-4 p-5">
      {/* summary strip — three live counters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-[13px] font-semibold">CI runs</span>
        </div>
        <span className="mono inline-flex items-center gap-1.5 text-[11px]">
          <CheckCircle2 className="h-3.5 w-3.5" style={{ color: 'hsl(var(--success))' }} />
          {counts.passing} passing
        </span>
        <span className="mono inline-flex items-center gap-1.5 text-[11px]">
          <XCircle className="h-3.5 w-3.5" style={{ color: 'hsl(var(--destructive))' }} />
          {counts.failing} failing
        </span>
        <span className="mono inline-flex items-center gap-1.5 text-[11px]">
          <Clock className="h-3.5 w-3.5" style={{ color: 'hsl(var(--warning))' }} />
          {counts.running} in flight
        </span>
        <div className="flex-1" />
        <FilterChips
          options={['all', 'failing', 'running', 'passing']}
          value={filter}
          onChange={setFilter}
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          disabled={githubBusy}
          onClick={() => void refresh(true)}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', githubBusy && 'animate-spin')} />
          Sync GitHub
        </Button>
      </div>

      {github && !github.available && (
        <div
          className="rounded-md px-3 py-2 text-[11.5px]"
          style={{
            background: 'hsl(var(--warning) / 0.08)',
            border: '1px solid hsl(var(--warning) / 0.25)'
          }}
        >
          <p className="font-medium">GitHub is offline for this app</p>
          <p className="mono mt-0.5 text-muted-foreground">{github.message}</p>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto">
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
          <div
            className="glass overflow-hidden"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <div
              className="flex items-center gap-3 px-3 py-2"
              style={{ borderBottom: '1px solid hsl(var(--border))' }}
            >
              <span className="w-[86px] shrink-0" />
              <span className="mono flex-[3] text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Workflow
              </span>
              <span className="mono hidden flex-[2] text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:block">
                Branch
              </span>
              <span className="mono w-[70px] shrink-0 text-right text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Duration
              </span>
              <span className="mono w-[74px] shrink-0 text-right text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                When
              </span>
            </div>

            {filtered.map((run) => {
              const tone = toneOf(run)
              const ToneIcon = tone.icon
              return (
                <button
                  key={run.id}
                  type="button"
                  onClick={() => void window.api.cockpit.openPath(run.url)}
                  className="flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent/20"
                  style={{ borderBottom: '1px solid hsl(var(--border))' }}
                >
                  <span
                    className="mono inline-flex w-[86px] shrink-0 items-center gap-1.5 text-[10.5px]"
                    style={{ color: tone.color }}
                  >
                    <ToneIcon className="h-3.5 w-3.5" />
                    {tone.label}
                  </span>
                  <div className="min-w-0 flex-[3]">
                    <p className="truncate text-[12px] font-medium">{run.name}</p>
                    <p className="mono mt-0.5 truncate text-[10px] text-muted-foreground">
                      {run.title || run.repoName}
                    </p>
                  </div>
                  <span className="mono hidden min-w-0 flex-[2] truncate text-[10.5px] text-muted-foreground md:block">
                    {run.branch || '—'}
                  </span>
                  <span className="mono w-[70px] shrink-0 text-right text-[10.5px] text-muted-foreground">
                    {duration(run)}
                  </span>
                  <span className="mono w-[74px] shrink-0 text-right text-[10.5px] text-muted-foreground">
                    {relative(run.createdAt)}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
