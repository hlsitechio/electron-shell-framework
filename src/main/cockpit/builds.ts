import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { configStore } from '../config-store'
import { log } from '../logging'
import type { CockpitEvent } from '../../shared/cockpit-types'

/**
 * Build supervisor: runs `npm run <script>` in a repo as a supervised child.
 *
 * Design notes
 * ------------
 * - The script name is validated against the repo's OWN package.json scripts
 *   (see ipc.ts) before it reaches here, so this layer never invents a command.
 * - Output is captured line-by-line and pushed to the activity rail, which is
 *   what makes the right panel a real log rather than a placeholder.
 * - Every child is tracked by id so it can be cancelled, and all children are
 *   killed on app quit — an orphaned `npm run dev` is the classic desktop-app
 *   leak.
 */

export interface BuildRecord {
  id: string
  repoId: string
  repoName: string
  script: string
  status: 'running' | 'passed' | 'failed' | 'cancelled'
  startedAt: string
  finishedAt: string | null
  exitCode: number | null
  pid: number | null
  lineCount: number
}

const MAX_OUTPUT = 4000

export class BuildSupervisor {
  private builds = new Map<string, BuildRecord>()
  private children = new Map<string, { kill: () => void }>()
  private output = new Map<string, string[]>()
  private seq = 0

  constructor(
    private readonly emit: (event: CockpitEvent) => void,
    private readonly onLine: (
      buildId: string,
      repoId: string,
      text: string,
      level: 'info' | 'success' | 'error' | 'warn'
    ) => void,
    private readonly onCountChange: () => void
  ) {}

  list(): BuildRecord[] {
    return [...this.builds.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  }

  get(id: string): BuildRecord | undefined {
    return this.builds.get(id)
  }

  getOutput(id: string): string {
    return (this.output.get(id) ?? []).join('\n')
  }

  /** Which npm runner to use — npm.cmd is required on Windows without a shell. */
  private npmCommand(): string {
    return process.platform === 'win32' ? 'npm.cmd' : 'npm'
  }

  private push(record: BuildRecord): void {
    this.builds.set(record.id, record)
    this.emit({ type: 'build', build: record })
  }

  start(
    repoId: string,
    repoName: string,
    repoPath: string,
    script: string,
    shellPath: string
  ): BuildRecord {
    const id = `build_${Date.now()}_${++this.seq}`
    const record: BuildRecord = {
      id,
      repoId,
      repoName,
      script,
      status: 'running',
      startedAt: new Date().toISOString(),
      finishedAt: null,
      exitCode: null,
      pid: null,
      lineCount: 0
    }
    this.push(record)
    this.output.set(id, [])
    this.onLine(id, repoId, `▶ npm run ${script} — ${repoName}`, 'info')

    const opts = {
      cwd: existsSync(repoPath) ? repoPath : undefined,
      windowsHide: true,
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
      // npm.cmd is a batch shim: without a shell Windows refuses to spawn it.
      shell: process.platform === 'win32'
    }

    let child
    try {
      child = spawn(this.npmCommand(), ['run', script], opts)
    } catch (err) {
      this.finish(id, null, `spawn failed: ${String(err)}`)
      return record
    }

    record.pid = child.pid ?? null
    this.push(record)
    this.children.set(id, { kill: () => child.kill() })
    this.onCountChange()

    const handleChunk = (chunk: Buffer, level: 'info' | 'error'): void => {
      const text = chunk.toString('utf8')
      for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trimEnd()
        if (!trimmed) continue
        const lines = this.output.get(id) ?? []
        lines.push(trimmed)
        if (lines.length > MAX_OUTPUT) lines.splice(0, lines.length - MAX_OUTPUT)
        this.output.set(id, lines)
        const current = this.builds.get(id)
        if (current) {
          current.lineCount = lines.length
          this.builds.set(id, current)
        }
        const lowered = trimmed.toLowerCase()
        const resolvedLevel = /error|failed|cannot|not found|err!/.test(lowered) ? 'error' : level
        this.onLine(id, repoId, trimmed, resolvedLevel)
      }
    }

    child.stdout?.on('data', (chunk: Buffer) => handleChunk(chunk, 'info'))
    child.stderr?.on('data', (chunk: Buffer) => handleChunk(chunk, 'error'))

    child.on('error', (err) => {
      this.finish(id, null, `child error: ${err.message}`)
    })

    child.on('close', (code) => {
      const current = this.builds.get(id)
      if (current?.status === 'running') {
        this.finish(id, code, null)
      }
    })

    void shellPath
    return this.builds.get(id) ?? record
  }

  private finish(id: string, code: number | null, note: string | null): void {
    const record = this.builds.get(id)
    if (!record) return
    record.status = record.status === 'cancelled' ? 'cancelled' : code === 0 ? 'passed' : 'failed'
    record.exitCode = code
    record.finishedAt = new Date().toISOString()
    this.builds.set(id, record)
    this.children.delete(id)
    this.emit({ type: 'build', build: record })

    const suffix = note ? ` (${note})` : ''
    const level =
      record.status === 'passed' ? 'success' : record.status === 'cancelled' ? 'warn' : 'error'
    this.onLine(
      id,
      record.repoId,
      `${record.status === 'passed' ? '✓' : record.status === 'cancelled' ? '■' : '✕'} npm run ${record.script} → ${record.status} (exit ${code ?? 'n/a'})${suffix}`,
      level
    )
    this.onCountChange()
  }

  stop(id: string): boolean {
    const child = this.children.get(id)
    if (!child) return false
    const record = this.builds.get(id)
    if (record) {
      record.status = 'cancelled'
      this.builds.set(id, record)
      this.emit({ type: 'build', build: record })
    }
    this.onLine(id, record?.repoId ?? '', `■ cancelled npm run ${record?.script ?? '?'}`, 'warn')
    try {
      child.kill()
    } catch (err) {
      log.warn('[cockpit] build kill failed:', String(err))
    }
    this.children.delete(id)
    this.onCountChange()
    return true
  }

  /** App quit — never leave a build running after the window is gone. */
  killAll(): void {
    for (const [id] of this.children) {
      try {
        this.children.get(id)?.kill()
      } catch {
        /* already gone */
      }
    }
    this.children.clear()
  }

  get running(): number {
    return this.children.size
  }
}

/** Persisted per-repo favourite scripts, so the UI can lead with what you use. */
const FAV_KEY = 'cockpit:favScripts'

export function getFavouriteScripts(): Record<string, string> {
  const stored = configStore.get<object>(FAV_KEY, {})
  return stored !== null && typeof stored === 'object' ? (stored as Record<string, string>) : {}
}

export function setFavouriteScript(repoId: string, script: string): void {
  const current = getFavouriteScripts()
  current[repoId] = script
  configStore.set(FAV_KEY as never, current as never)
}
