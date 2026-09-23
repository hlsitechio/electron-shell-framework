import { useEffect, useState } from 'react'
import { Ban, ChevronRight, Hammer, Play, RefreshCw, SquareTerminal, X } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { EmptyState, GlassCard } from '@renderer/widgets'
import { cn } from '@renderer/lib/utils'
import { useBuilds, useCockpitStore, useSelectedRepo } from '@renderer/stores/cockpit-store'
import type { BuildRun } from '../../../../shared/cockpit-types'

/**
 * Builds — the supervised-child view.
 *
 * A "build" here is a real `npm run <script>` child process in the repo, and
 * every row's state is the child's actual lifecycle (running → passed / failed
 * / cancelled) with its exit code. Output is streamed into the activity rail
 * by the main process; the Output panel below reads the captured buffer back
 * over IPC on demand.
 */

const STATUS_TONE: Record<BuildRun['status'], { color: string; label: string }> = {
  running: { color: 'hsl(var(--warning))', label: 'running' },
  passed: { color: 'hsl(var(--success))', label: 'passed' },
  failed: { color: 'hsl(var(--destructive))', label: 'failed' },
  cancelled: { color: 'hsl(var(--muted-foreground))', label: 'cancelled' }
}

function elapsed(build: BuildRun): string {
  const start = new Date(build.startedAt).getTime()
  const end = build.finishedAt ? new Date(build.finishedAt).getTime() : Date.now()
  const secs = Math.max(0, Math.round((end - start) / 1000))
  if (secs < 60) return `${secs}s`
  return `${Math.floor(secs / 60)}m ${secs % 60}s`
}

export function BuildsPage(): React.JSX.Element {
  const repo = useSelectedRepo()
  const builds = useBuilds()
  const { refresh, loading } = useCockpitStore()
  const [openBuildId, setOpenBuildId] = useState<string | null>(null)
  const [output, setOutput] = useState('')
  const [outputLoading, setOutputLoading] = useState(false)

  // Follow the newest build when nothing is pinned open. Deferred a tick so the
  // state update does not happen synchronously inside the effect body.
  useEffect(() => {
    if (openBuildId || !builds.length) return
    const timer = setTimeout(() => setOpenBuildId(builds[0].id), 0)
    return () => clearTimeout(timer)
  }, [builds, openBuildId])

  // Poll the captured buffer while the selected build is still running, and
  // once on selection for a finished one.
  useEffect(() => {
    if (!openBuildId) return
    let cancelled = false
    const pull = async (): Promise<void> => {
      setOutputLoading(true)
      try {
        const text = await window.api.cockpit.buildOutput(openBuildId)
        if (!cancelled) setOutput(text)
      } finally {
        if (!cancelled) setOutputLoading(false)
      }
    }
    void pull()
    const selected = builds.find((b) => b.id === openBuildId)
    if (selected?.status !== 'running') return () => undefined
    const timer = setInterval(() => void pull(), 1200)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [openBuildId, builds])

  const start = async (script: string): Promise<void> => {
    if (!repo) return
    try {
      const build = await window.api.cockpit.startBuild(repo.id, script)
      setOpenBuildId(build.id)
    } catch {
      /* the refusal reason lands in the activity rail */
    }
  }

  const selected = builds.find((b) => b.id === openBuildId) ?? null

  return (
    <div className="mx-auto flex h-full max-w-[1240px] flex-col gap-4.5 p-6">
      {/* launcher */}
      <GlassCard
        icon={Hammer}
        title={repo ? `Run a script · ${repo.name}` : 'Run a script'}
        subtitle={
          repo
            ? `${repo.scripts.length} npm script${repo.scripts.length === 1 ? '' : 's'} available — supervised child processes`
            : 'Select a repository on the Repos page first'
        }
        action={
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 rounded-lg"
            disabled={loading}
            onClick={() => void refresh(false)}
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            Rescan
          </Button>
        }
      >
        {repo && repo.scripts.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {repo.scripts.map((script) => (
              <button
                key={script}
                type="button"
                className="group/chip inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/70 px-3 py-1.5 text-[11.5px] font-mono font-medium hover:border-primary/50 hover:bg-accent/40 transition-all shadow-2xs cursor-pointer select-none"
                onClick={() => void start(script)}
                title={`npm run ${script} in ${repo.path}`}
              >
                <Play className="h-3 w-3 text-primary group-hover/chip:scale-110 transition-transform" />
                <span>{script}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-muted-foreground">
            {repo
              ? 'This repository has no package.json scripts to run.'
              : 'Pick a repository on the Repos page, then run one of its scripts here.'}
          </p>
        )}
      </GlassCard>

      <div className="flex min-h-0 flex-1 gap-4.5">
        {/* build list */}
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="mono mb-2 text-[10px] uppercase tracking-[0.14em] font-semibold text-muted-foreground/80">
            Build history · {builds.length}
          </p>
          <div className="min-h-0 flex-1 overflow-auto">
            {builds.length === 0 ? (
              <EmptyState
                icon={Hammer}
                title="No builds yet"
                hint="Run any npm script above — the child process, its output and its exit code all land here."
              />
            ) : (
              <div className="glass overflow-hidden rounded-xl border border-border/70">
                {builds.map((build) => {
                  const tone = STATUS_TONE[build.status]
                  const isRunning = build.status === 'running'
                  const isPassed = build.status === 'passed'
                  const isFailed = build.status === 'failed'

                  return (
                    <div
                      key={build.id}
                      className={cn(
                        'group flex cursor-pointer items-center gap-3 px-3.5 py-2.5 transition-all border-b select-none',
                        build.id === openBuildId ? 'bg-accent/40 shadow-xs' : 'hover:bg-accent/20'
                      )}
                      style={{ borderColor: 'hsl(var(--border) / 0.5)' }}
                      onClick={() => setOpenBuildId(build.id)}
                    >
                      <span
                        className={cn('dot shrink-0', isRunning && 'animate-pulse')}
                        style={{
                          background: tone.color,
                          boxShadow: isRunning ? `0 0 8px ${tone.color}` : undefined
                        }}
                      />
                      <div className="min-w-0 flex-[2]">
                        <p className="mono truncate text-[12.5px] font-semibold">
                          npm run {build.script}
                        </p>
                        <p className="mono mt-0.5 truncate text-[10.5px] text-muted-foreground">
                          {build.repoName}
                          {build.pid ? ` · pid ${build.pid}` : ''}
                          {build.lineCount ? ` · ${build.lineCount} lines` : ''}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'mono shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold',
                          isRunning && 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
                          isPassed &&
                            'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
                          isFailed && 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
                          !isRunning &&
                            !isPassed &&
                            !isFailed &&
                            'bg-muted/60 text-muted-foreground'
                        )}
                      >
                        {tone.label}
                      </span>
                      {build.exitCode !== null && (
                        <span className="mono shrink-0 text-[10.5px] text-muted-foreground/80">
                          code {build.exitCode}
                        </span>
                      )}
                      <span className="mono w-[56px] shrink-0 text-right text-[10.5px] text-muted-foreground">
                        {elapsed(build)}
                      </span>
                      {isRunning ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6.5 w-6.5 shrink-0 p-0 rounded hover:bg-destructive/20 hover:text-destructive"
                          title="Cancel this build"
                          onClick={(e) => {
                            e.stopPropagation()
                            void window.api.cockpit.stopBuild(build.id)
                          }}
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* output */}
        <div className="hidden min-w-0 flex-1 flex-col lg:flex">
          <div className="mb-1.5 flex items-center gap-2">
            <p className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Output {selected ? `· npm run ${selected.script}` : ''}
            </p>
            <div className="flex-1" />
            {selected && (
              <>
                <span className="mono text-[10px] text-muted-foreground">
                  {outputLoading ? 'reading…' : `${output.split('\n').length} lines`}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-1.5 text-[10.5px]"
                  onClick={() => void window.api.cockpit.writeClipboard(output)}
                  title="Copy the captured output"
                >
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  title="Stop this build"
                  disabled={selected.status !== 'running'}
                  onClick={() => void window.api.cockpit.stopBuild(selected.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>

          <div className="term mono min-h-0 flex-1 overflow-auto p-3 text-[11px] leading-relaxed">
            {output ? (
              output.split('\n').map((line, i) => (
                <div
                  key={`${i}-${line.slice(0, 12)}`}
                  className="whitespace-pre-wrap break-words"
                  style={{
                    color: /error|failed|err!|✕/i.test(line)
                      ? 'hsl(var(--destructive))'
                      : /✓|passed/i.test(line)
                        ? 'hsl(var(--success))'
                        : 'hsl(var(--foreground) / 0.85)'
                  }}
                >
                  {line || '\u00a0'}
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <SquareTerminal className="mx-auto mb-2 h-4 w-4" />
                  <p>Select a build to read its output.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
