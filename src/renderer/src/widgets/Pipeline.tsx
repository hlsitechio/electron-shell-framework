import { ChevronRight } from 'lucide-react'
import type { ComponentType } from 'react'
import { cn } from '@renderer/lib/utils'

export interface PipelineStep {
  label: string
  detail?: string
  icon?: ComponentType<{ className?: string }>
}

export interface PipelineProps {
  steps?: PipelineStep[]
  className?: string
}

const DEFAULT: PipelineStep[] = [
  { label: 'Ingest', detail: 'sources' },
  { label: 'Embed', detail: 'vectors' },
  { label: 'Retrieve', detail: 'top-k' },
  { label: 'Answer', detail: 'cited' }
]

/** 4 glass steps + STEP n + arrows. Wraps on narrow widths. */
export function Pipeline({ steps = DEFAULT, className }: PipelineProps) {
  return (
    <div className={cn('flex flex-wrap items-stretch gap-2', className)}>
      {steps.map((s, i) => {
        const Icon = s.icon
        return (
          <div key={`${s.label}-${i}`} className="flex items-center gap-2">
            <div className="glass min-w-[92px] px-3 py-2">
              <div className="flex items-center gap-1.5">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span className="mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                  step {i + 1}
                </span>
              </div>
              <p className="mt-1 text-xs font-medium">{s.label}</p>
              {s.detail && <p className="mono text-[10px] text-muted-foreground">{s.detail}</p>}
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            )}
          </div>
        )
      })}
    </div>
  )
}
