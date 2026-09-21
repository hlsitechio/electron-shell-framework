import { cn } from '@renderer/lib/utils'

export interface FilterChipsProps {
  options?: string[]
  value?: string
  onChange?: (value: string) => void
  className?: string
}

const DEFAULT = ['all', 'agents', 'docs', 'events', 'logs']

/** Pill filter chips — active state uses the accent gradient. */
export function FilterChips({
  options = DEFAULT,
  value = 'all',
  onChange,
  className
}: FilterChipsProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange?.(o)}
          aria-pressed={o === value}
          className={cn('chip', o === value && 'chip--active')}
        >
          {o}
        </button>
      ))}
    </div>
  )
}
