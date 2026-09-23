import React, { useState, useEffect } from 'react'
import {
  Layers,
  Activity,
  BarChart3,
  Terminal,
  Sparkles,
  Plus,
  X,
  GripVertical,
  Eye,
  Wrench,
  PanelRightClose,
  PanelRightOpen,
  ChevronDown,
  Minus,
  Square,
  Rocket
} from 'lucide-react'
import { useReframeStore, TEMPLATES, TemplateId } from '../stores/reframe-store'
import type { HeaderTabItem } from '../types/reframe-types'

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Layers,
  Activity,
  BarChart3,
  Terminal,
  Sparkles
}

export const ReframeNavHeader: React.FC = () => {
  const {
    mode,
    setMode,
    currentTemplateId,
    loadTemplate,
    headerTabs,
    activeHeaderTabId,
    setActiveHeaderTab,
    addHeaderTab,
    removeHeaderTab,
    reorderHeaderTabs,
    isRightSidebarOpen,
    toggleRightSidebar,
    setIsBakeModalOpen,
    themeInspector
  } = useReframeStore()

  // Drag-and-drop state for top tabs
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isAddingTab, setIsAddingTab] = useState(false)
  const [newTabTitle, setNewTabTitle] = useState('')
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.api?.window?.isMaximized?.().then((max) => {
      setIsMaximized(Boolean(max))
    })
    const unsub = window.api?.window?.onWindowStateChanged?.((s) => {
      setIsMaximized(Boolean(s?.isMaximized))
    })
    return () => unsub?.()
  }, [])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return // Left click only

    const target = e.target as HTMLElement
    // Ignore interactive elements
    if (
      target.closest('button') ||
      target.closest('select') ||
      target.closest('input') ||
      target.closest('a') ||
      target.closest('form') ||
      target.closest('.app-no-drag')
    ) {
      return
    }

    const startX = e.screenX
    const startY = e.screenY
    let hasStartedDragging = false

    const onPointerMove = (moveEv: PointerEvent) => {
      const dx = Math.abs(moveEv.screenX - startX)
      const dy = Math.abs(moveEv.screenY - startY)
      if (!hasStartedDragging && (dx > 2 || dy > 2)) {
        hasStartedDragging = true
        window.api?.window?.dragStart?.({ screenX: startX, screenY: startY })
      }
      if (hasStartedDragging) {
        window.api?.window?.dragMove?.({ screenX: moveEv.screenX, screenY: moveEv.screenY })
      }
    }

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      if (hasStartedDragging) {
        window.api?.window?.dragEnd?.()
      }
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
  }

  const handleHeaderDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (
      target.closest('button') ||
      target.closest('select') ||
      target.closest('input') ||
      target.closest('a') ||
      target.closest('form') ||
      target.closest('.app-no-drag')
    ) {
      return
    }
    window.api?.window?.maximize?.()
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      reorderHeaderTabs(draggedIndex, targetIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleCreateTab = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTabTitle.trim()) {
      setIsAddingTab(false)
      return
    }
    const newTab: HeaderTabItem = {
      id: `tab-${Date.now()}`,
      label: newTabTitle.trim(),
      icon: 'Layers',
      closable: true
    }
    addHeaderTab(newTab)
    setNewTabTitle('')
    setIsAddingTab(false)
  }

  return (
    <header
      onPointerDown={handlePointerDown}
      onDoubleClick={handleHeaderDoubleClick}
      className={`h-12 border-b border-zinc-800 bg-zinc-950 px-3 flex items-center justify-between gap-3 select-none shrink-0 z-30 ${
        isMaximized ? 'app-no-drag' : 'app-drag'
      }`}
      style={
        {
          borderBottomWidth: `${themeInspector?.borderThickness || 1}px`,
          WebkitAppRegion: isMaximized ? 'no-drag' : 'drag'
        } as React.CSSProperties
      }
    >
      {/* ── 1. LEFT LOGO / BRANDING ──────────────────────────── */}
      <div
        className={`flex items-center gap-2.5 shrink-0 ${isMaximized ? 'app-no-drag' : 'app-drag'}`}
        style={{ WebkitAppRegion: isMaximized ? 'no-drag' : 'drag' } as React.CSSProperties}
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Layers className="w-4 h-4" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-bold text-sm text-white tracking-tight">Reframe</span>
          <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Studio
          </span>
        </div>
      </div>

      {/* ── 2. CENTER DYNAMIC TABS (| TAB 1 | TAB 2 | +) ─────── */}
      <div
        className="app-no-drag flex items-center gap-1 shrink-0 px-2"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {(headerTabs.length > 0 || mode === 'builder') && (
          <div className="flex items-center gap-1 bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-800/80 max-w-xl overflow-x-auto no-scrollbar">
            {headerTabs.map((tab, idx) => {
              const isActive = tab.id === activeHeaderTabId
              const Icon = (tab.icon && ICON_MAP[tab.icon]) || Layers
              const isDragging = draggedIndex === idx
              const isDropTarget = dragOverIndex === idx

              return (
                <div
                  key={tab.id}
                  draggable={mode === 'builder'}
                  onDragStart={(e) => mode === 'builder' && handleDragStart(e, idx)}
                  onDragOver={(e) => mode === 'builder' && handleDragOver(e, idx)}
                  onDrop={(e) => mode === 'builder' && handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setActiveHeaderTab(tab.id)}
                  className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  } ${isDragging ? 'opacity-40' : ''} ${
                    isDropTarget ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-zinc-900' : ''
                  }`}
                  title={`${mode === 'builder' ? 'Drag to reorder • ' : ''}Click to view ${tab.label}`}
                >
                  {mode === 'builder' && (
                    <GripVertical className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 -ml-1 transition-opacity cursor-grab active:cursor-grabbing" />
                  )}
                  <Icon
                    className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`}
                  />
                  <span className="truncate max-w-[120px]">{tab.label}</span>

                  {/* Little red X button to remove tab */}
                  {mode === 'builder' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeHeaderTab(tab.id)
                      }}
                      className="p-0.5 rounded text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-0.5"
                      title={`Remove ${tab.label}`}
                    >
                      <X className="w-3 h-3 text-red-500" strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              )
            })}

            {headerTabs.length === 0 && mode === 'builder' && (
              <span className="text-[11px] text-zinc-500 italic px-2">No tabs</span>
            )}

            {/* + Add Header Tab */}
            {mode === 'builder' &&
              (isAddingTab ? (
                <form onSubmit={handleCreateTab} className="flex items-center gap-1 px-1">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Tab Name..."
                    value={newTabTitle}
                    onChange={(e) => setNewTabTitle(e.target.value)}
                    onBlur={() => {
                      if (!newTabTitle.trim()) setIsAddingTab(false)
                    }}
                    className="bg-zinc-950 border border-indigo-500 text-white text-xs px-2 py-1 rounded w-28 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingTab(true)}
                  className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors flex items-center gap-1 text-xs"
                  title="Add new workspace tab"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              ))}
          </div>
        )}
      </div>

      {/* ── DRAGGABLE EMPTY / BLACK SPACING ─────────────────── */}
      <div
        className={`flex-1 h-full min-w-8 select-none ${isMaximized ? 'app-no-drag' : 'app-drag'}`}
        style={{ WebkitAppRegion: isMaximized ? 'no-drag' : 'drag' } as React.CSSProperties}
        title="Double-click to toggle maximize • Drag to move window"
      />

      {/* ── 3. RIGHT CONTROLS & ACTIONS ──────────────────────── */}
      <div
        className="app-no-drag flex items-center gap-2 shrink-0"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Template Quick Selector */}
        {mode === 'builder' && (
          <div className="relative">
            <select
              value={currentTemplateId}
              onChange={(e) => loadTemplate(e.target.value as TemplateId)}
              className="appearance-none bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none cursor-pointer font-medium"
            >
              {Object.entries(TEMPLATES).map(([key, t]) => (
                <option key={key} value={key}>
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2 top-2 pointer-events-none" />
          </div>
        )}

        {/* Publish Standalone App (Zero-Dockview) */}
        {mode === 'builder' && (
          <button
            onClick={() => setIsBakeModalOpen(true)}
            title="Publish standalone application code (.tsx) and preset (.json)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-900/30 transition-all border border-indigo-400/30"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Publish App</span>
          </button>
        )}

        {/* Mode Switcher (Builder Mode ⟷ Client Deliverable View) */}
        {mode === 'builder' ? (
          <button
            onClick={() => setMode('client')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition-all"
            title="Preview clean client deliverable without builder controls"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Client View</span>
          </button>
        ) : (
          <button
            onClick={() => setMode('builder')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30 transition-all animate-pulse"
            title="Return to builder platform"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Builder Mode</span>
          </button>
        )}

        {/* Toggle Right Sidebar Inspector */}
        {mode === 'builder' && (
          <button
            onClick={toggleRightSidebar}
            className={`p-1.5 rounded-lg border transition-colors ${
              isRightSidebarOpen
                ? 'bg-zinc-800 text-white border-zinc-700'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
            }`}
            title={isRightSidebarOpen ? 'Collapse Right Inspector' : 'Open Right Inspector'}
          >
            {isRightSidebarOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </button>
        )}

        {/* ── NATIVE WINDOW CONTROLS (MINUS, MAXIMIZE, CLOSE) ─── */}
        <div className="flex items-center pl-1.5 ml-0.5 border-l border-zinc-800/80 shrink-0">
          <button
            onClick={() => window.api?.window?.minimize?.()}
            className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
            title="Minimize"
            aria-label="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => window.api?.window?.maximize?.()}
            className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
            title="Maximize"
            aria-label="Maximize"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => window.api?.window?.close?.()}
            className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-red-600 rounded transition-colors"
            title="Close"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
