import React, { useState } from 'react'
import { Plus, X, ChevronDown, GripVertical } from 'lucide-react'
import { useReframeStore } from '../stores/reframe-store'
import type { FooterTabItem } from '../types/reframe-types'

export const ReframeNavFooter: React.FC = () => {
  const {
    footerTabs,
    activeFooterTabId,
    isBottomDrawerOpen,
    toggleBottomDrawer,
    addFooterTab,
    removeFooterTab,
    reorderFooterTabs,
    mode,
    themeInspector
  } = useReframeStore()

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isAddingTab, setIsAddingTab] = useState(false)
  const [newTabLabel, setNewTabLabel] = useState('')
  const [newTabValue, setNewTabValue] = useState('')

  const activeTab = footerTabs.find((t) => t.id === activeFooterTabId)

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
      reorderFooterTabs(draggedIndex, targetIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleCreateFooterTab = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTabLabel.trim()) return

    const newTab: FooterTabItem = {
      id: `foot-${Date.now()}`,
      label: newTabLabel.trim(),
      value: newTabValue.trim() || 'Online',
      status: 'online',
      content: `Live telemetry channel for ${newTabLabel.trim()}. All systems nominal.`,
      closable: true
    }

    addFooterTab(newTab)
    setNewTabLabel('')
    setNewTabValue('')
    setIsAddingTab(false)
  }

  return (
    <footer
      className="border-t border-zinc-800 bg-zinc-950 flex flex-col shrink-0 select-none z-30 transition-all"
      style={{ borderTopWidth: `${themeInspector?.borderThickness || 1}px` }}
    >
      {/* ── EXPANDABLE BOTTOM DETAIL DRAWER ─────────────────────── */}
      {isBottomDrawerOpen && activeTab && (
        <div className="h-44 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur p-4 flex flex-col animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-white tracking-tight">
                {activeTab.label} Telemetry Console
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-800">
                {activeTab.value}
              </span>
            </div>
            <button
              onClick={() => toggleBottomDrawer()}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 rounded-lg p-3 border border-zinc-800/60 scrollbar-thin scrollbar-thumb-zinc-700">
            <p className="text-zinc-400">
              [Telemetry Stream] {new Date().toLocaleTimeString()} -{' '}
              {activeTab.content || 'Zero anomalous events reported.'}
            </p>
            <div className="mt-2 text-zinc-500 text-[11px] space-y-0.5">
              <div>&gt; Channel ID: {activeTab.id}</div>
              <div>&gt; Ingest Rate: 1,420 msgs/sec</div>
              <div>&gt; Health Status: 100% operational</div>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER STATUS STRIP (| TAB 1 | TAB 2 | +) ──────────── */}
      <div className="h-8 px-3 flex items-center justify-between text-xs text-zinc-400 gap-2">
        {/* Left: Dynamic Footer Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
          {footerTabs.map((tab, idx) => {
            const isSelected = activeFooterTabId === tab.id && isBottomDrawerOpen
            const isDragging = draggedIndex === idx
            const isDropTarget = dragOverIndex === idx

            return (
              <div
                key={tab.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                onClick={() => toggleBottomDrawer(tab.id)}
                className={`group flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                } ${isDragging ? 'opacity-40' : ''} ${
                  isDropTarget ? 'border-t-2 border-indigo-500' : ''
                }`}
                title={`Click to inspect ${tab.label}`}
              >
                {mode === 'builder' && (
                  <GripVertical className="w-2.5 h-2.5 text-zinc-600 opacity-0 group-hover:opacity-100 -ml-0.5 transition-opacity cursor-grab active:cursor-grabbing" />
                )}
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="font-semibold text-zinc-300">{tab.label}:</span>
                <span className="font-mono text-zinc-400">{tab.value}</span>

                {/* Little red X button to remove tab */}
                {mode === 'builder' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFooterTab(tab.id)
                    }}
                    className="p-0.5 rounded text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
                    title={`Remove ${tab.label}`}
                  >
                    <X className="w-2.5 h-2.5 text-red-500" strokeWidth={2.5} />
                  </button>
                )}
              </div>
            )
          })}

          {footerTabs.length === 0 && mode === 'builder' && (
            <span className="text-[11px] text-zinc-500 italic px-2">No status monitors</span>
          )}

          {/* + Add Footer Status Tab */}
          {mode === 'builder' &&
            (isAddingTab ? (
              <form onSubmit={handleCreateFooterTab} className="flex items-center gap-1">
                <input
                  autoFocus
                  type="text"
                  placeholder="Label..."
                  value={newTabLabel}
                  onChange={(e) => setNewTabLabel(e.target.value)}
                  className="bg-zinc-950 border border-indigo-500 text-white text-[11px] px-1.5 py-0.5 rounded w-16 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Value..."
                  value={newTabValue}
                  onChange={(e) => setNewTabValue(e.target.value)}
                  className="bg-zinc-950 border border-indigo-500 text-white text-[11px] px-1.5 py-0.5 rounded w-16 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-1.5 py-0.5 bg-indigo-600 text-white rounded text-[10px]"
                >
                  +
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingTab(true)}
                className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
                title="Add Status Tab"
              >
                <Plus className="w-3 h-3" />
              </button>
            ))}
        </div>

        {/* Right: Engine Indicator (Builder mode only) */}
        {mode === 'builder' && (
          <div className="flex items-center gap-2 text-[11px] shrink-0">
            <span className="text-zinc-500 font-mono">Studio Engine: Dockview</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </footer>
  )
}
