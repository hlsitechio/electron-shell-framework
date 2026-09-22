import {
  CircleDot,
  ExternalLink,
  GitPullRequest,
  GitPullRequestDraft,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion
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

const CHECK_META: Record<ChecksState, { icon: typeof ShieldCheck; color: string; label: string }> =
  {
    passing: { icon: ShieldCheck, color: 'hsl(var(--success))', label: 'checks passing' },
    failing: { icon: ShieldAlert, color: 'hsl(var(--destructive))', label: 'checks failing' },
    pending: { icon: ShieldQuestion, color: 'hsl(var(--warning))', label: 'checks pending' },
    none: { icon: ShieldQuestion, color: 'hsl(var(--muted-foreground))', label: 'no checks' }
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

  const filtered = useMemo(() => {
    if (filter === 'all') return prs
    if (filter === 'failing') return prs.filter((p) => p.checks === 'failing')
    if (filter === 'ready') return prs.filter((p) => !p.draft && p.reviewDecision === 'APPROVED')
    if (filter === 'draft') return prs.filter((p) => p.draft)
    return prs
  }, [prs, filter])

  return (
    <div className="mx-auto flex h-full max-w-[1100px] flex-col gap-4 p-5">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <GitPullRequest className="h-4 w-4 text-muted-foreground" />
          <span className="text-[13px] font-semibold">Pull request queue</span>
          <span className="mono text-[11px] text-muted-foreground">{prs.length} open</span>
        </div>
        <div className="flex-1" />
        <FilterChips
          options={['all', 'failing', 'ready', 'draft']}
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

      {/* gh state banner — the real reason, not a guess */}
      {github && !github.available && (
        <div
          className="flex items-start gap-2 rounded-md px-3 py-2"
          style={{
            background: 'hsl(var(--warning) / 0.08)',
            border: '1px solid hsl(var(--warning) / 0.25)'
          }}
        >
          <CircleDot
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
            style={{ color: 'hsl(var(--warning))' }}
          />
          <div className="min-w-0 text-[11.5px]">
            <p className="font-medium">GitHub is offline for this app</p>
            <p className="mono mt-0.5 text-muted-foreground">{github.message}</p>
          </div>
        </div>
      )}

      {github?.available && (
        <p className="mono text-[10.5px] text-muted-foreground">
          {github.message} · last checked {relative(github.checkedAt ?? '')}
        </p>
      )}

      {/* list */}
      <div className="min-h-0 flex-1 overflow-auto">
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
          <div className="space-y-2">
            {filtered.map((pr) => {
              const check = CHECK_META[pr.checks]
              const CheckIcon = check.icon
              return (
                <button
                  key={pr.id}
                  type="button"
                  onClick={() => void window.api.cockpit.openPath(pr.url)}
                  className="glass flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/20"
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                    style={{
                      background: 'hsl(var(--primary) / 0.14)',
                      color: 'hsl(var(--primary))'
                    }}
                  >
                    {pr.draft ? (
                      <GitPullRequestDraft className="h-3.5 w-3.5" />
                    ) : (
                      <GitPullRequest className="h-3.5 w-3.5" />
                    )}
                  </span>

                  <div className="min-w-0 flex-[3]">
                    <div className="flex items-center gap-2">
                      <span className="mono shrink-0 text-[11px] text-muted-foreground">
                        #{pr.number}
                      </span>
                      <span className="truncate text-[12.5px] font-medium">{pr.title}</span>
                    </div>
                    <div className="mono mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span>{pr.repoName}</span>
                      <span className="opacity-40">·</span>
                      <span className="truncate">{pr.branch}</span>
                      <span className="opacity-40">→</span>
                      <span>{pr.baseBranch}</span>
                    </div>
                  </div>

                  <div className="hidden shrink-0 items-center gap-1.5 md:flex" title={check.label}>
                    <CheckIcon className="h-3.5 w-3.5" style={{ color: check.color }} />
                    <span className="mono text-[10.5px] text-muted-foreground">
                      {pr.reviewDecision.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>

                  <div className="mono hidden shrink-0 text-right text-[10.5px] text-muted-foreground lg:block">
                    <div>{pr.author}</div>
                    <div className="opacity-70">{relative(pr.updatedAt)}</div>
                  </div>

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
