import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Minus, Square, X } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { useTabsStore } from '@renderer/stores/tabs-store'
import { useUiStore } from '@renderer/stores/ui-store'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { getPageLabel, type PageDefinition } from '@renderer/types/pages'
import { SvglIcon } from '@renderer/components/ui/SvglIcon'

interface TabBarProps {
  pages: PageDefinition[]
  platform?: string
}

/**
 * Single top bar — tabs + window controls merged into one unified 40px bar.
 *
 * - Dynamic responsive tabs: auto-collapses to icon-only with floating tooltips when narrow.
 * - Collapse toggle fixed at the left, before the tab segments.
 * - Window controls (min/max/close at 60% native opacity) at the right.
 * - Collapsed → slim strip: toggle + active page label + controls.
 * - `app-drag` on the bar so the window stays draggable; interactive regions are `app-no-drag`.
 */
export function TabBar({ pages, platform }: TabBarProps) {
  const isMac = platform === 'darwin'
  const { activeId, setActive } = useTabsStore()
  const { tabsCollapsed, toggleTabs } = useUiStore()

  const [isCompact, setIsCompact] = useState(false)
  const tabStripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = tabStripRef.current
    if (!el) return

    const check = () => {
      const width = el.clientWidth
      // If available width is tight, dynamically collapse tabs to icon-only mode
      const neededWidth = Math.max(pages.length * 105, 620)
      setIsCompact(width < neededWidth)
    }

    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [pages.length])

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

  const activePage = pages.find((p) => p.id === activeId)
  const activeLabel = activePage ? getPageLabel(activePage) : ''

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
          <div
            ref={tabStripRef}
            className="app-no-drag flex h-full min-w-0 flex-1 items-stretch overflow-x-auto"
          >
            {all.map((group, gi) => (
              <div
                key={group.category ?? group.pages[0].id}
                className="flex min-w-0 flex-1 items-stretch"
                style={{
                  borderRight: gi < all.length - 1 ? '1px solid hsl(var(--border))' : undefined
                }}
              >
                {group.category && !isCompact && (
                  <div
                    className="flex shrink-0 items-center px-2.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: 'hsl(var(--muted-foreground) / 0.75)' }}
                  >
                    {group.category}
                  </div>
                )}
                {group.pages.map((page, pgi) => {
                  const active = page.id === activeId
                  const label = getPageLabel(page)
                  const isSvglSlug = typeof page.icon === 'string'
                  const IconComponent =
                    typeof page.icon === 'function' || typeof page.icon === 'object'
                      ? page.icon
                      : null
                  const width = group.category && !isCompact ? undefined : '100%'

                  const tabButton = (
                    <button
                      key={page.id}
                      onClick={() => setActive(page.id)}
                      aria-label={label}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex min-w-0 items-center justify-center gap-1.5 transition-colors whitespace-nowrap',
                        isCompact ? 'px-2.5 text-xs' : 'px-2 text-[13px] font-medium',
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
                    >
                      {isSvglSlug ? (
                        <SvglIcon
                          name={page.icon as string}
                          size={14}
                          className={cn(
                            'h-3.5 w-3.5 shrink-0',
                            active && 'drop-shadow-[0_0_6px_hsl(var(--sidebar-accent)/0.6)]'
                          )}
                        />
                      ) : IconComponent ? (
                        <IconComponent
                          aria-hidden="true"
                          className={cn('h-3.5 w-3.5 shrink-0', active && 'stroke-[2.4]')}
                        />
                      ) : null}
                      {isCompact ? (
                        <span className="sr-only">{label}</span>
                      ) : (
                        <span className="truncate">{label}</span>
                      )}
                    </button>
                  )

                  if (isCompact) {
                    return (
                      <Tooltip key={page.id}>
                        <TooltipTrigger asChild>{tabButton}</TooltipTrigger>
                        <TooltipContent side="bottom">
                          <div className="flex flex-col text-xs">
                            <span className="font-semibold">{label}</span>
                            {page.category && (
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                {page.category}
                              </span>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return tabButton
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
