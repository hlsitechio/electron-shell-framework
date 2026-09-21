import { Badge } from '@renderer/components/ui/badge'
import { cn } from '@renderer/lib/utils'

export interface AgentCardData {
  name?: string
  /** catalogue number, rendered as #001 */
  number?: string
  /** ≤8 words */
  description?: string
  chips?: string[]
  status?: 'live' | 'soon' | 'offline'
  /** data: URL or file path. Falls back to initials — never an empty box. */
  image?: string
}

export interface AgentCardProps {
  data?: AgentCardData
  className?: string
}

const DEFAULT: Required<Pick<AgentCardData, 'name' | 'number' | 'description'>> & AgentCardData = {
  name: 'Bob',
  number: '001',
  description: 'Friendly generalist for everyday tasks',
  chips: ['research', 'writing', 'ops'],
  status: 'live'
}

const STATUS_TONE: Record<string, string> = {
  live: 'hsl(var(--success))',
  soon: 'hsl(var(--warning))',
  offline: 'hsl(var(--muted-foreground))'
}

/**
 * Agent card — photo/initials header, catalogue number, ≤8-word description,
 * capability chips and a status pill. Photo area is 16:9 cover.
 */
export function AgentCard({ data, className }: AgentCardProps) {
  const d = { ...DEFAULT, ...data }
  const initials = (d.name ?? 'A').slice(0, 1).toUpperCase()

  return (
    <div className={cn('glass overflow-hidden p-0', className)}>
      <div className="relative aspect-video w-full overflow-hidden">
        {d.image ? (
          <img src={d.image} alt={d.name} className="h-full w-full object-cover" />
        ) : (
          <div className="hatched flex h-full w-full items-center justify-center">
            <span className="mono text-2xl font-semibold text-muted-foreground">{initials}</span>
          </div>
        )}
        <div className="absolute right-2 top-2 flex items-center gap-1.5 rounded-full bg-black/45 px-2 py-0.5 backdrop-blur-sm">
          <span className="dot" style={{ background: STATUS_TONE[d.status ?? 'live'] }} />
          <span className="mono text-[10px] uppercase tracking-wider text-white/85">
            {d.status ?? 'live'}
          </span>
        </div>
      </div>

      <div className="p-3.5">
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-sm font-semibold">{d.name}</h3>
          <span className="mono text-[11px] text-muted-foreground">#{d.number}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.description}</p>
        {!!d.chips?.length && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {d.chips.map((c) => (
              <Badge key={c} variant="secondary" className="mono text-[10px] font-normal">
                {c}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
