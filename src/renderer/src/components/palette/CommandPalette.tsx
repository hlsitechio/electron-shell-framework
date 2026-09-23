import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  Code,
  Download,
  Folder,
  FolderGit2,
  FolderTree,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  Globe,
  Hammer,
  LayoutGrid,
  Moon,
  Palette,
  Plus,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
  Sidebar as SidebarIcon,
  Sparkles,
  SquareTerminal,
  Sun,
  Zap
} from 'lucide-react'
import { Dialog, DialogContent } from '@renderer/components/ui/dialog'
import { useCockpitStore, useRepos, useSelectedRepo } from '@renderer/stores/cockpit-store'
import { useTabsStore } from '@renderer/stores/tabs-store'
import { useUiStore } from '@renderer/stores/ui-store'
import { useTheme } from '@renderer/components/theme/ThemeProvider'
import { cn } from '@renderer/lib/utils'
import type { IdeTarget, Repo } from '../../../../shared/cockpit-types'

interface PaletteItem {
  id: string
  label: string
  description?: string
  category: string
  icon: React.ComponentType<{ className?: string }>
  shortcut?: string
  keywords?: string[]
  run: () => void
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenDiff?: (repo: Repo) => void
  onOpenBranches?: (repo: Repo) => void
  onOpenUpdate?: (repo: Repo) => void
}

export function CommandPalette({
  open,
  onOpenChange,
  onOpenDiff,
  onOpenBranches,
  onOpenUpdate
}: CommandPaletteProps): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const repos = useRepos()
  const selectedRepo = useSelectedRepo()
  const { selectRepo, refresh, addRepo } = useCockpitStore()
  const { setActive } = useTabsStore()
  const { toggleBottom, toggleLeft, toggleRight } = useUiStore()
  const { theme, toggleTheme } = useTheme()

  const listRef = useRef<HTMLDivElement | null>(null)

  const handleLaunchIde = async (repo: Repo, target: IdeTarget) => {
    try {
      await window.api?.cockpit?.openInIde?.(repo.path, target)
    } catch {
      /* ignore */
    }
  }

  // Build the complete command catalog
  const items = useMemo<PaletteItem[]>(() => {
    const list: PaletteItem[] = []

    // 1. Contextual Repo Actions (for selected repo)
    if (selectedRepo) {
      list.push(
        {
          id: 'repo-diff',
          label: `Diff & Stage: ${selectedRepo.name}`,
          description: `Visual diff viewer and conventional commit (${selectedRepo.dirtyCount} changed)`,
          category: 'Active Repository',
          icon: GitCommitHorizontal,
          keywords: ['git', 'diff', 'stage', 'commit', 'changes', selectedRepo.name],
          run: () => onOpenDiff?.(selectedRepo)
        },
        {
          id: 'repo-branches',
          label: `Switchboard: ${selectedRepo.name}`,
          description: `Switch branches, checkout or prune merged (${selectedRepo.branch})`,
          category: 'Active Repository',
          icon: GitBranch,
          keywords: ['branch', 'checkout', 'switch', 'prune', selectedRepo.name],
          run: () => onOpenBranches?.(selectedRepo)
        },
        {
          id: 'repo-update',
          label: `Check & Pull Updates: ${selectedRepo.name}`,
          description: 'Fetch remote upstream and run npm install if dependencies changed',
          category: 'Active Repository',
          icon: Download,
          keywords: ['pull', 'update', 'fetch', 'git', selectedRepo.name],
          run: () => onOpenUpdate?.(selectedRepo)
        },
        {
          id: 'repo-open-antigravity',
          label: `Open in Antigravity: ${selectedRepo.name}`,
          description: 'Launch Google Antigravity IDE in this repository',
          category: 'Open in IDE',
          icon: Sparkles,
          keywords: ['antigravity', 'ide', 'google', 'editor', selectedRepo.name],
          run: () => void handleLaunchIde(selectedRepo, 'antigravity')
        },
        {
          id: 'repo-open-cursor',
          label: `Open in Cursor: ${selectedRepo.name}`,
          description: 'Launch Cursor AI editor in this repository',
          category: 'Open in IDE',
          icon: Zap,
          keywords: ['cursor', 'ide', 'ai', 'editor', selectedRepo.name],
          run: () => void handleLaunchIde(selectedRepo, 'cursor')
        },
        {
          id: 'repo-open-vscode',
          label: `Open in VS Code: ${selectedRepo.name}`,
          description: 'Launch Visual Studio Code in this repository',
          category: 'Open in IDE',
          icon: Code,
          keywords: ['code', 'vscode', 'visual studio', selectedRepo.name],
          run: () => void handleLaunchIde(selectedRepo, 'code')
        },
        {
          id: 'repo-open-terminal',
          label: `Open in Terminal: ${selectedRepo.name}`,
          description: 'Open native Windows Terminal in this repository directory',
          category: 'Open in IDE',
          icon: SquareTerminal,
          keywords: ['terminal', 'wt', 'powershell', 'cmd', selectedRepo.name],
          run: () => void handleLaunchIde(selectedRepo, 'terminal')
        },
        {
          id: 'repo-open-explorer',
          label: `Open in Explorer: ${selectedRepo.name}`,
          description: 'Reveal repository folder in Windows File Explorer',
          category: 'Open in IDE',
          icon: Folder,
          keywords: ['explorer', 'folder', 'files', selectedRepo.name],
          run: () => void handleLaunchIde(selectedRepo, 'explorer')
        }
      )
    }

    // 2. Repositories in Workspace
    repos.forEach((r) => {
      list.push({
        id: `select-repo-${r.id}`,
        label: `Select Repo: ${r.name}`,
        description: `${r.path} · branch: ${r.branch}${r.dirtyCount > 0 ? ` · ${r.dirtyCount} dirty` : ''}`,
        category: 'Repositories',
        icon: FolderGit2,
        keywords: ['repo', 'workspace', r.name, r.branch, r.path],
        run: () => {
          selectRepo(r.id)
          setActive('repos')
        }
      })
    })

    // 3. Navigation Pages
    list.push(
      {
        id: 'nav-repos',
        label: 'Go to Repositories',
        description: 'View live git state for all workspace repositories',
        category: 'Navigation',
        icon: FolderGit2,
        shortcut: 'Ctrl+1',
        keywords: ['repos', 'repositories', 'workspace', 'home'],
        run: () => setActive('repos')
      },
      {
        id: 'nav-github',
        label: 'Go to GitHub Repos',
        description: 'Browse remote repositories and 1-click clone',
        category: 'Navigation',
        icon: Globe,
        shortcut: 'Ctrl+2',
        keywords: ['github', 'cloud', 'remote', 'clone'],
        run: () => setActive('github')
      },
      {
        id: 'nav-worktrees',
        label: 'Go to Worktrees',
        description: 'Inspect linked checkouts and branch directories',
        category: 'Navigation',
        icon: FolderTree,
        shortcut: 'Ctrl+3',
        keywords: ['worktrees', 'linked', 'checkouts'],
        run: () => setActive('worktrees')
      },
      {
        id: 'nav-builds',
        label: 'Go to Builds & Scripts',
        description: 'Supervise npm build scripts and process output',
        category: 'Navigation',
        icon: Hammer,
        shortcut: 'Ctrl+4',
        keywords: ['builds', 'npm', 'scripts', 'run', 'compile'],
        run: () => setActive('builds')
      },
      {
        id: 'nav-prs',
        label: 'Go to Pull Request Queue',
        description: 'View live PRs and review states from GitHub',
        category: 'Navigation',
        icon: GitPullRequest,
        shortcut: 'Ctrl+5',
        keywords: ['pr', 'pull requests', 'review', 'github'],
        run: () => setActive('pull-requests')
      },
      {
        id: 'nav-ci',
        label: 'Go to CI Runs',
        description: 'Track GitHub Actions workflow runs and conclusions',
        category: 'Navigation',
        icon: Activity,
        shortcut: 'Ctrl+6',
        keywords: ['ci', 'runs', 'actions', 'workflows', 'tests'],
        run: () => setActive('ci')
      },
      {
        id: 'nav-themes',
        label: 'Go to Themes Gallery',
        description: 'Customize UI color palettes and styling presets',
        category: 'Navigation',
        icon: Palette,
        keywords: ['themes', 'palette', 'colors', 'dark', 'light'],
        run: () => setActive('themes')
      },
      {
        id: 'nav-widgets',
        label: 'Go to Widgets & Components',
        description: 'Inspect cockpit UI widget library',
        category: 'Navigation',
        icon: LayoutGrid,
        keywords: ['widgets', 'ui', 'components'],
        run: () => setActive('widgets')
      },
      {
        id: 'nav-settings',
        label: 'Go to Settings',
        description: 'App preferences and system diagnostics',
        category: 'Navigation',
        icon: SettingsIcon,
        keywords: ['settings', 'preferences', 'config'],
        run: () => setActive('settings')
      }
    )

    // 4. Workspace Tools & Layout
    list.push(
      {
        id: 'tool-toggle-terminal',
        label: 'Toggle Bottom Terminal Dock',
        description: 'Show or hide the integrated PTY shell panel',
        category: 'Tools & Layout',
        icon: SquareTerminal,
        shortcut: 'Ctrl+`',
        keywords: ['terminal', 'bottom', 'pty', 'shell', 'console'],
        run: () => toggleBottom()
      },
      {
        id: 'tool-toggle-sidebar',
        label: 'Toggle Left Sidebar Rail',
        description: 'Expand or collapse the left navigation sidebar',
        category: 'Tools & Layout',
        icon: SidebarIcon,
        shortcut: 'Ctrl+B',
        keywords: ['sidebar', 'left', 'collapse', 'rail'],
        run: () => toggleLeft()
      },
      {
        id: 'tool-toggle-right',
        label: 'Toggle Right Activity Rail',
        description: 'Show or hide the live git activity and notification log',
        category: 'Tools & Layout',
        icon: Activity,
        keywords: ['activity', 'right', 'rail', 'logs'],
        run: () => toggleRight()
      },
      {
        id: 'tool-toggle-theme',
        label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        description: 'Toggle between dark and light appearance modes',
        category: 'Tools & Layout',
        icon: theme === 'dark' ? Sun : Moon,
        keywords: ['theme', 'dark', 'light', 'mode'],
        run: () => toggleTheme()
      },
      {
        id: 'tool-rescan',
        label: 'Rescan Workspace Repositories',
        description: 'Re-run git status and refresh all repo states from disk',
        category: 'Tools & Layout',
        icon: RefreshCw,
        shortcut: 'Ctrl+R',
        keywords: ['rescan', 'refresh', 'reload', 'git'],
        run: () => void refresh(false)
      },
      {
        id: 'tool-add-repo',
        label: 'Add Repository Folder',
        description: 'Select an existing folder with .git directory to add to cockpit',
        category: 'Tools & Layout',
        icon: Plus,
        keywords: ['add', 'repo', 'folder', 'new'],
        run: () => void addRepo()
      }
    )

    return list
  }, [
    selectedRepo,
    repos,
    theme,
    onOpenDiff,
    onOpenBranches,
    onOpenUpdate,
    selectRepo,
    setActive,
    toggleBottom,
    toggleLeft,
    toggleRight,
    toggleTheme,
    refresh,
    addRepo
  ])

  // Filter items according to search query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items

    return items.filter((item) => {
      const matchLabel = item.label.toLowerCase().includes(q)
      const matchDesc = item.description?.toLowerCase().includes(q)
      const matchCat = item.category.toLowerCase().includes(q)
      const matchKey = item.keywords?.some((k) => k.toLowerCase().includes(q))
      return matchLabel || matchDesc || matchCat || matchKey
    })
  }, [items, query])

  // Reset selected index when filtered results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const activeEl = listRef.current.querySelector<HTMLElement>('[data-selected="true"]')
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // Reset query on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [open])

  const executeItem = (item: PaletteItem) => {
    onOpenChange(false)
    item.run()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(
        (prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length)
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filteredItems[selectedIndex]
      if (item) {
        executeItem(item)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card/95 backdrop-blur-xl border shadow-2xl rounded-xl gap-0">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b bg-muted/20">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search repos, actions, IDEs, tabs…"
            className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/70"
          />
          <kbd className="mono hidden sm:inline-block px-1.5 py-0.5 text-[10.5px] rounded bg-muted border text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2 space-y-1 min-h-[140px]">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No commands or repositories match &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex
              const Icon = item.icon

              return (
                <div
                  key={item.id}
                  data-selected={isSelected}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-xs select-none',
                    isSelected
                      ? 'bg-primary text-primary-foreground font-medium shadow-xs'
                      : 'hover:bg-accent/40 text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors',
                        isSelected
                          ? 'bg-primary-foreground/15 border-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted/60 border-border/60 text-muted-foreground group-hover:text-foreground'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-semibold tracking-tight">
                          {item.label}
                        </span>
                        <span
                          className={cn(
                            'text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border',
                            isSelected
                              ? 'bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground'
                              : 'bg-muted/40 border-border/40 text-muted-foreground'
                          )}
                        >
                          {item.category}
                        </span>
                      </div>

                      {item.description && (
                        <p
                          className={cn(
                            'truncate text-[11px] mt-0.5',
                            isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          )}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.shortcut && (
                    <kbd
                      className={cn(
                        'mono text-[10.5px] px-1.5 py-0.5 rounded border shrink-0',
                        isSelected
                          ? 'bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground'
                          : 'bg-muted border-border/70 text-muted-foreground'
                      )}
                    >
                      {item.shortcut}
                    </kbd>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer info strip */}
        <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="mono px-1 py-0.2 rounded bg-muted border text-[10px]">↑</kbd>{' '}
              <kbd className="mono px-1 py-0.2 rounded bg-muted border text-[10px]">↓</kbd> navigate
            </span>
            <span>
              <kbd className="mono px-1 py-0.2 rounded bg-muted border text-[10px]">↵</kbd> select
            </span>
            <span>
              <kbd className="mono px-1 py-0.2 rounded bg-muted border text-[10px]">esc</kbd> close
            </span>
          </div>

          <span className="hidden sm:inline mono text-[10px]">Repo Cockpit OmniBar</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
