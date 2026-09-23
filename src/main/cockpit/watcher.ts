import { existsSync, watch, type FSWatcher } from 'node:fs'
import { join } from 'node:path'
import { log } from '../logging'

/**
 * Background Git Filesystem Watcher.
 *
 * Monitors `.git/HEAD`, `.git/index`, and `.git/refs/heads` for all active
 * workspace repositories. When an external change happens (VS Code, terminal,
 * git checkout/commit), it debounces and triggers a refresh callback so the
 * UI stays 100% reactive with zero polling overhead.
 */
export class GitWatcher {
  private watchers = new Map<string, FSWatcher[]>()
  private debounceTimer: NodeJS.Timeout | null = null

  constructor(private readonly onGitChange: () => void) {}

  /** Update watched repository paths */
  syncPaths(paths: string[]): void {
    const currentPaths = new Set(paths)

    // Remove watchers for dropped paths
    for (const [p, list] of this.watchers.entries()) {
      if (!currentPaths.has(p)) {
        for (const w of list) {
          try {
            w.close()
          } catch {}
        }
        this.watchers.delete(p)
      }
    }

    // Add watchers for new paths
    for (const p of paths) {
      if (!this.watchers.has(p)) {
        this.watchRepo(p)
      }
    }
  }

  private trigger(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer)
    this.debounceTimer = setTimeout(() => {
      try {
        this.onGitChange()
      } catch (err) {
        log.warn('[git-watcher] onGitChange trigger failed:', String(err))
      }
    }, 400)
  }

  private watchRepo(repoPath: string): void {
    const gitDir = join(repoPath, '.git')
    if (!existsSync(gitDir)) return

    const targets = [join(gitDir, 'HEAD'), join(gitDir, 'index'), join(gitDir, 'refs', 'heads')]

    const list: FSWatcher[] = []
    for (const target of targets) {
      if (!existsSync(target)) continue
      try {
        const w = watch(target, () => {
          this.trigger()
        })
        list.push(w)
      } catch {
        /* ignore watch permission/file lock issues */
      }
    }

    if (list.length > 0) {
      this.watchers.set(repoPath, list)
    }
  }

  dispose(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer)
    for (const list of this.watchers.values()) {
      for (const w of list) {
        try {
          w.close()
        } catch {}
      }
    }
    this.watchers.clear()
  }
}
