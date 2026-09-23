import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive,
  Check,
  CheckCircle2,
  FileCode,
  GitCommitHorizontal,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Undo2,
  X,
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
import type {
  CockpitEvent,
  DiffFileSummary,
  FileDiffStatus,
  Repo
} from '../../../../shared/cockpit-types'

interface GitDiffModalProps {
  repo: Repo | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onChanged?: () => void
}

const COMMIT_TYPES = [
  { prefix: 'feat: ', label: 'feat', title: 'New feature' },
  { prefix: 'fix: ', label: 'fix', title: 'Bug fix' },
  { prefix: 'refactor: ', label: 'refactor', title: 'Code refactor' },
  { prefix: 'style: ', label: 'style', title: 'Formatting/styles' },
  { prefix: 'docs: ', label: 'docs', title: 'Documentation' },
  { prefix: 'chore: ', label: 'chore', title: 'Maintenance/build' },
  { prefix: 'perf: ', label: 'perf', title: 'Performance improvement' }
]

export function GitDiffModal({
  repo,
  open,
  onOpenChange,
  onChanged
}: GitDiffModalProps): React.JSX.Element {
  const [files, setFiles] = useState<DiffFileSummary[]>([])
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [commitMessage, setCommitMessage] = useState('')
  const [stashMessage, setStashMessage] = useState('')
  const [showStash, setShowStash] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [confirmDiscard, setConfirmDiscard] = useState<string | null>(null)

  const diffScrollRef = useRef<HTMLDivElement | null>(null)

  const loadDiff = async () => {
    if (!repo) return
    setLoading(true)
    setStatusMessage(null)
    try {
      const res = await window.api.cockpit.gitDiffFiles(repo.id)
      setFiles(res)
      if (res.length > 0) {
        // Keep selected if still present, otherwise default to first
        setSelectedPath((prev) => {
          if (prev && res.some((f) => f.path === prev)) return prev
          return res[0].path
        })
      } else {
        setSelectedPath(null)
      }
    } catch (err) {
      setStatusMessage({ text: String(err), ok: false })
    } finally {
      setLoading(false)
    }
  }

  // Load when opened or repo changed
  useEffect(() => {
    if (open && repo) {
      void loadDiff()
    } else {
      setFiles([])
      setSelectedPath(null)
      setFilter('')
      setCommitMessage('')
      setStatusMessage(null)
      setConfirmDiscard(null)
      setShowStash(false)
    }
  }, [open, repo?.id])

  // Listen to live background watcher events to refresh diffs immediately
  useEffect(() => {
    if (!open || !repo) return
    const api = window.api?.cockpit
    if (!api?.onEvent) return

    const unsub = api.onEvent((event: CockpitEvent) => {
      if (event.type === 'git-change') {
        void loadDiff()
      }
    })

    return unsub
  }, [open, repo?.id])

  const filteredFiles = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return files
    return files.filter((f) => f.path.toLowerCase().includes(q))
  }, [files, filter])

  const selectedFile = useMemo(() => {
    return files.find((f) => f.path === selectedPath) ?? files[0] ?? null
  }, [files, selectedPath])

  const stagedCount = files.filter((f) => f.staged).length
  const unstagedCount = files.filter((f) => !f.staged).length

  const handleToggleStage = async (file: DiffFileSummary) => {
    if (!repo) return
    setBusyAction(`staging:${file.path}`)
    try {
      await window.api.cockpit.gitStageFile(repo.id, file.path, !file.staged)
      await loadDiff()
      onChanged?.()
    } catch (err) {
      setStatusMessage({ text: String(err), ok: false })
    } finally {
      setBusyAction(null)
    }
  }

  const handleStageAll = async (stage: boolean) => {
    if (!repo) return
    setBusyAction(stage ? 'stage-all' : 'unstage-all')
    try {
      await window.api.cockpit.gitStageFile(repo.id, '.', stage)
      await loadDiff()
      onChanged?.()
    } catch (err) {
      setStatusMessage({ text: String(err), ok: false })
    } finally {
      setBusyAction(null)
    }
  }

  const handleDiscard = async (filePath: string) => {
    if (!repo) return
    setBusyAction(`discard:${filePath}`)
    try {
      const ok = await window.api.cockpit.gitDiscardFile(repo.id, filePath)
      if (ok) {
        setConfirmDiscard(null)
        await loadDiff()
        onChanged?.()
        setStatusMessage({ text: `Discarded changes in ${filePath}`, ok: true })
      } else {
        setStatusMessage({ text: 'Failed to discard changes', ok: false })
      }
    } catch (err) {
      setStatusMessage({ text: String(err), ok: false })
    } finally {
      setBusyAction(null)
    }
  }

  const handleCommit = async () => {
    if (!repo || !commitMessage.trim()) return
    setBusyAction('committing')
    setStatusMessage(null)
    try {
      const ok = await window.api.cockpit.gitCommit(repo.id, commitMessage.trim())
      if (ok) {
        setCommitMessage('')
        setStatusMessage({ text: `Committed successfully: ${commitMessage.trim()}`, ok: true })
        await loadDiff()
        onChanged?.()
      } else {
        setStatusMessage({ text: 'Commit failed', ok: false })
      }
    } catch (err) {
      setStatusMessage({ text: String(err), ok: false })
    } finally {
      setBusyAction(null)
    }
  }

  const handleStash = async () => {
    if (!repo) return
    setBusyAction('stashing')
    setStatusMessage(null)
    try {
      const list = await window.api.cockpit.gitStash(
        repo.id,
        'save',
        stashMessage.trim() || undefined
      )
      setStashMessage('')
      setShowStash(false)
      setStatusMessage({
        text: `Changes stashed successfully (${list.length} stash entries)`,
        ok: true
      })
      await loadDiff()
      onChanged?.()
    } catch (err) {
      setStatusMessage({ text: String(err), ok: false })
    } finally {
      setBusyAction(null)
    }
  }

  const getStatusBadge = (status: FileDiffStatus) => {
    switch (status) {
      case 'modified':
        return (
          <Badge
            variant="outline"
            className="h-4.5 px-1 text-[10px] text-amber-500 border-amber-500/30"
          >
            M
          </Badge>
        )
      case 'added':
        return (
          <Badge
            variant="outline"
            className="h-4.5 px-1 text-[10px] text-emerald-500 border-emerald-500/30"
          >
            A
          </Badge>
        )
      case 'deleted':
        return (
          <Badge
            variant="outline"
            className="h-4.5 px-1 text-[10px] text-rose-500 border-rose-500/30"
          >
            D
          </Badge>
        )
      case 'untracked':
        return (
          <Badge
            variant="outline"
            className="h-4.5 px-1 text-[10px] text-sky-400 border-sky-400/30"
          >
            ?
          </Badge>
        )
      case 'renamed':
        return (
          <Badge
            variant="outline"
            className="h-4.5 px-1 text-[10px] text-purple-400 border-purple-400/30"
          >
            R
          </Badge>
        )
      case 'staged':
        return (
          <Badge
            variant="outline"
            className="h-4.5 px-1 text-[10px] text-emerald-500 border-emerald-500/30"
          >
            S
          </Badge>
        )
    }
  }

  // Scroll diff to top on file selection
  useEffect(() => {
    if (diffScrollRef.current) {
      diffScrollRef.current.scrollTop = 0
    }
  }, [selectedPath])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[88vh] flex flex-col p-6 overflow-hidden">
        {/* Header */}
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2.5">
              <GitCommitHorizontal className="h-5 w-5 text-primary" />
              <div>
                <DialogTitle className="text-base font-semibold tracking-tight">
                  Visual Diff & Staging — <span className="text-primary">{repo?.name}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Branch:{' '}
                  <span className="mono font-semibold text-foreground/90">{repo?.branch}</span> ·{' '}
                  <span className="text-emerald-500 font-medium">{stagedCount} staged</span> ·{' '}
                  <span className="text-amber-500 font-medium">{unstagedCount} unstaged</span>
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs px-2.5 gap-1.5"
                disabled={loading || Boolean(busyAction) || unstagedCount === 0}
                onClick={() => void handleStageAll(true)}
              >
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Stage All
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs px-2.5 gap-1.5"
                disabled={loading || Boolean(busyAction) || stagedCount === 0}
                onClick={() => void handleStageAll(false)}
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
                Unstage All
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                disabled={loading}
                onClick={() => void loadDiff()}
                title="Refresh Diff"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Main Body: 2-pane split */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-2">
          {/* Left: Files List (4 cols) */}
          <div className="md:col-span-4 flex flex-col min-h-0 border rounded-lg bg-card/40 overflow-hidden">
            <div className="p-2 border-b bg-muted/20 shrink-0">
              <div className="relative">
                <Search className="h-3 w-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter changed files…"
                  className="h-7 text-xs pl-7 bg-background"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border/40 min-h-0">
              {files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
                  <CheckCircle2 className="h-7 w-7 text-emerald-500 mb-2 opacity-80" />
                  <p className="text-xs font-medium text-foreground">Working tree clean</p>
                  <p className="text-[11px] mt-0.5">No uncommitted changes in this repository</p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No files match &quot;{filter}&quot;
                </div>
              ) : (
                filteredFiles.map((file) => {
                  const isSelected = file.path === selectedPath
                  const isStagingThis = busyAction === `staging:${file.path}`
                  const isDiscardingThis = busyAction === `discard:${file.path}`
                  const isConfirming = confirmDiscard === file.path

                  return (
                    <div
                      key={file.path}
                      onClick={() => setSelectedPath(file.path)}
                      className={cn(
                        'group flex items-center justify-between gap-2 px-2.5 py-2 text-xs cursor-pointer transition-colors',
                        isSelected ? 'bg-accent/60 font-medium' : 'hover:bg-accent/25'
                      )}
                    >
                      {/* Checkbox & Status */}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <button
                          type="button"
                          disabled={isStagingThis}
                          onClick={(e) => {
                            e.stopPropagation()
                            void handleToggleStage(file)
                          }}
                          className={cn(
                            'h-4 w-4 shrink-0 rounded flex items-center justify-center border transition-all cursor-pointer',
                            file.staged
                              ? 'bg-emerald-500 text-white border-emerald-600'
                              : 'border-muted-foreground/40 hover:border-emerald-500 hover:bg-emerald-500/10'
                          )}
                          title={file.staged ? 'Unstage file' : 'Stage file'}
                        >
                          {file.staged && <Check className="h-3 w-3 stroke-[3]" />}
                        </button>

                        {getStatusBadge(file.status)}

                        <span className="truncate mono text-[11px]" title={file.path}>
                          {file.path}
                        </span>
                      </div>

                      {/* Right stats & Discard button */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {file.additions > 0 && (
                          <span className="mono text-[10px] text-emerald-500">
                            +{file.additions}
                          </span>
                        )}
                        {file.deletions > 0 && (
                          <span className="mono text-[10px] text-rose-500">-{file.deletions}</span>
                        )}

                        {/* Discard file changes */}
                        {isConfirming ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-5 px-1.5 text-[10px]"
                              disabled={isDiscardingThis}
                              onClick={(e) => {
                                e.stopPropagation()
                                void handleDiscard(file.path)
                              }}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                setConfirmDiscard(null)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            title="Discard changes in file"
                            onClick={(e) => {
                              e.stopPropagation()
                              setConfirmDiscard(file.path)
                            }}
                          >
                            <Undo2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right: Unified Diff Viewer (8 cols) */}
          <div className="md:col-span-8 flex flex-col min-h-0 border rounded-lg bg-card/60 overflow-hidden">
            {selectedFile ? (
              <>
                {/* Diff Viewer Header */}
                <div className="p-2.5 px-3 border-b bg-muted/20 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="mono text-xs font-semibold truncate text-foreground">
                      {selectedFile.path}
                    </span>
                    {getStatusBadge(selectedFile.status)}
                    <span className="text-[11px] text-muted-foreground">
                      ({selectedFile.staged ? 'Staged' : 'Unstaged'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6.5 text-[11px] px-2 gap-1"
                      onClick={() => void handleToggleStage(selectedFile)}
                    >
                      {selectedFile.staged ? (
                        <>
                          <Minus className="h-3 w-3" /> Unstage
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3 text-emerald-500" /> Stage
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Diff Content */}
                <div
                  ref={diffScrollRef}
                  className="flex-1 overflow-auto p-3 font-mono text-[11.5px] leading-relaxed bg-[#0d1117] text-zinc-300 select-text"
                >
                  {(() => {
                    const lines =
                      selectedFile.diffLines && selectedFile.diffLines.length > 0
                        ? selectedFile.diffLines
                        : selectedFile.diff
                          ? selectedFile.diff.split('\n')
                          : []

                    if (lines.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-8 text-center">
                          <FileCode className="h-8 w-8 mb-2 opacity-50" />
                          <p>No text diff available (untracked file or binary content)</p>
                          <p className="text-[10.5px] mt-1 text-zinc-600">
                            Stage the file to track it in git.
                          </p>
                        </div>
                      )
                    }

                    return lines.map((line: string, idx: number) => {
                      const isChunkHeader = line.startsWith('@@')
                      const isAddition = line.startsWith('+') && !line.startsWith('+++')
                      const isDeletion = line.startsWith('-') && !line.startsWith('---')

                      return (
                        <div
                          key={idx}
                          className={cn(
                            'whitespace-pre-wrap break-all px-2 py-0.5 rounded-xs',
                            isChunkHeader && 'bg-sky-500/15 text-sky-400 font-semibold my-1',
                            isAddition && 'bg-emerald-500/15 text-emerald-400 font-medium',
                            isDeletion && 'bg-rose-500/15 text-rose-400 font-medium'
                          )}
                        >
                          {line}
                        </div>
                      )
                    })
                  })()}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                <FileCode className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-xs">Select a file on the left to preview changes</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Message if any */}
        {statusMessage && (
          <div
            className={cn(
              'px-3 py-1.5 rounded-md text-xs flex items-center gap-2 shrink-0 border',
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

        {/* Bottom Bar: Conventional Commit & Stash */}
        <div className="space-y-2.5 pt-1 shrink-0 border-t">
          {/* Quick Commit Types Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground mr-1 shrink-0">
              Type:
            </span>
            {COMMIT_TYPES.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => {
                  setCommitMessage((prev) => {
                    const clean = prev.replace(/^[a-z]+(\([a-z0-9_-]+\))?:\s*/i, '')
                    return `${t.prefix}${clean}`
                  })
                }}
                title={t.title}
                className="mono text-[10.5px] px-2 py-0.5 rounded border border-border/60 bg-muted/40 hover:bg-accent hover:border-primary/50 text-foreground transition-all cursor-pointer shrink-0"
              >
                {t.label}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[11px] gap-1 px-2 text-muted-foreground"
                onClick={() => setShowStash((v) => !v)}
              >
                <Archive className="h-3 w-3" />
                {showStash ? 'Hide Stash' : 'Stash Options'}
              </Button>
            </div>
          </div>

          {/* Stash panel if toggled */}
          {showStash && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border">
              <Input
                value={stashMessage}
                onChange={(e) => setStashMessage(e.target.value)}
                placeholder="Optional stash message (e.g. WIP work on feature)..."
                className="h-7 text-xs flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5"
                disabled={files.length === 0 || busyAction === 'stashing'}
                onClick={() => void handleStash()}
              >
                <Archive className="h-3.5 w-3.5" />
                Stash All Changes
              </Button>
            </div>
          )}

          {/* Commit Input and Action */}
          <div className="flex items-center gap-2">
            <Input
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  void handleCommit()
                }
              }}
              placeholder="Commit message (e.g. feat: add command palette) · Press Ctrl+Enter to commit"
              className="h-8.5 text-xs flex-1 mono"
            />

            <Button
              size="sm"
              disabled={stagedCount === 0 || !commitMessage.trim() || Boolean(busyAction)}
              onClick={() => void handleCommit()}
              className="h-8.5 px-4 text-xs gap-1.5 shrink-0"
            >
              {busyAction === 'committing' ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Committing…
                </>
              ) : (
                <>
                  <GitCommitHorizontal className="h-3.5 w-3.5" />
                  Commit ({stagedCount})
                </>
              )}
            </Button>
          </div>
        </div>

        <DialogFooter className="shrink-0 pt-2 border-t flex items-center justify-between sm:justify-between">
          <span className="text-[11px] text-muted-foreground">
            Tip: Press{' '}
            <kbd className="mono px-1 py-0.5 rounded bg-muted border text-[10px]">Ctrl+Enter</kbd>{' '}
            to commit staged files.
          </span>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
