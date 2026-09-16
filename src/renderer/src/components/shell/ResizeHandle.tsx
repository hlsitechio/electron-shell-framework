import { useCallback, useEffect, useRef } from 'react'
import { useUiStore } from '@renderer/stores/ui-store'

interface ResizeHandleProps {
  side: 'left' | 'right'
}

/**
 * Draggable divider.
 *  - side="left"  → resizes the left sidebar width (pointer x = sidebar width)
 *  - side="right" → resizes the right panel width (window width − pointer x)
 * Works both ways: the right handle is only mounted when the active page has
 * no right panel, so the edge stays draggable there too.
 */
export function ResizeHandle({ side }: ResizeHandleProps) {
  const dragging = useRef(false)
  const startX = useRef(0)
  const startLeft = useRef(0)
  const startRight = useRef(0)
  const { leftWidth, rightWidth, setLeftWidth, setRightWidth } = useUiStore()

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      dragging.current = true
      startX.current = e.clientX
      startLeft.current = leftWidth
      startRight.current = rightWidth
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    },
    [leftWidth, rightWidth]
  )

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - startX.current
      if (side === 'left') {
        setLeftWidth(startLeft.current + dx)
      } else {
        setRightWidth(startRight.current - dx)
      }
    },
    [side, setLeftWidth, setRightWidth]
  )

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [onPointerMove, onPointerUp])

  return (
    <div
      onPointerDown={onPointerDown}
      className="group relative z-10 w-1 shrink-0 cursor-col-resize bg-transparent"
      role="separator"
      aria-orientation="vertical"
      title="Drag to resize"
    >
      <div className="absolute inset-y-0 left-0 w-px bg-border transition-colors group-hover:bg-sidebar-accent" />
    </div>
  )
}
