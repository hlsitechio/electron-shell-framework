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
  Check,
  Terminal,
  Server,
  Columns,
  Rows,
  LayoutGrid,
  Plus,
  Trash2,
  Bot,
  Sparkles,
  Send,
  BrainCircuit,
  Sliders,
  FileCode,
  Copy,
  FileText,
  Database,
  Network,
  Clock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Timer,
  Pause,
  RotateCcw,
  Flame,
  ListTodo,
  CheckSquare,
  Square,
  Cloud,
  Sun,
  CloudRain,
  CloudSun,
  Mic,
  FileAudio,
  FileCheck2,
  UserCheck,
  PieChart,
  CalendarClock,
  HelpCircle,
  Users
} from 'lucide-react'
import { useReframeStore } from '../stores/reframe-store'
import { WIDGET_CATALOG } from './catalog/widget-catalog'
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
    <div className="reframe-panel-body p-3.5 bg-zinc-900/60 text-zinc-100 flex flex-col justify-center h-full overflow-y-auto">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2.5">
        {items.map((item: any, idx: number) => {
          const isPos = item.deltaType === 'positive'
          const isNeg = item.deltaType === 'negative'
          return (
            <div
              key={idx}
              className="p-3 rounded-lg bg-zinc-800/60 border border-zinc-700/60 hover:border-zinc-600 transition-all flex flex-col justify-between min-w-0"
            >
              <div className="flex items-center justify-between gap-1 text-xs text-zinc-300 font-medium mb-1 min-w-0">
                <span className="truncate">{item.label}</span>
                {item.delta && (
                  <span
                    className={`shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium font-mono ${
                      isPos
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isNeg
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-zinc-700/50 text-zinc-300'
                    }`}
                  >
                    {isPos ? (
                      <TrendingUp className="w-2.5 h-2.5" />
                    ) : isNeg ? (
                      <TrendingDown className="w-2.5 h-2.5" />
                    ) : null}
                    {item.delta}
                  </span>
                )}
              </div>
              <div className="text-xl font-bold tracking-tight text-white my-0.5 truncate">
                {item.value}
              </div>
              {item.subtext && (
                <div className="text-[10px] text-zinc-400 truncate">{item.subtext}</div>
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
          <h4 className="text-sm font-semibold text-zinc-100">{title}</h4>
          <p className="text-xs text-zinc-400 font-mono">{timeRange}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-zinc-800 px-2 py-1 rounded border border-zinc-700 text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} />
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
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          {params?.title || 'Data Registry'}
        </h4>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 pr-2.5 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 w-44"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto border border-zinc-800 rounded">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-800/80 text-zinc-300 border-b border-zinc-700">
              {columns.map((col) => (
                <th key={col.key} className="py-2 px-3 font-semibold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-zinc-800/40 transition-colors">
                {columns.map((col) => {
                  const val = row[col.key]
                  const isStatus =
                    col.key.toLowerCase().includes('status') ||
                    col.key.toLowerCase().includes('health')
                  return (
                    <td key={col.key} className="py-2 px-3 text-zinc-200">
                      {isStatus ? (
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${
                            val === 'Closing Soon' || val === 'Healthy' || val === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : val === 'In Review' ||
                                  val === 'Active Pilot' ||
                                  val === 'Review Needed'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-zinc-700/50 text-zinc-200'
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
  const content: string = params?.content || '### Operational Notes\n\nNo content configured.'
  const lines = content.split('\n')

  return (
    <div className="reframe-panel-body p-4 bg-zinc-900/60 text-zinc-100 overflow-y-auto">
      <div className="max-w-none text-xs leading-relaxed space-y-2 text-zinc-200">
        {lines.map((line, idx) => {
          const trimmed = line.trim()
          if (!trimmed) return <div key={idx} className="h-1.5" />
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-sm font-semibold text-zinc-100 tracking-tight pt-1">
                {trimmed.replace(/^###\s+/, '')}
              </h3>
            )
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-base font-bold text-zinc-100 tracking-tight pt-1">
                {trimmed.replace(/^##\s+/, '')}
              </h2>
            )
          }
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote
                key={idx}
                className="border-l-2 border-indigo-500/60 pl-3 py-1 text-zinc-300 italic text-xs bg-zinc-800/30 rounded-r"
              >
                {trimmed.replace(/^>\s+/, '')}
              </blockquote>
            )
          }
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            const raw = trimmed.replace(/^[*-]\s+/, '')
            const boldMatch = raw.match(/^\*\*(.*?)\*\*(.*)$/)
            if (boldMatch) {
              return (
                <div key={idx} className="flex items-start gap-2 pl-2 text-xs text-zinc-300">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>
                    <strong className="font-semibold text-zinc-100">{boldMatch[1]}</strong>
                    {boldMatch[2]}
                  </span>
                </div>
              )
            }
            return (
              <div key={idx} className="flex items-start gap-2 pl-2 text-xs text-zinc-300">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{raw}</span>
              </div>
            )
          }
          const numMatch = trimmed.match(/^(\d+\.)\s+(.*)$/)
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2 text-xs text-zinc-300">
                <span className="font-mono text-indigo-400 text-[11px] shrink-0">
                  {numMatch[1]}
                </span>
                <span>{numMatch[2]}</span>
              </div>
            )
          }
          return (
            <p key={idx} className="text-xs text-zinc-300">
              {trimmed}
            </p>
          )
        })}
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
    <div className="reframe-panel-body p-3 bg-zinc-950 font-mono text-xs text-zinc-200 flex flex-col h-full">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] text-zinc-300">
        <span className="flex items-center gap-1.5 font-semibold">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          Live Telemetry Stream
        </span>
        <span className="text-zinc-400 font-mono">{logs.length} events logged</span>
      </div>

      <div className="flex-1 overflow-auto pt-2 space-y-1.5">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-2 hover:bg-zinc-900/60 p-1 rounded transition-colors"
          >
            <span className="text-zinc-400 shrink-0 text-[10px] font-mono">{log.time}</span>
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
            <span className="text-zinc-200 break-all">{log.message}</span>
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

/* ============================================================
   8. TERMINAL CONSOLE WIDGET
   ============================================================ */
export const TerminalPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const welcome =
    params?.welcomeMessage ||
    'Connected to production cluster mesh (48 nodes)\nType "help" or "status" to inspect environment.'
  const [history, setHistory] = useState<Array<{ cmd: string; output: string }>>([
    {
      cmd: 'cluster-mesh status',
      output: '✓ 48/48 nodes healthy\n✓ zero critical alerts\n✓ latency p99: 14.2ms'
    }
  ])
  const [inputVal, setInputVal] = useState('')

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputVal.trim()
    if (!trimmed) return

    if (trimmed === 'clear') {
      setHistory([])
      setInputVal('')
      return
    }

    let output = `Command not recognized: "${trimmed}". Type "help" for available commands.`
    if (trimmed === 'help') {
      output = 'Available commands: status, ps, uptime, deploy, health, clear'
    } else if (trimmed === 'status' || trimmed === 'health') {
      output = 'Status: OK | Mesh Health: 99.98% | Active Nodes: 48 | Memory Pressure: Normal'
    } else if (trimmed === 'ps') {
      output =
        'PID   USER      TIME  COMMAND\n1     root      48d   containerd\n42    app       12d   node-worker-pool\n88    app        4d   event-streamer'
    } else if (trimmed === 'uptime') {
      output = 'up 48 days, 14:22, load average: 0.42, 0.38, 0.35'
    } else if (trimmed === 'deploy') {
      output = 'Initiating rolling canary update... [████████████] 100% Complete. 0 errors.'
    }

    setHistory((prev) => [...prev, { cmd: trimmed, output }])
    setInputVal('')
  }

  return (
    <div className="reframe-panel-body p-3 bg-zinc-950 text-zinc-100 flex flex-col h-full font-mono text-xs overflow-hidden">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[11px] text-zinc-400 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-zinc-300 font-semibold">{params?.title || 'Terminal Console'}</span>
        </div>
        <button
          onClick={() => setHistory([])}
          className="hover:text-white px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px]"
          title="Clear console"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-[11px] leading-relaxed">
        <div className="text-zinc-500 whitespace-pre-wrap">{welcome}</div>
        {history.map((h, i) => (
          <div key={i} className="space-y-0.5">
            <div className="text-emerald-400 flex items-center gap-1.5">
              <span className="text-zinc-500">$</span>
              <span>{h.cmd}</span>
            </div>
            <div className="text-zinc-300 pl-3 whitespace-pre-wrap">{h.output}</div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleCommand}
        className="mt-2 pt-2 border-t border-zinc-800 flex items-center gap-1.5 shrink-0"
      >
        <span className="text-emerald-400 font-bold">$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Enter command (e.g. status, ps, help)..."
          className="flex-1 bg-transparent border-0 text-white focus:outline-none text-[11px]"
        />
      </form>
    </div>
  )
}

/* ============================================================
   9. KUBERNETES / CLUSTER TOPOLOGY WIDGET
   ============================================================ */
export const ClusterTopologyWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const clusterName = params?.clusterName || 'prod-mesh-01'
  const totalNodes = params?.totalNodes || 48
  const healthyPods = params?.healthyPods || 342
  const warningPods = params?.warningPods || 2

  const namespaces = [
    { name: 'ingress-gw', pods: 12, cpu: '24%', mem: '42%', status: 'healthy' },
    { name: 'api-core', pods: 48, cpu: '56%', mem: '68%', status: 'healthy' },
    { name: 'worker-mesh', pods: 120, cpu: '78%', mem: '82%', status: 'healthy' },
    { name: 'db-proxy', pods: 8, cpu: '18%', mem: '34%', status: 'healthy' },
    { name: 'event-stream', pods: 32, cpu: '44%', mem: '58%', status: 'healthy' },
    { name: 'telemetry', pods: 16, cpu: '32%', mem: '48%', status: 'warning' }
  ]

  return (
    <div className="reframe-panel-body p-3.5 bg-zinc-900/60 text-zinc-100 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <h4 className="text-xs font-semibold text-zinc-100">
              {params?.title || 'Cluster Topology'}
            </h4>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">
            Cluster: {clusterName} • {totalNodes} Nodes
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {healthyPods} Pods Healthy
          </span>
          {warningPods > 0 && (
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {warningPods} Warning
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1">
        {namespaces.map((ns) => (
          <div
            key={ns.name}
            className="p-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700/60 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-zinc-200 truncate">{ns.name}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  ns.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
            </div>
            <div className="text-[10px] text-zinc-400 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Pods:</span>
                <span className="text-zinc-200">{ns.pods}</span>
              </div>
              <div className="flex justify-between">
                <span>CPU / Mem:</span>
                <span className="text-zinc-200">
                  {ns.cpu} / {ns.mem}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

let chatMsgCounter = 0
const makeMsgId = (prefix: string): string => `${prefix}-${++chatMsgCounter}`
const getChatTimestamp = (): string => {
  const d = new Date()
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
let taskCounter = 100
const makeTaskId = (): string => `tsk-${++taskCounter}`

/* ============================================================
   10. AI COPILOT & CHAT WIDGET
   ============================================================ */
export const AiChatPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const defaultModels = params?.models || [
    'Claude 3.7 Sonnet',
    'GPT-4o',
    'DeepSeek R1',
    'Gemini 2.0 Flash'
  ]
  const [selectedModel, setSelectedModel] = useState<string>(
    params?.activeModel || defaultModels[0]
  )
  const [tokenCount, setTokenCount] = useState<number>(params?.tokenCount || 1420)
  const [messages, setMessages] = useState<
    Array<{ id: string; sender: 'ai' | 'user'; author: string; timestamp: string; content: string }>
  >(
    params?.messages || [
      {
        id: 'msg-1',
        sender: 'ai',
        author: 'Claude 3.7',
        timestamp: '11:24 AM',
        content:
          'I have analyzed telemetry across all 14 active production clusters. Median p95 latency is stable at 14.2ms, but pod `billing-worker-02` shows elevated heap usage (84%). Would you like me to inspect memory allocations or generate a remediation patch?'
      },
      {
        id: 'msg-2',
        sender: 'user',
        author: 'You',
        timestamp: '11:25 AM',
        content:
          'Inspect memory allocations and explain if this is related to the recent Redis v7 upgrade.'
      },
      {
        id: 'msg-3',
        sender: 'ai',
        author: 'Claude 3.7',
        timestamp: '11:25 AM',
        content:
          'Confirmed correlation: Redis connection pool timeout was reduced to 250ms during the v7 migration, causing socket reconnect loops under peak queue ingestion. I have prepared an automatic pool threshold patch ready for your approval.'
      }
    ]
  )
  const [inputVal, setInputVal] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const quickPrompts = params?.quickPrompts || [
    'Summarize active incident report',
    'Analyze latency bottle-necks across nodes',
    'Draft executive compliance brief',
    'Synthesize SQL query optimization'
  ]

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputVal).trim()
    if (!text) return

    const newMsg = {
      id: makeMsgId('usr'),
      sender: 'user' as const,
      author: 'You',
      timestamp: getChatTimestamp(),
      content: text
    }

    setMessages((prev) => [...prev, newMsg])
    if (!textToSend) setInputVal('')
    setIsThinking(true)
    setTokenCount((prev) => prev + Math.floor(text.length / 3) + 40)

    setTimeout(() => {
      let reply = `I evaluated "${text}". Verified against the live enterprise schema: Zero schema drifts detected and query execution plans are within nominal P95 boundaries.`
      const lower = text.toLowerCase()
      if (lower.includes('incident') || lower.includes('report')) {
        reply = `Incident Report Summary (#INC-849):\n• Trigger: Socket starvation during failover.\n• Impact: 0.04% requests dropped across 2 minutes.\n• Resolution: Replica autoscaled to 8 instances. Cluster telemetry normal.`
      } else if (lower.includes('latency') || lower.includes('node')) {
        reply = `Latency Breakdown:\n• Node worker-us-east-1: 11.2ms (healthy)\n• Node worker-us-east-4: 38.6ms (high memory pressure)\n• Edge Gateway: 4.1ms\nRecommendation: Migrate queue consumption away from worker-4.`
      } else if (lower.includes('sql') || lower.includes('optimization')) {
        reply = `Recommended Indexing Patch:\nCREATE INDEX CONCURRENTLY idx_orders_customer_tenant ON orders (tenant_id, created_at DESC);\nExpected reduction in sequential scans: ~78%.`
      } else if (lower.includes('compliance') || lower.includes('brief')) {
        reply = `Executive Brief Prepared:\n• SOC2 Type II compliance: In compliance (90-day retention verified)\n• GDPR Right-to-Erasure: Automated webhook active\n• Encryption: TLS 1.3 + AES-256 enabled on all partitions.`
      }

      setMessages((prev) => [
        ...prev,
        {
          id: makeMsgId('ai'),
          sender: 'ai',
          author: selectedModel.split(' ')[0],
          timestamp: getChatTimestamp(),
          content: reply
        }
      ])
      setIsThinking(false)
      setTokenCount((prev) => prev + Math.floor(reply.length / 3))
    }, 450)
  }

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard?.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div className="reframe-panel-body p-3.5 bg-zinc-950/70 text-zinc-100 flex flex-col h-full overflow-hidden select-text">
      {/* Top Copilot Bar */}
      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <span>{params?.title || 'Enterprise AI Copilot'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </h4>
            <div className="text-[10px] text-zinc-500 font-mono">
              Ctx: {tokenCount.toLocaleString()} /{' '}
              {(params?.contextLimit || 128000).toLocaleString()} tokens
            </div>
          </div>
        </div>

        {/* Model Selector & Clear */}
        <div className="flex items-center gap-2">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-zinc-900 border border-zinc-700/80 rounded px-2 py-1 text-[11px] font-medium text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            {defaultModels.map((m: string) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <button
            onClick={() => setMessages([])}
            className="px-2 py-1 rounded bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-[10px] transition-colors"
            title="Clear conversation"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
        {messages.map((m) => {
          const isUser = m.sender === 'user'
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mb-1 px-1">
                <span className="font-semibold text-zinc-400">{m.author}</span>
                <span>•</span>
                <span>{m.timestamp}</span>
              </div>
              <div
                className={`relative max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-sm shadow-sm'
                    : 'bg-zinc-850/80 border border-zinc-700/60 text-zinc-200 rounded-bl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{m.content}</div>
                {!isUser && (
                  <button
                    onClick={() => handleCopy(m.id, m.content)}
                    className="absolute top-2 right-2 p-1 rounded bg-zinc-800/80 opacity-0 group-hover:opacity-100 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-opacity"
                    title="Copy message"
                  >
                    {copiedId === m.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {isThinking && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 w-fit text-xs text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span className="text-[11px]">{selectedModel} is synthesizing analysis...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts Row */}
      {quickPrompts.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 border-t border-zinc-800/80 shrink-0 scrollbar-none">
          {quickPrompts.map((qp: string, idx: number) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp)}
              className="shrink-0 px-2 py-1 rounded-md text-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors whitespace-nowrap"
            >
              + {qp}
            </button>
          ))}
        </div>
      )}

      {/* Input Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSendMessage()
        }}
        className="pt-2 border-t border-zinc-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={`Ask ${selectedModel} or type prompt...`}
          className="flex-1 bg-zinc-900/80 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || isThinking}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1 transition-all"
        >
          <Send className="w-3 h-3" />
          <span>Send</span>
        </button>
      </form>
    </div>
  )
}

/* ============================================================
   11. AUTONOMOUS AGENT & SWARM REASONING WIDGET
   ============================================================ */
export const AiAgentPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const isSwarm = Array.isArray(params?.agents) && params.agents.length > 0
  const [steps, setSteps] = useState(
    params?.steps || [
      {
        id: 'step-1',
        title: 'Context Retrieval & Metric Ingest',
        status: 'completed',
        time: '120ms',
        detail: 'Queried Datadog APM API for 14 clusters. Ingested 4,820 metric points.'
      },
      {
        id: 'step-2',
        title: 'Tool Call: kubernetes_get_pod_status(ns="production")',
        status: 'completed',
        time: '340ms',
        detail: 'Identified 2 unevicted pods in crashLoopBackOff on node worker-us-east-4.'
      },
      {
        id: 'step-3',
        title: 'CoT Reasoning: Synthesize Rolling Autoscale Mitigation',
        status: 'running',
        time: 'Live',
        detail:
          'Evaluating whether horizontal pod autoscaler can drain worker-04 without dropping active WebSockets.'
      }
    ]
  )

  const [approvalState, setApprovalState] = useState<'pending' | 'approved' | 'rejected'>('pending')

  const handleApprove = () => {
    setApprovalState('approved')
    setSteps((prev: any[]) => [
      ...prev.map((s) => (s.id === 'step-3' ? { ...s, status: 'completed', time: '1.2s' } : s)),
      {
        id: 'step-4',
        title: 'Action Executed: Scaled replicas 4 -> 8 & drained worker-04',
        status: 'completed',
        time: '420ms',
        detail:
          'Kubernetes deployment updated successfully. Zero 5xx responses recorded during canary shift.'
      },
      {
        id: 'step-5',
        title: 'Verification: Latency SLO & Pod Readiness Probes',
        status: 'completed',
        time: '210ms',
        detail: 'All 8 pods passed initial readiness checks. Median response time 13.8ms.'
      }
    ])
  }

  const handleReject = () => {
    setApprovalState('rejected')
    setSteps((prev: any[]) => [
      ...prev.map((s) => (s.id === 'step-3' ? { ...s, status: 'completed', time: 'Aborted' } : s)),
      {
        id: 'step-4',
        title: 'Execution Halted by Operator',
        status: 'warning',
        time: 'Now',
        detail: 'Operator declined automated cluster mutation. SRE on-call paged for manual triage.'
      }
    ])
  }

  if (isSwarm) {
    const agents = params.agents
    return (
      <div className="reframe-panel-body p-3.5 bg-zinc-950/70 text-zinc-100 flex flex-col h-full overflow-y-auto">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-purple-400" />
            <div>
              <h4 className="text-xs font-semibold text-zinc-100">
                {params?.title || 'Multi-Agent Swarm Pipeline'}
              </h4>
              <span className="text-[10px] text-zinc-400 font-mono">
                {params?.swarmName || 'Autonomous App Builder Swarm'} •{' '}
                {params?.totalThroughput || '48 tasks/min'}
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono">
            4 AGENTS SYNCHRONIZED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
          {agents.map((agent: any) => (
            <div
              key={agent.id}
              className="p-3 rounded-lg bg-zinc-850/70 border border-zinc-700/60 hover:border-zinc-600 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-semibold text-zinc-200">{agent.name}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[11px] text-zinc-400 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className="text-zinc-200">{agent.role}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Load:</span>
                  <span className="text-indigo-400 font-bold">{agent.load}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="reframe-panel-body p-3.5 bg-zinc-950/70 text-zinc-100 flex flex-col h-full overflow-y-auto">
      {/* Agent Header */}
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <BrainCircuit className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <span>{params?.agentName || 'Autonomous Sentinel Agent'}</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-300 font-mono">
                COT LOOP
              </span>
            </h4>
            <div className="text-[10px] text-zinc-500 font-mono">
              Status: {params?.status || 'Active Reasoning'} • Iteration {params?.iterations || 3}{' '}
              of {params?.maxIterations || 8}
            </div>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
          AUTONOMOUS
        </span>
      </div>

      {/* Thought Trace Steps */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-1">
        {steps.map((st: any, idx: number) => {
          const isDone = st.status === 'completed'
          const isRunning = st.status === 'running'
          const isWarn = st.status === 'warning'
          return (
            <div
              key={st.id || idx}
              className={`p-2.5 rounded-lg border text-xs transition-all ${
                isDone
                  ? 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300'
                  : isRunning
                    ? 'bg-indigo-950/20 border-indigo-500/40 text-indigo-100 shadow-sm'
                    : isWarn
                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                      : 'bg-zinc-900/30 border-zinc-800/40 text-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-medium">
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : isRunning ? (
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 animate-spin" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  )}
                  <span className="text-zinc-200 text-[11px] font-semibold">{st.title}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">{st.time}</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono pl-5 leading-relaxed">
                {st.detail}
              </p>
            </div>
          )
        })}
      </div>

      {/* Human In The Loop Approval Block */}
      {params?.pendingApproval && (
        <div className="mt-3 pt-3 border-t border-zinc-800 shrink-0">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Action Requires Operator Approval</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {params.pendingApproval.riskLevel} Risk
              </span>
            </div>
            <p className="text-[11px] text-zinc-300 mb-2.5">{params.pendingApproval.description}</p>

            {approvalState === 'pending' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleApprove}
                  className="flex-1 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Execute Action</span>
                </button>
                <button
                  onClick={handleReject}
                  className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-rose-900/50 text-zinc-300 hover:text-rose-200 border border-zinc-700 text-xs transition-colors"
                >
                  Reject
                </button>
              </div>
            ) : approvalState === 'approved' ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold py-0.5">
                <Check className="w-3.5 h-3.5" />
                <span>Action Approved by Operator • Executing payload</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold py-0.5">
                <XCircle className="w-3.5 h-3.5" />
                <span>Action Rejected by Operator • Loop halted</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================================================
   12. RAG VECTOR KNOWLEDGE RETRIEVER WIDGET
   ============================================================ */
export const AiRagPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const [searchQuery, setSearchQuery] = useState(
    params?.query || 'SOC2 Type II audit data retention requirements'
  )
  const [minScore, setMinScore] = useState<number>(85)
  const [copiedChunkId, setCopiedChunkId] = useState<string | null>(null)

  const chunks = params?.chunks || [
    {
      id: 'chunk-1',
      document: 'SOC2_Compliance_Master_Policy_2026.pdf',
      score: 98.4,
      section: 'Section 4.2: Data Retention & Encryption at Rest',
      snippet:
        'All customer clickstream logs and diagnostic telemetry containing PII must be encrypted using AES-256-GCM and purged after 90 days unless subject to legal preservation hold.'
    },
    {
      id: 'chunk-2',
      document: 'GDPR_Data_Classification_Matrix.docx',
      score: 94.1,
      section: 'Article 17: Right to Erasure Execution Protocol',
      snippet:
        'Clickstream telemetry must maintain pseudonymized foreign keys referencing the customer master table, allowing instant cascade deletion within 24 hours of erasure request.'
    },
    {
      id: 'chunk-3',
      document: 'Kafka_Retention_Runbook_v3.md',
      score: 89.7,
      section: 'Topic Tiering & Compaction Policies',
      snippet:
        'Retention period on topic production.clickstream.raw is configured to 2160h (90 days). Cold archival storage is streamed directly into immutable AWS S3 Glacier Vault.'
    }
  ]

  const filteredChunks = chunks.filter((c: any) => c.score >= minScore)

  const handleCopyChunk = (id: string, text: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedChunkId(id)
    setTimeout(() => setCopiedChunkId(null), 1500)
  }

  return (
    <div className="reframe-panel-body p-3.5 bg-zinc-950/70 text-zinc-100 flex flex-col h-full overflow-hidden select-text">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-200">
              {params?.title || 'Vector Knowledge Retriever'}
            </h4>
            <div className="text-[10px] text-zinc-500 font-mono">
              {params?.indexName || 'text-embedding-3-large'} •{' '}
              {params?.totalVectors || '142k vectors'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
          <span>Min Score:</span>
          <button
            onClick={() => setMinScore((prev) => (prev === 90 ? 80 : 90))}
            className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-zinc-200"
          >
            &gt; {minScore}%
          </button>
        </div>
      </div>

      {/* Semantic Query Input */}
      <div className="relative mb-3 shrink-0">
        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Semantic vector query..."
          className="w-full bg-zinc-900/90 border border-zinc-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Chunks List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filteredChunks.map((chunk: any) => (
          <div
            key={chunk.id}
            className="p-3 rounded-lg bg-zinc-850/80 border border-zinc-700/60 hover:border-zinc-600 transition-all text-xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-zinc-200 font-semibold truncate max-w-[70%]">
                <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{chunk.document}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  chunk.score >= 95
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}
              >
                {chunk.score}% Match
              </span>
            </div>

            <div className="text-[10px] text-zinc-400 font-mono mb-2">{chunk.section}</div>
            <p className="text-[11px] text-zinc-300 leading-relaxed font-sans bg-zinc-900/60 p-2 rounded border border-zinc-800">
              "{chunk.snippet}"
            </p>

            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleCopyChunk(chunk.id, chunk.snippet)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] transition-colors"
              >
                {copiedChunkId === chunk.id ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Chunk</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   13. PROMPT STUDIO & HYPERPARAMETER PLAYGROUND WIDGET
   ============================================================ */
export const AiPromptPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const [systemPrompt, setSystemPrompt] = useState(
    params?.systemPrompt ||
      'You are an elite enterprise financial copilot. Analyze portfolio allocation, calculate Sharpe ratios, and format deliverables with executive precision.'
  )
  const [temperature, setTemperature] = useState<number>(params?.temperature ?? 0.35)
  const [topP, setTopP] = useState<number>(params?.topP ?? 0.9)
  const [maxTokens, setMaxTokens] = useState<number>(params?.maxTokens ?? 4096)
  const [isRunningEval, setIsRunningEval] = useState(false)
  const [evalResult, setEvalResult] = useState<string | null>(null)

  const benchmark = params?.benchmark || {
    latency: '215ms',
    inputTokens: 142,
    outputTokens: 520,
    costEstimate: '$0.0028',
    throughput: '94.2 t/s'
  }

  const handleRunEval = () => {
    setIsRunningEval(true)
    setTimeout(() => {
      setEvalResult(
        'Evaluation complete (Score: 98.2/100):\n• Zero hallucinations detected\n• Mathematical consistency verified\n• Formatted output conforms to standard risk deliverable schema'
      )
      setIsRunningEval(false)
    }, 500)
  }

  return (
    <div className="reframe-panel-body p-3.5 bg-zinc-950/70 text-zinc-100 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-200">
              {params?.title || 'Prompt Studio & Hyperparameter Playground'}
            </h4>
            <div className="text-[10px] text-zinc-500 font-mono">
              Preset: Customer Escalation Analyzer • v4.2
            </div>
          </div>
        </div>

        <button
          onClick={handleRunEval}
          disabled={isRunningEval}
          className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {isRunningEval ? (
            <Sparkles className="w-3 h-3 animate-spin" />
          ) : (
            <Play className="w-3 h-3" />
          )}
          <span>Run Eval</span>
        </button>
      </div>

      {/* System Prompt Input */}
      <div className="mb-3 shrink-0">
        <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
          System Persona Directive
        </label>
        <textarea
          rows={3}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg p-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
        />
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 shrink-0">
        <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
          <div className="flex justify-between text-[11px] mb-1 font-mono">
            <span className="text-zinc-400">Temperature</span>
            <span className="text-amber-400 font-bold">{temperature.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
          <div className="flex justify-between text-[11px] mb-1 font-mono">
            <span className="text-zinc-400">Top-P</span>
            <span className="text-amber-400 font-bold">{topP.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={topP}
            onChange={(e) => setTopP(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
          <div className="flex justify-between text-[11px] mb-1 font-mono">
            <span className="text-zinc-400">Max Tokens</span>
            <span className="text-amber-400 font-bold">{maxTokens}</span>
          </div>
          <input
            type="range"
            min="256"
            max="8192"
            step="256"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Benchmarks Bar */}
      <div className="grid grid-cols-4 gap-2 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[10px] font-mono text-zinc-400 mb-3 shrink-0">
        <div>
          <span className="block text-zinc-500">Latency</span>
          <span className="text-zinc-200 font-semibold">{benchmark.latency}</span>
        </div>
        <div>
          <span className="block text-zinc-500">Est. Cost</span>
          <span className="text-zinc-200 font-semibold">{benchmark.costEstimate}</span>
        </div>
        <div>
          <span className="block text-zinc-500">Tokens</span>
          <span className="text-zinc-200 font-semibold">
            {benchmark.inputTokens} / {benchmark.outputTokens}
          </span>
        </div>
        <div>
          <span className="block text-zinc-500">Speed</span>
          <span className="text-emerald-400 font-semibold">{benchmark.throughput}</span>
        </div>
      </div>

      {/* Evaluation Output */}
      {evalResult && (
        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/40 text-xs text-emerald-200 font-mono whitespace-pre-line leading-relaxed">
          {evalResult}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   14. AI CODE GENERATOR & DIFF VIEWER WIDGET
   ============================================================ */
export const AiCodeGenPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const [applied, setApplied] = useState(false)
  const [copied, setCopied] = useState(false)

  const filename = params?.filename || 'auth-session-manager.service.ts'
  const summary =
    params?.summary || 'Migrated symmetric HMAC tokens to ES256 asymmetric ECDSA signatures.'
  const stats = params?.stats || { added: 18, removed: 4 }
  const diffLines = params?.diffLines || [
    { type: 'normal', content: 'export class AuthSessionManager {' },
    { type: 'normal', content: '  private keyStore: KeyVaultCache;' },
    { type: 'delete', content: '-   private hmacSecret = process.env.JWT_SECRET;' },
    { type: 'add', content: '+   private publicKeyUrl = process.env.AUTH_JWKS_ENDPOINT;' },
    {
      type: 'add',
      content: '+   private ecdsaVerifier = new ES256TokenVerifier(this.publicKeyUrl);'
    },
    { type: 'normal', content: '' },
    {
      type: 'normal',
      content: '  async verifyIncomingSession(token: string): Promise<UserSession> {'
    },
    { type: 'delete', content: '-     return jwt.verify(token, this.hmacSecret);' },
    { type: 'add', content: '+     const cachedKey = await this.keyStore.getOrFetch(token.kid);' },
    { type: 'add', content: '+     return this.ecdsaVerifier.verify(token, cachedKey);' },
    { type: 'normal', content: '  }' },
    { type: 'normal', content: '}' }
  ]

  const handleCopyCode = () => {
    const raw = diffLines.map((l: any) => l.content).join('\n')
    navigator.clipboard?.writeText(raw)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="reframe-panel-body p-3.5 bg-zinc-950/70 text-zinc-100 flex flex-col h-full overflow-hidden select-text">
      {/* Diff Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileCode className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-200 font-mono">{filename}</h4>
            <div className="text-[10px] text-zinc-500 font-mono">
              <span className="text-emerald-400 font-bold">+{stats.added}</span> /{' '}
              <span className="text-rose-400 font-bold">-{stats.removed}</span> lines
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-[10px] transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={() => setApplied(true)}
            disabled={applied}
            className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/60 text-white font-semibold text-[10px] transition-colors"
          >
            <Check className="w-3 h-3" />
            <span>{applied ? 'Applied ✓' : 'Apply Patch'}</span>
          </button>
        </div>
      </div>

      <p className="text-[11px] text-zinc-400 mb-2 shrink-0 font-sans">{summary}</p>

      {/* Unified Diff Box */}
      <div className="flex-1 overflow-y-auto font-mono text-[11px] bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-0.5 leading-relaxed">
        {diffLines.map((line: any, idx: number) => {
          const isAdd = line.type === 'add'
          const isDel = line.type === 'delete'
          return (
            <div
              key={idx}
              className={`px-2 py-0.5 rounded flex items-center gap-2 ${
                isAdd
                  ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500'
                  : isDel
                    ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500'
                    : 'text-zinc-400'
              }`}
            >
              <span className="w-6 shrink-0 text-zinc-600 text-[10px] select-none text-right">
                {idx + 1}
              </span>
              <span className="whitespace-pre">{line.content}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================
   15. DIGITAL CLOCK & WORLD TIME WIDGET
   ============================================================ */
export const DigitalClockPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const [time, setTime] = useState<Date>(() => new Date())
  const [use24h, setUse24h] = useState<boolean>(params?.use24Hour ?? false)
  const [showSeconds, setShowSeconds] = useState<boolean>(params?.showSeconds ?? true)
  const [colonVisible, setColonVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
      setColonVisible((prev) => !prev)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const worldClocks = params?.worldClocks || [
    { city: 'London', tz: 'Europe/London', label: 'BST / UTC+1' },
    { city: 'Tokyo', tz: 'Asia/Tokyo', label: 'JST / UTC+9' },
    { city: 'San Francisco', tz: 'America/Los_Angeles', label: 'PDT / UTC-7' }
  ]

  const hours = time.getHours()
  const displayHours = use24h
    ? hours.toString().padStart(2, '0')
    : (hours % 12 || 12).toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const seconds = time.getSeconds().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'

  const dateString = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div className="reframe-panel-body p-4 bg-zinc-950/70 text-zinc-100 flex flex-col justify-between h-full select-none overflow-hidden">
      {/* Top Header Toolbar */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-zinc-300">
            {params?.title || 'Digital Chronometer'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <button
            onClick={() => setUse24h((prev) => !prev)}
            className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            {use24h ? '24H' : '12H'}
          </button>
          <button
            onClick={() => setShowSeconds((prev) => !prev)}
            className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            {showSeconds ? 'SEC ON' : 'SEC OFF'}
          </button>
        </div>
      </div>

      {/* Main Digital Clock Display */}
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <div className="flex items-baseline gap-1 font-mono tracking-tighter">
          <span className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-sm">
            {displayHours}
          </span>
          <span
            className={`text-4xl sm:text-5xl font-extrabold text-indigo-400 transition-opacity duration-200 ${
              colonVisible ? 'opacity-100' : 'opacity-20'
            }`}
          >
            :
          </span>
          <span className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-sm">
            {minutes}
          </span>
          {showSeconds && (
            <>
              <span
                className={`text-4xl sm:text-5xl font-extrabold text-indigo-400 transition-opacity duration-200 ${
                  colonVisible ? 'opacity-100' : 'opacity-20'
                }`}
              >
                :
              </span>
              <span className="text-3xl sm:text-4xl font-semibold text-zinc-400">{seconds}</span>
            </>
          )}
          {!use24h && (
            <span className="ml-2 text-sm font-bold text-indigo-400 font-sans tracking-normal uppercase">
              {ampm}
            </span>
          )}
        </div>

        <div className="mt-2 text-xs sm:text-sm font-medium text-zinc-400 tracking-wide">
          {dateString}
        </div>
      </div>

      {/* World Clocks Footer Strip */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 shrink-0">
        {worldClocks.map((wc: any, idx: number) => {
          let wcTime: string
          try {
            wcTime = time.toLocaleTimeString('en-US', {
              timeZone: wc.tz,
              hour: '2-digit',
              minute: '2-digit',
              hour12: !use24h
            })
          } catch {
            wcTime = '--:--'
          }
          return (
            <div
              key={idx}
              className="p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col text-center"
            >
              <span className="text-[10px] font-semibold text-zinc-300 truncate">{wc.city}</span>
              <span className="text-xs font-mono font-bold text-indigo-300">{wcTime}</span>
              <span className="text-[9px] text-zinc-500 font-mono truncate">{wc.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================
   16. CALENDAR & AGENDA WIDGET
   ============================================================ */
export const CalendarAgendaPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 8, 24))
  const [selectedDay, setSelectedDay] = useState<number>(24)
  const events = params?.events || [
    {
      id: 'ev-1',
      day: 24,
      time: '10:00 AM',
      title: 'Sprint Review & Architecture Sync',
      type: 'primary'
    },
    { id: 'ev-2', day: 24, time: '02:30 PM', title: 'Client Deliverable Demo', type: 'success' },
    {
      id: 'ev-3',
      day: 24,
      time: '04:15 PM',
      title: 'Kubernetes Mesh Patch Window',
      type: 'warning'
    },
    {
      id: 'ev-4',
      day: 25,
      time: '11:00 AM',
      title: 'Executive Budget Allocation Meeting',
      type: 'primary'
    },
    {
      id: 'ev-5',
      day: 28,
      time: '09:30 AM',
      title: 'Q3 Retrospective & Roadmap Kickoff',
      type: 'info'
    }
  ]

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayIndex = new Date(year, month, 1).getDay()
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate()

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const daysArray: Array<number | null> = []
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null)
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    daysArray.push(d)
  }

  const filteredEvents = events.filter((ev: any) => ev.day === selectedDay)

  return (
    <div className="reframe-panel-body p-3 bg-zinc-950/70 text-zinc-100 flex flex-col h-full overflow-hidden select-none">
      {/* Month Navigator */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-zinc-200">{monthName}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setCurrentDate(new Date(2026, 8, 24))
              setSelectedDay(24)
            }}
            className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 transition-colors"
          >
            Today
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-hidden min-h-0">
        {/* Calendar Matrix */}
        <div className="flex flex-col min-w-0">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-zinc-500 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 flex-1">
            {daysArray.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="p-1" />
              }
              const isToday = day === 24 && month === 8 && year === 2026
              const isSelected = day === selectedDay
              const hasEvents = events.some((ev: any) => ev.day === day)
              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`p-1 rounded-md text-xs font-mono relative flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : isToday
                        ? 'bg-indigo-950/40 text-indigo-300 font-bold border border-indigo-500/40'
                        : 'hover:bg-zinc-800 text-zinc-300'
                  }`}
                >
                  <span>{day}</span>
                  {hasEvents && (
                    <span
                      className={`w-1 h-1 rounded-full mt-0.5 ${
                        isSelected ? 'bg-white' : 'bg-indigo-400'
                      }`}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Agenda Events Pane */}
        <div className="border-t md:border-t-0 md:border-l border-zinc-800 pt-2 md:pt-0 md:pl-3 flex flex-col min-w-0 overflow-hidden">
          <div className="text-[11px] font-semibold text-zinc-300 mb-2 flex items-center justify-between">
            <span>
              Agenda: Sep {selectedDay}, {year}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredEvents.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500 italic border border-dashed border-zinc-800 rounded-lg">
                No events scheduled for day {selectedDay}.
              </div>
            ) : (
              filteredEvents.map((ev: any) => (
                <div
                  key={ev.id}
                  className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-semibold text-indigo-400">
                      {ev.time}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        ev.type === 'success'
                          ? 'bg-emerald-400'
                          : ev.type === 'warning'
                            ? 'bg-amber-400'
                            : 'bg-indigo-400'
                      }`}
                    />
                  </div>
                  <div className="font-medium text-zinc-200 text-[11px] leading-snug">
                    {ev.title}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   17. POMODORO FOCUS TIMER WIDGET
   ============================================================ */
export const PomodoroPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus')
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [completedSessions, setCompletedSessions] = useState<number>(params?.completedSessions ?? 2)
  const totalSessions = params?.totalSessions ?? 4

  const modeDurations = {
    focus: (params?.focusMinutes ?? 25) * 60,
    shortBreak: (params?.shortBreakMinutes ?? 5) * 60,
    longBreak: (params?.longBreakMinutes ?? 15) * 60
  }

  useEffect(() => {
    let interval: any = null
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1)
      }, 1000)
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false)
      if (mode === 'focus') {
        setCompletedSessions((prev) => prev + 1)
        setMode('shortBreak')
        setSecondsLeft(modeDurations.shortBreak)
      } else {
        setMode('focus')
        setSecondsLeft(modeDurations.focus)
      }
    }
    return () => clearInterval(interval)
  }, [isRunning, secondsLeft, mode, modeDurations.focus, modeDurations.shortBreak])

  const handleSwitchMode = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    setMode(newMode)
    setIsRunning(false)
    setSecondsLeft(modeDurations[newMode])
  }

  const handleToggleTimer = () => {
    setIsRunning((prev) => !prev)
  }

  const handleReset = () => {
    setIsRunning(false)
    setSecondsLeft(modeDurations[mode])
  }

  const mins = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0')
  const secs = (secondsLeft % 60).toString().padStart(2, '0')
  const progressPercent = Math.round(
    ((modeDurations[mode] - secondsLeft) / modeDurations[mode]) * 100
  )

  return (
    <div className="reframe-panel-body p-4 bg-zinc-950/70 text-zinc-100 flex flex-col justify-between h-full select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <Timer className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-semibold text-zinc-300">{params?.title || 'Pomodoro Timer'}</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-400">
          <span>
            Session {completedSessions} of {totalSessions}
          </span>
          <div className="flex gap-1 ml-1.5">
            {Array.from({ length: totalSessions }).map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i < completedSessions ? 'bg-rose-400' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center gap-1.5 my-2 shrink-0">
        <button
          onClick={() => handleSwitchMode('focus')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            mode === 'focus'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Focus (25m)
        </button>
        <button
          onClick={() => handleSwitchMode('shortBreak')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            mode === 'shortBreak'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Short Break (5m)
        </button>
        <button
          onClick={() => handleSwitchMode('longBreak')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            mode === 'longBreak'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Long Break (15m)
        </button>
      </div>

      {/* Main Countdown Timer */}
      <div className="flex-1 flex flex-col items-center justify-center my-2">
        <div className="text-5xl sm:text-6xl font-extrabold font-mono text-white tracking-tighter drop-shadow-sm">
          {mins}:{secs}
        </div>
        <div className="text-[11px] text-zinc-400 mt-2 font-mono flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span className="truncate max-w-xs">
            {params?.currentTask || 'Focusing on high-density architecture'}
          </span>
        </div>
        <div className="w-48 bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full transition-all duration-500 ${
              mode === 'focus'
                ? 'bg-rose-500'
                : mode === 'shortBreak'
                  ? 'bg-emerald-500'
                  : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-center gap-2 pt-2 border-t border-zinc-800 shrink-0">
        <button
          onClick={handleToggleTimer}
          className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : mode === 'focus'
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
        </button>
        <button
          onClick={handleReset}
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/* ============================================================
   18. TASK CHECKLIST & TO-DO TRACKER WIDGET
   ============================================================ */
export const TaskChecklistPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const [tasks, setTasks] = useState(
    params?.tasks || [
      {
        id: 'tsk-1',
        title: 'Review production cluster telemetry & APM logs',
        priority: 'high',
        completed: true,
        tag: 'Infra'
      },
      {
        id: 'tsk-2',
        title: 'Deploy automated SOC2 compliance retention policy',
        priority: 'high',
        completed: true,
        tag: 'Security'
      },
      {
        id: 'tsk-3',
        title: 'Finalize enterprise client dashboard presentation',
        priority: 'medium',
        completed: false,
        tag: 'Client'
      },
      {
        id: 'tsk-4',
        title: 'Tune prompt temperature and benchmark throughput',
        priority: 'medium',
        completed: false,
        tag: 'AI'
      },
      {
        id: 'tsk-5',
        title: 'Validate zero-dependency standalone code export',
        priority: 'low',
        completed: false,
        tag: 'Build'
      }
    ]
  )
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const handleToggleTask = (id: string) => {
    setTasks((prev: any[]) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const handleDeleteTask = (id: string) => {
    setTasks((prev: any[]) => prev.filter((t) => t.id !== id))
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    const newTask = {
      id: makeTaskId(),
      title: newTaskTitle.trim(),
      priority: 'medium',
      completed: false,
      tag: 'General'
    }
    setTasks((prev: any[]) => [...prev, newTask])
    setNewTaskTitle('')
  }

  const completedCount = tasks.filter((t: any) => t.completed).length
  const totalCount = tasks.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const filteredTasks = tasks.filter((t: any) => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  return (
    <div className="reframe-panel-body p-3.5 bg-zinc-950/70 text-zinc-100 flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <ListTodo className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-zinc-200">
            {params?.title || 'Action Item Tracker'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">
          {completedCount}/{totalCount} Completed ({progressPercent}%)
        </span>
      </div>

      {/* Progress Bar & Filter Tabs */}
      <div className="space-y-2 mb-2.5 shrink-0">
        <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-medium">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 rounded transition-colors ${
              filter === 'all'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-2 py-0.5 rounded transition-colors ${
              filter === 'active'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Active ({totalCount - completedCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-2 py-0.5 rounded transition-colors ${
              filter === 'completed'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {filteredTasks.map((t: any) => (
          <div
            key={t.id}
            className={`group p-2 rounded-lg border flex items-center justify-between gap-2 text-xs transition-all ${
              t.completed
                ? 'bg-zinc-900/40 border-zinc-850/60 text-zinc-500'
                : 'bg-zinc-850/80 border-zinc-750 text-zinc-200 hover:border-zinc-650'
            }`}
          >
            <div
              onClick={() => handleToggleTask(t.id)}
              className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
            >
              {t.completed ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-zinc-500 hover:text-zinc-300 shrink-0" />
              )}
              <span
                className={`truncate text-xs ${t.completed ? 'line-through text-zinc-500' : ''}`}
              >
                {t.title}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {t.tag && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  {t.tag}
                </span>
              )}
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-semibold ${
                  t.priority === 'high'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : t.priority === 'medium'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}
              >
                {t.priority}
              </span>
              <button
                onClick={() => handleDeleteTask(t.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Rapid Add Bar */}
      <form onSubmit={handleAddTask} className="pt-2 border-t border-zinc-800 flex gap-2 shrink-0">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="+ Add a new task..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!newTaskTitle.trim()}
          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition-all"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </form>
    </div>
  )
}

/* ============================================================
   19. CALCULATOR & CONVERTER WIDGET
   ============================================================ */
export const CalculatorPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const [display, setDisplay] = useState('0')
  const [prevVal, setPrevVal] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [overwrite, setOverwrite] = useState(false)
  const [history, setHistory] = useState<string[]>(
    params?.history || ['1,250 × 1.2 = 1,500', '48,000 ÷ 12 = 4,000']
  )

  const compute = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b
      case '-':
        return a - b
      case '×':
        return a * b
      case '÷':
        return b !== 0 ? a / b : 0
      default:
        return b
    }
  }

  const handleDigit = (d: string) => {
    if (overwrite || display === '0') {
      setDisplay(d)
      setOverwrite(false)
    } else {
      setDisplay((prev) => (prev.length < 12 ? prev + d : prev))
    }
  }

  const handleDot = () => {
    if (overwrite) {
      setDisplay('0.')
      setOverwrite(false)
    } else if (!display.includes('.')) {
      setDisplay((prev) => prev + '.')
    }
  }

  const handleOp = (op: string) => {
    const cur = parseFloat(display)
    if (prevVal !== null && operation && !overwrite) {
      const res = compute(prevVal, cur, operation)
      setDisplay(String(res))
      setPrevVal(res)
    } else {
      setPrevVal(cur)
    }
    setOperation(op)
    setOverwrite(true)
  }

  const handleEquals = () => {
    if (prevVal === null || !operation) return
    const cur = parseFloat(display)
    const res = compute(prevVal, cur, operation)
    const entry = `${prevVal} ${operation} ${cur} = ${res}`
    setHistory((prev) => [entry, ...prev.slice(0, 4)])
    setDisplay(String(res))
    setPrevVal(null)
    setOperation(null)
    setOverwrite(true)
  }

  const handleClear = () => {
    setDisplay('0')
    setPrevVal(null)
    setOperation(null)
    setOverwrite(false)
  }

  const handlePercent = () => {
    const cur = parseFloat(display)
    setDisplay(String(cur / 100))
  }

  return (
    <div className="reframe-panel-body p-3 bg-zinc-950/70 text-zinc-100 flex flex-col justify-between h-full select-none overflow-hidden">
      {/* Display with tape */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 mb-2 flex flex-col justify-between min-h-[60px] shrink-0">
        <div className="text-[10px] font-mono text-zinc-500 text-right truncate">
          {history[0] || (operation && prevVal !== null ? `${prevVal} ${operation}` : '')}
        </div>
        <div className="text-2xl font-mono font-bold text-white text-right tracking-tight overflow-x-auto scrollbar-none">
          {display}
        </div>
      </div>

      {/* Button Matrix */}
      <div className="grid grid-cols-4 gap-1.5 flex-1">
        <button
          onClick={handleClear}
          className="p-2 rounded bg-zinc-850 hover:bg-zinc-800 text-rose-400 font-semibold text-xs transition-colors"
        >
          AC
        </button>
        <button
          onClick={handlePercent}
          className="p-2 rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs transition-colors"
        >
          %
        </button>
        <button
          onClick={() => setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'))}
          className="p-2 rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs transition-colors"
        >
          ⌫
        </button>
        <button
          onClick={() => handleOp('÷')}
          className="p-2 rounded bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 font-bold text-sm transition-colors"
        >
          ÷
        </button>

        <button
          onClick={() => handleDigit('7')}
          className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-medium text-xs transition-colors"
        >
          7
        </button>
        <button
          onClick={() => handleDigit('8')}
          className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-medium text-xs transition-colors"
        >
          8
        </button>
        <button
          onClick={() => handleDigit('9')}
          className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-medium text-xs transition-colors"
        >
          9
        </button>
        <button
          onClick={() => handleOp('×')}
          className="p-2 rounded bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 font-bold text-sm transition-colors"
        >
          ×
        </button>

        <button
          onClick={() => handleDigit('4')}
          className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-medium text-xs transition-colors"
        >
          4
        </button>
        <button
          onClick={() => handleDigit('5')}
          className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-medium text-xs transition-colors"
        >
          5
        </button>
        <button
          onClick={() => handleDigit('6')}
          className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-medium text-xs transition-colors"
        >
          6
        </button>
        <button
          onClick={() => handleOp('-')}
          className="p-2 rounded bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 font-bold text-sm transition-colors"
        >
          -
        </button>

        <button
          onClick={() => handleDigit('1')}
          className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-medium text-xs transition-colors"
        >
          1
        </button>
        <button
          onClick={() => handleDigit('2')}
          className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-medium text-xs transition-colors"
        >
          2
        </button>
        <button
          onClick={() => handleDigit('3')}
          className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-medium text-xs transition-colors"
        >
          3
        </button>
        <button
          onClick={() => handleOp('+')}
          className="p-2 rounded bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 font-bold text-sm transition-colors"
        >
          +
        </button>

        <button
          onClick={() => handleDigit('0')}
          className="col-span-2 p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-medium text-xs transition-colors"
        >
          0
        </button>
        <button
          onClick={handleDot}
          className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-medium text-xs transition-colors"
        >
          .
        </button>
        <button
          onClick={handleEquals}
          className="p-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors"
        >
          =
        </button>
      </div>
    </div>
  )
}

/* ============================================================
   20. WEATHER & ENVIRONMENTAL COCKPIT WIDGET
   ============================================================ */
export const WeatherPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const [city] = useState(params?.city || 'New York, US')
  const [isFahrenheit, setIsFahrenheit] = useState(false)

  const rawTemp = params?.temperature ?? 22
  const temp = isFahrenheit ? Math.round((rawTemp * 9) / 5 + 32) : rawTemp
  const unit = isFahrenheit ? '°F' : '°C'

  const forecast = params?.forecast || [
    { day: 'Mon', temp: 24, condition: 'Sunny' },
    { day: 'Tue', temp: 22, condition: 'Partly Cloudy' },
    { day: 'Wed', temp: 19, condition: 'Rain' },
    { day: 'Thu', temp: 21, condition: 'Partly Cloudy' },
    { day: 'Fri', temp: 26, condition: 'Sunny' }
  ]

  return (
    <div className="reframe-panel-body p-3.5 bg-zinc-950/70 text-zinc-100 flex flex-col justify-between h-full select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <CloudSun className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-zinc-200">{city}</span>
        </div>
        <button
          onClick={() => setIsFahrenheit((prev) => !prev)}
          className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono text-zinc-300"
        >
          {isFahrenheit ? '°F' : '°C'}
        </button>
      </div>

      {/* Main Temperature Hero */}
      <div className="flex items-center justify-between my-2">
        <div>
          <div className="text-4xl font-extrabold text-white font-mono tracking-tight">
            {temp}
            {unit}
          </div>
          <div className="text-xs text-zinc-400 font-medium mt-0.5">
            {params?.condition || 'Partly Cloudy'}
          </div>
        </div>
        <div className="text-right text-[11px] font-mono text-zinc-400 space-y-0.5">
          <div>
            High: {isFahrenheit ? 77 : 25}
            {unit} • Low: {isFahrenheit ? 62 : 17}
            {unit}
          </div>
          <div>Humidity: {params?.humidity || '48%'}</div>
          <div>Wind: {params?.windSpeed || '14 km/h'}</div>
        </div>
      </div>

      {/* 5-Day Forecast Strip */}
      <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-zinc-800/80 shrink-0">
        {forecast.map((f: any, idx: number) => {
          const fTemp = isFahrenheit ? Math.round((f.temp * 9) / 5 + 32) : f.temp
          return (
            <div
              key={idx}
              className="p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col items-center text-center"
            >
              <span className="text-[10px] text-zinc-400 font-semibold">{f.day}</span>
              {f.condition.includes('Sun') ? (
                <Sun className="w-3.5 h-3.5 text-amber-400 my-1" />
              ) : f.condition.includes('Rain') ? (
                <CloudRain className="w-3.5 h-3.5 text-blue-400 my-1" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-zinc-400 my-1" />
              )}
              <span className="text-[11px] font-mono font-bold text-zinc-200">{fTemp}°</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================
   22. MEETING AUDIO RECORDER WIDGET
   ============================================================ */
export const MeetingRecorderPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [seconds, setSeconds] = useState<number>(params?.initialSeconds ?? 482)
  const [micDevice, setMicDevice] = useState('Studio USB Condenser (Default)')
  const [noiseSuppression, setNoiseSuppression] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording, isPaused])

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600)
    const mins = Math.floor((secs % 3600) / 60)
    const remSecs = secs % 60
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`
    }
    return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`
  }

  const waveHeights = [
    24, 48, 80, 65, 92, 35, 78, 90, 45, 60, 30, 85, 70, 95, 50, 40, 65, 88, 75, 42
  ]

  return (
    <div className="reframe-panel-body p-3.5 bg-zinc-950/70 text-zinc-100 flex flex-col justify-between h-full select-none overflow-hidden">
      {/* Top Header / Mic Selector */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isRecording && !isPaused
                ? 'bg-rose-500 animate-pulse'
                : isPaused
                  ? 'bg-amber-400'
                  : 'bg-zinc-600'
            }`}
          />
          <span className="font-semibold text-zinc-200">
            {isRecording && !isPaused
              ? 'Recording Active'
              : isPaused
                ? 'Recording Paused'
                : 'Ready to Record'}
          </span>
        </div>
        <select
          value={micDevice}
          onChange={(e) => setMicDevice(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-[11px] text-zinc-300 focus:outline-none focus:border-zinc-700"
        >
          <option>Studio USB Condenser (Default)</option>
          <option>Built-in Array (Realtek Audio)</option>
          <option>Bluetooth Headset (AirPods Pro)</option>
        </select>
      </div>

      {/* Center Waveform & Timer */}
      <div className="flex flex-col items-center justify-center my-auto py-2">
        <div className="text-4xl font-extrabold font-mono tracking-tight text-white mb-2">
          {formatTime(seconds)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-4 font-mono">
          <span>Bitrate: 256kbps Opus</span>
          <span>•</span>
          <span className="text-emerald-400">Peak: -8.4 dBFS</span>
        </div>

        {/* Audio Waveform Bars */}
        <div className="flex items-end justify-center gap-1 h-12 w-full max-w-sm px-4">
          {waveHeights.map((h, idx) => (
            <div
              key={idx}
              className={`w-1.5 rounded-full transition-all duration-150 ${
                isRecording && !isPaused
                  ? 'bg-gradient-to-t from-indigo-500 to-rose-400'
                  : 'bg-zinc-800'
              }`}
              style={{
                height: isRecording && !isPaused ? `${h}%` : '15%'
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNoiseSuppression(!noiseSuppression)}
            className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
              noiseSuppression
                ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            Noise Suppression: {noiseSuppression ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              onClick={() => {
                setIsRecording(true)
                setIsPaused(false)
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Start Recording</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1"
              >
                {isPaused ? (
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
              <button
                onClick={() => {
                  setIsRecording(false)
                  setIsPaused(false)
                }}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-200 text-xs font-medium flex items-center gap-1"
              >
                <Square className="w-3 h-3 fill-rose-300" />
                <span>Stop & Transcribe</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   23. MEETING LIVE TRANSCRIPT WIDGET
   ============================================================ */
export const MeetingTranscriptPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const [filterSpeaker, setFilterSpeaker] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copied, setCopied] = useState(false)

  const transcripts = useMemo(
    () =>
      params?.transcript || [
        {
          id: 'tr-1',
          speaker: 'Sarah Lin',
          role: 'VP Eng',
          time: '10:14 AM',
          text: 'Good morning everyone. Let us review the primary Redis cluster replication failover test and client deliverable milestones.',
          confidence: 99
        },
        {
          id: 'tr-2',
          speaker: 'Alex Chen',
          role: 'Staff Dev',
          time: '10:15 AM',
          text: 'Yes, we conducted the canary failover at 08:30 UTC. Replica reconnection was seamless with zero dropped packets.',
          confidence: 98
        },
        {
          id: 'tr-3',
          speaker: 'David Ross',
          role: 'Product Lead',
          time: '10:16 AM',
          text: 'Excellent. What about the enterprise client dashboard delivery date? We promised the cockpit preview by Friday.',
          confidence: 97
        },
        {
          id: 'tr-4',
          speaker: 'Sarah Lin',
          role: 'VP Eng',
          time: '10:16 AM',
          text: 'The new widget suite and zero-dependency export are already verified. We are completely on schedule for Friday release.',
          confidence: 99
        },
        {
          id: 'tr-5',
          speaker: 'Alex Chen',
          role: 'Staff Dev',
          time: '10:17 AM',
          text: 'I will finish tagging the package and double check our SOC2 encryption keys right after this call.',
          confidence: 96
        }
      ],
    [params?.transcript]
  )

  const speakers = useMemo(() => {
    const set = new Set<string>()
    transcripts.forEach((t: any) => set.add(t.speaker))
    return Array.from(set)
  }, [transcripts])

  const filtered = transcripts.filter((t: any) => {
    if (filterSpeaker !== 'all' && t.speaker !== filterSpeaker) return false
    if (searchQuery && !t.text.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleCopy = () => {
    const fullText = filtered
      .map((t: any) => `[${t.time}] ${t.speaker} (${t.role}): ${t.text}`)
      .join('\n')
    navigator.clipboard?.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="reframe-panel-body p-3 bg-zinc-950/70 text-zinc-100 flex flex-col h-full select-none overflow-hidden">
      {/* Top Search & Controls */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-1.5 text-zinc-400 pl-0.5">
          <FileAudio className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        </div>
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search transcript utterances..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>

        <select
          value={filterSpeaker}
          onChange={(e) => setFilterSpeaker(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
        >
          <option value="all">All Speakers ({transcripts.length})</option>
          {speakers.map((spk) => (
            <option key={spk} value={spk}>
              {spk}
            </option>
          ))}
        </select>

        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Copy transcript to clipboard"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Transcript List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 py-2.5 pr-1">
        {filtered.map((item: any) => {
          const isSarah = item.speaker.includes('Sarah')
          const isAlex = item.speaker.includes('Alex')
          const badgeColor = isSarah
            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
            : isAlex
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'

          return (
            <div
              key={item.id}
              className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors"
            >
              <div className="flex items-center justify-between mb-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded font-medium border ${badgeColor}`}>
                    {item.speaker}
                  </span>
                  <span className="text-zinc-500 font-mono text-[10px]">{item.role}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                  <span>{item.time}</span>
                  <span className="text-emerald-500">{item.confidence}%</span>
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed pl-0.5">{item.text}</p>
            </div>
          )
        })}
      </div>

      {/* Bottom Live Streaming Indicator */}
      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Whisper-Large v3 • Real-time Diarization</span>
        </div>
        <span>{filtered.length} utterances</span>
      </div>
    </div>
  )
}

/* ============================================================
   24. MEETING SUMMARY & MINUTES WIDGET
   ============================================================ */
export const MeetingSummaryPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const [activeTab, setActiveTab] = useState<'tldr' | 'decisions' | 'blockers'>('tldr')
  const [model, setModel] = useState(params?.model || 'Claude 3.7 Sonnet')
  const [isGenerating, setIsGenerating] = useState(false)

  const tldr =
    params?.tldr ||
    'Architecture sync confirmed Q3 cluster migration is green. Redis failover completed without client disruption. Enterprise cockpit deliverable is locked for Friday release.'
  const decisions = params?.decisions || [
    'Approved Redis v7 failover parameter configuration in production',
    'Confirmed Friday 5 PM release date for Client Dashboard deliverable',
    'Scheduled SRE on-call shadow rotation for next Tuesday'
  ]
  const blockers = params?.blockers || [
    'Pending SOC2 Type II legal audit sign-off for client data retention policy'
  ]

  const handleRegenerate = () => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 800)
  }

  return (
    <div className="reframe-panel-body p-3.5 bg-zinc-950/70 text-zinc-100 flex flex-col h-full select-none overflow-hidden">
      {/* Header with Model Badge & Regenerate */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-zinc-200">AI Minutes & Summary</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-[11px] text-zinc-300 focus:outline-none focus:border-zinc-700"
          >
            <option>Claude 3.7 Sonnet</option>
            <option>GPT-4o Omnichannel</option>
            <option>Gemini 1.5 Pro</option>
          </select>
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
            title="Regenerate summary"
          >
            <RotateCcw
              className={`w-3 h-3 ${isGenerating ? 'animate-spin text-indigo-400' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 my-2.5 shrink-0">
        {(['tldr', 'decisions', 'blockers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {tab === 'tldr'
              ? 'Executive TL;DR'
              : tab === 'decisions'
                ? `Decisions (${decisions.length})`
                : `Blockers (${blockers.length})`}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'tldr' && (
          <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-300 leading-relaxed space-y-2">
            <p>{tldr}</p>
            <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>Sentiment: Highly Constructive</span>
              <span>45m Audio Processed</span>
            </div>
          </div>
        )}

        {activeTab === 'decisions' && (
          <div className="space-y-2 text-xs">
            {decisions.map((dec: string, idx: number) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-zinc-200 leading-snug">{dec}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'blockers' && (
          <div className="space-y-2 text-xs">
            {blockers.map((blk: string, idx: number) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/30 flex items-start gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-zinc-200 leading-snug">{blk}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   25. MEETING ACTION ITEMS WIDGET
   ============================================================ */
let actionItemIdCounter = 100
const getNextActionId = () => `act-${++actionItemIdCounter}`

export const MeetingActionItemsPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const [items, setItems] = useState(
    params?.items || [
      {
        id: 'act-1',
        task: 'Merge Redis connection pool timeout patch to production branch',
        assignee: 'Alex Chen',
        due: 'Today 5:00 PM',
        priority: 'high',
        completed: true,
        timestamp: '10:15 AM'
      },
      {
        id: 'act-2',
        task: 'Package standalone client dashboard export and verify demo',
        assignee: 'Sarah Lin',
        due: 'Thursday 12:00 PM',
        priority: 'high',
        completed: false,
        timestamp: '10:17 AM'
      },
      {
        id: 'act-3',
        task: 'Forward SOC2 data retention brief to compliance committee',
        assignee: 'David Ross',
        due: 'Friday 2:00 PM',
        priority: 'medium',
        completed: false,
        timestamp: '10:22 AM'
      }
    ]
  )
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [newTaskText, setNewTaskText] = useState('')
  const [seekingAudio, setSeekingAudio] = useState<string | null>(null)

  const toggleTask = (id: string) => {
    setItems((prev: any[]) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const handleSeek = (ts: string) => {
    setSeekingAudio(`Jumped to audio timestamp [${ts}]`)
    setTimeout(() => setSeekingAudio(null), 2500)
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskText.trim()) return
    const newItem = {
      id: getNextActionId(),
      task: newTaskText.trim(),
      assignee: 'Sarah Lin',
      due: 'End of Week',
      priority: 'medium',
      completed: false,
      timestamp: '10:24 AM'
    }
    setItems((prev: any[]) => [...prev, newItem])
    setNewTaskText('')
  }

  const filteredItems = items.filter((it: any) => {
    if (filter === 'pending') return !it.completed
    if (filter === 'completed') return it.completed
    return true
  })

  return (
    <div className="reframe-panel-body p-3.5 bg-zinc-950/70 text-zinc-100 flex flex-col h-full select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-zinc-200">Extracted Action Items</span>
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'pending', 'completed'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                filter === mode ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {seekingAudio && (
        <div className="my-1.5 px-2 py-1 rounded bg-indigo-950/40 border border-indigo-500/40 text-[10px] text-indigo-300 font-mono">
          {seekingAudio}
        </div>
      )}

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
        {filteredItems.map((item: any) => (
          <div
            key={item.id}
            className={`p-2 rounded-lg border transition-colors flex items-start gap-2 text-xs ${
              item.completed
                ? 'bg-zinc-900/30 border-zinc-850 opacity-70'
                : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <button
              onClick={() => toggleTask(item.id)}
              className="mt-0.5 text-zinc-400 hover:text-zinc-100"
            >
              {item.completed ? (
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Square className="w-3.5 h-3.5 text-zinc-500" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p
                className={`leading-snug ${item.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}
              >
                {item.task}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-400 font-mono">
                <span className="px-1.5 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                  @{item.assignee}
                </span>
                <span>Due: {item.due}</span>
                <button
                  onClick={() => handleSeek(item.timestamp)}
                  className="text-indigo-400 hover:underline cursor-pointer"
                  title="Play audio context"
                >
                  [{item.timestamp}]
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inline Add Task Form */}
      <form onSubmit={handleAddTask} className="pt-2 border-t border-zinc-800 flex gap-2 shrink-0">
        <input
          type="text"
          placeholder="+ Add next action item..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
        />
        <button
          type="submit"
          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          Add
        </button>
      </form>
    </div>
  )
}

/* ============================================================
   26. SPEAKER TALK-TIME & SENTIMENT ANALYTICS
   ============================================================ */
export const MeetingTalkTimePanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const speakers = params?.speakers || [
    { name: 'Sarah Lin', role: 'VP Eng', percentage: 42, pace: '138 wpm', sentiment: 'Positive' },
    {
      name: 'Alex Chen',
      role: 'Staff Dev',
      percentage: 36,
      pace: '152 wpm',
      sentiment: 'Constructive'
    },
    {
      name: 'David Ross',
      role: 'Product Lead',
      percentage: 22,
      pace: '144 wpm',
      sentiment: 'Neutral'
    }
  ]

  const overallSentiment = params?.overallSentiment || '92% Constructive'

  return (
    <div className="reframe-panel-body p-3.5 bg-zinc-950/70 text-zinc-100 flex flex-col justify-between h-full select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <PieChart className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-zinc-200">Speaker Talk-Time & Intelligence</span>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/30">
          {overallSentiment}
        </span>
      </div>

      {/* Speaker Bars */}
      <div className="space-y-3.5 my-auto py-2">
        {speakers.map((spk: any, idx: number) => {
          const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500']
          const barColor = colors[idx % colors.length]

          return (
            <div key={spk.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-zinc-200">{spk.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">({spk.role})</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-zinc-400">{spk.pace}</span>
                  <span className="font-bold text-zinc-200">{spk.percentage}%</span>
                </div>
              </div>
              <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                <div
                  className={`h-full rounded-full ${barColor} transition-all duration-500`}
                  style={{ width: `${spk.percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Metrics Footer */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800 shrink-0 text-center font-mono">
        <div className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800">
          <span className="text-[9px] text-zinc-500 block">OPTIMAL PACE</span>
          <span className="text-xs font-bold text-zinc-200">144 wpm</span>
        </div>
        <div className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800">
          <span className="text-[9px] text-zinc-500 block">INTERRUPTIONS</span>
          <span className="text-xs font-bold text-zinc-200">2 events</span>
        </div>
        <div className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800">
          <span className="text-[9px] text-zinc-500 block">ENGAGEMENT</span>
          <span className="text-xs font-bold text-emerald-400">96.8%</span>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   27. MEETING AGENDA & PACING STOPWATCH
   ============================================================ */
export const MeetingAgendaTimerPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const [items, setItems] = useState(
    params?.items || [
      {
        id: 'ag-1',
        topic: 'Redis failover verification & APM review',
        allotted: 15,
        elapsed: 14,
        status: 'completed'
      },
      {
        id: 'ag-2',
        topic: 'Enterprise dashboard client deliverable review',
        allotted: 20,
        elapsed: 12,
        status: 'current'
      },
      {
        id: 'ag-3',
        topic: 'SOC2 compliance retention policy audit',
        allotted: 10,
        elapsed: 0,
        status: 'pending'
      }
    ]
  )

  const handleNextTopic = () => {
    setItems((prev: any[]) => {
      const currIdx = prev.findIndex((i) => i.status === 'current')
      if (currIdx === -1 || currIdx === prev.length - 1) return prev
      return prev.map((item, idx) => {
        if (idx === currIdx) return { ...item, status: 'completed' }
        if (idx === currIdx + 1) return { ...item, status: 'current' }
        return item
      })
    })
  }

  const currentTopic = items.find((i: any) => i.status === 'current')

  return (
    <div className="reframe-panel-body p-3.5 bg-zinc-950/70 text-zinc-100 flex flex-col justify-between h-full select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-zinc-200">Meeting Agenda & Pacing</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/30 text-emerald-300 border border-emerald-500/30">
          {params?.status || 'On Track (+1m ahead)'}
        </span>
      </div>

      {/* Agenda Topics List */}
      <div className="space-y-2 my-auto py-2">
        {items.map((item: any, idx: number) => {
          const isCurrent = item.status === 'current'
          const isDone = item.status === 'completed'

          return (
            <div
              key={item.id}
              className={`p-2.5 rounded-lg border text-xs transition-colors ${
                isCurrent
                  ? 'bg-indigo-950/20 border-indigo-500/40 text-white'
                  : isDone
                    ? 'bg-zinc-900/30 border-zinc-850 text-zinc-400'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-500 text-[11px]">{idx + 1}.</span>
                  <span className="font-medium">{item.topic}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border bg-zinc-900 border-zinc-800 text-zinc-300">
                  {item.elapsed}m / {item.allotted}m
                </span>
              </div>
              {isCurrent && (
                <div className="mt-2 h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, (item.elapsed / item.allotted) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 shrink-0">
        <div className="text-[11px] font-mono text-zinc-400">
          {currentTopic ? `Active: ${currentTopic.topic.slice(0, 24)}...` : 'All topics covered'}
        </div>
        <button
          onClick={handleNextTopic}
          className="px-3 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <span>Next Topic</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

/* ============================================================
   28. ASK AI ABOUT THIS MEETING (MEETING RAG)
   ============================================================ */
let qaMessageIdCounter = 100
const getNextQaId = () => `qa-${++qaMessageIdCounter}`

export const MeetingQaPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 'qa-1',
      question: 'What did Sarah say about the Friday deadline?',
      answer:
        'Sarah Lin confirmed at 10:16 AM that the new widget suite and zero-dependency export are verified, and delivery remains strictly on schedule for Friday release.',
      citation: 'Utterance #4 • 10:16 AM'
    }
  ])
  const [isSearching, setIsSearching] = useState(false)

  const samplePrompts = useMemo(
    () =>
      params?.samplePrompts || [
        'What was decided about Redis failover?',
        'Who is responsible for the client export package?',
        'Any blockers identified?'
      ],
    [params?.samplePrompts]
  )

  const handleSend = (text: string) => {
    if (!text.trim()) return
    setIsSearching(true)
    const q = text.trim()
    setQuery('')
    setTimeout(() => {
      let ans =
        'Based on the call transcript, the team confirmed unanimous consensus on the timeline and zero customer impact.'
      let cit = 'Utterance #2 • 10:15 AM'
      if (q.toLowerCase().includes('redis')) {
        ans =
          'Alex Chen reported the canary failover completed at 08:30 UTC with zero dropped packets and instant replica re-attachment.'
        cit = 'Utterance #2 • 10:15 AM'
      } else if (q.toLowerCase().includes('client') || q.toLowerCase().includes('export')) {
        ans =
          'Sarah Lin confirmed the client deliverable is locked for Friday release, and Alex Chen is packaging the standalone release.'
        cit = 'Utterance #4 • 10:16 AM'
      } else if (q.toLowerCase().includes('blocker')) {
        ans =
          'The only open blocker is the pending SOC2 Type II legal audit sign-off for client data retention policy.'
        cit = 'Section: Minutes & Blockers'
      }

      setMessages((prev) => [
        ...prev,
        {
          id: getNextQaId(),
          question: q,
          answer: ans,
          citation: cit
        }
      ])
      setIsSearching(false)
    }, 600)
  }

  return (
    <div className="reframe-panel-body p-3.5 bg-zinc-950/70 text-zinc-100 flex flex-col h-full select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-zinc-200">Ask AI About This Meeting</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
          Semantic Meeting RAG
        </span>
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-1.5 my-2 shrink-0">
        {samplePrompts.map((p: string) => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Conversation / Answers List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 py-1 pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-1.5 text-xs"
          >
            <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <span className="text-indigo-400">Q:</span>
              <span>{m.question}</span>
            </div>
            <p className="text-zinc-300 leading-relaxed pl-3 border-l-2 border-indigo-500/40">
              {m.answer}
            </p>
            <div className="text-[10px] font-mono text-emerald-400 pt-1 flex items-center justify-between">
              <span>Citation: {m.citation}</span>
              <span className="text-zinc-500">99.1% Confidence</span>
            </div>
          </div>
        ))}
        {isSearching && (
          <div className="p-2.5 rounded-lg bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-400 font-mono animate-pulse flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Searching meeting embeddings & audio alignment...</span>
          </div>
        )}
      </div>

      {/* Query Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend(query)
        }}
        className="pt-2 border-t border-zinc-800 flex gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask anything about what was said on this call..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
        />
        <button
          type="submit"
          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          Ask
        </button>
      </form>
    </div>
  )
}

/* ============================================================
   29. PRE-MEETING ATTENDEE BRIEFING WIDGET
   ============================================================ */
export const MeetingBriefingPanelWidget: React.FC<IDockviewPanelProps> = ({ params }) => {
  const meetingName = params?.meetingName || 'Executive Cockpit Review'
  const primaryGoal =
    params?.primaryGoal || 'Demonstrate the 63+ client widget kit and confirm Friday release.'
  const attendees = params?.attendees || [
    { name: 'Sarah Lin', role: 'VP of Engineering', company: 'Acme Corp', lastMet: '4 days ago' },
    { name: 'David Ross', role: 'Head of Product', company: 'Acme Corp', lastMet: '1 week ago' },
    { name: 'Alex Chen', role: 'Staff Infrastructure', company: 'Internal', lastMet: 'Yesterday' }
  ]

  return (
    <div className="reframe-panel-body p-3.5 bg-zinc-950/70 text-zinc-100 flex flex-col justify-between h-full select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-zinc-200">Pre-Meeting Attendee Briefing</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/30 text-blue-300 border border-blue-500/30">
          Executive Dossier
        </span>
      </div>

      {/* Goal Callout */}
      <div className="my-2 p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-500/30 text-xs shrink-0">
        <span className="text-[10px] font-mono uppercase text-indigo-400 block font-semibold mb-0.5">
          Primary Call Objective: {meetingName}
        </span>
        <p className="text-zinc-200">{primaryGoal}</p>
      </div>

      {/* Attendee Dossier Cards */}
      <div className="flex-1 overflow-y-auto space-y-2 py-1">
        {attendees.map((att: any) => (
          <div
            key={att.name}
            className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 flex items-center justify-between text-xs"
          >
            <div>
              <div className="font-semibold text-zinc-200">{att.name}</div>
              <div className="text-[11px] text-zinc-400 font-mono">
                {att.role} • {att.company}
              </div>
            </div>
            <div className="text-right text-[10px] text-zinc-500 font-mono">
              <div>Last touchpoint</div>
              <div className="text-zinc-400">{att.lastMet}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Runbook Context */}
      <div className="pt-2 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 flex items-center justify-between shrink-0">
        <span>Linked artifacts: 3 briefs</span>
        <span className="text-emerald-400">Context Synced</span>
      </div>
    </div>
  )
}

/* ============================================================
   30. EMPTY / WIREFRAME SLOT WIDGET
   ============================================================ */
export const EmptySlotWidget: React.FC<IDockviewPanelProps> = ({ api }) => {
  const panelId = api.id
  const { setTargetSlotId, setIsCatalogModalOpen, addEmptySlot, removePanel, fillEmptySlot } =
    useReframeStore()

  const handleOpenCatalog = () => {
    setTargetSlotId(panelId)
    setIsCatalogModalOpen(true)
  }

  const handleQuickFill = (widgetType: string) => {
    const item = WIDGET_CATALOG.find((w) => w.widgetType === widgetType)
    if (item) {
      fillEmptySlot(panelId, item)
    }
  }

  return (
    <div className="reframe-panel-body w-full h-full p-4 flex flex-col justify-between bg-zinc-950/40 text-zinc-100 select-none overflow-hidden relative group">
      {/* Top Slot Action Toolbar */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/40">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
          <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-zinc-300">Wireframe Slot</span>
        </div>

        {/* Quick split & manage actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => addEmptySlot('right', panelId)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 text-[10px] font-medium transition-colors"
            title="Split and add a new empty column to the right"
          >
            <Columns className="w-3 h-3 text-indigo-400" />
            <span>+ Col</span>
          </button>
          <button
            onClick={() => addEmptySlot('below', panelId)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 text-[10px] font-medium transition-colors"
            title="Split and add a new empty row below"
          >
            <Rows className="w-3 h-3 text-emerald-400" />
            <span>+ Row</span>
          </button>
          <button
            onClick={() => removePanel(panelId)}
            className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Remove this slot"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Center Wireframe Action Area */}
      <div className="flex-1 my-3 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-all bg-zinc-900/20">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-3 group-hover:border-zinc-700 group-hover:text-zinc-200 transition-all">
          <LayoutGrid className="w-6 h-6 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
        </div>
        <h3 className="text-xs font-semibold text-zinc-200 tracking-tight">
          Unassigned Layout Slot
        </h3>
        <p className="text-[11px] text-zinc-500 max-w-xs mt-1 mb-3.5 leading-relaxed">
          Map your grid with columns & rows, then assign a client widget.
        </p>

        <button
          onClick={handleOpenCatalog}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Choose Widget (63+)</span>
        </button>

        {/* Quick 1-click pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 pt-3 border-t border-zinc-800/60 max-w-sm">
          <button
            onClick={() => handleQuickFill('recorder')}
            className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 transition-colors"
          >
            + Record
          </button>
          <button
            onClick={() => handleQuickFill('transcript')}
            className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 transition-colors"
          >
            + Transcript
          </button>
          <button
            onClick={() => handleQuickFill('summary')}
            className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 transition-colors"
          >
            + Minutes
          </button>
          <button
            onClick={() => handleQuickFill('meeting-actions')}
            className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 transition-colors"
          >
            + Actions
          </button>
          <button
            onClick={() => handleQuickFill('clock')}
            className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 transition-colors"
          >
            + Clock
          </button>
          <button
            onClick={() => handleQuickFill('tasks')}
            className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 transition-colors"
          >
            + Tasks
          </button>
          <button
            onClick={() => handleQuickFill('pomodoro')}
            className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 transition-colors"
          >
            + Pomodoro
          </button>
          <button
            onClick={() => handleQuickFill('calendar')}
            className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-blue-200 border border-blue-500/30 transition-colors"
          >
            + Calendar
          </button>
          <button
            onClick={() => handleQuickFill('calculator')}
            className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 transition-colors"
          >
            + Calc
          </button>
          <button
            onClick={() => handleQuickFill('weather')}
            className="px-2 py-0.5 rounded text-[10px] bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 hover:text-teal-200 border border-teal-500/30 transition-colors"
          >
            + Weather
          </button>
          <button
            onClick={() => handleQuickFill('aichat')}
            className="px-2 py-0.5 rounded text-[10px] bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
          >
            + AI Chat
          </button>
          <button
            onClick={() => handleQuickFill('kpi')}
            className="px-2 py-0.5 rounded text-[10px] bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
          >
            + KPI
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1">
        <span>Slot ID: {panelId}</span>
        <span>Drag sashes to resize</span>
      </div>
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
  embed: EmbedPanelWidget,
  terminal: TerminalPanelWidget,
  cluster: ClusterTopologyWidget,
  empty: EmptySlotWidget,
  slot: EmptySlotWidget,
  aichat: AiChatPanelWidget,
  chat: AiChatPanelWidget,
  aiagent: AiAgentPanelWidget,
  agent: AiAgentPanelWidget,
  airag: AiRagPanelWidget,
  rag: AiRagPanelWidget,
  aiprompt: AiPromptPanelWidget,
  prompt: AiPromptPanelWidget,
  aicode: AiCodeGenPanelWidget,
  code: AiCodeGenPanelWidget,
  clock: DigitalClockPanelWidget,
  digitalclock: DigitalClockPanelWidget,
  worldclock: DigitalClockPanelWidget,
  calendar: CalendarAgendaPanelWidget,
  agenda: CalendarAgendaPanelWidget,
  pomodoro: PomodoroPanelWidget,
  timer: PomodoroPanelWidget,
  tasks: TaskChecklistPanelWidget,
  todo: TaskChecklistPanelWidget,
  calculator: CalculatorPanelWidget,
  calc: CalculatorPanelWidget,
  weather: WeatherPanelWidget,
  recorder: MeetingRecorderPanelWidget,
  'meeting-record': MeetingRecorderPanelWidget,
  transcript: MeetingTranscriptPanelWidget,
  'meeting-transcript': MeetingTranscriptPanelWidget,
  summary: MeetingSummaryPanelWidget,
  'meeting-summary': MeetingSummaryPanelWidget,
  minutes: MeetingSummaryPanelWidget,
  'meeting-actions': MeetingActionItemsPanelWidget,
  'talk-time': MeetingTalkTimePanelWidget,
  'agenda-timer': MeetingAgendaTimerPanelWidget,
  'meeting-qa': MeetingQaPanelWidget,
  briefing: MeetingBriefingPanelWidget
}
