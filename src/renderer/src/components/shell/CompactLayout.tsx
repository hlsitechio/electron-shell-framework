import { useUiStore } from '@renderer/stores/ui-store'
import { WindowControls } from './WindowControls'
import { RightPanel } from './RightPanel'
import { ResizeHandle } from './ResizeHandle'
import { LayoutGrid } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { getPageLabel, type PageIcon } from '@renderer/types/pages'
import { SvglIcon } from '@renderer/components/ui/SvglIcon'
import type { ShellModeProps } from '@renderer/types/shell'

function CompactNavIcon({ icon: Icon, className }: { icon?: PageIcon; className?: string }) {
  if (!Icon) return <LayoutGrid className={className} />
  if (typeof Icon === 'string') {
    return <SvglIcon name={Icon} className={className} />
  }
  return <Icon className={className} />
}

/**
 * Compact layout — navigation folded into the top bar, full-bleed content.
 *
 * For single-purpose utilities, focus modes and anything that should feel like
 * a tool rather than a workspace. Pages become a horizontal segmented control
 * in the bar; the sidebar rail is gone entirely.
 */
export function CompactLayout({ pages, activeId, onSelect, platform, slots }: ShellModeProps) {
  const activePage = pages.find((p) => p.id === activeId) ?? pages[0]
  const { tabsCollapsed, toggleTabs } = useUiStore()
  const rightDock = slots?.rightDock ?? (activePage?.rightPanel ? <activePage.rightPanel /> : null)
  const navPages = pages.filter((p) => p.showInSidebar !== false)

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
      style={{ background: 'hsl(var(--background))' }}
    >
      {/* Single top bar: nav + content + controls */}
      <div
        className="app-drag flex h-11 shrink-0 items-center gap-2 border-b px-2"
        style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--topbar-bg))' }}
      >
        <button
          onClick={toggleTabs}
          className="app-no-drag flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-tab-hover-bg hover:text-foreground"
          aria-label={tabsCollapsed ? 'Show navigation' : 'Hide navigation'}
          aria-expanded={!tabsCollapsed}
        >
          {slots?.sidebarHeader ?? <span>Menu</span>}
        </button>

        {!tabsCollapsed && (
          <nav className="app-no-drag flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
            {navPages.map((p) => {
              const active = p.id === activeId
              return (
                <button
                  key={p.id}
                  onClick={() => onSelect(p.id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors',
                    active
                      ? 'bg-tab-active-bg text-tab-active-fg'
                      : 'text-muted-foreground hover:bg-tab-hover-bg'
                  )}
                >
                  <CompactNavIcon
                    icon={p.icon}
                    className={cn('h-3.5 w-3.5', active && 'stroke-[2.4]')}
                  />
                  <span className="truncate">{getPageLabel(p)}</span>
                </button>
              )
            })}
          </nav>
        )}

        {tabsCollapsed && (
          <div className="app-no-drag flex min-w-0 flex-1 items-center truncate px-2 text-sm font-medium">
            {activePage ? getPageLabel(activePage) : ''}
          </div>
        )}

        {slots?.topBarActions && (
          <div className="app-no-drag flex shrink-0 items-center gap-1.5">
            {slots.topBarActions}
          </div>
        )}

        <WindowControls isMac={platform === 'darwin'} />
      </div>

      {/* Full-bleed content */}
      <div className="flex min-h-0 flex-1">
        <main
          className="min-w-0 flex-1 overflow-auto"
          style={{ background: 'hsl(var(--content-bg))' }}
        >
          {slots?.content ?? (activePage ? <activePage.component /> : null)}
        </main>
        {rightDock && (
          <>
            <ResizeHandle side="right" />
            <RightPanel>{rightDock}</RightPanel>
          </>
        )}
      </div>
    </div>
  )
}
