import { Activity, BarChart3, LayoutDashboard, Users } from 'lucide-react'
import { GlassCard, StatTile, ChartWidget, DataTable, CapabilityBars } from '@renderer/widgets'
import type { AppTemplate } from './types'

/**
 * ADMIN DASHBOARD — 45,544 GitHub repos under `dashboard` + `admin-dashboard`
 * (6,409). The highest tutorial demand of anything measured, and the most
 * common client request: "put our numbers on a screen".
 */

function Overview() {
  return (
    <div className="space-y-4 p-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Active users" value="12,408" delta="+8.2%" progress={72} />
        <StatTile label="Sessions" value="412K" delta="+14%" progress={82} />
        <StatTile label="Conversion" value="3.8%" delta="+0.3%" progress={38} />
        <StatTile label="Churn" value="1.2%" delta="-0.4%" progress={12} />
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <GlassCard
          className="lg:col-span-2"
          title="Traffic"
          subtitle="Last 6 periods"
          icon={BarChart3}
        >
          <ChartWidget height={230} />
        </GlassCard>
        <GlassCard title="Channel mix" subtitle="Where users come from">
          <CapabilityBars
            items={[
              { name: 'Organic', score: 8 },
              { name: 'Referral', score: 5 },
              { name: 'Paid', score: 3 },
              { name: 'Email', score: 2 }
            ]}
          />
        </GlassCard>
      </div>
    </div>
  )
}

function Records() {
  return (
    <div className="space-y-3 p-6">
      <GlassCard title="Recent activity" subtitle="Newest first" icon={Activity}>
        <DataTable
          columns={[
            { key: 'user', label: 'User' },
            { key: 'action', label: 'Action' },
            { key: 'value', label: 'Items', numeric: true },
            { key: 'state', label: 'Status', statusKey: 'state' }
          ]}
          rows={[
            { user: 'dana.k', action: 'Bulk import', value: '4,120', state: 'up' },
            { user: 'sam.t', action: 'Export CSV', value: '812', state: 'flat' },
            { user: 'bot.ops', action: 'Nightly sync', value: '12,904', state: 'up' },
            { user: 'h.larose', action: 'Schema change', value: '1', state: 'warn' }
          ]}
        />
      </GlassCard>
    </div>
  )
}

function People() {
  return (
    <div className="space-y-3 p-6">
      <GlassCard title="Team" subtitle="Seats and roles" icon={Users}>
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'role', label: 'Role' },
            { key: 'seats', label: 'Seats', numeric: true }
          ]}
          rows={[
            { name: 'Operations', role: 'admin', seats: '4' },
            { name: 'Engineering', role: 'member', seats: '18' },
            { name: 'Support', role: 'member', seats: '7' }
          ]}
        />
      </GlassCard>
    </div>
  )
}

export const dashboardTemplate: AppTemplate = {
  id: 'dashboard',
  name: 'Admin Dashboard',
  tagline: 'KPIs, charts and record tables.',
  description:
    'The most-requested client build and the highest-demand tutorial topic (45K+ repos). KPI tiles over a chart, a record table, and a team/roles page. Numbers are mono and right-aligned; every tile is a widget prop away from real data.',
  icon: LayoutDashboard,
  home: 'overview',
  preset: 'muted-violet',
  layout: { leftWidth: 220, rightOpen: false, tabsCollapsed: false, bottomOpen: false },
  pages: [
    {
      id: 'overview',
      label: 'Overview',
      description: 'KPIs + traffic',
      icon: LayoutDashboard,
      component: Overview
    },
    {
      id: 'records',
      label: 'Records',
      description: 'Activity table',
      icon: Activity,
      component: Records
    },
    { id: 'people', label: 'People', description: 'Seats + roles', icon: Users, component: People }
  ],
  dataShape:
    'metrics: { users, sessions, conversion, churn }, series: [{ label, a, b }], records: [{ user, action, value, state }]',
  extendWith: ['HTTP fetch over IPC', 'date-range picker', 'CSV export', 'scheduled digest email']
}
