import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'

export interface RunResult {
  ok: boolean
  code: number | null
  stdout: string
  stderr: string
  /** present when the binary itself could not be started (ENOENT, EACCES, timeout) */
  error?: string
}

export interface RunOptions {
  cwd?: string
  timeoutMs?: number
  env?: NodeJS.ProcessEnv
}

/**
 * Run a binary with an argument ARRAY — never a shell string.
 *
 * Nothing in this app concatenates user input into a command line: every call
 * site passes a fixed binary plus discrete argv entries, so a repo path or a
 * branch name containing `&`, `|` or `"` cannot break out into a new command.
 */
export function run(cmd: string, args: string[], options: RunOptions = {}): Promise<RunResult> {
  const { cwd, timeoutMs = 20000, env } = options

  return new Promise((resolve) => {
    let settled = false
    const finish = (result: RunResult): void => {
      if (settled) return
      settled = true
      resolve(result)
    }

    let child
    try {
      child = execFile(
        cmd,
        args,
        {
          cwd,
          timeout: timeoutMs,
          windowsHide: true,
          maxBuffer: 12 * 1024 * 1024,
          encoding: 'utf8',
          env: { ...process.env, ...env, GIT_OPTIONAL_LOCKS: '0' }
        },
        (err, stdout, stderr) => {
          const code =
            err && typeof (err as { code?: unknown }).code === 'number'
              ? ((err as { code?: number }).code ?? null)
              : err
                ? 1
                : 0
          finish({
            ok: !err,
            code,
            stdout: stdout ?? '',
            stderr: stderr ?? '',
            error: err ? String((err as Error).message) : undefined
          })
        }
      )
    } catch (err) {
      finish({ ok: false, code: null, stdout: '', stderr: '', error: String(err) })
      return
    }

    child.on('error', (err) => {
      finish({ ok: false, code: null, stdout: '', stderr: '', error: String(err.message) })
    })
  })
}

/** sha1 hex, truncated — stable id for a path without leaking the path itself. */
export function hashId(input: string): string {
  return createHash('sha1').update(input).digest('hex').slice(0, 16)
}
