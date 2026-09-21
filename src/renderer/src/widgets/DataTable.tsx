import { cn } from '@renderer/lib/utils'

export interface TableColumn {
  key: string
  label: string
  /** right-align + mono (numbers) */
  numeric?: boolean
  /** render a status dot using this row field */
  statusKey?: string
}

export interface TableRow {
  [key: string]: string | number
}

export interface DataTableProps {
  columns?: TableColumn[]
  rows?: TableRow[]
  /** highlight the first row (selected state) */
  className?: string
}

const DEFAULT_COLUMNS: TableColumn[] = [
  { key: 'name', label: 'Name' },
  { key: 'value', label: 'Value', numeric: true },
  { key: 'change', label: 'Change', numeric: true },
  { key: 'state', label: 'State', statusKey: 'state' }
]

const DEFAULT_ROWS: TableRow[] = [
  { name: 'Core index', value: '412.88', change: '+1.24%', state: 'up' },
  { name: 'Growth fund', value: '188.02', change: '-0.42%', state: 'down' },
  { name: 'Bond sleeve', value: '96.41', change: '+0.08%', state: 'flat' },
  { name: 'Cash', value: '24.10', change: '0.00%', state: 'flat' }
]

const TONE: Record<string, string> = {
  up: 'hsl(var(--success))',
  down: 'hsl(var(--destructive))',
  flat: 'hsl(var(--muted-foreground))',
  warn: 'hsl(var(--warning))'
}

/** Compact data table — mono numerics, hairline rows, status dots. */
export function DataTable({
  columns = DEFAULT_COLUMNS,
  rows = DEFAULT_ROWS,
  className
}: DataTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  'mono px-2 py-1.5 text-[10px] font-normal uppercase tracking-[0.12em] text-muted-foreground',
                  c.numeric ? 'text-right' : 'text-left'
                )}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="transition-colors hover:bg-accent/50"
              style={{ borderBottom: '1px solid hsl(var(--border) / 0.6)' }}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    'px-2 py-1.5',
                    c.numeric ? 'mono text-right tabular-nums' : 'text-left',
                    c.key === columns[0].key && 'font-medium'
                  )}
                >
                  {c.statusKey ? (
                    <span className="flex items-center justify-end gap-1.5">
                      <span
                        className="dot"
                        style={{
                          background: TONE[String(r[c.statusKey])] ?? 'hsl(var(--muted-foreground))'
                        }}
                      />
                      <span className="mono text-[11px] text-muted-foreground">{r[c.key]}</span>
                    </span>
                  ) : (
                    r[c.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
