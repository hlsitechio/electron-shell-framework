import { PanelLeftClose, PanelLeftOpen, Settings, User } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@renderer/lib/utils'
import { Avatar, AvatarFallback } from '@renderer/components/ui/avatar'
import { useUiStore } from '@renderer/stores/ui-store'
import { useCockpitTotals } from '@renderer/stores/cockpit-store'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import type { PageDefinition } from '@renderer/types/pages'
import { useBranding } from '@renderer/lib/useBranding'

interface SidebarProps {
  pages: PageDefinition[]
  activeId: string
  onSelect: (id: string) => void
}

export function Sidebar({ pages, activeId, onSelect }: SidebarProps) {
  const { leftCollapsed, leftWidth, toggleLeft } = useUiStore()
  const { branding } = useBranding()
  const [hovered, setHovered] = useState<string | null>(null)
  const totals = useCockpitTotals()

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
            <div
              className="mx-auto flex h-6 w-6 items-center justify-center font-bold text-primary-foreground text-xs shadow-xs"
              style={{ background: 'hsl(var(--primary))', borderRadius: 4 }}
            >
              {branding.appName.charAt(0).toUpperCase()}
            </div>
          )
        ) : (
          <div className="flex items-center gap-2">
            {branding.logo ? (
              <img
                src={branding.logo}
                alt={branding.appName}
                className="h-6 w-6 rounded-sm object-contain"
              />
            ) : (
              <div
                className="flex h-6 w-6 items-center justify-center font-bold text-primary-foreground text-xs shadow-xs"
                style={{ background: 'hsl(var(--primary))', borderRadius: 4 }}
              >
                {branding.appName.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className="text-sm font-semibold tracking-tight"
              style={{ color: 'hsl(var(--sidebar-fg))' }}
            >
              {branding.appName}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="app-no-drag flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {navPages.map((page) => {
          const Icon = page.icon
          const active = page.id === activeId
          const showLabel = !leftCollapsed || hovered === page.id
          const badge = getPageBadge(page.id)

          return (
            <Tooltip key={page.id} open={leftCollapsed && hovered === page.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect(page.id)}
                  onMouseEnter={() => setHovered(page.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={cn(
                    'relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-all',
                    leftCollapsed && 'justify-center px-0',
                    active
                      ? 'bg-accent/40 font-semibold'
                      : 'text-muted-foreground hover:bg-accent/20 hover:text-foreground'
                  )}
                  style={{
                    color: active ? 'hsl(var(--sidebar-accent))' : undefined
                  }}
                >
                  {/* Left accent indicator bar when active */}
                  {active && (
                    <span
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r"
                      style={{ background: 'hsl(var(--sidebar-accent))' }}
                    />
                  )}
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform',
                      active && 'stroke-[2.2] scale-105'
                    )}
                  />
                  {showLabel && (
                    <div className="flex min-w-0 flex-1 items-center justify-between">
                      <span className="truncate">{page.label}</span>
                      {badge}
                    </div>
                  )}
                  {!showLabel && badge && <span className="absolute top-1.5 right-2">{badge}</span>}
                </button>
              </TooltipTrigger>
              {leftCollapsed && <TooltipContent side="right">{page.label}</TooltipContent>}
            </Tooltip>
          )
        })}
      </nav>

      {/* Footer: profile picture + collapse toggle + settings gear */}
      <div className="shrink-0 border-t p-2" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSelect('settings')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors"
                style={{ color: 'hsl(var(--sidebar-muted))', padding: 2 }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = 'hsl(var(--sidebar-accent) / 0.09)')
                }
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                aria-label="Profile"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback>
                    <User className="h-3.5 w-3.5" />
                  </AvatarFallback>
                </Avatar>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Profile</TooltipContent>
          </Tooltip>
          <button
            onClick={toggleLeft}
            className={cn(
              'flex h-9 flex-1 items-center rounded-lg text-sm transition-colors',
              leftCollapsed ? 'justify-center' : 'justify-center gap-2'
            )}
            style={{ color: 'hsl(var(--sidebar-muted))' }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = 'hsl(var(--sidebar-accent) / 0.09)')
            }
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
            aria-label={leftCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {leftCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSelect('settings')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm transition-colors"
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
        </div>
      </div>
    </aside>
  )
}
