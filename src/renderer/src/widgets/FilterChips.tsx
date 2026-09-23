import { cn } from '@renderer/lib/utils'

export type FilterOption = string | { id?: string; value?: string; label?: string; count?: number }

export interface FilterChipsProps {
  options?: FilterOption[]
  value?: string
  onChange?: (value: string) => void
  className?: string
}

const DEFAULT: FilterOption[] = ['all', 'agents', 'docs', 'events', 'logs']

/** Pill filter chips — modern segmented controls with optional counts. */
export function FilterChips({
  options = DEFAULT,
  value = 'all',
  onChange,
  className
}: FilterChipsProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {options.map((opt) => {
        const id = typeof opt === 'string' ? opt : (opt.id ?? opt.value ?? '')
        const label = typeof opt === 'string' ? opt : (opt.label ?? opt.id ?? opt.value ?? '')
        const count = typeof opt === 'string' ? undefined : opt.count
        const isActive = id === value

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange?.(id)}
            aria-pressed={isActive}
            className={cn('chip', isActive && 'chip--active')}
          >
            <span>{label}</span>
            {count !== undefined && (
              <span
                className={cn(
                  'rounded px-1 text-[9.5px] font-semibold tabular-nums',
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted-foreground/15 text-muted-foreground'
                )}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
