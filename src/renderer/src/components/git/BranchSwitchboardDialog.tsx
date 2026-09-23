import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  GitBranch,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  XCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Badge } from '@renderer/components/ui/badge'
import { cn } from '@renderer/lib/utils'
import type { BranchInfo, CockpitEvent, Repo } from '../../../../shared/cockpit-types'

interface BranchSwitchboardDialogProps {
  repo: Repo | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onChanged?: () => void
}

export function BranchSwitchboardDialog({
  repo,
  open,
  onOpenChange,
  onChanged
}: BranchSwitchboardDialogProps): React.JSX.Element {
  const [branches, setBranches] = useState<BranchInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [newBranchName, setNewBranchName] = useState('')
  const [creating, setCreating] = useState(false)
  const [switchingTo, setSwitchingTo] = useState<string | null>(null)
  const [cleaning, setCleaning] = useState(false)
  const [confirmClean, setConfirmClean] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const loadBranches = async () => {
    if (!repo) return
    setLoading(true)
    try {
      const list = await window.api.cockpit.gitListBranches(repo.id)
      setBranches(list)
    } catch (err) {
      setStatusMessage({ text: String(err), ok: false })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && repo) {
      void loadBranches()
      setStatusMessage(null)
      setConfirmClean(false)
      setNewBranchName('')
      setFilter('')
    }
  }, [open, repo?.id])

  // Real-time watcher notification
  useEffect(() => {
    if (!open || !repo) return
    const api = window.api?.cockpit
    if (!api?.onEvent) return

    const unsub = api.onEvent((event: CockpitEvent) => {
      if (event.type === 'git-change') {
        void loadBranches()
      }
    })

    return unsub
  }, [open, repo?.id])

  const filteredBranches = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return branches
    return branches.filter((b) => b.name.toLowerCase().includes(q))
  }, [branches, filter])

  const currentBranch = branches.find((b) => b.current)
  const otherBranches = filteredBranches.filter((b) => !b.current)
  const mergedBranchesCount = branches.filter((b) => b.merged && !b.current).length

  const handleCheckout = async (branchName: string) => {
    if (!repo) return
    setSwitchingTo(branchName)
    setStatusMessage(null)
    try {
      const ok = await window.api.cockpit.gitCheckoutBranch(repo.id, branchName)
      if (ok) {
        setStatusMessage({ text: `Switched to branch "${branchName}"`, ok: true })
        await loadBranches()
        onChanged?.()
      } else {
        setStatusMessage({ text: 'Failed to checkout branch', ok: false })
      }
    } catch (err) {
      setStatusMessage({ text: String(err), ok: false })
    } finally {
      setSwitchingTo(null)
    }
  }

  const handleCreate = async () => {
    const cleanName = newBranchName.trim().replace(/\s+/g, '-')
    if (!repo || !cleanName) return
    setCreating(true)
    setStatusMessage(null)
    try {
      const ok = await window.api.cockpit.gitCreateBranch(repo.id, cleanName)
      if (ok) {
        setNewBranchName('')
        setStatusMessage({ text: `Created and checked out "${cleanName}"`, ok: true })
        await loadBranches()
        onChanged?.()
      } else {
        setStatusMessage({ text: 'Failed to create branch', ok: false })
      }
    } catch (err) {
      setStatusMessage({ text: String(err), ok: false })
    } finally {
      setCreating(false)
    }
  }

  const handleCleanMerged = async () => {
    if (!repo) return
    setCleaning(true)
    setStatusMessage(null)
    try {
      const deleted = await window.api.cockpit.gitCleanupMergedBranches(repo.id)
      const count = deleted.length
      setStatusMessage({
        text:
          count > 0
            ? `Deleted ${count} stale merged branch${count === 1 ? '' : 'es'}: ${deleted.join(', ')}`
            : 'No stale merged branches found.',
        ok: true
      })
      setConfirmClean(false)
      await loadBranches()
      onChanged?.()
    } catch (err) {
      setStatusMessage({ text: String(err), ok: false })
    } finally {
      setCleaning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
        {/* Header */}
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              <div>
                <DialogTitle className="text-base font-semibold tracking-tight">
                  Branch Switchboard — <span className="text-primary">{repo?.name}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Fast 1-click checkout, instant branch creation, and stale merged cleanup.
                </DialogDescription>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              disabled={loading}
              onClick={() => void loadBranches()}
              title="Refresh Branches"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1 min-h-0">
          {/* Create Branch Card */}
          <div className="rounded-lg border bg-card/60 p-3 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Plus className="h-3 w-3" />
              Create & Checkout New Branch
            </span>
            <div className="flex items-center gap-2">
              <Input
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void handleCreate()
                  }
                }}
                placeholder="Branch name (e.g. feat/command-palette, fix/auth)..."
                className="h-8 text-xs mono flex-1"
              />
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5 px-3"
                disabled={!newBranchName.trim() || creating}
                onClick={() => void handleCreate()}
              >
                {creating ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Create & Switch
              </Button>
            </div>
          </div>

          {/* Current Branch Highlight */}
          {currentBranch && (
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Currently Active Branch
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <GitBranch className="h-4 w-4 text-primary shrink-0" />
                  <span className="mono text-sm font-semibold truncate text-foreground">
                    {currentBranch.name}
                  </span>
                  {currentBranch.upstream && (
                    <span className="text-[11px] text-muted-foreground">
                      tracks <span className="mono font-medium">{currentBranch.upstream}</span>
                    </span>
                  )}
                </div>
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/40 gap-1 text-[11px]">
                <Check className="h-3 w-3" />
                HEAD
              </Badge>
            </div>
          )}

          {/* Search Filter */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search branches…"
              className="h-8 text-xs pl-8 bg-card/60"
            />
          </div>

          {/* Branch List */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Local Branches ({otherBranches.length})
              </span>
            </div>

            <div className="rounded-lg border bg-card divide-y overflow-hidden max-h-56 overflow-y-auto">
              {otherBranches.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  {filter ? `No branches match "${filter}"` : 'No other local branches'}
                </div>
              ) : (
                otherBranches.map((b) => {
                  const isSwitching = switchingTo === b.name

                  return (
                    <div
                      key={b.name}
                      className="px-3 py-2 flex items-center justify-between gap-3 hover:bg-accent/30 transition-colors text-xs"
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <GitBranch className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="mono font-medium truncate text-foreground">{b.name}</span>

                        {b.upstream && (
                          <span className="text-[10px] text-muted-foreground truncate">
                            → {b.upstream}
                          </span>
                        )}

                        {b.merged && (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-zinc-400 border-zinc-500/30 px-1 py-0 h-4"
                            title="Merged into current branch"
                          >
                            merged
                          </Badge>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6.5 text-[11px] px-2.5 gap-1 shrink-0"
                        disabled={Boolean(switchingTo)}
                        onClick={() => void handleCheckout(b.name)}
                      >
                        {isSwitching ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <ArrowRight className="h-3 w-3" />
                        )}
                        Checkout
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Clean Merged Branches Section */}
          <div className="rounded-lg border bg-muted/15 p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Clean Stale Merged Branches</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Safe prune: removes local branches already merged into HEAD ({mergedBranchesCount}{' '}
                detected).
              </p>
            </div>

            {confirmClean ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs px-2.5"
                  disabled={cleaning}
                  onClick={() => void handleCleanMerged()}
                >
                  {cleaning ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Confirm Prune'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs px-2"
                  onClick={() => setConfirmClean(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs px-2.5 gap-1.5 shrink-0"
                disabled={mergedBranchesCount === 0 || cleaning}
                onClick={() => setConfirmClean(true)}
              >
                <Trash2 className="h-3 w-3 text-muted-foreground" />
                Clean ({mergedBranchesCount})
              </Button>
            )}
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={cn(
                'px-3 py-2 rounded-md text-xs flex items-center gap-2 border',
                statusMessage.ok
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : 'bg-destructive/10 border-destructive/30 text-destructive'
              )}
            >
              {statusMessage.ok ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <XCircle className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="truncate">{statusMessage.text}</span>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 pt-2 border-t">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
