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
    isLeftSidebarOpen,
    setIsLeftSidebarOpen,
    themeInspector
  } = useReframeStore()

  const handleDoubleClick = useCallback(() => {
    if (side === 'left') {
      setIsLeftSidebarOpen(true)
      setLeftSidebarWidth(240)
    } else {
      setRightSidebarWidth(360)
    }
  }, [side, setIsLeftSidebarOpen, setLeftSidebarWidth, setRightSidebarWidth])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      draggingRef.current = true
      setIsDragging(true)
      startXRef.current = e.clientX

      if (side === 'left') {
        const currentW = isLeftSidebarOpen ? leftSidebarWidth : 56
        if (!isLeftSidebarOpen) {
          setIsLeftSidebarOpen(true)
        }
        startWidthRef.current = currentW
      } else {
        startWidthRef.current = rightSidebarWidth
      }

      try {
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      } catch {
        // ignore if not supported
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [side, isLeftSidebarOpen, leftSidebarWidth, rightSidebarWidth, setIsLeftSidebarOpen]
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

  return (
    <>
      {/* Full-screen drag shield overlay: guarantees no canvas or iframe swallows pointer events */}
      {isDragging && (
        <div
          className="fixed inset-0 z-[9999] cursor-col-resize select-none pointer-events-auto"
          aria-hidden="true"
        />
      )}

      {/* Resize Handle Hit Target */}
      <div
        onPointerDown={onPointerDown}
        onDoubleClick={handleDoubleClick}
        className={`absolute top-0 bottom-0 z-40 cursor-col-resize select-none group flex items-center justify-center w-3 ${
          side === 'left' ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'
        }`}
        role="separator"
        aria-orientation="vertical"
        title={`Drag to resize ${side} sidebar • Double-click to reset`}
      >
        {/* Visual highlight line */}
        <div
          className={`h-full transition-colors duration-150 ${
            isDragging ? 'bg-indigo-500' : 'bg-transparent group-hover:bg-indigo-500/60'
          }`}
          style={{ width: `${borderThickness}px` }}
        />

        {/* Tactile 3-dot grip affordance pill (visible on hover/active, clean desktop style) */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-1 w-2 py-1.5 rounded-full bg-zinc-800 border border-zinc-700/80 shadow-sm transition-opacity duration-150 pointer-events-none ${
            isDragging
              ? 'opacity-100 bg-zinc-700 border-indigo-500/60'
              : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <span className="w-0.5 h-0.5 rounded-full bg-zinc-300" />
          <span className="w-0.5 h-0.5 rounded-full bg-zinc-300" />
          <span className="w-0.5 h-0.5 rounded-full bg-zinc-300" />
        </div>
      </div>
    </>
  )
}
