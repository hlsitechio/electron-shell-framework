import { existsSync } from 'node:fs'
import { configStore } from '../config-store'
import { log } from '../logging'
import type { CockpitEvent, TerminalSession } from '../../shared/cockpit-types'

/**
 * PTY supervisor — one REAL terminal per repo.
 *
 * node-pty spawns a genuine ConPTY pseudo-console, so what streams back is the
 * shell's own output (ANSI included), not a simulation.
 *
 * Two things this layer owns that are easy to get wrong:
 *  1. Backpressure. The renderer can be slower than a chatty build, so main
 *     buffers output and FLUSHES ON AN INTERVAL instead of emitting per chunk —
 *     otherwise a `npm run dev` that logs in a tight loop floods IPC and the
 *     window stops responding.
 *  2. Teardown. A PTY outlives the window if you let it; every session is
 *     tracked and killed on quit, and each repo gets exactly ONE session (a
 *     second attach reuses it and replays the scrollback).
 */

interface Session {
  repoId: string
  pty: {
    write: (data: string) => void
    resize: (c: number, r: number) => void
    kill: () => void
    pid: number
  }
  pid: number
  shell: string
  cwd: string
  cols: number
  rows: number
  /** pending output not yet flushed to the renderer */
  pending: string
  buffer: string
  sequence: number
}

const FLUSH_MS = 40
const MAX_BUFFER = 400_000
const MAX_INPUT = 65536

export class PtySupervisor {
  private sessions = new Map<string, Session>()
  private flushTimer: NodeJS.Timeout | null = null

  constructor(
    private readonly emit: (event: CockpitEvent) => void,
    private readonly onCountChange: () => void
  ) {}

  get count(): number {
    return this.sessions.size
  }

  has(repoId: string): boolean {
    return this.sessions.has(repoId)
  }

  /** Preferred shell: PowerShell on Windows, $SHELL elsewhere. */
  private shellPath(): string {
    if (process.platform === 'win32') {
      const candidates = [
        'C:\\Program Files\\PowerShell\\7\\pwsh.exe',
        'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
      ]
      for (const c of candidates) {
        try {
          if (existsSync(c)) return c
        } catch {
          /* keep looking */
        }
      }
      return process.env['COMSPEC'] || 'cmd.exe'
    }
    return process.env['SHELL'] || '/bin/bash'
  }

  shellLabel(): string {
    return this.shellPath().split(/[\\/]/).pop() ?? 'shell'
  }

  private startFlushing(): void {
    if (this.flushTimer) return
    this.flushTimer = setInterval(() => {
      for (const session of this.sessions.values()) {
        if (!session.pending) continue
        const data = session.pending
        session.pending = ''
        session.sequence += 1
        this.emit({
          type: 'terminal-data',
          repoId: session.repoId,
          data,
          sequence: session.sequence,
          pid: session.pid
        })
      }
    }, FLUSH_MS)
    this.flushTimer.unref?.()
  }

  private stopFlushingIfIdle(): void {
    if (this.sessions.size > 0 || !this.flushTimer) return
    clearInterval(this.flushTimer)
    this.flushTimer = null
  }

  /** Scrollback for a re-attach, so opening the panel twice is not a blank screen. */
  replay(repoId: string): string {
    return this.sessions.get(repoId)?.buffer ?? ''
  }

  attach(repoId: string, cwd: string, cols: number, rows: number): TerminalSession {
    const existing = this.sessions.get(repoId)
    if (existing) {
      existing.cols = cols
      existing.rows = rows
      try {
        existing.pty.resize(cols, rows)
      } catch {
        /* pty may have exited between checks */
      }
      return {
        repoId,
        pid: existing.pid,
        shell: existing.shell,
        cwd: existing.cwd,
        cols,
        rows
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pty = require('node-pty') as typeof import('node-pty')
    const shell = this.shellPath()
    const workingDir = existsSync(cwd) ? cwd : process.env['USERPROFILE'] || process.cwd()

    const child = pty.spawn(shell, process.platform === 'win32' ? ['-NoLogo'] : ['-l'], {
      name: 'xterm-256color',
      cols,
      rows,
      cwd: workingDir,
      env: { ...process.env, TERM: 'xterm-256color' } as Record<string, string>
    })

    const session: Session = {
      repoId,
      pty: child,
      pid: child.pid,
      shell,
      cwd: workingDir,
      cols,
      rows,
      pending: '',
      buffer: '',
      sequence: 0
    }
    this.sessions.set(repoId, session)
    this.onCountChange()
    this.startFlushing()

    child.onData((data: string) => {
      const current = this.sessions.get(repoId)
      if (!current) return
      current.pending += data
      current.buffer += data
      if (current.buffer.length > MAX_BUFFER) {
        current.buffer = current.buffer.slice(current.buffer.length - MAX_BUFFER)
      }
    })

    child.onExit(({ exitCode }) => {
      const current = this.sessions.get(repoId)
      if (current) {
        // Flush whatever the shell said on its way out before announcing exit.
        if (current.pending) {
          this.emit({
            type: 'terminal-data',
            repoId,
            data: current.pending,
            sequence: ++current.sequence,
            pid: current.pid
          })
          current.pending = ''
        }
        this.sessions.delete(repoId)
      }
      this.onCountChange()
      this.stopFlushingIfIdle()
      this.emit({ type: 'terminal-exit', repoId, exitCode })
    })

    log.info(`[cockpit] pty attached repo=${repoId} pid=${child.pid} shell=${shell}`)

    // A first prompt, so the panel never looks dead on open.
    this.write(repoId, process.platform === 'win32' ? 'Write-Host ""\r' : 'printf "\\n"\n')

    return { repoId, pid: child.pid, shell, cwd: workingDir, cols, rows }
  }

  write(repoId: string, data: string): boolean {
    const session = this.sessions.get(repoId)
    if (!session) return false
    if (data.length > MAX_INPUT) return false
    try {
      session.pty.write(data)
      return true
    } catch (err) {
      log.warn('[cockpit] pty write failed:', String(err))
      return false
    }
  }

  resize(repoId: string, cols: number, rows: number): boolean {
    const session = this.sessions.get(repoId)
    if (!session) return false
    try {
      session.pty.resize(cols, rows)
      session.cols = cols
      session.rows = rows
      return true
    } catch {
      return false
    }
  }

  close(repoId: string): boolean {
    const session = this.sessions.get(repoId)
    if (!session) return false
    try {
      session.pty.kill()
    } catch (err) {
      log.warn('[cockpit] pty kill failed:', String(err))
    }
    this.sessions.delete(repoId)
    this.onCountChange()
    this.stopFlushingIfIdle()
    return true
  }

  killAll(): void {
    for (const [repoId] of this.sessions) this.close(repoId)
    this.stopFlushingIfIdle()
  }
}

/** Persisted user preference: which repo the terminal panel opens on. */
const LAST_REPO_KEY = 'cockpit:lastTerminalRepo'

export function getLastTerminalRepo(): string | null {
  return configStore.get<string | null>(LAST_REPO_KEY, null)
}

export function setLastTerminalRepo(repoId: string): void {
  configStore.set(LAST_REPO_KEY as never, repoId as never)
}
