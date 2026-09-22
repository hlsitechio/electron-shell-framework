import { Minus, Square, X } from 'lucide-react'

/**
 * Native window controls — min / max / close.
 *
 * Extracted from TabBar so every layout mode shares one implementation and the
 * frameless window keeps working identically. `app-no-drag` keeps the buttons
 * clickable inside a draggable bar; 60% opacity matches native Windows chrome.
 */
export function WindowControls({ isMac }: { isMac?: boolean }) {
  if (isMac) return null

  return (
    <div className="app-no-drag flex h-full shrink-0 items-center" style={{ opacity: 0.6 }}>
      <button
        onClick={() => window.api?.window?.minimize?.()}
        className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-tab-hover-bg hover:text-foreground"
        aria-label="Minimize"
      >
        <Minus className="h-4 w-4" />
      </button>
      <button
        onClick={() => window.api?.window?.maximize?.()}
        className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-tab-hover-bg hover:text-foreground"
        aria-label="Maximize"
      >
        <Square className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => window.api?.window?.close?.()}
        className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
