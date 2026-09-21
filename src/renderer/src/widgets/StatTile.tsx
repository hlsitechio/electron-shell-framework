import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { GlassCard } from './GlassCard'

export interface StatTileProps {
  label?: string
  value?: string
  /** delta text, e.g. "+12.4%" — sign drives the arrow + tone */
  delta?: string
  /** 0..100 — renders a thin progress rail under the value */
  progress?: number
  className?: string
}

/** Stat tile — number instead of a sentence, mono, tiny uppercase label. */
export function StatTile({
  label = 'Active agents',
  value = '1,248',
  delta = '+12.4%',
  progress = 68,
  className
}: StatTileProps) {
  const up = delta.trim().startsWith('+')
  const down = delta.trim().startsWith('-')
  const DeltaIcon = up ? ArrowUpRight : down ? ArrowDownRight : Minus
  const tone = up
    ? 'hsl(var(--success))'
    : down
      ? 'hsl(var(--destructive))'
      : 'hsl(var(--muted-foreground))'

  return (
    <GlassCard className={cn('min-w-0', className)}>
      <p className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="stat-number mono text-2xl font-semibold leading-none">{value}</span>
        <span className="mono flex items-center gap-0.5 text-[11px]" style={{ color: tone }}>
          <DeltaIcon className="h-3 w-3" />
          {delta}
        </span>
      </div>
      {typeof progress === 'number' && (
        <div className="cap-track mt-3">
          <div className="cap-fill" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
      )}
    </GlassCard>
  )
}
