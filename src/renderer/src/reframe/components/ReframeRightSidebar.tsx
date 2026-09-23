import React, { useState } from 'react'
import {
  Sparkles,
  X,
  Plus,
  Hash,
  BarChart2,
  Table as TableIcon,
  FileText,
  Activity,
  Zap,
  RotateCcw,
  Palette,
  Heading,
  Footprints,
  Bot,
  Code2
} from 'lucide-react'
import { useReframeStore, DOCKVIEW_THEMES } from '../stores/reframe-store'
import type { FontFamilyKey } from '../types/reframe-types'
import { ReframeResizeHandle } from './ReframeResizeHandle'
import { McpAgentInspector } from './McpAgentInspector'

export const ReframeRightSidebar: React.FC = () => {
  const {
    isRightSidebarOpen,
    setIsRightSidebarOpen,
    rightTabs,
    activeRightTabId,
    setActiveRightTabId,
    addRightTab,
    removeRightTab,
    themeInspector,
    updateThemeInspector,
    resetThemeInspector,
    selectedThemeKey,
    setSelectedThemeKey,
    headerConfig,
    updateHeaderConfig,
    footerConfig,
    updateFooterConfig,
    addPanel,
    setIsBakeModalOpen,
    rightSidebarWidth,
    leftSidebarWidth,
    setLeftSidebarWidth,
    setRightSidebarWidth
  } = useReframeStore()

  const [isAddingTab, setIsAddingTab] = useState(false)
  const [newTabLabel, setNewTabLabel] = useState('')

  if (!isRightSidebarOpen) return null

  const handleAddWidget = (
    widgetType: 'kpi' | 'chart' | 'table' | 'notes' | 'activity' | 'actionpad',
    direction: 'right' | 'below' | 'stack'
  ) => {
    const id = `panel-${Date.now()}`
    const defaultTitles = {
      kpi: 'Executive Metric Tile',
      chart: 'Real-time Chart',
      table: 'Active Entity Table',
      notes: 'Operational Runbook',
      activity: 'Live Log Stream',
      actionpad: 'Command Triggers'
    }

    const panelConfig = {
      id,
      title: defaultTitles[widgetType],
      widgetType,
      widgetProps: {},
      closable: true
    }

    if (direction === 'stack') {
      addPanel(panelConfig)
    } else {
      addPanel(panelConfig, { direction })
    }
  }

  const handleCreateCustomTab = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTabLabel.trim()) return
    const id = `custom-${Date.now()}`
    addRightTab({ id, label: newTabLabel.trim(), icon: 'Sparkles' })
    setNewTabLabel('')
    setIsAddingTab(false)
  }

  return (
    <aside
      className="relative bg-zinc-950 border-l border-zinc-800 flex flex-col h-full z-30 select-none shrink-0 shadow-2xl"
      style={{
        width: `${rightSidebarWidth}px`,
        borderLeftWidth: `${themeInspector?.borderThickness || 1}px`
      }}
    >
      <ReframeResizeHandle side="right" />
      {/* ── TOP HEADER & TAB STRIP ────────────────────────────── */}
      <div className="border-b border-zinc-800 bg-zinc-900/60 p-2 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
          {rightTabs.map((t) => (
            <div
              key={t.id}
              onClick={() => setActiveRightTabId(t.id)}
              className={`group px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeRightTabId === t.id
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-850'
              }`}
            >
              {t.id === 'agent' && <Bot className="w-3 h-3 text-indigo-400 shrink-0" />}
              <span>{t.label}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeRightTab(t.id)
                }}
                className="p-0.5 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-0.5"
                title={`Remove ${t.label}`}
              >
                <X className="w-3 h-3" strokeWidth={2} />
              </button>
            </div>
          ))}

          {rightTabs.length === 0 && (
            <span className="text-[11px] text-zinc-400 px-2 font-mono">No tabs</span>
          )}

          {/* + Add Right Tab */}
          {isAddingTab ? (
            <form onSubmit={handleCreateCustomTab} className="flex items-center gap-1">
              <input
                autoFocus
                type="text"
                placeholder="Tab Name..."
                value={newTabLabel}
                onChange={(e) => setNewTabLabel(e.target.value)}
                onBlur={() => {
                  if (!newTabLabel.trim()) setIsAddingTab(false)
                }}
                className="bg-zinc-950 border border-indigo-500 text-white text-xs px-2 py-1 rounded w-20 focus:outline-none"
              />
            </form>
          ) : (
            <button
              onClick={() => setIsAddingTab(true)}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Add Inspector Tab"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsRightSidebarOpen(false)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── BODY CONTENT PER ACTIVE TAB ───────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-zinc-800">
        {/* ── TAB 1: WIDGET LIBRARY ───────────────────────────── */}
        {activeRightTabId === 'widgets' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                Dockview Widget Library
              </h3>
              <p className="text-xs text-zinc-400">
                Click any widget to insert it directly into your live layout canvas.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAddWidget('kpi', 'below')}
                className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 flex flex-col gap-1 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-indigo-400">
                  <Hash className="w-4 h-4" />
                  <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200 font-mono">
                    + Below
                  </span>
                </div>
                <span className="text-xs font-semibold text-zinc-100">KPI Summary</span>
                <span className="text-[10px] text-zinc-400">Metric counters & deltas</span>
              </button>

              <button
                onClick={() => handleAddWidget('chart', 'right')}
                className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 flex flex-col gap-1 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-blue-400">
                  <BarChart2 className="w-4 h-4" />
                  <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200 font-mono">
                    + Right
                  </span>
                </div>
                <span className="text-xs font-semibold text-zinc-100">Live Chart</span>
                <span className="text-[10px] text-zinc-400">Area, Line, Bar trends</span>
              </button>

              <button
                onClick={() => handleAddWidget('table', 'below')}
                className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 flex flex-col gap-1 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-emerald-400">
                  <TableIcon className="w-4 h-4" />
                  <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200 font-mono">
                    + Below
                  </span>
                </div>
                <span className="text-xs font-semibold text-zinc-100">Data Table</span>
                <span className="text-[10px] text-zinc-400">Entity records & status</span>
              </button>

              <button
                onClick={() => handleAddWidget('notes', 'right')}
                className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 flex flex-col gap-1 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-amber-400">
                  <FileText className="w-4 h-4" />
                  <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200 font-mono">
                    + Right
                  </span>
                </div>
                <span className="text-xs font-semibold text-zinc-100">Notes Runbook</span>
                <span className="text-[10px] text-zinc-400">Markdown directives</span>
              </button>

              <button
                onClick={() => handleAddWidget('activity', 'below')}
                className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 flex flex-col gap-1 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-rose-400">
                  <Activity className="w-4 h-4" />
                  <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200 font-mono">
                    + Below
                  </span>
                </div>
                <span className="text-xs font-semibold text-zinc-100">Activity Feed</span>
                <span className="text-[10px] text-zinc-400">Live operational events</span>
              </button>

              <button
                onClick={() => handleAddWidget('actionpad', 'right')}
                className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 flex flex-col gap-1 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-amber-300">
                  <Zap className="w-4 h-4" />
                  <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200 font-mono">
                    + Right
                  </span>
                </div>
                <span className="text-xs font-semibold text-zinc-100">Action Pad</span>
                <span className="text-[10px] text-zinc-400">Script execution triggers</span>
              </button>
            </div>

            {/* Publish App Callout */}
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-zinc-200 font-semibold text-xs">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>Publish Standalone App</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-normal">
                Ready to deliver? Export standalone React code with{' '}
                <strong className="text-white font-medium">zero Dockview runtime</strong>.
              </p>
              <button
                onClick={() => setIsBakeModalOpen(true)}
                className="py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors text-center flex items-center justify-center gap-1.5 border border-zinc-700"
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Publish App (.tsx)</span>
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 2: THEME & CSS SLIDERS ──────────────────────── */}
        {activeRightTabId === 'theme' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Theme & CSS Engine
                </h3>
                <p className="text-xs text-zinc-400">Direct Dockview CSS variable overrides</p>
              </div>
              <button
                onClick={resetThemeInspector}
                className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
                title="Reset Sliders"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dockview Theme Palette */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>Palette Preset</span>
              </label>
              <select
                value={selectedThemeKey}
                onChange={(e) => setSelectedThemeKey(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs p-2 rounded-lg focus:outline-none"
              >
                {DOCKVIEW_THEMES.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Gap Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-300 font-medium">
                <span>Layout Gap</span>
                <span className="font-mono text-zinc-400">{themeInspector.gap}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="32"
                value={themeInspector.gap}
                onChange={(e) => updateThemeInspector({ gap: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Padding Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-300 font-medium">
                <span>Canvas Padding</span>
                <span className="font-mono text-zinc-400">{themeInspector.padding}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="32"
                value={themeInspector.padding}
                onChange={(e) => updateThemeInspector({ padding: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Border Radius */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-300 font-medium">
                <span>Border Radius</span>
                <span className="font-mono text-zinc-400">{themeInspector.borderRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                value={themeInspector.borderRadius}
                onChange={(e) => updateThemeInspector({ borderRadius: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Tab Bar Height */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-300 font-medium">
                <span>Tab Bar Height</span>
                <span className="font-mono text-zinc-400">{themeInspector.tabBarHeight}px</span>
              </div>
              <input
                type="range"
                min="24"
                max="56"
                value={themeInspector.tabBarHeight}
                onChange={(e) => updateThemeInspector({ tabBarHeight: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Border Thickness */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-300 font-medium">
                <span>Border Thickness</span>
                <span className="font-mono text-zinc-400">
                  {themeInspector.borderThickness || 1}px
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={themeInspector.borderThickness || 1}
                onChange={(e) => updateThemeInspector({ borderThickness: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Left Sidebar Width */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-300 font-medium">
                <span>Left Sidebar Width</span>
                <span className="font-mono text-zinc-400">{leftSidebarWidth}px</span>
              </div>
              <input
                type="range"
                min="160"
                max="540"
                value={leftSidebarWidth}
                onChange={(e) => setLeftSidebarWidth(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Right Sidebar Width */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-300 font-medium">
                <span>Right Sidebar Width</span>
                <span className="font-mono text-zinc-400">{rightSidebarWidth}px</span>
              </div>
              <input
                type="range"
                min="260"
                max="720"
                value={rightSidebarWidth}
                onChange={(e) => setRightSidebarWidth(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        )}

        {/* ── TAB 3: FRAMING BRANDING ─────────────────────────── */}
        {activeRightTabId === 'framing' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                Client Framing & Typography
              </h3>
              <p className="text-xs text-zinc-400">Brand titles, fonts, and footer indicators</p>
            </div>

            {/* App Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                <Heading className="w-3.5 h-3.5 text-indigo-400" />
                <span>Header Title</span>
              </label>
              <input
                type="text"
                value={headerConfig.title}
                onChange={(e) => updateHeaderConfig({ title: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs p-2 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Subtitle</label>
              <input
                type="text"
                value={headerConfig.subtitle}
                onChange={(e) => updateHeaderConfig({ subtitle: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs p-2 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Font Family */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Font Family</label>
              <select
                value={headerConfig.fontFamily}
                onChange={(e) =>
                  updateHeaderConfig({ fontFamily: e.target.value as FontFamilyKey })
                }
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs p-2 rounded-lg focus:outline-none"
              >
                <option value="outfit">Outfit (Modern Tech)</option>
                <option value="inter">Inter (Clean UI)</option>
                <option value="jetbrains">JetBrains Mono (Developer)</option>
                <option value="geist">Geist (Minimalist)</option>
                <option value="system">System Default</option>
              </select>
            </div>

            {/* Footer Status Label */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                <span>Footer Status Label</span>
              </label>
              <input
                type="text"
                value={footerConfig.statusLabel}
                onChange={(e) => updateFooterConfig({ statusLabel: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs p-2 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* ── TAB 4: AI AGENT (NATIVE MCP SERVER) ──────────── */}
        {activeRightTabId === 'agent' && <McpAgentInspector />}

        {/* ── TAB 5: CUSTOM TAB ──────────────────────────────── */}
        {activeRightTabId !== 'widgets' &&
          activeRightTabId !== 'theme' &&
          activeRightTabId !== 'framing' &&
          activeRightTabId !== 'agent' && (
            <div className="p-4 text-center text-xs text-zinc-400 space-y-2">
              <Sparkles className="w-6 h-6 mx-auto text-indigo-400" />
              <div className="font-semibold text-zinc-200">Custom Inspector View</div>
              <p>Dynamic custom inspector panel for extension widgets and notes.</p>
            </div>
          )}
      </div>
    </aside>
  )
}
