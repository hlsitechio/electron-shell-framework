import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { IdeDetectionResult, IdeTarget } from '../../shared/cockpit-types'
import { run } from './exec'

/**
 * IDE detection & launcher service.
 * Supports Antigravity, Cursor, VS Code, Windsurf, Explorer, and Windows Terminal.
 */

function getKnownIdePaths(): Record<IdeTarget, string[]> {
  const localAppData = process.env.LOCALAPPDATA || ''
  const programFiles = process.env.ProgramFiles || 'C:\\Program Files'
  const isWin = process.platform === 'win32'

  if (!isWin) {
    return {
      antigravity: [
        '/usr/local/bin/antigravity',
        '/Applications/Antigravity.app/Contents/MacOS/Antigravity'
      ],
      cursor: ['/usr/local/bin/cursor', '/Applications/Cursor.app/Contents/MacOS/Cursor'],
      code: [
        '/usr/local/bin/code',
        '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'
      ],
      windsurf: ['/usr/local/bin/windsurf', '/Applications/Windsurf.app/Contents/MacOS/Windsurf'],
      explorer: ['open', 'xdg-open'],
      terminal: ['open', 'x-terminal-emulator']
    }
  }

  return {
    antigravity: [
      join(localAppData, 'Programs', 'antigravity', 'Antigravity.exe'),
      join(programFiles, 'antigravity', 'Antigravity.exe')
    ],
    cursor: [
      join(localAppData, 'Programs', 'cursor', 'Cursor.exe'),
      join(localAppData, 'Programs', 'cursor', 'bin', 'cursor.cmd'),
      join(programFiles, 'cursor', 'Cursor.exe')
    ],
    code: [
      join(localAppData, 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd'),
      join(localAppData, 'Programs', 'Microsoft VS Code', 'Code.exe'),
      join(programFiles, 'Microsoft VS Code', 'bin', 'code.cmd')
    ],
    windsurf: [
      join(localAppData, 'Programs', 'Windsurf', 'Windsurf.exe'),
      join(localAppData, 'Programs', 'Windsurf', 'bin', 'windsurf.cmd'),
      join(programFiles, 'Windsurf', 'Windsurf.exe')
    ],
    explorer: ['explorer.exe'],
    terminal: ['wt.exe', 'powershell.exe', 'cmd.exe']
  }
}

/** Check if command or path is available */
async function isIdeAvailable(
  target: IdeTarget
): Promise<{ available: boolean; executablePath?: string }> {
  if (target === 'explorer' || target === 'terminal') {
    return { available: true }
  }

  const paths = getKnownIdePaths()[target]
  for (const p of paths) {
    if (existsSync(p)) {
      return { available: true, executablePath: p }
    }
  }

  // Check PATH with `where` (Windows) or `which` (Unix)
  const lookupCmd = process.platform === 'win32' ? 'where.exe' : 'which'
  const res = await run(lookupCmd, [target], { timeoutMs: 3000 })
  if (res.ok && res.stdout.trim()) {
    const firstMatch = res.stdout.trim().split('\n')[0]?.trim()
    return { available: true, executablePath: firstMatch }
  }

  return { available: false }
}

/** Detect which IDEs are installed on the local machine */
export async function detectInstalledIdes(): Promise<IdeDetectionResult> {
  const [antigravity, cursor, code, windsurf] = await Promise.all([
    isIdeAvailable('antigravity'),
    isIdeAvailable('cursor'),
    isIdeAvailable('code'),
    isIdeAvailable('windsurf')
  ])

  const installed: Record<IdeTarget, boolean> = {
    antigravity: antigravity.available,
    cursor: cursor.available,
    code: code.available,
    windsurf: windsurf.available,
    explorer: true,
    terminal: true
  }

  let defaultIde: IdeTarget = 'explorer'
  if (antigravity.available) defaultIde = 'antigravity'
  else if (cursor.available) defaultIde = 'cursor'
  else if (code.available) defaultIde = 'code'
  else if (windsurf.available) defaultIde = 'windsurf'

  return { installed, defaultIde }
}

/** Launch target repository in preferred or requested IDE */
export async function launchInIde(repoPath: string, requestedIde?: IdeTarget): Promise<boolean> {
  const detection = await detectInstalledIdes()
  const ide =
    requestedIde && detection.installed[requestedIde] ? requestedIde : detection.defaultIde

  try {
    if (ide === 'explorer') {
      if (process.platform === 'win32') {
        spawn('explorer.exe', [repoPath], { detached: true, stdio: 'ignore' }).unref()
      } else if (process.platform === 'darwin') {
        spawn('open', [repoPath], { detached: true, stdio: 'ignore' }).unref()
      } else {
        spawn('xdg-open', [repoPath], { detached: true, stdio: 'ignore' }).unref()
      }
      return true
    }

    if (ide === 'terminal') {
      if (process.platform === 'win32') {
        const wtCheck = await run('where.exe', ['wt.exe'], { timeoutMs: 2000 })
        if (wtCheck.ok) {
          spawn('wt.exe', ['-d', repoPath], { detached: true, stdio: 'ignore' }).unref()
        } else {
          spawn('powershell.exe', ['-NoExit', '-Command', `Set-Location "${repoPath}"`], {
            detached: true,
            stdio: 'ignore'
          }).unref()
        }
      } else if (process.platform === 'darwin') {
        spawn('open', ['-a', 'Terminal', repoPath], { detached: true, stdio: 'ignore' }).unref()
      } else {
        spawn('x-terminal-emulator', ['--working-directory', repoPath], {
          detached: true,
          stdio: 'ignore'
        }).unref()
      }
      return true
    }

    // Antigravity, Cursor, VS Code, Windsurf
    const status = await isIdeAvailable(ide)
    if (!status.available) {
      // Fallback to explorer if requested IDE is missing
      return launchInIde(repoPath, 'explorer')
    }

    const exe = status.executablePath || (process.platform === 'win32' ? `${ide}.cmd` : ide)
    spawn(exe, [repoPath], {
      detached: true,
      stdio: 'ignore',
      windowsHide: false
    }).unref()

    return true
  } catch (err) {
    return false
  }
}
