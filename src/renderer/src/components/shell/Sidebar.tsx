import { useState } from 'react'
import { PanelLeftClose, PanelLeftOpen, Settings, User, Plus, GripVertical, X } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { Avatar, AvatarFallback } from '@renderer/components/ui/avatar'
import { useUiStore } from '@renderer/stores/ui-store'
import { useCockpitTotals } from '@renderer/stores/cockpit-store'
import { useCustomPagesStore } from '@renderer/stores/custom-pages-store'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { getPageLabel, type PageDefinition } from '@renderer/types/pages'
import { useBranding } from '@renderer/lib/useBranding'
import { SvglIcon } from '@renderer/components/ui/SvglIcon'

interface SidebarProps {
  pages: PageDefinition[]
  activeId: string
  onSelect: (id: string) => void
}

export function Sidebar({ pages, activeId, onSelect }: SidebarProps) {
  const { leftCollapsed, leftWidth, toggleLeft } = useUiStore()
  const { branding } = useBranding()
  const totals = useCockpitTotals()
  const { reorderPages, setIsAddTabOpen, removeCustomPage } = useCustomPagesStore()
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)

  const navPages = pages.filter((p) => p.showInSidebar !== false)

  const getPageBadge = (id: string) => {
    if (id === 'repos' && totals.dirty > 0) {
      return (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: 'hsl(var(--warning))' }}
          title={`${totals.dirty} uncommitted changes`}
        />
      )
    }
    if (id === 'builds' && totals.running > 0) {
      return (
        <span
          className="h-1.5 w-1.5 rounded-full animate-pulse"
          style={{ background: 'hsl(var(--success))', boxShadow: '0 0 6px hsl(var(--success))' }}
          title={`${totals.running} builds running`}
        />
      )
    }
    if (id === 'pull-requests' && totals.prs > 0) {
      return (
        <span className="mono rounded px-1 py-0.2 text-[9.5px] font-semibold text-muted-foreground">
          {totals.prs}
        </span>
      )
    }
    if (id === 'ci' && totals.failing > 0) {
      return (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: 'hsl(var(--destructive))' }}
          title={`${totals.failing} CI failures`}
        />
      )
    }
    return null
  }

  return (
    <aside
      className="flex h-full flex-col select-none"
      style={{
        width: leftCollapsed ? 64 : leftWidth,
        background: 'hsl(var(--sidebar-bg))',
        borderRight: '1px solid hsl(var(--sidebar-border))',
        transition: 'width 160ms ease'
      }}
    >
      {/* Brand */}
      <div
        className="flex h-10 shrink-0 items-center border-b px-3"
        style={{ borderColor: 'hsl(var(--sidebar-border))' }}
      >
        {leftCollapsed ? (
          branding.logo ? (
            <img
              src={branding.logo}
              alt={branding.appName}
              className="mx-auto h-6 w-6 rounded-sm object-contain"
            />
          ) : (
            <SvglIcon name="electron" className="mx-auto h-6 w-6 shrink-0" size={24} />
          )
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            {branding.logo ? (
              <img
                src={branding.logo}
                alt={branding.appName}
                className="h-6 w-6 shrink-0 rounded-sm object-contain"
              />
            ) : (
              <SvglIcon name="electron" className="h-6 w-6 shrink-0" size={24} />
            )}
            <span
              className="truncate text-sm font-semibold tracking-tight"
              style={{ color: 'hsl(var(--sidebar-fg))' }}
            >
              {branding.appName}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav
        aria-label="Main Navigation"
        className="app-no-drag flex flex-1 flex-col gap-1 overflow-y-auto p-2"
      >
        {navPages.map((page) => {
          const active = page.id === activeId
          const label = getPageLabel(page)
          const badge = getPageBadge(page.id)
          const isSvglSlug = typeof page.icon === 'string'
          const IconComponent =
            typeof page.icon === 'function' || typeof page.icon === 'object' ? page.icon : null
          const isCustomTab = page.id.startsWith('custom-tab-')

          return (
            <div
              key={page.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', page.id)
                setDraggedId(page.id)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                if (draggedId && draggedId !== page.id) {
                  setDropTargetId(page.id)
                }
              }}
              onDragLeave={() => {
                if (dropTargetId === page.id) setDropTargetId(null)
              }}
              onDrop={(e) => {
                e.preventDefault()
                if (draggedId && draggedId !== page.id) {
                  reorderPages(draggedId, page.id)
                }
                setDraggedId(null)
                setDropTargetId(null)
              }}
              onDragEnd={() => {
                setDraggedId(null)
                setDropTargetId(null)
              }}
              className={cn(
                'relative group rounded-md transition-all',
                draggedId === page.id && 'opacity-40 scale-95',
                dropTargetId === page.id && 'border-t-2 border-blue-500 pt-0.5'
              )}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelect(page.id)}
                    aria-label={label}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative flex h-8 w-full items-center gap-2 rounded-md px-2 text-[13px] font-medium transition-all group/btn',
                      leftCollapsed && 'justify-center px-0',
                      active
                        ? 'bg-accent/40 font-semibold'
                        : 'text-muted-foreground hover:bg-accent/20 hover:text-foreground'
                    )}
                    style={{
                      color: active ? 'hsl(var(--sidebar-accent))' : undefined
                    }}
                  >
                    {/* Drag grip icon on hover */}
                    {!leftCollapsed && (
                      <GripVertical className="h-3 w-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-grab -ml-0.5" />
                    )}

                    {/* Left accent indicator bar when active */}
                    {active && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r"
                        style={{ background: 'hsl(var(--sidebar-accent))' }}
                      />
                    )}
                    {isSvglSlug ? (
                      <SvglIcon
                        name={page.icon as string}
                        size={16}
                        className={cn(
                          'h-4 w-4 shrink-0 transition-transform',
                          active && 'drop-shadow-[0_0_6px_hsl(var(--sidebar-accent)/0.6)] scale-105'
                        )}
                      />
                    ) : IconComponent ? (
                      <IconComponent
                        aria-hidden="true"
                        className={cn(
                          'h-4 w-4 shrink-0 transition-transform',
                          active && 'stroke-[2.4] scale-105'
                        )}
                        style={
                          active
                            ? { filter: 'drop-shadow(0 0 6px hsl(var(--sidebar-accent) / 0.6))' }
                            : undefined
                        }
                      />
                    ) : null}
                    {leftCollapsed ? (
                      <span className="sr-only">{label}</span>
                    ) : (
                      <div className="flex min-w-0 flex-1 items-center justify-between">
                        <span className="truncate">{label}</span>
                        <div className="flex items-center gap-1">
                          {badge}
                          {isCustomTab && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation()
                                removeCustomPage(page.id)
                              }}
                              className="p-0.5 rounded hover:bg-zinc-800 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete tab"
                            >
                              <X className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {leftCollapsed && badge && (
                      <span className="absolute top-1.5 right-2">{badge}</span>
                    )}
                  </button>
                </TooltipTrigger>
                {leftCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
              </Tooltip>
            </div>
          )
        })}

        {/* + Add Tab Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsAddTabOpen(true)}
              aria-label="Add new tab"
              className={cn(
                'relative flex h-8 items-center gap-2 rounded-md border border-dashed border-zinc-700/60 text-xs font-medium text-muted-foreground transition-all hover:border-blue-500/60 hover:bg-accent/20 hover:text-foreground mt-1.5',
                leftCollapsed ? 'justify-center px-0 w-8 mx-auto' : 'px-2.5 w-full'
              )}
            >
              <Plus className="h-3.5 w-3.5 shrink-0 text-blue-400" />
              {!leftCollapsed && <span>Add Tab</span>}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Add new tab</TooltipContent>
        </Tooltip>
      </nav>

      {/* Footer: profile picture + settings gear + collapse toggle */}
      <div
        className={cn('shrink-0 border-t', leftCollapsed ? 'px-1 py-2' : 'p-2')}
        style={{ borderColor: 'hsl(var(--sidebar-border))' }}
      >
        {leftCollapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect('settings')}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                  style={{ color: 'hsl(var(--sidebar-muted))' }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = 'hsl(var(--sidebar-accent) / 0.09)')
                  }
                  onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  aria-label="Profile"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      <User className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Profile</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect('settings')}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors"
                  style={{ color: 'hsl(var(--sidebar-muted))' }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = 'hsl(var(--sidebar-accent) / 0.09)')
                  }
                  onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleLeft}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors"
                  style={{ color: 'hsl(var(--sidebar-muted))' }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = 'hsl(var(--sidebar-accent) / 0.09)')
                  }
                  onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  aria-label="Expand sidebar"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect('settings')}
                  className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1 text-sm font-medium transition-colors"
                  style={{ color: 'hsl(var(--sidebar-muted))' }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = 'hsl(var(--sidebar-accent) / 0.09)')
                  }
                  onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  aria-label="Profile"
                >
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback>
                      <User className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-xs font-medium text-foreground">Profile</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Profile settings</TooltipContent>
            </Tooltip>

            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelect('settings')}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors"
                    style={{ color: 'hsl(var(--sidebar-muted))' }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = 'hsl(var(--sidebar-accent) / 0.09)')
                    }
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    aria-label="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Settings</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleLeft}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors"
                    style={{ color: 'hsl(var(--sidebar-muted))' }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = 'hsl(var(--sidebar-accent) / 0.09)')
                    }
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    aria-label="Collapse sidebar"
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Collapse sidebar</TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
