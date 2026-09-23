import React, { useState, useMemo, useEffect } from 'react'
import type { IDockviewPanelProps } from 'dockview-react'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Search,
  ArrowUpRight,
  Zap,
  Play,
  Check
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'

/* ============================================================
   1. KPI STAT WIDGET
   ============================================================ */
export const KpiPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const items = params?.items || [
    {
      label: 'Total Volume',
      value: '$24.8M',
      delta: '+12.4%',
      deltaType: 'positive',
      subtext: 'Trailing 30 days'
    },
    {
      label: 'Active Users',
      value: '18,420',
      delta: '+8.1%',
      deltaType: 'positive',
      subtext: 'High engagement'
    },
    {
      label: 'Conversion Rate',
      value: '3.64%',
      delta: '-0.2%',
      deltaType: 'neutral',
      subtext: 'Industry benchmark 3.2%'
    },
    {
      label: 'System Health',
      value: '99.98%',
      delta: '+0.01%',
      deltaType: 'positive',
      subtext: 'Zero incidents'
    }
  ]

  return (
    <div className="reframe-panel-body p-4 bg-zinc-900/60 text-zinc-100 flex flex-col justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item: any, idx: number) => {
          const isPos = item.deltaType === 'positive'
          const isNeg = item.deltaType === 'negative'
          return (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>{item.label}</span>
                {item.delta && (
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-medium ${
                      isPos
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isNeg
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-zinc-700/50 text-zinc-300'
                    }`}
                  >
                    {isPos ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : isNeg ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : null}
                    {item.delta}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold tracking-tight text-white my-0.5">
                {item.value}
              </div>
              {item.subtext && (
                <div className="text-[11px] text-zinc-500 truncate">{item.subtext}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================
   2. CHART WIDGET
   ============================================================ */
const SAMPLE_CHART_DATA = [
  { name: 'Jan', revenue: 420, conversions: 240, latency: 12 },
  { name: 'Feb', revenue: 480, conversions: 290, latency: 14 },
  { name: 'Mar', revenue: 560, conversions: 350, latency: 11 },
  { name: 'Apr', revenue: 610, conversions: 410, latency: 15 },
  { name: 'May', revenue: 690, conversions: 460, latency: 13 },
  { name: 'Jun', revenue: 780, conversions: 520, latency: 10 },
  { name: 'Jul', revenue: 840, conversions: 580, latency: 12 },
  { name: 'Aug', revenue: 920, conversions: 640, latency: 9 },
  { name: 'Sep', revenue: 1040, conversions: 710, latency: 11 }
]

export const ChartPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const title = params?.title || 'Performance Metric Over Time'
  const chartType = params?.chartType || 'area'
  const dataKey = params?.dataKey || 'revenue'
  const timeRange = params?.timeRange || 'Trailing 9 Months'

  return (
    <div className="reframe-panel-body p-4 bg-zinc-900/60 text-zinc-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-zinc-200">{title}</h4>
          <p className="text-xs text-zinc-500">{timeRange}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-zinc-800/80 px-2 py-1 rounded border border-zinc-700/60 text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Live Metrics
        </div>
      </div>

      <div className="flex-1 w-full min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart
              data={SAMPLE_CHART_DATA}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#3f3f46',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey={dataKey} fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart
              data={SAMPLE_CHART_DATA}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#3f3f46',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          ) : (
            <AreaChart
              data={SAMPLE_CHART_DATA}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#3f3f46',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#chartGradient)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ============================================================
   3. DATA TABLE WIDGET
   ============================================================ */
export const TablePanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const columns: Array<{ key: string; header: string }> = params?.columns || [
    { key: 'item', header: 'Item' },
    { key: 'category', header: 'Category' },
    { key: 'status', header: 'Status' }
  ]
  const filteredRows = useMemo(() => {
    const rows: Array<Record<string, any>> = params?.rows || [
      { item: 'Data Point 1', category: 'Core', status: 'Active' },
      { item: 'Data Point 2', category: 'Secondary', status: 'In Review' }
    ]
    if (!searchTerm.trim()) return rows
    const term = searchTerm.toLowerCase()
    return rows.filter((r) =>
      Object.values(r).some((val) => String(val).toLowerCase().includes(term))
    )
  }, [params?.rows, searchTerm])

  return (
    <div className="reframe-panel-body p-3 bg-zinc-900/60 text-zinc-100 flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {params?.title || 'Data Registry'}
        </h4>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 pr-2.5 py-1 text-xs bg-zinc-800 border border-zinc-700/70 rounded text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 w-44"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto border border-zinc-800 rounded">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-800/70 text-zinc-400 border-b border-zinc-700/60">
              {columns.map((col) => (
                <th key={col.key} className="py-2 px-3 font-medium">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filteredRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-zinc-800/40 transition-colors">
                {columns.map((col) => {
                  const val = row[col.key]
                  const isStatus =
                    col.key.toLowerCase().includes('status') ||
                    col.key.toLowerCase().includes('health')
                  return (
                    <td key={col.key} className="py-2 px-3 text-zinc-300">
                      {isStatus ? (
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${
                            val === 'Closing Soon' || val === 'Healthy' || val === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : val === 'In Review' ||
                                  val === 'Active Pilot' ||
                                  val === 'Review Needed'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-zinc-700/40 text-zinc-300'
                          }`}
                        >
                          {val}
                        </span>
                      ) : (
                        val
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ============================================================
   4. NOTES & RUNBOOK WIDGET
   ============================================================ */
export const NotesPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const content = params?.content || '### Operational Notes\n\nNo content configured.'
  return (
    <div className="reframe-panel-body p-4 bg-zinc-900/60 text-zinc-200">
      <div className="max-w-none text-xs leading-relaxed space-y-2 whitespace-pre-line text-zinc-300">
        {content}
      </div>
    </div>
  )
}

/* ============================================================
   5. LIVE ACTIVITY STREAM WIDGET
   ============================================================ */
interface LogEntry {
  id: string
  time: string
  severity: 'info' | 'warn' | 'error' | 'success'
  message: string
}

const INITIAL_LOGS: LogEntry[] = [
  {
    id: '1',
    time: '13:08:12',
    severity: 'info',
    message: 'Connected to distributed cluster mesh (48 nodes)'
  },
  {
    id: '2',
    time: '13:08:15',
    severity: 'success',
    message: 'Zero-downtime replication verified across regions'
  },
  {
    id: '3',
    time: '13:08:21',
    severity: 'info',
    message: 'Inbound clickstream ingest: 142k events/sec'
  },
  {
    id: '4',
    time: '13:08:32',
    severity: 'warn',
    message: 'Memory watermark reached 68% on node-worker-04 (auto-scaled)'
  },
  {
    id: '5',
    time: '13:08:44',
    severity: 'success',
    message: 'Synthetic end-to-end trace latency measured: 14.2ms'
  }
]

export const ActivityPanelWidget: React.FC<IDockviewPanelProps> = () => {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const timeStr = now.toTimeString().split(' ')[0]
      const events = [
        { severity: 'info', message: 'Healthcheck ping ack from gateway worker #12' },
        {
          severity: 'success',
          message: 'Database transaction commit batch completed (1,240 rows)'
        },
        { severity: 'info', message: 'Cache hit ratio 98.4% across CDN edge nodes' },
        { severity: 'warn', message: 'Slow query auto-optimized by database planner (42ms)' }
      ]
      const randomEvent = events[Math.floor(Math.random() * events.length)]
      setLogs((prev) => [
        ...prev.slice(-40),
        {
          id: String(Date.now()),
          time: timeStr,
          severity: randomEvent.severity as any,
          message: randomEvent.message
        }
      ])
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="reframe-panel-body p-3 bg-zinc-950 font-mono text-xs text-zinc-300 flex flex-col h-full">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          Live Telemetry Stream
        </span>
        <span className="text-zinc-500">{logs.length} events logged</span>
      </div>

      <div className="flex-1 overflow-auto pt-2 space-y-1.5">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-2 hover:bg-zinc-900/60 p-1 rounded transition-colors"
          >
            <span className="text-zinc-500 shrink-0 text-[10px]">{log.time}</span>
            {log.severity === 'success' && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            {log.severity === 'warn' && (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            )}
            {log.severity === 'error' && (
              <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            )}
            {log.severity === 'info' && (
              <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
            )}
            <span className="text-zinc-300 break-all">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   6. OPERATIONAL ACTION PAD WIDGET
   ============================================================ */
export const ActionPadPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const [activeActionId, setActiveActionId] = useState<string | null>(null)
  const actions = params?.actions || [
    { id: '1', label: 'Purge CDN Cache', description: 'Invalidates edge cache' },
    {
      id: '2',
      label: 'Rotate Session Salts',
      description: 'Gracefully rotates worker session keys'
    },
    { id: '3', label: 'Run Full Node Diagnostics', description: 'Generates telemetry report' }
  ]

  const handleTrigger = (id: string) => {
    setActiveActionId(id)
    setTimeout(() => setActiveActionId(null), 2000)
  }

  return (
    <div className="reframe-panel-body p-4 bg-zinc-900/60 text-zinc-100 flex flex-col justify-center h-full">
      <div className="space-y-2.5">
        {actions.map((act: any) => {
          const isDone = activeActionId === act.id
          return (
            <button
              key={act.id}
              onClick={() => handleTrigger(act.id)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/60 hover:bg-zinc-800 hover:border-zinc-500 transition-all text-left group"
            >
              <div>
                <div className="text-xs font-semibold text-zinc-200 group-hover:text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  {act.label}
                </div>
                {act.description && (
                  <div className="text-[11px] text-zinc-500 mt-0.5">{act.description}</div>
                )}
              </div>
              <div
                className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-700/60 text-zinc-300 group-hover:bg-indigo-600 group-hover:text-white'
                }`}
              >
                {isDone ? (
                  <>
                    <Check className="w-3 h-3" /> Done
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" /> Trigger
                  </>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================
   7. WEBVIEW / EMBED WIDGET
   ============================================================ */
export const EmbedPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const url = params?.url || 'https://dockview.dev'
  return (
    <div className="w-full h-full bg-zinc-950 flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400">
        <span className="truncate">{url}</span>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
        >
          Open External <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>
      <iframe src={url} className="w-full flex-1 border-0" title="Embedded view" />
    </div>
  )
}

export const REFRAME_WIDGET_COMPONENTS: Record<string, React.FC<IDockviewPanelProps>> = {
  kpi: KpiPanelWidget,
  metric: KpiPanelWidget,
  chart: ChartPanelWidget,
  table: TablePanelWidget,
  notes: NotesPanelWidget,
  activity: ActivityPanelWidget,
  actionpad: ActionPadPanelWidget,
  embed: EmbedPanelWidget
}
