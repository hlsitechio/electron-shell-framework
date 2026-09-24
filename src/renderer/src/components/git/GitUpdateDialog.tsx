import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
  GitBranch,
  GitCommitHorizontal,
  Package,
  RefreshCw,
  RotateCcw,
  Terminal,
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
import { Badge } from '@renderer/components/ui/badge'
import { Switch } from '@renderer/components/ui/switch'
import { Label } from '@renderer/components/ui/label'
import { cn } from '@renderer/lib/utils'
import type {
  CockpitEvent,
  GitUpdateCheckResult,
  GitUpdateApplyResult,
  GitUpdateProgressEvent
} from '../../../../shared/cockpit-types'

interface Props {
  repoIdOrPath?: string | null
  repoName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
  isAppSelfUpdate?: boolean
}

export function GitUpdateDialog({
  repoIdOrPath,
  repoName,
  open,
  onOpenChange,
  onUpdated,
  isAppSelfUpdate = false
}: Props): React.JSX.Element {
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<GitUpdateCheckResult | null>(null)
  const [applying, setApplying] = useState(false)
  const [applyResult, setApplyResult] = useState<GitUpdateApplyResult | null>(null)
  const [installDeps, setInstallDeps] = useState(true)
  const [runBuild, setRunBuild] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState<string>('idle')

  const logEndRef = useRef<HTMLDivElement | null>(null)

  // Listen to live progress events
  useEffect(() => {
    if (!open) return
    const api = window.api?.cockpit
    if (!api) return

    const unsub = api.onEvent((event: CockpitEvent) => {
      if (event.type === 'git-update-progress') {
        const p: GitUpdateProgressEvent = event.progress
        setCurrentStep(p.step)
        if (p.outputChunk) {
          setLogs((prev) => [...prev.slice(-300), p.outputChunk || ''])
        } else if (p.message) {
          setLogs((prev) => [...prev.slice(-300), `[${p.step}] ${p.message}`])
        }
      }
    })

    return unsub
  }, [open])

  // Auto-scroll logs to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const runCheck = useCallback(async () => {
    setChecking(true)
    setApplyResult(null)
    try {
      const res = await window.api.cockpit.gitCheckUpdate(repoIdOrPath ?? undefined)
      setCheckResult(res)
      if (res.dependenciesChanged) {
        setInstallDeps(true)
      }
    } catch (err) {
      setCheckResult({
        ok: false,
        repoPath: repoIdOrPath ?? '',
        repoName: repoName ?? 'Repository',
        branch: 'unknown',
        upstream: null,
        remoteUrl: null,
        ahead: 0,
        behind: 0,
        hasUpdate: false,
        incomingCommits: [],
        dependenciesChanged: false,
        changedFiles: [],
        isDirty: false,
        error: String(err)
      })
    } finally {
      setChecking(false)
    }
  }, [repoIdOrPath, repoName])

  // Trigger check when opened
  useEffect(() => {
    if (open) {
      setLogs([])
      setApplyResult(null)
      setCurrentStep('idle')
      void runCheck()
    }
  }, [open, runCheck])

  const runUpdate = async () => {
    if (applying) return
    setApplying(true)
    setLogs([])
    setCurrentStep('pulling')

    try {
      const res = await window.api.cockpit.gitApplyUpdate(repoIdOrPath ?? undefined, {
        installDeps,
        runBuild
      })
      setApplyResult(res)
      if (res.ok) {
        onUpdated?.()
        // Re-check update status
        void runCheck()
      }
    } catch (err) {
      setApplyResult({
        ok: false,
        repoPath: repoIdOrPath ?? '',
        pulledCommits: 0,
        dependenciesInstalled: false,
        buildRun: false,
        logs: [String(err)],
        error: String(err)
      })
    } finally {
      setApplying(false)
    }
  }

  const handleRelaunch = async () => {
    try {
      await window.api.cockpit.relaunchApp()
    } catch {
      window.location.reload()
    }
  }

  const title = isAppSelfUpdate
    ? 'Application Git Update'
    : `Git Update — ${repoName || checkResult?.repoName || 'Repository'}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              {title}
            </DialogTitle>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs gap-1.5"
              disabled={checking || applying}
              onClick={() => void runCheck()}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', checking && 'animate-spin')} />
              Check again
            </Button>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Fetch remote commits from upstream, install updated dependencies, and sync local
            repository.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
          {/* Status summary banner */}
          {checkResult && (
            <div className="rounded-lg border bg-accent/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="mono inline-flex items-center gap-1 rounded bg-muted/80 px-2 py-0.5 text-xs font-medium border text-foreground">
                    <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                    {checkResult.branch}
                  </span>
                  {checkResult.upstream && (
                    <span className="text-xs text-muted-foreground">
                      tracking{' '}
                      <span className="mono font-semibold text-foreground/80">
                        {checkResult.upstream}
                      </span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {checkResult.ahead > 0 && (
                    <Badge
                      variant="outline"
                      className="text-amber-500 border-amber-500/30 gap-1 text-[11px]"
                    >
                      <ArrowUp className="h-3 w-3" />
                      {checkResult.ahead} ahead
                    </Badge>
                  )}
                  {checkResult.behind > 0 ? (
                    <Badge className="bg-primary text-primary-foreground gap-1 text-[11px]">
                      <ArrowDown className="h-3 w-3" />
                      {checkResult.behind} behind
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-emerald-500 border-emerald-500/30 gap-1 text-[11px]"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Up to date
                    </Badge>
                  )}
                </div>
              </div>

              {/* Dirty status warning */}
              {checkResult.isDirty && (
                <div className="flex items-start gap-2 rounded-md bg-amber-500/10 border border-amber-500/25 p-2.5 text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Local changes detected in working copy:</span>{' '}
                    Uncommitted files exist. Git pull will attempt a fast-forward, but may require
                    stashing if merge conflicts occur.
                  </div>
                </div>
              )}

              {/* Dependency changes alert */}
              {checkResult.dependenciesChanged && (
                <div className="flex items-start gap-2 rounded-md bg-sky-500/10 border border-sky-500/25 p-2.5 text-xs text-sky-600 dark:text-sky-400">
                  <Package className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">
                      Dependencies modified in incoming commits:
                    </span>{' '}
                    <span className="mono">{checkResult.changedFiles.join(', ')}</span>. Running{' '}
                    <span className="mono">npm install</span> is strongly recommended.
                  </div>
                </div>
              )}

              {/* Error message */}
              {checkResult.error && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/25 p-2.5 text-xs text-destructive">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="truncate">{checkResult.error}</div>
                </div>
              )}
            </div>
          )}

          {/* Incoming commits section */}
          {checkResult && checkResult.incomingCommits.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Incoming Commits ({checkResult.incomingCommits.length})
                </span>
              </div>
              <div className="rounded-lg border bg-card divide-y overflow-hidden max-h-48 overflow-y-auto">
                {checkResult.incomingCommits.map((c) => (
                  <div
                    key={c.hash}
                    className="px-3 py-2 text-xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <GitCommitHorizontal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate font-medium text-foreground">{c.subject}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-muted-foreground text-[11px]">
                      <span>{c.author}</span>
                      <span className="mono bg-muted px-1.5 py-0.5 rounded text-[10px] text-foreground">
                        {c.shortHash}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Update Options */}
          <div className="rounded-lg border bg-card p-3 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Update Options
            </span>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="install-deps" className="text-xs font-medium cursor-pointer">
                  Install dependencies (npm install)
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Automatically runs package installation after git pull
                </p>
              </div>
              <Switch
                id="install-deps"
                checked={installDeps}
                onCheckedChange={setInstallDeps}
                disabled={applying}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="run-build" className="text-xs font-medium cursor-pointer">
                  Build bundle (npm run build)
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Recompiles production output files after update
                </p>
              </div>
              <Switch
                id="run-build"
                checked={runBuild}
                onCheckedChange={setRunBuild}
                disabled={applying}
              />
            </div>
          </div>

          {/* Execution Progress & Terminal Output */}
          {(applying || logs.length > 0 || applyResult) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5" />
                  Terminal Logs
                </span>
                <Badge variant="outline" className="mono text-[10px] uppercase">
                  {currentStep}
                </Badge>
              </div>
              <div className="rounded-lg bg-black/90 p-3 text-emerald-400 font-mono text-[11px] leading-relaxed max-h-40 overflow-y-auto border border-border/40 shadow-inner">
                {logs.length === 0 ? (
                  <span className="text-muted-foreground italic">Waiting for process output…</span>
                ) : (
                  logs.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap break-all">
                      {line}
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>

              {applyResult && (
                <div
                  className={cn(
                    'rounded-lg p-3 text-xs flex items-center justify-between gap-2 border',
                    applyResult.ok
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                      : 'bg-destructive/10 border-destructive/30 text-destructive'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {applyResult.ok ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>
                      {applyResult.ok
                        ? 'Update and dependency installation finished successfully!'
                        : `Update failed: ${applyResult.error}`}
                    </span>
                  </div>

                  {applyResult.ok && isAppSelfUpdate && (
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => void handleRelaunch()}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restart App
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-2 sm:gap-0 pt-2 border-t">
          <Button variant="ghost" size="sm" disabled={applying} onClick={() => onOpenChange(false)}>
            Close
          </Button>

          <Button
            size="sm"
            disabled={
              applying ||
              checking ||
              (!checkResult?.hasUpdate && !checkResult?.isDirty && logs.length === 0)
            }
            onClick={() => void runUpdate()}
            className="gap-1.5"
          >
            {applying ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Updating…
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                {checkResult?.hasUpdate
                  ? `Update (${checkResult.behind} commits)`
                  : 'Pull & Install'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
