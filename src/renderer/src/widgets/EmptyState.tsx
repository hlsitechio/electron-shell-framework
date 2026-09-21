import { Inbox } from 'lucide-react'
import type { ComponentType } from 'react'
import { cn } from '@renderer/lib/utils'

export interface EmptyStateProps {
  title?: string
  hint?: string
  icon?: ComponentType<{ className?: string }>
  action?: React.ReactNode
  className?: string
}

/** Designed empty state — hatched placeholder, never a blank box. */
export function EmptyState({
  title = 'Nothing here yet',
  hint = 'Connect a source to populate this panel.',
  icon: Icon = Inbox,
  action,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'hatched flex flex-col items-center justify-center gap-2 rounded-lg p-8 text-center',
        className
      )}
      style={{ border: '1px dashed hsl(var(--border))' }}
    >
      <Icon className="h-5 w-5 text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-[36ch] text-xs text-muted-foreground">{hint}</p>
      {action}
    </div>
  )
}
