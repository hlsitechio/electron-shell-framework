import {
  CircleDot,
  Clock,
  ExternalLink,
  GitBranch,
  GitPullRequest,
  GitPullRequestDraft,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  User
} from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { EmptyState, FilterChips } from '@renderer/widgets'
import { cn } from '@renderer/lib/utils'
import { useCockpitStore } from '@renderer/stores/cockpit-store'
import { useMemo, useState } from 'react'
import type { PullRequest, ChecksState } from '../../../../shared/cockpit-types'

/**
 * PR queue — real data from `gh pr list`.
 *
 * If `gh` is missing or logged out, main returns `github.available === false`
 * with the reason, and this page shows that reason verbatim instead of an
 * empty list that would look like "no pull requests".
 */

const CHECK_META: Record<
  ChecksState,
  { icon: typeof ShieldCheck; color: string; badgeClass: string; label: string }
> = {
  passing: {
    icon: ShieldCheck,
    color: 'hsl(var(--success))',
    badgeClass: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    label: 'checks passing'
  },
  failing: {
    icon: ShieldAlert,
    color: 'hsl(var(--destructive))',
    badgeClass: 'border-destructive/25 bg-destructive/10 text-destructive',
    label: 'checks failing'
  },
  pending: {
    icon: ShieldQuestion,
    color: 'hsl(var(--warning))',
    badgeClass: 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    label: 'checks pending'
  },
  none: {
    icon: ShieldQuestion,
    color: 'hsl(var(--muted-foreground))',
    badgeClass: 'border-border bg-secondary/40 text-muted-foreground',
    label: 'no checks'
  }
}

function reviewDecisionBadge(decision: string): { label: string; className: string } {
  const norm = decision ? decision.toLowerCase().replace(/_/g, ' ') : 'review needed'
  if (decision === 'APPROVED') {
    return {
      label: 'Approved',
      className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    }
  }
  if (decision === 'CHANGES_REQUESTED') {
    return {
      label: 'Changes Requested',
      className: 'border-destructive/25 bg-destructive/10 text-destructive'
    }
  }
  if (decision === 'REVIEW_REQUIRED') {
    return {
      label: 'Review Required',
      className: 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400'
    }
  }
  return { label: norm, className: 'border-border bg-secondary/40 text-muted-foreground' }
}

/** Stable empty reference — a fresh `[]` per render breaks memo deps. */
const EMPTY_PRS: PullRequest[] = []

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

export function PullRequestsPage(): React.JSX.Element {
  const { snapshot, refresh, githubBusy } = useCockpitStore()
  const [filter, setFilter] = useState('all')

  const prs = useMemo(() => snapshot?.prs ?? EMPTY_PRS, [snapshot])
  const github = snapshot?.github

  const counts = useMemo(
    () => ({
      all: prs.length,
      failing: prs.filter((p) => p.checks === 'failing').length,
      ready: prs.filter((p) => !p.draft && p.reviewDecision === 'APPROVED').length,
      draft: prs.filter((p) => p.draft).length
    }),
    [prs]
  )

  const filterOptions = useMemo(
    () => [
      { label: 'All', value: 'all', count: counts.all },
      { label: 'Failing', value: 'failing', count: counts.failing },
      { label: 'Ready', value: 'ready', count: counts.ready },
      { label: 'Draft', value: 'draft', count: counts.draft }
    ],
    [counts]
  )

  const filtered = useMemo(() => {
    if (filter === 'all') return prs
    if (filter === 'failing') return prs.filter((p) => p.checks === 'failing')
    if (filter === 'ready') return prs.filter((p) => !p.draft && p.reviewDecision === 'APPROVED')
    if (filter === 'draft') return prs.filter((p) => p.draft)
    return prs
  }, [prs, filter])

  return (
    <div className="mx-auto flex h-full max-w-[1240px] flex-col gap-5 p-6">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <GitPullRequest className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-foreground">
                Pull Request Queue
              </h1>
              <span className="mono rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {prs.length} open
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time pull request statuses and reviews across workspace repositories
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

      {/* gh state banner — the real reason, not a guess */}
      {github && !github.available && (
        <div
          className="flex items-start gap-2.5 rounded-lg px-3.5 py-2.5"
          style={{
            background: 'hsl(var(--warning) / 0.08)',
            border: '1px solid hsl(var(--warning) / 0.25)'
          }}
        >
          <CircleDot className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'hsl(var(--warning))' }} />
          <div className="min-w-0 text-xs">
            <p className="font-medium text-foreground">GitHub is offline for this app</p>
            <p className="mono mt-0.5 text-muted-foreground">{github.message}</p>
          </div>
        </div>
      )}

      {github?.available && (
        <div className="mono flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>{github.message}</span>
          <span className="opacity-40">·</span>
          <span>last checked {relative(github.checkedAt ?? '')}</span>
        </div>
      )}

      {/* list */}
      <div className="min-h-0 flex-1 overflow-auto pr-0.5">
        {filtered.length === 0 ? (
          <EmptyState
            icon={GitPullRequest}
            title={github?.available ? 'No pull requests in this filter' : 'Waiting on GitHub'}
            hint={
              github?.available
                ? 'Every open PR in your repositories is listed here. Switch the filter to see drafts or approved ones.'
                : 'Authenticate the gh CLI (gh auth login) and press Sync GitHub — this page never fabricates a queue.'
            }
          />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((pr) => {
              const check = CHECK_META[pr.checks]
              const CheckIcon = check.icon
              const review = reviewDecisionBadge(pr.reviewDecision)
              return (
                <div
                  key={pr.id}
                  onClick={() => void window.api.cockpit.openPath(pr.url)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      void window.api.cockpit.openPath(pr.url)
                    }
                  }}
                  className="glass group flex cursor-pointer flex-col gap-3 rounded-lg border border-border/70 p-3.5 transition-all duration-150 hover:border-primary/40 hover:bg-accent/20 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm transition-transform duration-150 group-hover:scale-105',
                        pr.draft
                          ? 'border-border bg-secondary/50 text-muted-foreground'
                          : 'border-primary/20 bg-primary/10 text-primary'
                      )}
                    >
                      {pr.draft ? (
                        <GitPullRequestDraft className="h-4 w-4" />
                      ) : (
                        <GitPullRequest className="h-4 w-4" />
                      )}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="mono rounded border border-border/80 bg-secondary/40 px-1.5 py-0.2 text-[11px] font-semibold text-muted-foreground">
                          #{pr.number}
                        </span>
                        <span className="truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                          {pr.title}
                        </span>
                        {pr.draft && (
                          <span className="mono rounded border border-border/60 bg-muted/40 px-1.5 py-0.2 text-[10px] uppercase tracking-wider text-muted-foreground">
                            Draft
                          </span>
                        )}
                      </div>

                      <div className="mono mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground/80">{pr.repoName}</span>
                        <span className="opacity-40">·</span>
                        <div className="inline-flex items-center gap-1 rounded bg-secondary/40 px-1.5 py-0.5 text-[10.5px]">
                          <GitBranch className="h-3 w-3 text-muted-foreground" />
                          <span className="max-w-[140px] truncate">{pr.branch}</span>
                          <span className="opacity-50">→</span>
                          <span className="font-medium">{pr.baseBranch}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* right metadata */}
                  <div className="flex shrink-0 flex-wrap items-center gap-2.5 sm:gap-3">
                    {/* checks */}
                    <div
                      className={cn(
                        'mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
                        check.badgeClass
                      )}
                      title={check.label}
                    >
                      <CheckIcon className="h-3.5 w-3.5" />
                      <span className="capitalize">{check.label}</span>
                    </div>

                    {/* review decision */}
                    {pr.reviewDecision && (
                      <span
                        className={cn(
                          'mono rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize',
                          review.className
                        )}
                      >
                        {review.label}
                      </span>
                    )}

                    {/* author & time */}
                    <div className="mono hidden text-right text-[11px] text-muted-foreground lg:block">
                      <div className="flex items-center justify-end gap-1 font-medium text-foreground/85">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>{pr.author}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 opacity-70">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{relative(pr.updatedAt)}</span>
                      </div>
                    </div>

                    <div className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors group-hover:bg-accent/40 group-hover:text-foreground">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
