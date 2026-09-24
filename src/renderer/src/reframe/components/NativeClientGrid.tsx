import React, { useState } from 'react'
import { useReframeStore } from '../stores/reframe-store'
import { REFRAME_WIDGET_COMPONENTS } from '../widgets/reframe-widgets'
import type { PanelConfig } from '../types/reframe-types'
import {
  Sparkles,
  BarChart2,
  Table as TableIcon,
  FileText,
  Activity,
  Zap,
  Globe,
  Layers,
  Terminal,
  Server,
  LayoutGrid
} from 'lucide-react'

const WIDGET_ICONS: Record<string, React.FC<{ className?: string }>> = {
  kpi: Layers,
  chart: BarChart2,
  table: TableIcon,
  notes: FileText,
  activity: Activity,
  actionpad: Zap,
  embed: Globe,
  terminal: Terminal,
  cluster: Server,
  empty: LayoutGrid
}

interface ClientPanelCardProps {
  groupData: any
  panels: Record<string, PanelConfig>
}

const ClientPanelCard: React.FC<ClientPanelCardProps> = ({ groupData, panels }) => {
  const views: string[] = groupData?.views || []
  const initialActive = groupData?.activeView || views[0]
  const [activeViewId, setActiveViewId] = useState<string>(initialActive)

  const activePanelId = views.includes(activeViewId) ? activeViewId : views[0]
  const panel = panels[activePanelId]

  if (!panel) {
    return (
      <div className="w-full h-full rounded-xl bg-zinc-900/30 border border-zinc-800/50 flex items-center justify-center p-4">
        <span className="text-xs text-zinc-500">Panel not found</span>
      </div>
    )
  }

  if (panel.widgetType === 'empty') {
    return (
      <div className="w-full h-full min-h-[180px] rounded-xl bg-zinc-900/30 border border-dashed border-zinc-800/80 p-6 flex flex-col items-center justify-center text-center space-y-2 select-none">
        <LayoutGrid className="w-7 h-7 text-zinc-600" />
        <span className="text-xs font-medium text-zinc-400">Empty Wireframe Slot</span>
        <span className="text-[11px] text-zinc-600">Reserved position in client layout</span>
      </div>
    )
  }

  const WidgetComponent = REFRAME_WIDGET_COMPONENTS[panel.widgetType]
  const Icon = WIDGET_ICONS[panel.widgetType] || Sparkles

  return (
    <div className="w-full h-full rounded-xl bg-zinc-900/50 border border-zinc-800/80 overflow-hidden shadow-sm flex flex-col hover:border-zinc-700/80 transition-all backdrop-blur-sm min-h-[180px]">
      {/* Native Card Header (Zero Dockview Tabs) */}
      <div className="px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/70 flex items-center justify-between shrink-0">
        {views.length > 1 ? (
          // Tab-group stack switcher
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 min-w-0">
            {views.map((vId) => {
              const p = panels[vId]
              if (!p) return null
              const isSelected = p.id === activePanelId
              const TabIcon = WIDGET_ICONS[p.widgetType] || Sparkles
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveViewId(p.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[130px]">{p.title}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1 rounded bg-zinc-800 text-zinc-300 shrink-0">
              <Icon className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-semibold text-zinc-100 tracking-tight truncate">
              {panel.title}
            </h3>
          </div>
        )}

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50">
            {panel.widgetType}
          </span>
        </div>
      </div>

      {/* Widget Body */}
      <div className="flex-1 min-h-[140px] relative bg-zinc-950/40 p-1 flex flex-col overflow-auto">
        {WidgetComponent ? (
          <WidgetComponent
            api={null as any}
            containerApi={null as any}
            params={panel.widgetProps}
          />
        ) : (
          <div className="p-6 text-center text-xs text-zinc-500">Widget not found</div>
        )}
      </div>
    </div>
  )
}

interface DockviewNodeRendererProps {
  node: any
  orientation: 'HORIZONTAL' | 'VERTICAL'
  panels: Record<string, PanelConfig>
}

const DockviewNodeRenderer: React.FC<DockviewNodeRendererProps> = ({
  node,
  orientation,
  panels
}) => {
  if (!node) return null

  if (node.type === 'leaf') {
    return <ClientPanelCard groupData={node.data} panels={panels} />
  }

  if (node.type === 'branch') {
    const children = Array.isArray(node.data) ? node.data : []
    const isHorizontal = orientation === 'HORIZONTAL'
    // Alternating split direction at each level
    const nextOrientation = isHorizontal ? 'VERTICAL' : 'HORIZONTAL'

    return (
      <div
        className={`w-full h-full flex gap-4 min-w-0 min-h-0 ${
          isHorizontal ? 'flex-col md:flex-row' : 'flex-col'
        }`}
      >
        {children.map((child: any, idx: number) => {
          const flexGrow = typeof child.size === 'number' && child.size > 0 ? child.size : 1
          return (
            <div
              key={idx}
              className="flex-1 min-w-0 min-h-0 flex flex-col"
              style={{ flex: `${flexGrow} 1 0%` }}
            >
              <DockviewNodeRenderer node={child} orientation={nextOrientation} panels={panels} />
            </div>
          )
        })}
      </div>
    )
  }

  return null
}

export const NativeClientGrid: React.FC = () => {
  const { panels, deviceMode, activeHeaderTabId, tabWorkspaces, dockviewApi } = useReframeStore()

  const panelList = Object.values(panels)

  // If there are zero panels, stay completely empty
  if (panelList.length === 0) {
    return <div className="w-full h-full bg-zinc-950" />
  }

  const activeWorkspace = activeHeaderTabId ? tabWorkspaces[activeHeaderTabId] : undefined
  const layoutJson = activeWorkspace?.layoutJson || (dockviewApi ? dockviewApi.toJSON() : undefined)

  const hasTreeLayout = Boolean(
    layoutJson?.grid?.root &&
    Array.isArray(layoutJson.grid.root.data) &&
    layoutJson.grid.root.data.length > 0
  )

  const frameClass =
    deviceMode === 'tablet'
      ? 'max-w-4xl mx-auto my-6 border border-zinc-800 rounded-2xl shadow-2xl p-4 flex-1 flex flex-col min-h-0'
      : deviceMode === 'mobile'
        ? 'max-w-md mx-auto my-4 border border-zinc-800 rounded-xl shadow-2xl p-3 flex-1 flex flex-col min-h-0'
        : 'w-full h-full flex-1 flex flex-col min-h-0 min-w-0'

  return (
    <div className="w-full h-full overflow-y-auto bg-zinc-950 p-6 select-none scrollbar-thin scrollbar-thumb-zinc-800 flex flex-col">
      <div className={`${frameClass} transition-all duration-300`}>
        {hasTreeLayout ? (
          // ── 1. FAITHFUL DOCKVIEW TREE LAYOUT (COLUMNS & ROWS MATCHING BUILDER MODE) ──
          <div className="w-full h-full min-h-0 min-w-0 flex-1 flex flex-col">
            <DockviewNodeRenderer
              node={layoutJson.grid.root}
              orientation={layoutJson.grid.orientation || 'HORIZONTAL'}
              panels={panels}
            />
          </div>
        ) : (
          // ── 2. FALLBACK BALANCED GRID ──────────────────────────────────────────────
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            {panelList.map((p) => {
              const WidgetComponent = REFRAME_WIDGET_COMPONENTS[p.widgetType]
              const Icon = WIDGET_ICONS[p.widgetType] || Sparkles

              return (
                <div
                  key={p.id}
                  className="rounded-xl bg-zinc-900/50 border border-zinc-800/80 overflow-hidden shadow-sm flex flex-col hover:border-zinc-700/80 transition-all backdrop-blur-sm min-h-[220px]"
                >
                  <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/70 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded bg-zinc-800 text-zinc-300">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs font-semibold text-zinc-100 tracking-tight">
                        {p.title}
                      </h3>
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50">
                      {p.widgetType}
                    </span>
                  </div>

                  <div className="flex-1 min-h-[140px] relative bg-zinc-950/40 p-1 flex flex-col overflow-auto">
                    {WidgetComponent ? (
                      <WidgetComponent
                        api={null as any}
                        containerApi={null as any}
                        params={p.widgetProps}
                      />
                    ) : (
                      <div className="p-6 text-center text-xs text-zinc-500">Widget not found</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
