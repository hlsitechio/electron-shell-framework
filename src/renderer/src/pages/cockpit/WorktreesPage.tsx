import { useState } from 'react'
import {
  AlertTriangle,
  FolderTree,
  GitBranch,
  Lock,
  Plus,
  RefreshCw,
  Scissors,
  SquareTerminal,
  Star
} from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { EmptyState, GlassCard } from '@renderer/widgets'
import { cn } from '@renderer/lib/utils'
import { useCockpitStore, useSelectedRepo } from '@renderer/stores/cockpit-store'

/**
 * Worktrees — the multi-checkout view.
 *
 * Backed by `git worktree list --porcelain`. The repo selector drives it, so
 * the page always reflects the repo you picked on the Repos page; creating one
 * runs a real `git worktree add -b <branch>`, and the activity rail shows the
 * exact command and its result.
 */
export function WorktreesPage(): React.JSX.Element {
  const repo = useSelectedRepo()
  const { createWorktree, pruneWorktrees, openTerminal, refresh, loading } = useCockpitStore()
  const [branch, setBranch] = useState('')
  const [busy, setBusy] = useState(false)

  if (!repo) {
    return (
      <div className="p-5">
        <EmptyState
          icon={FolderTree}
          title="No repository selected"
          hint="Add a repository on the Repos page — worktrees appear here once there is a repo to read them from."
        />
      </div>
    )
  }

  const submit = async (): Promise<void> => {
    const name = branch.trim()
    if (!name) return
    setBusy(true)
    try {
      await createWorktree(repo.id, name)
      setBranch('')
    } finally {
      setBusy(false)
    }
  }

  const orphaned = repo.worktrees.filter((w) => w.prunable)

  return (
    <div className="mx-auto flex h-full max-w-[1100px] flex-col gap-4 p-5">
      {/* header */}
      <GlassCard
        icon={FolderTree}
        title={`Worktrees · ${repo.name}`}
        subtitle={`${repo.worktrees.length} checkout${repo.worktrees.length === 1 ? '' : 's'} linked to this repository`}
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7"
              disabled={loading}
              onClick={() => void refresh(false)}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              Rescan
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7"
              onClick={() => void pruneWorktrees(repo.id)}
              title="git worktree prune — drop bookkeeping for deleted folders"
            >
              <Scissors className="h-3.5 w-3.5" />
              Prune
            </Button>
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void submit()
            }}
            placeholder="feature/new-worktree"
            className="mono h-8 max-w-[320px] flex-1 text-[12px]"
            spellCheck={false}
          />
          <Button
            size="sm"
            className="h-8"
            disabled={busy || !branch.trim()}
            onClick={() => void submit()}
          >
            <Plus className="h-3.5 w-3.5" />
            Create worktree
          </Button>
          <span className="mono text-[10.5px] text-muted-foreground">
            creates a sibling folder named {repo.name}--&lt;branch&gt;
          </span>
        </div>
      </GlassCard>

      {/* worktree list */}
      <div className="min-h-0 flex-1 overflow-auto">
        {repo.worktrees.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="No worktrees"
            hint="This repository uses a single checkout. Create one above to work on two branches side by side."
          />
        ) : (
          <div className="space-y-2">
            {repo.worktrees.map((wt) => (
              <div
                key={wt.path}
                className="glass flex items-center gap-3 px-3 py-2.5"
                style={
                  wt.isMain
                    ? { boxShadow: 'inset 2px 0 0 0 hsl(var(--primary)), var(--shadow-md)' }
                    : undefined
                }
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                  style={{
                    background: wt.isMain
                      ? 'hsl(var(--primary) / 0.16)'
                      : 'hsl(var(--muted) / 0.6)',
                    color: wt.isMain ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
                  }}
                >
                  {wt.isMain ? (
                    <Star className="h-3.5 w-3.5" />
                  ) : (
                    <GitBranch className="h-3.5 w-3.5" />
                  )}
                </span>

                <div className="min-w-0 flex-[3]">
                  <div className="flex items-center gap-2">
                    <span className="mono truncate text-[12.5px] font-medium">{wt.branch}</span>
                    {wt.isMain && (
                      <span
                        className="mono rounded px-1.5 py-0.5 text-[9.5px] uppercase tracking-wide"
                        style={{
                          background: 'hsl(var(--primary) / 0.16)',
                          color: 'hsl(var(--primary))'
                        }}
                      >
                        main checkout
                      </span>
                    )}
                    {wt.locked && (
                      <span className="mono inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Lock className="h-2.5 w-2.5" /> locked
                      </span>
                    )}
                    {wt.prunable && (
                      <span
                        className="mono inline-flex items-center gap-1 text-[10px]"
                        style={{ color: 'hsl(var(--destructive))' }}
                      >
                        <AlertTriangle className="h-2.5 w-2.5" /> prunable
                      </span>
                    )}
                  </div>
                  <p className="mono mt-0.5 truncate text-[10.5px] text-muted-foreground">
                    {wt.path}
                  </p>
                </div>

                <span className="mono hidden shrink-0 text-[10.5px] text-muted-foreground sm:block">
                  {wt.head ? wt.head.slice(0, 7) : '—'}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    title="Reveal in Explorer"
                    onClick={() => void window.api.cockpit.openPath(wt.path)}
                  >
                    <FolderTree className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    title="Open a terminal here"
                    onClick={() => openTerminal(repo.id)}
                  >
                    <SquareTerminal className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {orphaned.length > 0 && (
          <div
            className="mt-3 flex items-start gap-2 rounded-md px-3 py-2"
            style={{
              background: 'hsl(var(--warning) / 0.08)',
              border: '1px solid hsl(var(--warning) / 0.25)'
            }}
          >
            <AlertTriangle
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              style={{ color: 'hsl(var(--warning))' }}
            />
            <p className="text-[11.5px]">
              {orphaned.length} worktree{orphaned.length === 1 ? '' : 's'} reference a folder that
              no longer exists. Use <span className="mono">Prune</span> to clean up git&apos;s
              bookkeeping.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
