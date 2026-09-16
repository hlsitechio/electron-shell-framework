import { ChevronDown, ChevronUp, SquareTerminal } from 'lucide-react'
import { useUiStore } from '@renderer/stores/ui-store'

/**
 * Collapsible bottom panel — a VS Code-terminal-style strip.
 * Closed: a slim toggle bar with a chevron-up.
 * Open: a panel with a placeholder "panel content goes here".
 */
export function BottomPanel() {
  const { bottomOpen, toggleBottom } = useUiStore()

  return (
    <div
      className="shrink-0 border-t"
      style={{
        background: 'hsl(var(--topbar-bg))',
        borderColor: 'hsl(var(--border))',
        height: bottomOpen ? 180 : 28,
        transition: 'height 160ms ease',
        overflow: 'hidden'
      }}
    >
      {bottomOpen ? (
        <div className="flex h-full flex-col">
          <div
            className="flex h-8 shrink-0 items-center justify-between border-b px-3"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <div className="flex items-center gap-2">
              <SquareTerminal className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Terminal
              </span>
            </div>
            <button
              onClick={toggleBottom}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent"
              aria-label="Collapse panel"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center p-3">
            <p className="text-sm text-muted-foreground">
              Panel content goes here — hook your own tool, log stream, or output view.
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleBottom}
          className="flex h-full w-full items-center justify-center gap-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Open panel"
        >
          <ChevronUp className="h-3.5 w-3.5" />
          <span className="uppercase tracking-widest text-[10px] font-bold">Panel</span>
        </button>
      )}
    </div>
  )
}
