import { BrowserWindow, clipboard, dialog, ipcMain, shell, type IpcMainInvokeEvent } from 'electron'
import { existsSync, mkdirSync } from 'node:fs'
import { store, configFilePath, cloneRoot, setCloneRoot } from './store'
import { BuildSupervisor, setFavouriteScript } from './builds'
import { PtySupervisor, getLastTerminalRepo, setLastTerminalRepo } from './pty'
import { addWorktree, cloneRepo, isRepo, pruneWorktrees, resolveRoot } from './git'
import { getCachedRemoteRepos } from './remote'
import { isTrustedSender } from '../ipc-policy'
import { log } from '../logging'
import {
  branchSchema,
  buildIdSchema,
  colsSchema,
  isGithubUrl,
  isKnownPath,
  isUsableDirectory,
  repoIdSchema,
  rowsSchema,
  scriptSchema,
  terminalInputSchema
} from './validate'

/**
 * The cockpit's IPC surface.
 *
 * Two rules hold everywhere in this file:
 *  1. Every handler is gated by `isTrustedSender` (owned window, top frame, our
 *     document) — the same policy the framework IPC uses.
 *  2. Every renderer-supplied value is validated by zod BEFORE it is used, and
 *     anything that reaches a child process is also checked against live state
 *     (a script must exist in that repo's package.json, a path must be a repo
 *     we actually inspected).
 */

const EVENT_CHANNEL = 'cockpit:event'

function handle(
  channel: string,
  fn: (event: IpcMainInvokeEvent, ...args: never[]) => unknown
): void {
  ipcMain.handle(channel, (event, ...args) => {
    if (!isTrustedSender(event)) {
      log.warn(`[cockpit] rejected unauthorized sender on ${channel}`)
      throw new Error(`[cockpit] unauthorized sender on ${channel}`)
    }
    return fn(event, ...(args as never[]))
  })
}

function windowOf(event: IpcMainInvokeEvent): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender)
}

export interface CockpitIpc {
  builds: BuildSupervisor
  pty: PtySupervisor
  dispose: () => void
}

export function registerCockpitIpc(): CockpitIpc {
  /* ------------------------------------------------------------ supervisors */

  const builds = new BuildSupervisor(
    (event) => store.emit(event),
    (buildId, repoId, text, level) => store.addLog(text, level, repoId, buildId),
    () => {
      store.counters.builds = builds.running
    }
  )

  const pty = new PtySupervisor(
    (event) => store.emit(event),
    () => {
      store.counters.terminals = pty.count
      store.emitSnapshot()
    }
  )

  store.buildsProvider = () => builds.list()
  store.startHeartbeat()

  // A push channel the renderer subscribes to exactly once.
  ipcMain.on('cockpit:subscribe', (event) => {
    if (!isTrustedSender(event)) {
      log.warn('[cockpit] rejected subscribe from untrusted sender')
      return
    }
    const sink = (payload: unknown): void => {
      if (!event.sender.isDestroyed()) event.sender.send(EVENT_CHANNEL, payload)
    }
    const unsubscribe = store.subscribe(sink)
    event.sender.once('destroyed', unsubscribe)
  })

  /* ------------------------------------------------------------------ reads */

  handle('cockpit:snapshot', () => store.snapshot())
  handle('cockpit:heartbeat', () => store.heartbeat())

  handle('cockpit:refresh', async (_e, includeGithub: unknown) => {
    try {
      return await store.refresh(Boolean(includeGithub))
    } catch (err) {
      store.addLog(`Refresh failed: ${String(err)}`, 'error')
      return store.snapshot()
    }
  })

  /* ------------------------------------------------------------- repo admin */

  handle('cockpit:addRepo', async (event) => {
    const win = windowOf(event)
    const result = win
      ? await dialog.showOpenDialog(win, {
          title: 'Add a repository',
          properties: ['openDirectory'],
          buttonLabel: 'Add repo'
        })
      : await dialog.showOpenDialog({ properties: ['openDirectory'] })

    if (result.canceled || !result.filePaths.length) {
      return store.snapshot()
    }

    const picked = result.filePaths[0]
    if (!isUsableDirectory(picked)) {
      store.addLog(`Cannot read ${picked}`, 'error')
      return store.snapshot()
    }

    const root = await resolveRoot(picked)
    if (!root || !(await isRepo(root))) {
      store.addLog(`${picked} is not a git repository — add a folder that contains .git`, 'warn')
      return store.snapshot()
    }

    store.addRepoPath(root)
    store.addLog(`Added repository ${root}`, 'success')
    return store.refresh(false)
  })

  handle('cockpit:removeRepo', (_e, repoId: unknown) => {
    const parsed = repoIdSchema.safeParse(repoId)
    if (!parsed.success) return store.snapshot()
    const removed = store.removeRepoPath(parsed.data)
    if (removed) store.addLog(`Removed ${removed} from the workspace`, 'info')
    return store.refresh(false)
  })

  handle('cockpit:revealRepo', (_e, repoId: unknown) => {
    const parsed = repoIdSchema.safeParse(repoId)
    if (!parsed.success) return false
    const repo = store.findRepo(parsed.data)
    if (!repo) return false
    shell.showItemInFolder(repo.path)
    return true
  })

  handle('cockpit:openPath', async (_e, target: unknown) => {
    if (typeof target !== 'string') return false
    if (target.startsWith('http')) {
      if (!isGithubUrl(target)) return false
      await shell.openExternal(target)
      return true
    }
    // Only paths that belong to a repo we inspected may be opened.
    if (
      !isKnownPath(
        target,
        store.getRepos().map((r) => r.path)
      )
    )
      return false
    await shell.openPath(target)
    return true
  })

  /* --------------------------------------------------------------- worktrees */

  handle('cockpit:createWorktree', async (_e, repoId: unknown, branch: unknown) => {
    const id = repoIdSchema.safeParse(repoId)
    const name = branchSchema.safeParse(branch)
    if (!id.success || !name.success) {
      store.addLog('Invalid worktree request (bad repo id or branch name)', 'warn')
      return store.snapshot()
    }
    const repo = store.findRepo(id.data)
    if (!repo) return store.snapshot()

    store.addLog(`git worktree add -b ${name.data} … (${repo.name})`, 'info')
    const result = await addWorktree(repo.path, name.data)
    store.addLog(result.message, result.ok ? 'success' : 'error')
    return store.refresh(false)
  })

  handle('cockpit:pruneWorktrees', async (_e, repoId: unknown) => {
    const parsed = repoIdSchema.safeParse(repoId)
    if (!parsed.success) return store.snapshot()
    const repo = store.findRepo(parsed.data)
    if (!repo) return store.snapshot()
    const result = await pruneWorktrees(repo.path)
    store.addLog(
      `worktree prune (${repo.name}): ${result.message}`,
      result.ok ? 'success' : 'error'
    )
    return store.refresh(false)
  })

  /* ------------------------------------------------------------------ builds */

  handle('cockpit:startBuild', (_e, repoId: unknown, script: unknown) => {
    const id = repoIdSchema.safeParse(repoId)
    const name = scriptSchema.safeParse(script)
    if (!id.success || !name.success) throw new Error('Invalid build request')

    const repo = store.findRepo(id.data)
    if (!repo) throw new Error('Unknown repository')

    // The script must exist in the repo's own package.json — the renderer
    // cannot ask us to run an arbitrary command.
    if (!repo.scripts.includes(name.data)) {
      store.addLog(`Refused: "${name.data}" is not a script in ${repo.name}/package.json`, 'warn')
      throw new Error('Script not present in package.json')
    }

    setFavouriteScript(repo.id, name.data)
    store.addLog(`Starting build in ${repo.name}: npm run ${name.data}`, 'info')
    return builds.start(repo.id, repo.name, repo.path, name.data, process.env['COMSPEC'] ?? '')
  })

  handle('cockpit:stopBuild', (_e, buildId: unknown) => {
    const parsed = buildIdSchema.safeParse(buildId)
    if (!parsed.success) return false
    return builds.stop(parsed.data)
  })

  handle('cockpit:buildOutput', (_e, buildId: unknown) => {
    const parsed = buildIdSchema.safeParse(buildId)
    if (!parsed.success) return ''
    return builds.getOutput(parsed.data).slice(-200_000)
  })

  /* --------------------------------------------------------------- terminal */

  handle('cockpit:terminalAttach', (_e, repoId: unknown, cols: unknown, rows: unknown) => {
    const id = repoIdSchema.safeParse(repoId)
    const c = colsSchema.safeParse(cols)
    const r = rowsSchema.safeParse(rows)
    if (!id.success || !c.success || !r.success) throw new Error('Invalid terminal attach')

    const repo = store.findRepo(id.data)
    if (!repo) throw new Error('Unknown repository')

    // A repo gets exactly ONE shell. A re-attach (panel reopened, renderer
    // reloaded) reuses the live session and replays its scrollback, so only a
    // genuinely new session is worth a log line.
    const isFirstAttach = !pty.has(repo.id)
    const session = pty.attach(repo.id, repo.path, c.data, r.data)
    setLastTerminalRepo(repo.id)

    if (isFirstAttach) {
      store.addLog(`Terminal attached to ${repo.name} (pid ${session.pid})`, 'success')
    }
    return session
  })

  handle('cockpit:terminalWrite', (_e, repoId: unknown, data: unknown) => {
    const id = repoIdSchema.safeParse(repoId)
    const input = terminalInputSchema.safeParse(data)
    if (!id.success || !input.success) return false
    return pty.write(id.data, input.data)
  })

  handle('cockpit:terminalResize', (_e, repoId: unknown, cols: unknown, rows: unknown) => {
    const id = repoIdSchema.safeParse(repoId)
    const c = colsSchema.safeParse(cols)
    const r = rowsSchema.safeParse(rows)
    if (!id.success || !c.success || !r.success) return false
    return pty.resize(id.data, c.data, r.data)
  })

  handle('cockpit:terminalClose', (_e, repoId: unknown) => {
    const id = repoIdSchema.safeParse(repoId)
    if (!id.success) return false
    const closed = pty.close(id.data)
    if (closed) {
      const repo = store.findRepo(id.data)
      store.addLog(`Terminal closed (${repo?.name ?? id.data})`, 'info')
    }
    return closed
  })

  /* -------------------------------------------------------------- clipboard */

  handle('cockpit:clipboardWrite', (_e, text: unknown) => {
    if (typeof text !== 'string' || text.length > 200_000) return false
    clipboard.writeText(text)
    return true
  })

  /* ------------------------------------------------------------------ misc */

  handle('cockpit:configPath', () => configFilePath())
  handle('cockpit:lastTerminalRepo', () => getLastTerminalRepo())

  /* --------------------------------------------------- remote repo listing */

  handle('cockpit:listRemoteRepos', async (_e, force: unknown) => {
    return store.listRemoteRepos(Boolean(force))
  })

  handle('cockpit:pickCloneParent', async (event) => {
    const win = windowOf(event)
    const result = win
      ? await dialog.showOpenDialog(win, {
          title: 'Where should clones go?',
          properties: ['openDirectory', 'createDirectory'],
          buttonLabel: 'Use this folder'
        })
      : await dialog.showOpenDialog({ properties: ['openDirectory'] })
    if (result.canceled || !result.filePaths.length) return null
    const dir = result.filePaths[0]
    if (!isUsableDirectory(dir)) return null
    setCloneRoot(dir)
    store.addLog(`Clone destination set to ${dir}`, 'success')
    return dir
  })

  /**
   * Clone ONE repo on demand. The slug is validated against the LIVE remote list
   * — the renderer cannot ask us to clone an arbitrary URL or path, and the
   * destination is always a direct child of a directory the user chose.
   */
  handle('cockpit:cloneRepo', async (_e, slug: unknown, parentDir: unknown, full: unknown) => {
    if (typeof slug !== 'string' || !/^[\w.-]+\/[\w.-]+$/.test(slug)) {
      return { ok: false, slug: String(slug), path: null, message: 'Invalid repository slug' }
    }

    const remote = getCachedRemoteRepos()
    if (!remote.repos.some((r) => r.slug.toLowerCase() === slug.toLowerCase())) {
      store.addLog(`Refused: ${slug} is not in the listed GitHub repositor`, 'warn')
      return {
        ok: false,
        slug,
        path: null,
        message: 'Not in the listed GitHub repositories — refresh the list first'
      }
    }

    const parent =
      typeof parentDir === 'string' && isUsableDirectory(parentDir) ? parentDir : cloneRoot()
    try {
      if (!existsSync(parent)) mkdirSync(parent, { recursive: true })
    } catch (err) {
      store.addLog(`Cannot create ${parent}: ${String(err)}`, 'error')
      return { ok: false, slug, path: null, message: `Cannot create ${parent}` }
    }

    const mode = full ? 'full' : 'blobless + depth 1'
    store.addLog(`Cloning ${slug} into ${parent} (${mode})…`, 'info')

    const result = await cloneRepo(slug, parent, Boolean(full), (text) => {
      store.emit({ type: 'clone-progress', slug, text })
    })

    if (result.ok && result.path) {
      store.addRepoPath(result.path)
      store.addLog(`${result.message} — added to the workspace`, 'success')
      await store.refresh(false)
    } else {
      store.addLog(`Clone failed for ${slug}: ${result.message}`, 'error')
    }

    return { ok: result.ok, slug, path: result.path, message: result.message }
  })

  const dispose = (): void => {
    builds.killAll()
    pty.killAll()
    store.stopHeartbeat()
  }

  return { builds, pty, dispose }
}
