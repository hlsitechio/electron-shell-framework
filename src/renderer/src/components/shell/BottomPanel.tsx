import { ChevronDown, ChevronUp, SquareTerminal } from 'lucide-react'
import { useState, useRef, type ReactNode } from 'react'
import { useUiStore } from '@renderer/stores/ui-store'

/**
 * Collapsible bottom panel — a VS Code-terminal-style strip.
 * Closed: a slim toggle bar with a chevron-up.
 * Open: a resizable panel hosting the live PTY terminal.
 */
export function BottomPanel({ children }: { children?: ReactNode }) {
  const { bottomOpen, toggleBottom } = useUiStore()
  const [panelHeight, setPanelHeight] = useState(280)
  const isDragging = useRef(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    const startY = e.clientY
    const startH = panelHeight

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return
      const delta = startY - moveEvent.clientY
      const newHeight = Math.min(
        Math.max(140, startH + delta),
        Math.round(window.innerHeight * 0.75)
      )
      setPanelHeight(newHeight)
    }

    const onMouseUp = () => {
      isDragging.current = false
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div
      className="relative shrink-0 border-t"
      style={{
        background: 'hsl(var(--topbar-bg))',
        borderColor: 'hsl(var(--border))',
        height: bottomOpen ? panelHeight : 28,
        transition: isDragging.current ? 'none' : 'height 160ms ease',
        overflow: 'hidden'
      }}
    >
      {bottomOpen ? (
        <div className="flex h-full flex-col">
          {/* Draggable top edge */}
          <div
            onMouseDown={handleMouseDown}
            className="group absolute top-0 left-0 right-0 h-1.5 cursor-row-resize z-20"
            title="Drag to resize terminal"
          >
            <div className="h-0.5 w-full bg-transparent group-hover:bg-primary/50 transition-colors" />
          </div>

          <div
            className="flex h-8 shrink-0 items-center justify-between border-b px-3 select-none"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <div className="flex items-center gap-2">
              <SquareTerminal className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Terminal
              </span>
              <span className="mono rounded bg-muted/60 px-1.5 py-0.5 text-[9.5px] text-muted-foreground">
                ConPTY
              </span>
            </div>
            <button
              onClick={toggleBottom}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Collapse panel"
              title="Collapse panel"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            {children ?? (
              <div className="flex h-full items-center justify-center p-3">
                <p className="text-xs text-muted-foreground">
                  Panel content goes here — hook your own tool, log stream, or output view.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={toggleBottom}
          className="flex h-full w-full items-center justify-center gap-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground select-none"
          aria-label="Open panel"
        >
          <ChevronUp className="h-3.5 w-3.5" />
          <SquareTerminal className="h-3 w-3 opacity-70" />
          <span className="uppercase tracking-widest text-[10px] font-bold">Terminal Panel</span>
        </button>
      )}
    </div>
  )
}
