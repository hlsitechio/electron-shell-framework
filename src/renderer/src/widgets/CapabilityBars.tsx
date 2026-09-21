import type { ComponentType } from 'react'
import { cn } from '@renderer/lib/utils'

export interface Capability {
  name: string
  /** 0..10 */
  score: number
  icon?: ComponentType<{ className?: string; style?: React.CSSProperties }>
}

export interface CapabilityBarsProps {
  items?: Capability[]
  /** label column width */
  labelWidth?: number
  className?: string
}

const DEFAULT: Capability[] = [
  { name: 'Reasoning', score: 9 },
  { name: 'Tool use', score: 8 },
  { name: 'Retrieval', score: 7 },
  { name: 'Vision', score: 6 }
]

/**
 * Capability bars — 44px icon slot, name, gradient track, x/10 score in mono.
 */
export function CapabilityBars({
  items = DEFAULT,
  labelWidth = 130,
  className
}: CapabilityBarsProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {items.map((c) => {
        const Icon = c.icon
        const pct = Math.max(0, Math.min(10, c.score)) * 10
        return (
          <div key={c.name} className="flex items-center gap-3">
            {Icon && (
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                style={{ background: 'hsl(var(--primary) / 0.14)', color: 'hsl(var(--primary))' }}
              >
                <Icon className="h-3 w-3" />
              </span>
            )}
            <span
              className="shrink-0 truncate text-xs text-muted-foreground"
              style={{ width: labelWidth }}
            >
              {c.name}
            </span>
            <span className="cap-track flex-1">
              <span className="cap-fill" style={{ width: `${pct}%` }} />
            </span>
            <span className="mono shrink-0 text-[11px] text-muted-foreground">{c.score}/10</span>
          </div>
        )
      })}
    </div>
  )
}
