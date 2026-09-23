import { ChevronDown, ChevronUp, Minus, Search, Square, X } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { useTabsStore } from '@renderer/stores/tabs-store'
import { useUiStore } from '@renderer/stores/ui-store'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import type { PageDefinition } from '@renderer/types/pages'

interface TabBarProps {
  pages: PageDefinition[]
  platform?: string
}

/**
 * THE single top bar — tabs + window controls merged (no double bar).
 *
 *   [⇅]|[ Dashboard | Settings | Chat | Documents ]  [-][□][×]
 *
 * - Collapse toggle fixed at the LEFT, before the tab segments.
 * - Window controls (min/max/close at 60% native opacity) at the RIGHT.
 * - Collapsed → slim strip: toggle + active page label + controls.
 * - `app-drag` on the bar so the window stays draggable; interactive
 *   regions are `app-no-drag`.
 */
export function TabBar({ pages, platform }: TabBarProps) {
  const isMac = platform === 'darwin'
  const { activeId, setActive } = useTabsStore()
  const { tabsCollapsed, toggleTabs, setPaletteOpen } = useUiStore()

  const handleMaximize = () => window.api?.window?.maximize?.()
  const handleMinimize = () => window.api?.window?.minimize?.()
  const handleClose = () => window.api?.window?.close?.()

  // Group pages by category: [ {category, pages[]}, ... ], uncategorized first
  const cats = new Map<string, PageDefinition[]>()
  const flat: PageDefinition[] = []
  for (const p of pages) {
    if (p.category) {
      const arr = cats.get(p.category) ?? []
      arr.push(p)
      cats.set(p.category, arr)
    } else {
      flat.push(p)
    }
  }
  const all: Array<{ category?: string; pages: PageDefinition[] }> = []
  for (const p of flat) all.push({ pages: [p] })
  for (const [category, arr] of cats) all.push({ category, pages: arr })

  const activeLabel = pages.find((p) => p.id === activeId)?.label ?? ''

  return (
    <div
      className="app-drag flex h-10 shrink-0 items-center border-b select-none"
      style={{
        background: 'hsl(var(--topbar-bg))',
        borderColor: 'hsl(var(--border))'
      }}
      data-platform={isMac ? 'darwin' : 'win32'}
    >
      {isMac && (
        <div className="app-no-drag flex w-20 shrink-0 items-center gap-2 pl-3">
          <span className="h-3 w-3 rounded-full bg-destructive" />
          <span className="h-3 w-3 rounded-full bg-warning" />
          <span className="h-3 w-3 rounded-full bg-success" />
        </div>
      )}

      {/* Collapse toggle — fixed left, before the tabs */}
      <div className="app-no-drag flex shrink-0 items-center pl-1.5 pr-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleTabs}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-tab-hover-bg hover:text-foreground"
              aria-label={tabsCollapsed ? 'Expand tabs' : 'Collapse tabs'}
            >
              {tabsCollapsed ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>{tabsCollapsed ? 'Expand tabs' : 'Collapse tabs'}</TooltipContent>
        </Tooltip>
      </div>

      {tabsCollapsed ? (
        /* Collapsed: slim strip — active page label flexes so the
           window controls stay pinned to the right edge */
        <span className="min-w-0 flex-1 truncate px-2 text-xs font-medium text-muted-foreground">
          {activeLabel}
        </span>
      ) : (
        <>
          <div
            className="h-4 w-px shrink-0 opacity-40"
            style={{ background: 'hsl(var(--border))' }}
          />
          <div className="app-no-drag flex h-full min-w-0 flex-1 items-center gap-2 overflow-x-auto px-2">
            {all.map((group) => (
              <div
                key={group.category ?? group.pages[0].id}
                className="flex items-center gap-0.5 rounded-lg border p-0.5"
                style={{
                  background: 'hsl(var(--muted) / 0.35)',
                  borderColor: 'hsl(var(--border) / 0.7)'
                }}
              >
                {group.category && (
                  <span
                    className="select-none px-2 text-[9.5px] font-bold uppercase tracking-wider"
                    style={{ color: 'hsl(var(--muted-foreground) / 0.8)' }}
                  >
                    {group.category}
                  </span>
                )}
                {group.pages.map((page) => {
                  const active = page.id === activeId
                  const Icon = page.icon
                  return (
                    <button
                      key={page.id}
                      onClick={() => setActive(page.id)}
                      className={cn(
                        'tab-segment flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-all',
                        active
                          ? 'bg-card text-foreground shadow-xs font-semibold'
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      )}
                      style={
                        active
                          ? {
                              background: 'hsl(var(--card))',
                              color: 'hsl(var(--card-foreground))',
                              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.12)'
                            }
                          : undefined
                      }
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon
                        className={cn(
                          'h-3.5 w-3.5 shrink-0 transition-transform',
                          active ? 'text-primary scale-105 stroke-[2.2]' : 'opacity-70'
                        )}
                      />
                      <span>{page.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Command Palette Trigger */}
      <div className="app-no-drag flex h-full shrink-0 items-center px-1.5">
        <button
          onClick={() => setPaletteOpen(true)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border border-border/70 bg-card/60 hover:bg-accent text-muted-foreground hover:text-foreground transition-all shadow-2xs"
          title="Open Command Palette (Ctrl+K)"
        >
          <Search className="h-3 w-3 text-muted-foreground" />
          <span className="hidden md:inline">Palette</span>
          <kbd className="mono text-[9.5px] px-1 py-0.2 rounded bg-muted/80 border border-border/50 text-muted-foreground ml-0.5">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Window controls — integrated right */}
      {!isMac && (
        <div className="app-no-drag flex h-full shrink-0 items-center">
          <button
            onClick={handleMinimize}
            className="flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Minimize"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleMaximize}
            className="flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Maximize"
          >
            <Square className="h-3 w-3" />
          </button>
          <button
            onClick={handleClose}
            className="flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
