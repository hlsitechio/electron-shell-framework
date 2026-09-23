import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { GlassCard } from './GlassCard'

export interface StatTileProps {
  label?: string
  value?: string
  /** delta text, e.g. "+12.4%" or descriptive subtitle */
  delta?: string
  /** 0..100 — renders a thin progress rail under the value */
  progress?: number
  icon?: LucideIcon
  className?: string
}

/** Stat tile — clean metric card with balanced typography and smart badges */
export function StatTile({
  label = 'Active agents',
  value = '1,248',
  delta = '+12.4%',
  progress,
  icon: Icon,
  className
}: StatTileProps) {
  const isUp = delta ? delta.trim().startsWith('+') : false
  const isDown = delta ? delta.trim().startsWith('-') : false

  return (
    <GlassCard className={cn('min-w-0 transition-all hover:border-primary/30', className)}>
      <div className="flex items-center justify-between gap-1">
        <p className="text-[11px] font-medium text-muted-foreground tracking-tight">{label}</p>
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />}
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-2 flex-wrap">
        <span className="stat-number text-2xl font-bold leading-none tracking-tight">{value}</span>
        {delta && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10.5px] font-medium',
              isUp && 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
              isDown && 'bg-rose-500/10 text-rose-500 dark:text-rose-400',
              !isUp && !isDown && 'bg-muted/60 text-muted-foreground'
            )}
          >
            {isUp && <ArrowUpRight className="h-3 w-3" />}
            {isDown && <ArrowDownRight className="h-3 w-3" />}
            <span>{delta}</span>
          </span>
        )}
      </div>
      {typeof progress === 'number' && progress > 0 && (
        <div className="cap-track mt-3 bg-muted/40 h-1 rounded-full overflow-hidden">
          <div
            className="cap-fill h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}
    </GlassCard>
  )
}
