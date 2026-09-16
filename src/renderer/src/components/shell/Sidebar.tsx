import { PanelLeftClose, PanelLeftOpen, Settings, User } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@renderer/lib/utils'
import { Avatar, AvatarFallback } from '@renderer/components/ui/avatar'
import { useUiStore } from '@renderer/stores/ui-store'
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
            <div
              className="mx-auto flex h-6 w-6 items-center justify-center font-bold text-primary-foreground"
              style={{ background: 'hsl(var(--primary))', borderRadius: 2 }}
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
                className="flex h-6 w-6 items-center justify-center font-bold text-primary-foreground"
                style={{ background: 'hsl(var(--primary))', borderRadius: 2 }}
              >
                {branding.appName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-semibold" style={{ color: 'hsl(var(--sidebar-fg))' }}>
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

          return (
            <Tooltip key={page.id} open={leftCollapsed && hovered === page.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect(page.id)}
                  onMouseEnter={() => setHovered(page.id)}
                  onMouseLeave={() => setHovered(null)}
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
                  <Icon
                    className={cn('h-4 w-4 shrink-0', active && 'stroke-[2.4]')}
                    style={
                      active
                        ? { filter: 'drop-shadow(0 0 6px hsl(var(--sidebar-accent) / 0.6))' }
                        : undefined
                    }
                  />
                  {showLabel && <span className="truncate">{page.label}</span>}
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
