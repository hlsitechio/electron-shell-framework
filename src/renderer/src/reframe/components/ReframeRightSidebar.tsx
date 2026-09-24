import React, { useState, useMemo } from 'react'
import {
  Sparkles,
  X,
  Plus,
  RotateCcw,
  Palette,
  Heading,
  Footprints,
  Bot,
  Code2,
  Search,
  Layers,
  Columns,
  Rows,
  LayoutGrid
} from 'lucide-react'
import { useReframeStore, DOCKVIEW_THEMES } from '../stores/reframe-store'
import type { FontFamilyKey } from '../types/reframe-types'
import { WIDGET_CATALOG, WIDGET_CATEGORIES } from '../widgets/catalog/widget-catalog'
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
    setIsBakeModalOpen,
    setIsCatalogModalOpen,
    insertCatalogWidget,
    addEmptySlot,
    scaffoldBlankLayout,
    rightSidebarWidth,
    leftSidebarWidth,
    setLeftSidebarWidth,
    setRightSidebarWidth
  } = useReframeStore()

  const [isAddingTab, setIsAddingTab] = useState(false)
  const [newTabLabel, setNewTabLabel] = useState('')
  const [catalogSearch, setCatalogSearch] = useState('')
  const [sidebarCategory, setSidebarCategory] = useState<string>('all')

  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.toLowerCase().trim()
    return WIDGET_CATALOG.filter((item) => {
      const matchCat = sidebarCategory === 'all' || item.category === sidebarCategory
      if (!matchCat) return false
      if (!q) return true
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [catalogSearch, sidebarCategory])

  if (!isRightSidebarOpen) return null

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
          <div className="space-y-3.5">
            {/* Layout Wireframing (Map Grid First) */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Map Wireframe Layout</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">No Widgets</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => addEmptySlot('right')}
                  className="px-2 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Columns className="w-3 h-3 text-indigo-400" />
                  <span>+ Empty Col</span>
                </button>
                <button
                  onClick={() => addEmptySlot('below')}
                  className="px-2 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Rows className="w-3 h-3 text-emerald-400" />
                  <span>+ Empty Row</span>
                </button>
              </div>

              {/* Wireframe Presets */}
              <div className="pt-1.5 border-t border-zinc-800/60 space-y-1">
                <div className="text-[10px] font-mono uppercase text-zinc-500">
                  Scaffold Blank Presets
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => scaffoldBlankLayout('2-columns')}
                    className="py-1 px-1.5 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-[10px] transition-colors text-center"
                  >
                    2 Columns
                  </button>
                  <button
                    onClick={() => scaffoldBlankLayout('3-columns')}
                    className="py-1 px-1.5 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-[10px] transition-colors text-center"
                  >
                    3 Columns
                  </button>
                  <button
                    onClick={() => scaffoldBlankLayout('2x2-grid')}
                    className="py-1 px-1.5 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-[10px] transition-colors text-center"
                  >
                    2x2 Grid
                  </button>
                  <button
                    onClick={() => scaffoldBlankLayout('header-2-col')}
                    className="py-1 px-1.5 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-[10px] transition-colors text-center"
                  >
                    Hero + 2 Col
                  </button>
                  <button
                    onClick={() => scaffoldBlankLayout('3-rows')}
                    className="py-1 px-1.5 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-[10px] transition-colors text-center"
                  >
                    3 Rows
                  </button>
                  <button
                    onClick={() => scaffoldBlankLayout('1-slot')}
                    className="py-1 px-1.5 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-[10px] transition-colors text-center"
                  >
                    1 Slot
                  </button>
                </div>
              </div>
            </div>

            {/* Header + Browse Full Catalog Banner */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Widget Palette
                </h3>
                <span className="text-[10px] font-mono text-zinc-400">
                  {WIDGET_CATALOG.length} Pre-made
                </span>
              </div>
              <button
                onClick={() => setIsCatalogModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Layers className="w-4 h-4" />
                <span>Browse Full Catalog ({WIDGET_CATALOG.length}+)</span>
              </button>
            </div>

            {/* Mini Search & Category Chips */}
            <div className="space-y-2 pt-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter widgets..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white text-[11px] pl-8 pr-2.5 py-1.5 rounded-lg focus:outline-none placeholder:text-zinc-500 transition-colors"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                {WIDGET_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSidebarCategory(cat.id)}
                    className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                      sidebarCategory === cat.id
                        ? 'bg-zinc-800 text-white border border-zinc-700 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Widget Cards */}
            <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-zinc-800">
              {filteredCatalog.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-500">
                  No widgets found matching &quot;{catalogSearch}&quot;
                </div>
              ) : (
                filteredCatalog.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {item.title}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                        {item.domainBadge}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 line-clamp-1 leading-normal">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">
                        {item.categoryLabel}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => insertCatalogWidget(item, 'below')}
                          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-mono transition-colors"
                          title="Insert below active panel"
                        >
                          + Below
                        </button>
                        <button
                          onClick={() => insertCatalogWidget(item, 'right')}
                          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-indigo-600 text-zinc-300 hover:text-white text-[10px] font-mono transition-colors"
                          title="Insert to the right"
                        >
                          + Right
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
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
