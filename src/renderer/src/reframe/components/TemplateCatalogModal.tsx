import React, { useState, useMemo } from 'react'
import {
  X,
  Search,
  Check,
  Sparkles,
  Layers,
  Activity,
  Terminal,
  BrainCircuit,
  Video,
  FileText,
  Calendar,
  BarChart3,
  ShieldCheck,
  LayoutGrid,
  ChevronRight,
  Clock,
  Columns
} from 'lucide-react'
import {
  useReframeStore,
  TEMPLATES,
  TemplateId,
  ReframeTemplateItem
} from '../stores/reframe-store'

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Finance: Layers,
  'AI & Agents': BrainCircuit,
  DevOps: Activity,
  Engineering: Terminal,
  Meetings: Video,
  Documents: FileText,
  Productivity: Calendar,
  Analytics: BarChart3,
  Security: ShieldCheck,
  Minimal: LayoutGrid
}

const CATEGORIES = [
  'All',
  'Finance',
  'AI & Agents',
  'DevOps',
  'Engineering',
  'Meetings',
  'Documents',
  'Productivity',
  'Analytics',
  'Security',
  'Minimal'
] as const

export const TemplateCatalogModal: React.FC = () => {
  const { isTemplateModalOpen, setIsTemplateModalOpen, currentTemplateId, loadTemplate } =
    useReframeStore()

  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [activePreviewTabs, setActivePreviewTabs] = useState<Record<string, string>>({})

  // Filter templates based on category and search query
  const filteredTemplates = useMemo(() => {
    return (Object.values(TEMPLATES) as ReframeTemplateItem[]).filter((tpl) => {
      // Exclude blank playground from catalog showcase or list it under Minimal
      if (tpl.id === 'blank') return false

      const matchesCat = selectedCategory === 'All' || tpl.category === selectedCategory

      const query = searchQuery.trim().toLowerCase()
      if (!query) return matchesCat

      const matchesName = tpl.name.toLowerCase().includes(query)
      const matchesDesc = tpl.description.toLowerCase().includes(query)
      const matchesCatName = tpl.category.toLowerCase().includes(query)
      const matchesTabs = tpl.headerTabs?.some((tab) => tab.label.toLowerCase().includes(query))

      return matchesCat && (matchesName || matchesDesc || matchesCatName || matchesTabs)
    })
  }, [selectedCategory, searchQuery])

  if (!isTemplateModalOpen) return null

  const handleApply = (id: TemplateId) => {
    loadTemplate(id)
    setIsTemplateModalOpen(false)
  }

  const handleTabPreviewClick = (tplId: string, tabId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActivePreviewTabs((prev) => ({
      ...prev,
      [tplId]: tabId
    }))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setIsTemplateModalOpen(false)}
    >
      <div
        className="w-full max-w-6xl max-h-[92vh] flex flex-col bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-850 bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Starter App Templates
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                  10 Premade Suited Apps • 5 Tabs × 5 Widgets
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Each starter template ships with 5 dedicated workspace tabs and 5 pre-selected
                widgets per tab (25 total widgets). Apply and customize freely.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTemplateModalOpen(false)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── CONTROLS & FILTER ROW ─────────────────────────────────── */}
        <div className="px-6 py-3 border-b border-zinc-850/80 bg-zinc-900/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat !== 'All' ? CATEGORY_ICONS[cat] : null
              const isSelected = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{cat}</span>
                </button>
              )
            })}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px] md:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates or tabs..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* ── TEMPLATES GRID ────────────────────────────────────────── */}
        <div
          className="flex-1 min-h-0 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-5 items-start scrollbar-thin scrollbar-thumb-zinc-800"
          style={{ gridAutoRows: 'max-content' }}
        >
          {filteredTemplates.map((template) => {
            const isCurrent = currentTemplateId === template.id
            const CatIcon = CATEGORY_ICONS[template.category] || Layers
            const tabs = template.headerTabs || []

            // Current active tab preview for this card
            const currentTabId = activePreviewTabs[template.id] || tabs[0]?.id || ''
            const activeWorkspace = template.tabWorkspaces?.[currentTabId]
            const activePanels = activeWorkspace
              ? Object.values(activeWorkspace)
              : Object.values(template.panels || {})

            return (
              <div
                key={template.id}
                className={`flex flex-col bg-zinc-900/60 rounded-xl border transition-all duration-200 overflow-hidden ${
                  isCurrent
                    ? 'border-indigo-500/60 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-950/20'
                    : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/90'
                }`}
              >
                {/* Card Header */}
                <div className="p-4 sm:p-5 flex items-start justify-between gap-3 border-b border-zinc-850/60 bg-zinc-900/40">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-750 text-indigo-400 shrink-0 mt-0.5">
                      <CatIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
                          {template.name}
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                          {template.category}
                        </span>
                        {isCurrent && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                            <Check className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApply(template.id)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
                      isCurrent
                        ? 'bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    }`}
                  >
                    <span>{isCurrent ? 'Reset Layout' : 'Apply'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 5 Tabs Navigation Bar in Card */}
                <div className="px-4 py-2.5 bg-zinc-950/40 border-b border-zinc-850/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 shrink-0 mr-1 flex items-center gap-1">
                    <Columns className="w-3 h-3" />
                    <span>5 Tabs:</span>
                  </span>
                  {tabs.map((tab, idx) => {
                    const isTabActive = tab.id === currentTabId
                    return (
                      <button
                        key={tab.id}
                        onClick={(e) => handleTabPreviewClick(template.id, tab.id, e)}
                        className={`px-2 py-1 rounded text-xs transition-colors shrink-0 flex items-center gap-1.5 ${
                          isTabActive
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-medium'
                            : 'bg-zinc-850/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                        }`}
                        title={`Tab ${idx + 1}: ${tab.label}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* 5 Pre-Selected Widgets Preview for the Active Tab */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
                      <span className="font-medium text-zinc-300 flex items-center gap-1">
                        <span>Pre-selected widgets for this tab</span>
                        <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded text-[10px]">
                          {activePanels.length} widgets
                        </span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Theme: {template.themeKey.replace('dockview-theme-', '')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activePanels.map((panel, pIdx) => (
                        <div
                          key={panel.id || pIdx}
                          className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950/60 border border-zinc-850/80 text-xs"
                        >
                          <span className="w-4 h-4 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                            {pIdx + 1}
                          </span>
                          <span className="text-zinc-200 font-medium truncate">{panel.title}</span>
                          <span className="ml-auto text-[10px] text-zinc-500 font-mono uppercase shrink-0">
                            {panel.widgetType}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer status / subtle metadata */}
                  <div className="mt-4 pt-3 border-t border-zinc-850/60 flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="truncate">
                      Header:{' '}
                      <strong className="text-zinc-400 font-normal">{template.header.title}</strong>
                    </span>
                    <span className="shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>Ready to load</span>
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── FOOTER BAR ───────────────────────────────────────────── */}
        <div className="px-6 py-3 border-t border-zinc-850 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <div>
            Showing <strong className="text-zinc-200">{filteredTemplates.length}</strong> starter
            templates. Each template installs 5 dynamic tabs with 5 widgets ready to run offline.
          </div>
          <button
            onClick={() => setIsTemplateModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
