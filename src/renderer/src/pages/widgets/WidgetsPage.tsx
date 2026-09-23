import { Filter, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import {
  AgentCard,
  CapabilityBars,
  ChartWidget,
  ChatWidget,
  EmptyState,
  FilterChips,
  GlassCard,
  Pipeline,
  StatTile,
  TerminalWidget
} from '@renderer/widgets'
import { useTheme } from '@renderer/components/theme/ThemeProvider'
import { SvglIcon } from '@renderer/components/ui/SvglIcon'
import { BUNDLED_SVGL_NAMES } from '@renderer/lib/svgl'

/**
 * Widgets page — every component in the kit, rendered with its demo props
 * so you can see the full vocabulary in one screen at the current preset.
 */
export function WidgetsPage() {
  const [chip, setChip] = useState('all')
  const { presetMeta } = useTheme()

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Widgets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The building blocks, all reading the <strong>{presetMeta.name}</strong> tokens. Copy a
          file from{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-[11px]">src/renderer/src/widgets</code>{' '}
          and point it at real data.
        </p>
      </div>

      {/* Stats row */}
      <section className="space-y-2">
        <h2 className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Stat tiles
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile />
          <StatTile label="Memories stored" value="84,209" delta="+3.1%" progress={42} />
          <StatTile label="Avg latency" value="412ms" delta="-8.7%" progress={22} />
          <StatTile label="Error rate" value="0.02%" delta="0.0%" progress={3} />
        </div>
      </section>

      {/* Chart + capability */}
      <section className="grid gap-3 lg:grid-cols-3">
        <GlassCard
          className="lg:col-span-2"
          title="Throughput"
          subtitle="Last 6 periods"
          icon={LayoutDashboard}
        >
          <ChartWidget height={190} />
        </GlassCard>
        <GlassCard title="Model profile" subtitle="Self-reported capability">
          <CapabilityBars />
        </GlassCard>
      </section>

      {/* Chat + terminal */}
      <section className="grid gap-3 lg:grid-cols-2">
        <ChatWidget className="h-72" />
        <div className="space-y-3">
          <TerminalWidget />
          <GlassCard title="Pipeline" subtitle="Four-step flow with arrow connectors">
            <Pipeline />
          </GlassCard>
        </div>
      </section>

      {/* Cards row */}
      <section className="space-y-2">
        <h2 className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Agent cards
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AgentCard />
          <AgentCard
            data={{
              name: 'Rex',
              number: '002',
              description: 'Reviews pull requests before you merge',
              chips: ['code review', 'CI'],
              status: 'soon'
            }}
          />
          <AgentCard
            data={{
              name: 'Nova',
              number: '003',
              description: 'Maps a market in an afternoon',
              chips: ['research', 'reports'],
              status: 'live'
            }}
          />
        </div>
      </section>

      {/* Chips + empty */}
      <section className="grid gap-3 lg:grid-cols-2">
        <GlassCard
          title="Filter chips"
          subtitle="Active state uses the accent gradient"
          icon={Filter}
        >
          <FilterChips value={chip} onChange={setChip} />
          <p className="mono mt-3 text-[11px] text-muted-foreground">active: {chip}</p>
        </GlassCard>
        <GlassCard title="Empty state" subtitle="Designed, never a blank box">
          <EmptyState />
        </GlassCard>
      </section>

      {/* Native SVGL icons */}
      <section className="space-y-2">
        <h2 className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Native SVGL (svgl.app) Icons
        </h2>
        <GlassCard
          title="SVGL Tech & Brand Kit"
          subtitle="Direct native integration from svgl.app with offline pre-bundled assets and light/dark theme variants"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {BUNDLED_SVGL_NAMES.map((name) => (
              <div
                key={name}
                className="flex items-center gap-2.5 rounded-md border border-border/40 bg-card/40 p-2.5 transition-colors hover:border-sidebar-accent/50 hover:bg-card/70"
              >
                <SvglIcon name={name} size={20} className="h-5 w-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold capitalize">{name}</p>
                  <p className="mono text-[10px] text-muted-foreground">svgl('{name}')</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </div>
  )
}
