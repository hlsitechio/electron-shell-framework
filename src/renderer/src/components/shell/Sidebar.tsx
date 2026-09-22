import { PanelLeftClose, PanelLeftOpen, Settings, User } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { Avatar, AvatarFallback } from '@renderer/components/ui/avatar'
import { useUiStore } from '@renderer/stores/ui-store'
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

  const navPages = pages.filter((p) => p.showInSidebar !== false)

  return (
    <aside
      className="flex h-full flex-col"
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
              className="truncate text-sm font-semibold"
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
          const isSvglSlug = typeof page.icon === 'string'
          const IconComponent =
            typeof page.icon === 'function' || typeof page.icon === 'object' ? page.icon : null

          return (
            <Tooltip key={page.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect(page.id)}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-8 items-center gap-2 px-2 text-[13px] font-medium transition-colors',
                    leftCollapsed && 'justify-center px-0'
                  )}
                  style={{
                    borderRadius: 3,
                    background: active ? 'hsl(var(--sidebar-accent) / 0.16)' : 'transparent',
                    color: active ? 'hsl(var(--sidebar-accent))' : 'hsl(var(--sidebar-muted))'
                  }}
                  onMouseOver={(e) => {
                    if (!active)
                      e.currentTarget.style.background = 'hsl(var(--sidebar-accent) / 0.09)'
                  }}
                  onMouseOut={(e) => {
                    if (!active) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {isSvglSlug ? (
                    <SvglIcon
                      name={page.icon as string}
                      size={16}
                      className={cn(
                        'h-4 w-4 shrink-0',
                        active && 'drop-shadow-[0_0_6px_hsl(var(--sidebar-accent)/0.6)]'
                      )}
                    />
                  ) : IconComponent ? (
                    <IconComponent
                      aria-hidden="true"
                      className={cn('h-4 w-4 shrink-0', active && 'stroke-[2.4]')}
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
                    <span className="truncate">{label}</span>
                  )}
                </button>
              </TooltipTrigger>
              {leftCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
            </Tooltip>
          )
        })}
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
