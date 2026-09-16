import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

/** Demo data — replace with your own metrics. */
const data = [
  { week: 'W1', usage: 18, active: 12 },
  { week: 'W2', usage: 26, active: 17 },
  { week: 'W3', usage: 22, active: 15 },
  { week: 'W4', usage: 41, active: 28 },
  { week: 'W5', usage: 38, active: 31 },
  { week: 'W6', usage: 52, active: 44 }
]

/**
 * Recharts demo block — wired to the theme tokens so it follows
 * dark/light automatically. Copy this file and point it at real data.
 */
export function ExampleChart() {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 8,
              fontSize: 12
            }}
          />
          <Area
            type="monotone"
            dataKey="usage"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            fill="url(#usageFill)"
          />
          <Area
            type="monotone"
            dataKey="active"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            fillOpacity={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
