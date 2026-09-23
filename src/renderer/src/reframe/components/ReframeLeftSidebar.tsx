import React, { useState } from 'react'
import {
  LayoutGrid,
  Activity,
  FileText,
  Globe,
  Plus,
  X,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Terminal,
  Shield,
  Zap,
  BarChart2
} from 'lucide-react'
import { useReframeStore } from '../stores/reframe-store'
import type { LeftTabItem } from '../types/reframe-types'
import { ReframeResizeHandle } from './ReframeResizeHandle'

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  LayoutGrid,
  Activity,
  FileText,
  Globe,
  Sparkles,
  Layers,
  Terminal,
  Shield,
  Zap,
  BarChart2
}

export const ReframeLeftSidebar: React.FC = () => {
  const {
    leftTabs,
    activeLeftTabId,
    setActiveLeftTab,
    addLeftTab,
    removeLeftTab,
    reorderLeftTabs,
    isLeftSidebarOpen,
    toggleLeftSidebar,
    leftSidebarWidth,
    themeInspector,
    mode
  } = useReframeStore()

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isAddingTab, setIsAddingTab] = useState(false)
  const [newTabLabel, setNewTabLabel] = useState('')
  const [newTabType, setNewTabType] = useState<'canvas' | 'embed' | 'notes'>('canvas')
  const [newTabUrl, setNewTabUrl] = useState('')

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
      reorderLeftTabs(draggedIndex, targetIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTabLabel.trim()) return

    const newTab: LeftTabItem = {
      id: `left-${Date.now()}`,
      label: newTabLabel.trim(),
      viewType: newTabType,
      url: newTabType === 'embed' ? newTabUrl.trim() || 'https://dockview.dev' : undefined,
      icon: newTabType === 'notes' ? 'FileText' : newTabType === 'embed' ? 'Globe' : 'LayoutGrid',
      closable: true
    }

    addLeftTab(newTab)
    setNewTabLabel('')
    setNewTabUrl('')
    setIsAddingTab(false)
  }

  return (
    <aside
      className="relative border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between shrink-0 select-none z-20"
      style={{
        width: isLeftSidebarOpen ? `${leftSidebarWidth}px` : '3.5rem',
        borderRightWidth: `${themeInspector?.borderThickness || 1}px`
      }}
    >
      {/* Resize handle always mounted on the right edge of left sidebar */}
      <ReframeResizeHandle side="left" />

      {/* ── TOP SECTION: TAB LIST ──────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-y-auto p-2 space-y-1">
        {/* Navigation Section Title (when expanded and builder mode) */}
        {isLeftSidebarOpen && mode === 'builder' && (
          <div className="px-2 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Views & Canvases</span>
            <span className="text-[10px] text-zinc-400 font-mono">{leftTabs.length} tabs</span>
          </div>
        )}

        {/* Tab Items */}
        {leftTabs.map((tab, idx) => {
          const isActive = tab.id === activeLeftTabId
          const Icon = (tab.icon && ICON_MAP[tab.icon]) || LayoutGrid
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
              onClick={() => setActiveLeftTab(tab.id)}
              className={`group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                isActive
                  ? 'bg-zinc-800 text-white border border-zinc-700/80 shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-850/80'
              } ${isDragging ? 'opacity-40' : ''} ${
                isDropTarget ? 'border-t-2 border-indigo-500' : ''
              }`}
              title={tab.label}
            >
              {/* Drag Handle */}
              {isLeftSidebarOpen && mode === 'builder' && (
                <GripVertical className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 -ml-1 transition-opacity cursor-grab active:cursor-grabbing shrink-0" />
              )}

              {/* Icon */}
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-200'
                }`}
              />

              {/* Label */}
              {isLeftSidebarOpen && (
                <span className="truncate flex-1 tracking-tight font-medium">{tab.label}</span>
              )}

              {/* Little red X button to remove tab */}
              {isLeftSidebarOpen && mode === 'builder' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeLeftTab(tab.id)
                  }}
                  className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  title={`Remove ${tab.label}`}
                >
                  <X className="w-3 h-3" strokeWidth={2} />
                </button>
              )}
            </div>
          )
        })}

        {isLeftSidebarOpen && leftTabs.length === 0 && mode === 'builder' && (
          <div className="p-3 text-center text-xs text-zinc-400">No tabs configured</div>
        )}

        {/* ── + ADD TAB BUTTON (builder mode only) ────────────────── */}
        {mode === 'builder' &&
          (isLeftSidebarOpen ? (
            isAddingTab ? (
              <form
                onSubmit={handleAddSubmit}
                className="p-2.5 rounded-lg bg-zinc-900/90 border border-indigo-500/50 space-y-2 mt-2"
              >
                <div className="text-[11px] font-semibold text-indigo-300">New Tab</div>
                <input
                  autoFocus
                  type="text"
                  placeholder="Tab Name..."
                  value={newTabLabel}
                  onChange={(e) => setNewTabLabel(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs px-2 py-1.5 rounded focus:outline-none focus:border-indigo-500"
                />
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setNewTabType('canvas')}
                    className={`flex-1 py-1 rounded border text-center ${
                      newTabType === 'canvas'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    Canvas
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTabType('notes')}
                    className={`flex-1 py-1 rounded border text-center ${
                      newTabType === 'notes'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    Notes
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTabType('embed')}
                    className={`flex-1 py-1 rounded border text-center ${
                      newTabType === 'embed'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    Embed
                  </button>
                </div>

                {newTabType === 'embed' && (
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newTabUrl}
                    onChange={(e) => setNewTabUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs px-2 py-1 rounded focus:outline-none focus:border-indigo-500"
                  />
                )}

                <div className="flex gap-1.5 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingTab(false)}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingTab(true)}
                className="w-full mt-2 py-2 px-3 rounded-lg border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-colors font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tab</span>
              </button>
            )
          ) : (
            <button
              onClick={() => {
                toggleLeftSidebar()
                setIsAddingTab(true)
              }}
              className="w-full p-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors flex items-center justify-center"
              title="Add Tab"
            >
              <Plus className="w-4 h-4" />
            </button>
          ))}
      </div>

      {/* ── BOTTOM SECTION: COLLAPSE TOGGLE ─────────────────────── */}
      <div className="p-2 border-t border-zinc-800 bg-zinc-950">
        <button
          onClick={toggleLeftSidebar}
          className="w-full p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
          title={isLeftSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isLeftSidebarOpen ? (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[11px]">Collapse</span>
            </>
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
