import { cn } from '@renderer/lib/utils'

export interface TerminalLine {
  /** mono key shown before the value */
  key?: string
  value: string
  tone?: 'default' | 'muted' | 'accent' | 'success' | 'warn'
}

export interface TerminalWidgetProps {
  title?: string
  lines?: TerminalLine[]
  className?: string
}

const DEFAULT: TerminalLine[] = [
  { key: 'model', value: 'claude-sonnet-4.5', tone: 'accent' },
  { key: 'tools', value: '12 connected' },
  { key: 'workspace', value: 'org_2f8…a91', tone: 'muted' },
  { key: 'status', value: 'ready', tone: 'success' }
]

const TONE: Record<string, string> = {
  default: 'hsl(var(--foreground))',
  muted: 'hsl(var(--muted-foreground))',
  accent: 'hsl(var(--primary))',
  success: 'hsl(var(--success))',
  warn: 'hsl(var(--warning))'
}

/** Terminal-style panel — dark glass, traffic dots, mono, accent keys. */
export function TerminalWidget({
  title = 'session',
  lines = DEFAULT,
  className
}: TerminalWidgetProps) {
  return (
    <div className={cn('term', className)}>
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: '1px solid hsl(var(--border))' }}
      >
        <span className="flex gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: 'hsl(var(--destructive) / 0.75)' }}
          />
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: 'hsl(var(--warning) / 0.75)' }}
          />
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: 'hsl(var(--success) / 0.75)' }}
          />
        </span>
        <span className="mono ml-1 text-[11px] text-muted-foreground">{title}</span>
      </div>
      <div className="mono space-y-1 p-3 text-[11.5px] leading-relaxed">
        {lines.map((l, i) => (
          <div key={`${l.value}-${i}`} className="flex gap-2">
            {l.key && <span className="term-key shrink-0">{l.key}</span>}
            <span className="shrink-0 text-muted-foreground/60">·</span>
            <span className="min-w-0 break-all" style={{ color: TONE[l.tone ?? 'default'] }}>
              {l.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
