import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Eraser, Plus, RotateCw, SquareTerminal, X } from 'lucide-react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { Button } from '@renderer/components/ui/button'
import { cn } from '@renderer/lib/utils'
import { useCockpitStore, useRepos } from '@renderer/stores/cockpit-store'

/**
 * The bottom panel — a REAL terminal, one PTY per repo.
 *
 * xterm.js renders; node-pty (in the main process) is the actual shell. Nothing
 * here simulates output: keystrokes go out over IPC to the pseudo-console and
 * the shell's bytes come back.
 *
 * Three details that make it feel native:
 *  - FitAddon + a ResizeObserver, so the PTY receives real cols/rows on every
 *    panel resize instead of a fixed 80x24.
 *  - The xterm theme is rebuilt from the live CSS tokens and re-applied when
 *    `data-theme` / `data-preset` change, so the terminal follows the app's
 *    theme rather than staying a black box.
 *  - Switching repo disposes and re-attaches, so you can never type into the
 *    wrong repo's shell.
 */

/** Build an xterm theme out of the active token set. */
function themeFromTokens(): Record<string, string> {
  const cs = getComputedStyle(document.documentElement)
  const token = (name: string, fallback: string): string => {
    const raw = cs.getPropertyValue(name).trim()
    return raw ? `hsl(${raw})` : fallback
  }
  return {
    background: token('--background', '#121212'),
    foreground: token('--foreground', '#e6e6e6'),
    cursor: token('--primary', '#a6a6a6'),
    cursorAccent: token('--background', '#121212'),
    selectionBackground: `hsl(${cs.getPropertyValue('--primary').trim()} / 0.3)`,
    black: token('--muted', '#1f1f1f'),
    red: token('--destructive', '#a35'),
    green: token('--success', '#4a8'),
    yellow: token('--warning', '#a86'),
    blue: token('--primary', '#888'),
    magenta: token('--chart-5', '#a7a'),
    cyan: token('--chart-1', '#7aa'),
    white: token('--foreground', '#ddd'),
    brightBlack: token('--muted-foreground', '#888'),
    brightRed: token('--destructive', '#c66'),
    brightGreen: token('--success', '#6b9'),
    brightYellow: token('--warning', '#ca9'),
    brightBlue: token('--primary', '#aaa'),
    brightMagenta: token('--chart-5', '#c9c'),
    brightCyan: token('--chart-1', '#9cc'),
    brightWhite: token('--card-foreground', '#fff')
  }
}

export function CockpitTerminal(): React.JSX.Element {
  const repos = useRepos()
  const { terminalRepoId, setTerminalRepoId } = useCockpitStore()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitRef = useRef<FitAddon | null>(null)
  const [session, setSession] = useState<{ pid: number; shell: string; cwd: string } | null>(null)
  const [status, setStatus] = useState<'idle' | 'attaching' | 'live' | 'exited' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')
  /**
   * The repo the terminal targets. Held in a ref so xterm's `onData` — which is
   * registered once for the component's lifetime — always writes to the CURRENT
   * session. Mirrored in an effect (never during render: mutating a ref while
   * rendering breaks React's purity contract and can desync the shell).
   */
  const activeRepoIdRef = useRef<string | null>(null)

  // Default to the selected repo, then the first one, so the panel is never blank.
  useEffect(() => {
    if (terminalRepoId) return
    const first = repos[0]
    if (first) setTerminalRepoId(first.id)
  }, [repos, terminalRepoId, setTerminalRepoId])

  const activeRepo = useMemo(
    () => repos.find((r) => r.id === terminalRepoId) ?? null,
    [repos, terminalRepoId]
  )

  /* ------------------------------------------------------------- terminal */

  useEffect(() => {
    if (!hostRef.current || termRef.current) return

    const term = new Terminal({
      fontFamily: 'Cascadia Mono, Consolas, ui-monospace, monospace',
      fontSize: 12,
      lineHeight: 1.25,
      cursorBlink: true,
      convertEol: false,
      scrollback: 5000,
      allowProposedApi: true,
      theme: themeFromTokens()
    })
    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(hostRef.current)
    termRef.current = term
    fitRef.current = fit

    try {
      fit.fit()
    } catch {
      /* host not measured yet — the observer will fit shortly */
    }

    // Follow the app's theme: re-read the tokens whenever the shell changes them.
    const observer = new MutationObserver(() => {
      term.options.theme = themeFromTokens()
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-preset', 'class', 'style']
    })

    const onResize = new ResizeObserver(() => {
      try {
        fit.fit()
        const repoId = activeRepoIdRef.current
        if (repoId) void window.api.cockpit.terminalResize(repoId, term.cols, term.rows)
      } catch {
        /* transient during layout */
      }
    })
    onResize.observe(hostRef.current)

    term.onData((data) => {
      const repoId = activeRepoIdRef.current
      if (repoId) void window.api.cockpit.terminalWrite(repoId, data)
    })

    return () => {
      observer.disconnect()
      onResize.disconnect()
      term.dispose()
      termRef.current = null
      fitRef.current = null
    }
  }, [])

  /* ------------------------------------------------------------- terminal */

  const attach = useCallback(async (repoId: string): Promise<void> => {
    const term = termRef.current
    if (!term) return
    setStatus('attaching')
    setMessage('')
    try {
      const cols = Math.max(term.cols || 80, 2)
      const rows = Math.max(term.rows || 24, 1)
      const s = await window.api.cockpit.terminalAttach(repoId, cols, rows)
      setSession({ pid: s.pid, shell: s.shell, cwd: s.cwd })
      setStatus('live')
      term.focus()
    } catch (err) {
      setStatus('error')
      setMessage(String(err).replace(/^Error:\s*/, ''))
    }
  }, [])

  // Re-attach whenever the target repo changes.
  useEffect(() => {
    const term = termRef.current
    if (!term || !terminalRepoId) return
    activeRepoIdRef.current = terminalRepoId
    term.reset()
    void attach(terminalRepoId)
  }, [terminalRepoId, attach])

  /* ----------------------------------------------------------- event pump */

  useEffect(() => {
    const api = window.api?.cockpit
    if (!api) return

    // A dedicated subscription: the terminal is the only consumer of PTY bytes.
    const unsubscribe = api.onEvent((event) => {
      if (event.type === 'terminal-data') {
        if (event.repoId !== activeRepoIdRef.current) return
        termRef.current?.write(event.data)
      } else if (event.type === 'terminal-exit') {
        if (event.repoId !== activeRepoIdRef.current) return
        setStatus('exited')
        termRef.current?.write(
          `\r\n\x1b[38;5;244m— shell exited (code ${event.exitCode}) — press Restart to open a new one —\x1b[0m\r\n`
        )
      }
    })
    return unsubscribe
  }, [])

  // A window resize can change cols without the host box changing.
  useEffect(() => {
    const onWinResize = (): void => {
      try {
        fitRef.current?.fit()
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('resize', onWinResize)
    return () => window.removeEventListener('resize', onWinResize)
  }, [])

  /* ---------------------------------------------------------------- actions */

  const restart = async (): Promise<void> => {
    if (!terminalRepoId) return
    await window.api.cockpit.terminalClose(terminalRepoId)
    termRef.current?.reset()
    await attach(terminalRepoId)
  }

  const close = async (): Promise<void> => {
    if (!terminalRepoId) return
    await window.api.cockpit.terminalClose(terminalRepoId)
    setStatus('idle')
    setSession(null)
    termRef.current?.write('\r\n\x1b[38;5;244m— terminal closed —\x1b[0m\r\n')
  }

  const statusTone =
    status === 'live'
      ? 'hsl(var(--success))'
      : status === 'error'
        ? 'hsl(var(--destructive))'
        : status === 'exited'
          ? 'hsl(var(--warning))'
          : 'hsl(var(--muted-foreground))'

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* toolbar */}
      <div
        className="flex h-8 shrink-0 items-center gap-2 px-3"
        style={{ borderBottom: '1px solid hsl(var(--border))' }}
      >
        <SquareTerminal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

        {/* repo tabs — one PTY each */}
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
          {repos.length === 0 && (
            <span className="mono text-[10.5px] text-muted-foreground">no repositories</span>
          )}
          {repos.map((repo) => {
            const isActive = repo.id === terminalRepoId
            return (
              <button
                key={repo.id}
                type="button"
                onClick={() => setTerminalRepoId(repo.id)}
                className={cn(
                  'mono shrink-0 rounded px-2 py-0.5 text-[10.5px] transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
                style={isActive ? { background: 'hsl(var(--accent))' } : undefined}
                title={repo.path}
              >
                {repo.name}
              </button>
            )
          })}
        </div>

        <div className="flex-1" />

        <span className="mono inline-flex shrink-0 items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="dot" style={{ background: statusTone }} />
          {status === 'live' && session
            ? `${session.shell.split(/[\\/]/).pop()} · pid ${session.pid}`
            : status}
        </span>

        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          title="Clear the screen"
          onClick={() => termRef.current?.clear()}
        >
          <Eraser className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          title="Restart the shell in this repo"
          onClick={() => void restart()}
        >
          <RotateCw className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          title="Close the shell"
          onClick={() => void close()}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* cwd strip */}
      {activeRepo && (
        <div
          className="mono flex h-6 shrink-0 items-center gap-2 px-3 text-[10px] text-muted-foreground"
          style={{ borderBottom: '1px solid hsl(var(--border))' }}
        >
          <span className="truncate">{session?.cwd ?? activeRepo.path}</span>
          {status === 'error' && (
            <span className="shrink-0" style={{ color: 'hsl(var(--destructive))' }}>
              {message}
            </span>
          )}
        </div>
      )}

      {/* xterm host */}
      <div
        className="min-h-0 flex-1 overflow-hidden"
        style={{ background: 'hsl(var(--background))' }}
      >
        <div ref={hostRef} className="h-full w-full px-2 py-1" />
      </div>

      {repos.length === 0 && (
        <div className="mono px-3 pb-2 text-[10.5px] text-muted-foreground">
          <Plus className="mr-1 inline h-3 w-3" />
          add a repository to open a shell in it
        </div>
      )}
    </div>
  )
}
