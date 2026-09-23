import React from 'react'
import { useReframeStore } from '../stores/reframe-store'
import { REFRAME_WIDGET_COMPONENTS } from '../widgets/reframe-widgets'
import {
  Sparkles,
  BarChart2,
  Table as TableIcon,
  FileText,
  Activity,
  Zap,
  Globe,
  Layers
} from 'lucide-react'

const WIDGET_ICONS: Record<string, React.FC<{ className?: string }>> = {
  kpi: Layers,
  chart: BarChart2,
  table: TableIcon,
  notes: FileText,
  activity: Activity,
  actionpad: Zap,
  embed: Globe
}

export const NativeClientGrid: React.FC = () => {
  const { panels, deviceMode } = useReframeStore()

  const panelList = Object.values(panels)

  // If there are zero panels, stay completely empty
  if (panelList.length === 0) {
    return <div className="w-full h-full bg-zinc-950" />
  }

  // Separate KPI widgets from detailed panels for optimal visual layout
  const kpiPanels = panelList.filter((p) => p.widgetType === 'kpi')
  const contentPanels = panelList.filter((p) => p.widgetType !== 'kpi')

  const frameClass =
    deviceMode === 'tablet'
      ? 'max-w-4xl mx-auto my-6 border border-zinc-800 rounded-2xl shadow-2xl p-4'
      : deviceMode === 'mobile'
        ? 'max-w-md mx-auto my-4 border border-zinc-800 rounded-xl shadow-2xl p-3'
        : 'w-full'

  return (
    <div className="w-full h-full overflow-y-auto bg-zinc-950 p-6 select-none scrollbar-thin scrollbar-thumb-zinc-800">
      <div className={`${frameClass} space-y-6 transition-all duration-300`}>
        {/* 1. Top KPI Summary Strip */}
        {kpiPanels.length > 0 && (
          <div className="space-y-4">
            {kpiPanels.map((p) => {
              const WidgetComponent = REFRAME_WIDGET_COMPONENTS[p.widgetType]
              return (
                <div
                  key={p.id}
                  className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden shadow-sm backdrop-blur-sm"
                >
                  {p.title && (
                    <div className="px-4 py-2.5 border-b border-zinc-800/70 bg-zinc-900/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-xs font-semibold text-zinc-200 tracking-tight">
                          {p.title}
                        </h3>
                      </div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                        Live Metrics
                      </span>
                    </div>
                  )}
                  {WidgetComponent && (
                    <div className="p-1">
                      <WidgetComponent
                        api={null as any}
                        containerApi={null as any}
                        params={p.widgetProps}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* 2. Main Content Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {contentPanels.map((p, idx) => {
            const WidgetComponent = REFRAME_WIDGET_COMPONENTS[p.widgetType]
            const Icon = WIDGET_ICONS[p.widgetType] || Sparkles

            // Sizing: Charts, Tables, and Embeds get 8 columns or 12 columns; others get 4 columns
            const isWide =
              p.widgetType === 'chart' || p.widgetType === 'table' || p.widgetType === 'embed'

            const colSpan =
              contentPanels.length === 1
                ? 'lg:col-span-12'
                : isWide
                  ? idx % 2 === 0
                    ? 'lg:col-span-7'
                    : 'lg:col-span-8'
                  : 'lg:col-span-4'

            return (
              <div
                key={p.id}
                className={`${colSpan} rounded-xl bg-zinc-900/50 border border-zinc-800/80 overflow-hidden shadow-sm flex flex-col hover:border-zinc-700/80 transition-all backdrop-blur-sm`}
              >
                {/* Native Card Header (Zero Dockview Tabs) */}
                <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded bg-zinc-800 text-zinc-300">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
                      {p.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50">
                      {p.widgetType}
                    </span>
                  </div>
                </div>

                {/* Widget Body */}
                <div className="flex-1 min-h-[220px] relative bg-zinc-950/40">
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
      </div>
    </div>
  )
}
