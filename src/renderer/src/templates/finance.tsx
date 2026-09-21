import { LineChart, PieChart, Receipt, Wallet } from 'lucide-react'
import { GlassCard, StatTile, ChartWidget, DataTable, CapabilityBars } from '@renderer/widgets'
import type { AppTemplate } from './types'

/**
 * FINANCE — 21 shipped Electron apps
 * (Kattana, Invizi, Buckets, Stockifier, elcalc, Forestpin Analytics)
 *
 * The honest caveat: much of this category is crypto/trading shaped. This
 * template ships the general shape — accounts, positions, budget — because
 * that is what a client actually asks for. Numbers are always mono + right
 * aligned, and never rounded in the UI without a reason.
 */

function Portfolio() {
  return (
    <div className="space-y-4 p-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Net worth" value="$1.42M" delta="+2.4%" progress={74} />
        <StatTile label="Cash" value="$24.1K" delta="+0.1%" progress={30} />
        <StatTile label="Invested" value="$1.31M" delta="+2.6%" progress={68} />
        <StatTile label="Debt" value="$0" delta="0.0%" progress={0} />
      </div>
      <GlassCard title="Positions" subtitle="By weight">
        <DataTable
          columns={[
            { key: 'name', label: 'Holding' },
            { key: 'weight', label: 'Weight', numeric: true },
            { key: 'value', label: 'Value', numeric: true },
            { key: 'state', label: 'Trend', statusKey: 'state' }
          ]}
          rows={[
            { name: 'Core index', weight: '42%', value: '$596K', state: 'up' },
            { name: 'Growth fund', weight: '28%', value: '$367K', state: 'flat' },
            { name: 'Bond sleeve', weight: '22%', value: '$288K', state: 'down' },
            { name: 'Cash', weight: '8%', value: '$24.1K', state: 'flat' }
          ]}
        />
      </GlassCard>
    </div>
  )
}

function Budget() {
  return (
    <div className="space-y-4 p-6">
      <GlassCard title="Spend by category" subtitle="This month" icon={PieChart}>
        <CapabilityBars
          items={[
            { name: 'Housing', score: 9 },
            { name: 'Food', score: 6 },
            { name: 'Transport', score: 4 },
            { name: 'Discretionary', score: 7 }
          ]}
        />
      </GlassCard>
      <GlassCard title="Recent" subtitle="Last 5 transactions" icon={Receipt}>
        <DataTable
          columns={[
            { key: 'what', label: 'Merchant' },
            { key: 'cat', label: 'Category' },
            { key: 'value', label: 'Amount', numeric: true }
          ]}
          rows={[
            { what: 'Hydro-Québec', cat: 'Housing', value: '-$142.08' },
            { what: 'Metro', cat: 'Food', value: '-$88.41' },
            { what: 'STL', cat: 'Transport', value: '-$94.50' },
            { what: 'Payroll', cat: 'Income', value: '+$4,120.00' }
          ]}
        />
      </GlassCard>
    </div>
  )
}

function Performance() {
  return (
    <div className="space-y-4 p-6">
      <GlassCard title="Performance" subtitle="Trailing 12 periods" icon={LineChart}>
        <ChartWidget height={280} />
      </GlassCard>
      <GlassCard title="Note" subtitle="What this template deliberately is not">
        <p className="text-xs leading-relaxed text-muted-foreground">
          No live price feed and no brokerage integration ship with the template — those are the
          parts that make a finance app legally and operationally heavy. The layout is the
          deliverable; the data source is yours.
        </p>
      </GlassCard>
    </div>
  )
}

export const financeTemplate: AppTemplate = {
  id: 'finance',
  name: 'Finance',
  tagline: 'Accounts, positions and budget.',
  description:
    'Twenty-one shipped finance apps, but be honest about the shape: most are crypto/trading. This template ships the general client ask — net worth, positions, budget, recent transactions — with mono right-aligned numerics and no live feed baked in.',
  icon: Wallet,
  home: 'portfolio',
  preset: 'dark-indigo',
  layout: { leftWidth: 220, rightOpen: false, tabsCollapsed: false, bottomOpen: false },
  pages: [
    {
      id: 'portfolio',
      label: 'Portfolio',
      description: 'Positions',
      icon: Wallet,
      component: Portfolio
    },
    {
      id: 'budget',
      label: 'Budget',
      description: 'Spend + transactions',
      icon: Receipt,
      component: Budget
    },
    {
      id: 'performance',
      label: 'Performance',
      description: 'Trailing returns',
      icon: LineChart,
      component: Performance
    }
  ],
  dataShape:
    'accounts: [{ id, name, kind }], positions: [{ symbol, weight, value, trend }], transactions: [{ id, merchant, category, amount, at }]',
  extendWith: [
    'CSV import (bank export)',
    'local sqlite ledger',
    'recurring transaction detection',
    'multi-currency'
  ]
}
