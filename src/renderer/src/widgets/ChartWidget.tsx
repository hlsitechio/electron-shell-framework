import { useId } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { cn } from '@renderer/lib/utils'

export interface ChartWidgetProps {
  /** rows: [{ label, a, b }] — `a` is the filled series, `b` the line */
  data?: Array<Record<string, string | number>>
  xKey?: string
  series?: [string, string]
  height?: number
  className?: string
}

const DEFAULT_DATA = [
  { label: 'Mon', a: 18, b: 12 },
  { label: 'Tue', a: 26, b: 17 },
  { label: 'Wed', a: 22, b: 15 },
  { label: 'Thu', a: 41, b: 28 },
  { label: 'Fri', a: 38, b: 31 },
  { label: 'Sat', a: 52, b: 44 }
]

/**
 * Themed area chart. Reads --chart-1/--chart-2 so it re-skins with the
 * active preset automatically. The gradient id comes from useId() so
 * several charts on one page never collide in SVG <defs>.
 */
export function ChartWidget({
  data = DEFAULT_DATA,
  xKey = 'label',
  series = ['a', 'b'],
  height = 200,
  className
}: ChartWidgetProps) {
  const gid = `chart-grad-${useId().replace(/[:\u00ab\u00bb]/g, '')}`
  const [s1, s2] = series

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.38} />
              <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
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
              fontSize: 12,
              color: 'hsl(var(--popover-foreground))'
            }}
          />
          <Area
            type="monotone"
            dataKey={s1}
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            fill={`url(#${gid})`}
          />
          <Area
            type="monotone"
            dataKey={s2}
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            fillOpacity={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
