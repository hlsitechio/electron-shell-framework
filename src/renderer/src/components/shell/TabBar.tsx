import { ChevronDown, ChevronUp, Minus, Square, X } from 'lucide-react'
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
  const { tabsCollapsed, toggleTabs } = useUiStore()

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
        <span className="min-w-0 flex-1 truncate px-1 text-xs text-muted-foreground">
          {activeLabel}
        </span>
      ) : (
        <>
          <div className="h-4 w-px shrink-0" style={{ background: 'hsl(var(--border))' }} />
          <div className="app-no-drag flex h-full min-w-0 flex-1 items-stretch overflow-x-auto">
            {all.map((group, gi) => (
              <div
                key={group.category ?? group.pages[0].id}
                className="flex min-w-0 flex-1"
                style={{
                  borderRight: gi < all.length - 1 ? '1px solid hsl(var(--border))' : undefined
                }}
              >
                {group.category && (
                  <div
                    className="flex shrink-0 items-center px-2.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: 'hsl(var(--muted-foreground) / 0.75)' }}
                  >
                    {group.category}
                  </div>
                )}
                {group.pages.map((page, pgi) => {
                  const active = page.id === activeId
                  const Icon = page.icon
                  const width = group.category ? undefined : '100%'
                  return (
                    <button
                      key={page.id}
                      onClick={() => setActive(page.id)}
                      className={cn(
                        'flex min-w-0 items-center justify-center gap-1.5 px-2 text-[13px] font-medium transition-colors whitespace-nowrap',
                        active ? '' : 'hover:bg-tab-hover-bg text-muted-foreground'
                      )}
                      style={{
                        flex: width ?? 1,
                        borderRadius: 0,
                        background: active ? 'hsl(var(--tab-active-bg))' : 'transparent',
                        color: active ? 'hsl(var(--tab-active-fg))' : undefined,
                        borderRight:
                          pgi < group.pages.length - 1 ? '1px solid hsl(var(--border))' : undefined
                      }}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon className={cn('h-3.5 w-3.5 shrink-0', active && 'stroke-[2.4]')} />
                      <span className="truncate">{page.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Window controls — integrated right, 60% native opacity */}
      {!isMac && (
        <div className="app-no-drag flex h-full shrink-0 items-center" style={{ opacity: 0.6 }}>
          <button
            onClick={handleMinimize}
            className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-tab-hover-bg hover:text-foreground"
            aria-label="Minimize"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={handleMaximize}
            className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-tab-hover-bg hover:text-foreground"
            aria-label="Maximize"
          >
            <Square className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleClose}
            className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
