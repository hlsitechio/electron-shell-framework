import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useReframeStore } from '../stores/reframe-store'

interface ReframeResizeHandleProps {
  side: 'left' | 'right'
}

export const ReframeResizeHandle: React.FC<ReframeResizeHandleProps> = ({ side }) => {
  const [isDragging, setIsDragging] = useState(false)
  const draggingRef = useRef(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const {
    leftSidebarWidth,
    setLeftSidebarWidth,
    rightSidebarWidth,
    setRightSidebarWidth,
    themeInspector
  } = useReframeStore()

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      draggingRef.current = true
      setIsDragging(true)
      startXRef.current = e.clientX
      startWidthRef.current = side === 'left' ? leftSidebarWidth : rightSidebarWidth

      try {
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      } catch {
        // ignore if not supported
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [side, leftSidebarWidth, rightSidebarWidth]
  )

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!draggingRef.current) return
      const dx = e.clientX - startXRef.current
      if (side === 'left') {
        setLeftSidebarWidth(startWidthRef.current + dx)
      } else {
        setRightSidebarWidth(startWidthRef.current - dx)
      }
    },
    [side, setLeftSidebarWidth, setRightSidebarWidth]
  )

  const onPointerUp = useCallback((e: PointerEvent) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    setIsDragging(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    try {
      if ((e.target as HTMLElement).hasPointerCapture?.(e.pointerId)) {
        ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [onPointerMove, onPointerUp])

  const borderThickness = Math.max(1, themeInspector?.borderThickness || 1)
  const handleWidth = Math.max(8, borderThickness + 6)

  return (
    <div
      onPointerDown={onPointerDown}
      className={`absolute top-0 bottom-0 z-40 cursor-col-resize select-none group flex items-center justify-center ${
        side === 'left' ? '-right-1.5' : '-left-1.5'
      }`}
      style={{
        width: `${handleWidth}px`
      }}
      role="separator"
      aria-orientation="vertical"
      title={`Drag to resize ${side} sidebar`}
    >
      {/* Visual highlight line */}
      <div
        className={`h-full transition-colors duration-150 ${
          isDragging
            ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]'
            : 'bg-transparent group-hover:bg-indigo-500/60'
        }`}
        style={{ width: `${borderThickness}px` }}
      />
    </div>
  )
}
