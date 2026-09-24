import React, { useState, useMemo, useEffect } from 'react'
import {
  X,
  Search,
  Plus,
  TrendingUp,
  BarChart2,
  Table as TableIcon,
  Radio,
  Terminal,
  Zap,
  FileText,
  ShoppingCart,
  ShieldCheck,
  Users,
  Target,
  DollarSign,
  Server,
  Activity,
  Clock,
  Cpu,
  Globe,
  Filter,
  Database,
  AlertOctagon,
  Receipt,
  Layers,
  Shield,
  UserCheck,
  ToggleRight,
  Lock,
  GitCommit,
  LifeBuoy,
  CreditCard,
  Sliders,
  AlertTriangle,
  BookOpen,
  Code2,
  Briefcase,
  ClipboardList,
  Check
} from 'lucide-react'
import { useReframeStore } from '../stores/reframe-store'
import {
  WIDGET_CATALOG,
  WIDGET_CATEGORIES,
  type WidgetCatalogItem
} from '../widgets/catalog/widget-catalog'

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  TrendingUp,
  BarChart2,
  Table: TableIcon,
  Radio,
  Terminal,
  Zap,
  FileText,
  ShoppingCart,
  ShieldCheck,
  Users,
  Target,
  DollarSign,
  Server,
  Activity,
  Clock,
  Cpu,
  Globe,
  Filter,
  Database,
  AlertOctagon,
  Receipt,
  Layers,
  Shield,
  UserCheck,
  ToggleRight,
  Lock,
  GitCommit,
  LifeBuoy,
  CreditCard,
  Sliders,
  AlertTriangle,
  BookOpen,
  Code2,
  Briefcase,
  ClipboardList
}

export const WidgetCatalogModal: React.FC = () => {
  const {
    isCatalogModalOpen,
    setIsCatalogModalOpen,
    catalogPlacementDirection,
    setCatalogPlacementDirection,
    insertCatalogWidget,
    targetSlotId,
    setTargetSlotId,
    panels
  } = useReframeStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [keepOpen, setKeepOpen] = useState(false)
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCatalogModalOpen) {
        setIsCatalogModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCatalogModalOpen, setIsCatalogModalOpen])

  // Filter widgets by category & search query
  const filteredWidgets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return WIDGET_CATALOG.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      if (!matchesCategory) return false

      if (!q) return true
      const inTitle = item.title.toLowerCase().includes(q)
      const inDesc = item.description.toLowerCase().includes(q)
      const inDomain = item.domainBadge.toLowerCase().includes(q)
      const inTags = item.tags.some((t) => t.toLowerCase().includes(q))
      return inTitle || inDesc || inDomain || inTags
    })
  }, [searchQuery, selectedCategory])

  if (!isCatalogModalOpen) return null

  const handleSelectWidget = (item: WidgetCatalogItem) => {
    insertCatalogWidget(item, catalogPlacementDirection)
    setRecentlyAddedId(item.id)
    setTimeout(() => setRecentlyAddedId(null), 1500)

    if (!keepOpen) {
      setIsCatalogModalOpen(false)
    }
  }

  // Count items per category
  const categoryCounts = WIDGET_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat.id] =
        cat.id === 'all'
          ? WIDGET_CATALOG.length
          : WIDGET_CATALOG.filter((w) => w.category === cat.id).length
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* ── 1. MODAL HEADER & CONTROLS ───────────────────────── */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between gap-4 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-indigo-400 shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Widget Catalog</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {WIDGET_CATALOG.length} Pre-made
                </span>
                {targetSlotId && panels[targetSlotId] && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5 shadow-sm">
                    <span>Filling: {panels[targetSlotId].title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setTargetSlotId(null)
                      }}
                      className="hover:text-white"
                      title="Cancel targeting slot"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Client-ready Dockview components with zero external dependencies.
              </p>
            </div>
          </div>

          {/* Placement selector & Close button */}
          <div className="flex items-center gap-3">
            {!targetSlotId ? (
              <div className="flex items-center gap-1.5 text-xs text-zinc-300 bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 font-medium">Placement:</span>
                <select
                  value={catalogPlacementDirection}
                  onChange={(e) => setCatalogPlacementDirection(e.target.value as any)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer font-medium"
                >
                  <option value="right" className="bg-zinc-900 text-white">
                    + Right
                  </option>
                  <option value="below" className="bg-zinc-900 text-white">
                    + Below
                  </option>
                  <option value="left" className="bg-zinc-900 text-white">
                    + Left
                  </option>
                  <option value="above" className="bg-zinc-900 text-white">
                    + Above
                  </option>
                  <option value="stack" className="bg-zinc-900 text-white">
                    Tab Stack
                  </option>
                </select>
              </div>
            ) : null}

            <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={keepOpen}
                onChange={(e) => setKeepOpen(e.target.checked)}
                className="accent-indigo-500 rounded cursor-pointer"
              />
              <span>Add multiple</span>
            </label>

            <button
              onClick={() => setIsCatalogModalOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-1"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 2. SEARCH & CATEGORY BAR ─────────────────────────── */}
        <div className="px-6 py-3 border-b border-zinc-850 bg-zinc-950/90 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shrink-0">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              autoFocus
              type="text"
              placeholder="Search 42+ widgets, metrics, tables, runbooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white text-xs pl-9 pr-8 py-2 rounded-xl focus:outline-none placeholder:text-zinc-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-xs text-zinc-400 font-mono">
            Showing <span className="text-white font-semibold">{filteredWidgets.length}</span> of{' '}
            {WIDGET_CATALOG.length}
          </div>
        </div>

        {/* ── 3. MAIN BODY (CATEGORY TABS + WIDGET GRID) ──────── */}
        <div className="flex-1 flex overflow-hidden">
          {/* Category Vertical Nav */}
          <div className="w-52 border-r border-zinc-850 bg-zinc-950/60 p-3 space-y-1 overflow-y-auto shrink-0">
            <div className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Categories
            </div>
            {WIDGET_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id
              const count = categoryCounts[cat.id] || 0
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                    isSelected
                      ? 'bg-zinc-800 text-white font-semibold border border-zinc-700/80 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <span className="truncate">{cat.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Widget Cards Grid */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800">
            {filteredWidgets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Search className="w-10 h-10 text-zinc-600 mb-3" />
                <h4 className="text-sm font-semibold text-zinc-300">No widgets found</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                  No widget matched &quot;{searchQuery}&quot; in the selected category. Try
                  searching for &quot;revenue&quot;, &quot;chart&quot;, or &quot;sre&quot;.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="mt-4 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredWidgets.map((item) => {
                  const Icon = ICON_MAP[item.icon] || Layers
                  const isAdded = recentlyAddedId === item.id

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectWidget(item)}
                      className="group p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-850/80 cursor-pointer transition-all flex flex-col justify-between shadow-sm relative overflow-hidden"
                    >
                      <div>
                        {/* Card Header: Icon + Domain Badge */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 group-hover:border-zinc-600 transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-750">
                            {item.domainBadge}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors tracking-tight line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Card Footer: Category Label + Insert Action */}
                      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">
                          {item.categoryLabel}
                        </span>

                        <div
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                            isAdded
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-zinc-800 text-zinc-200 group-hover:bg-indigo-600 group-hover:text-white'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Added!</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Insert</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── 4. MODAL FOOTER ─────────────────────────────────── */}
        <div className="px-6 py-3 border-t border-zinc-850 bg-zinc-900/90 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <div>Click any widget to place it into the active workspace tab.</div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-zinc-500">
              Zero Dockview Deliverable Ready
            </span>
            <button
              onClick={() => setIsCatalogModalOpen(false)}
              className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
