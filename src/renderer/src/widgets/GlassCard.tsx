import type { ComponentType, ReactNode } from 'react'
import { cn } from '@renderer/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  /** optional header row: icon + title + a right-side slot */
  icon?: ComponentType<{ className?: string }>
  title?: string
  subtitle?: string
  action?: ReactNode
  /** removes the glass treatment (plain card) when false */
  glass?: boolean
}

/**
 * The kit's panel primitive — layered glass: translucent surface, blur,
 * top gloss sweep, inset highlight and a hairline border.
 * A flat fill is never used; see styles/widgets.css.
 */
export function GlassCard({
  children,
  className,
  icon: Icon,
  title,
  subtitle,
  action,
  glass = true
}: GlassCardProps) {
  return (
    <div
      className={cn('p-4', glass ? 'glass' : 'rounded-lg border bg-card', className)}
      style={
        glass
          ? undefined
          : { borderColor: 'hsl(var(--card-border))', background: 'hsl(var(--card))' }
      }
    >
      {(title || Icon || action) && (
        <div className="mb-3 flex items-start gap-2">
          {Icon && (
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
              style={{ background: 'hsl(var(--primary) / 0.16)', color: 'hsl(var(--primary))' }}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            {title && <h3 className="truncate text-sm font-semibold">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
