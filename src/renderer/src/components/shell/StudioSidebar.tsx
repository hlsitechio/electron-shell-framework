import type { ReactNode } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { useUiStore } from '@renderer/stores/ui-store'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'

interface StudioSidebarProps {
  /** Brand / workspace switcher at the top. */
  header?: ReactNode
  /** The tree itself — a workspace → project → document hierarchy, a file list… */
  children?: ReactNode
  /** Profile card + actions above the collapse toggle. */
  footer?: ReactNode
  /** Optional section label rendered above the tree. */
  sectionLabel?: string
  /** Rendered at the right of the section label row (e.g. a "+" button). */
  sectionAction?: ReactNode
}

/**
 * Studio sidebar — the hierarchical counterpart to `Sidebar`.
 *
 * The dashboard sidebar renders a flat `pages[]` registry. Studio apps need a
 * *tree* (workspace → project → document) plus a profile footer, and that is the
 * single biggest reason a studio app used to fork the shell: there was no slot
 * for it. This component owns the chrome — width, collapse, resize, theming,
 * scroll — and the app supplies only the contents.
 *
 *   ┌──────────────────┐
 *   │ header (brand)   │
 *   ├──────────────────┤
 *   │ SECTION   [+]    │
 *   │  ▸ tree …        │   ← children
 *   ├──────────────────┤
 *   │ footer (profile) │
 *   │ [collapse]       │
 *   └──────────────────┘
 */
export function StudioSidebar({
  header,
  children,
  footer,
  sectionLabel,
  sectionAction
}: StudioSidebarProps) {
  const { leftCollapsed, leftWidth, toggleLeft } = useUiStore()

  return (
    <aside
      className="flex h-full flex-col"
      style={{
        width: leftCollapsed ? 56 : leftWidth,
        background: 'hsl(var(--sidebar-bg))',
        borderRight: '1px solid hsl(var(--sidebar-border))',
        transition: 'width 160ms ease'
      }}
    >
      {/* Header — brand or workspace switcher */}
      {header && (
        <div
          className="flex h-11 shrink-0 items-center gap-2 border-b px-3"
          style={{ borderColor: 'hsl(var(--sidebar-border))' }}
        >
          {header}
        </div>
      )}

      {/* Section label + action */}
      {!leftCollapsed && sectionLabel && (
        <div className="flex shrink-0 items-center justify-between px-3 pb-1.5 pt-3">
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'hsl(var(--sidebar-muted))' }}
          >
            {sectionLabel}
          </span>
          {sectionAction}
        </div>
      )}

      {/* The tree */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2">{children}</div>

      {/* Footer — profile + actions, then the collapse toggle */}
      <div className="shrink-0 border-t p-2" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        {!leftCollapsed && footer && <div className="mb-1">{footer}</div>}
        <button
          onClick={toggleLeft}
          className={cn(
            'flex h-8 w-full items-center rounded-lg text-xs transition-colors',
            leftCollapsed ? 'justify-center' : 'justify-center gap-2'
          )}
          style={{ color: 'hsl(var(--sidebar-muted))' }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = 'hsl(var(--sidebar-accent) / 0.09)')
          }
          onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          aria-label={leftCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-2">
                {leftCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <>
                    <PanelLeftClose className="h-4 w-4" />
                    <span>Collapse</span>
                  </>
                )}
              </span>
            </TooltipTrigger>
            {leftCollapsed && <TooltipContent side="right">Expand sidebar</TooltipContent>}
          </Tooltip>
        </button>
      </div>
    </aside>
  )
}
