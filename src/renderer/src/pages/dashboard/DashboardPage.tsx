import { useState } from 'react'
import {
  Activity,
  CheckCircle2,
  Cpu,
  Layers,
  Moon,
  PanelLeft,
  PanelRight,
  PanelTop,
  Radio,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  Zap
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from 'recharts'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import { useTheme } from '@renderer/components/theme/ThemeProvider'
import { useTabsStore } from '@renderer/stores/tabs-store'
import { useUiStore } from '@renderer/stores/ui-store'
import { GlassCard, StatTile, CapabilityBars } from '@renderer/widgets'
import { SvglIcon } from '@renderer/components/ui/SvglIcon'

const TELEMETRY_DATA = [
  { time: '10:00', tokens: 18400, latency: 142, cache: 92 },
  { time: '10:15', tokens: 26800, latency: 138, cache: 94 },
  { time: '10:30', tokens: 22100, latency: 155, cache: 89 },
  { time: '10:45', tokens: 41200, latency: 128, cache: 96 },
  { time: '11:00', tokens: 38900, latency: 135, cache: 93 },
  { time: '11:15', tokens: 54600, latency: 118, cache: 97 },
  { time: '11:30', tokens: 48200, latency: 122, cache: 95 },
  { time: '11:45', tokens: 62400, latency: 112, cache: 98 },
  { time: '12:00', tokens: 58900, latency: 116, cache: 96 }
]

const TIME_RANGES = ['1H', '24H', '7D', '30D']

export function DashboardPage() {
  const { theme, toggleTheme, presetMeta } = useTheme()
  const { setActive } = useTabsStore()
  const {
    leftCollapsed,
    toggleLeft,
    rightOpen,
    toggleRight,
    tabsCollapsed,
    toggleTabs,
    bottomOpen,
    toggleBottom
  } = useUiStore()

  const [timeRange, setTimeRange] = useState('24H')

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Hero Command Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            <span className="mono text-[11px] font-bold uppercase tracking-widest text-emerald-500">
              Live Production Cluster • US-East-1
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            AI Operations & Cloud Command
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Real-time inference telemetry, multi-agent fleet orchestration, and framework runtime
            metrics on <strong className="text-foreground">{presetMeta.name}</strong>.
          </p>
        </div>

        {/* Time filters & primary actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-border/40 bg-card/60 p-0.5 backdrop-blur-md">
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button size="sm" onClick={() => setActive('templates')} className="gap-1.5 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Templates</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="gap-1.5"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* KPI Stat Tiles */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Inference Volume" value="148.2k" delta="+14.2%" progress={88} />
        <StatTile label="P99 Response Latency" value="118 ms" delta="-24ms" progress={22} />
        <StatTile label="Active Agent Fleet" value="42 Nodes" delta="+8 online" progress={92} />
        <StatTile label="Cluster SLA Health" value="99.98%" delta="Nominal" progress={99} />
      </div>

      {/* Main Grid: Telemetry + Model Routing */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Main Throughput Area Chart & Agent Fleet */}
        <div className="space-y-6 lg:col-span-2">
          {/* Real-time Telemetry Chart */}
          <GlassCard
            title="Throughput & Token Velocity"
            subtitle="Concurrent model generation volume (tokens/sec) vs cache hit ratio"
            icon={Activity}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
              <div className="flex items-center gap-6">
                <div>
                  <p className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Peak Load
                  </p>
                  <p className="text-base font-bold text-foreground">62,400 t/s</p>
                </div>
                <div>
                  <p className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Cache Hit Ratio
                  </p>
                  <p className="text-base font-bold text-emerald-500">96.4%</p>
                </div>
                <div>
                  <p className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Active Concurrency
                  </p>
                  <p className="text-base font-bold text-foreground">340 Streams</p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1 font-mono text-[10px]">
                <Radio className="h-2.5 w-2.5 animate-pulse text-emerald-500" />
                Live Stream
              </Badge>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={TELEMETRY_DATA}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="tokenFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="cacheFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 6,
                      fontSize: 12,
                      color: 'hsl(var(--popover-foreground))',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tokens"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2.4}
                    fill="url(#tokenFill)"
                    name="Tokens/sec"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Active AI Agent Pipeline Fleet */}
          <GlassCard
            title="Autonomous Agent Pipeline"
            subtitle="Real-time status of specialized background subagents and critique loops"
            icon={Layers}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border/50 bg-card/40 p-3 transition-colors hover:border-sidebar-accent/50 hover:bg-card/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold">Architect-01</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Analysis
                  </Badge>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Synthesizing codebase AST & symbol references.
                </p>
                <div className="mt-3">
                  <CapabilityBars
                    labelWidth={65}
                    items={[
                      { name: 'Reasoning', score: 9.4 },
                      { name: 'Synthesis', score: 9.1 },
                      { name: 'Code', score: 9.8 }
                    ]}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-card/40 p-3 transition-colors hover:border-sidebar-accent/50 hover:bg-card/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-primary" />
                    <span className="text-xs font-bold">Writer-03</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Drafting
                  </Badge>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Formatting inline passage proposals with audit diffs.
                </p>
                <div className="mt-3">
                  <CapabilityBars
                    labelWidth={65}
                    items={[
                      { name: 'Reasoning', score: 8.8 },
                      { name: 'Synthesis', score: 9.6 },
                      { name: 'Speed', score: 9.2 }
                    ]}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-card/40 p-3 transition-colors hover:border-sidebar-accent/50 hover:bg-card/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-sky-500" />
                    <span className="text-xs font-bold">Verifier-02</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Testing
                  </Badge>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Checking type invariants and vitest assertions.
                </p>
                <div className="mt-3">
                  <CapabilityBars
                    labelWidth={65}
                    items={[
                      { name: 'Invariants', score: 9.9 },
                      { name: 'Coverage', score: 9.4 },
                      { name: 'Speed', score: 9.5 }
                    ]}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right 1 Col: Model Routing with Native SVGL + Framework Controls */}
        <div className="space-y-6">
          {/* Model Inference Allocation (Native SVGL) */}
          <GlassCard
            title="Model Mesh & Routing"
            subtitle="Distributed inference allocation via SVGL native assets"
            icon={Cpu}
          >
            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <SvglIcon name="anthropic" size={16} className="h-4 w-4" />
                    <span className="font-semibold">Claude 3.7 Sonnet</span>
                  </div>
                  <span className="mono text-muted-foreground">48% · 118ms</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                  <div className="h-full bg-primary" style={{ width: '48%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <SvglIcon name="openai" size={16} className="h-4 w-4" />
                    <span className="font-semibold">GPT-4o Omnimodal</span>
                  </div>
                  <span className="mono text-muted-foreground">32% · 142ms</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                  <div className="h-full bg-sky-500" style={{ width: '32%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <SvglIcon name="python" size={16} className="h-4 w-4" />
                    <span className="font-semibold">Local DeepSeek-R1</span>
                  </div>
                  <span className="mono text-muted-foreground">20% · 64ms</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                  <div className="h-full bg-emerald-500" style={{ width: '20%' }} />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-md border border-border/40 bg-card/30 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Engine Shell</span>
                <div className="flex items-center gap-1.5">
                  <SvglIcon name="electron" size={14} className="h-3.5 w-3.5" />
                  <span className="mono text-xs font-semibold">Electron 44.1</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Real-time Audit Events */}
          <GlassCard
            title="Cluster Audit Stream"
            subtitle="Verified security policy and fuses"
            icon={ShieldCheck}
          >
            <div className="space-y-2.5">
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">ASAR Integrity & Fuses Locked</p>
                  <p className="mono text-[10px] text-muted-foreground">
                    12:28:14 • zero tampering
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">Dynamic Compact Tabs Active</p>
                  <p className="mono text-[10px] text-muted-foreground">
                    12:27:02 • ResizeObserver live
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">Encrypted SafeStorage Synced</p>
                  <p className="mono text-[10px] text-muted-foreground">
                    12:25:40 • DPAPI verified
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Quick Shell Rails Controls */}
          <GlassCard
            title="Frame & Shell Controls"
            subtitle="Toggle layout rails directly"
            icon={Settings}
          >
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLeft}
                className="justify-start gap-1.5 text-xs"
              >
                <PanelLeft className="h-3.5 w-3.5" />
                <span>{leftCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleRight}
                className="justify-start gap-1.5 text-xs"
              >
                <PanelRight className="h-3.5 w-3.5" />
                <span>{rightOpen ? 'Hide Dock' : 'Show Dock'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTabs}
                className="justify-start gap-1.5 text-xs"
              >
                <PanelTop className="h-3.5 w-3.5" />
                <span>{tabsCollapsed ? 'Expand Top' : 'Collapse Top'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleBottom}
                className="justify-start gap-1.5 text-xs"
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>{bottomOpen ? 'Close Tray' : 'Open Tray'}</span>
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
