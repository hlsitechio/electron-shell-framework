import { Check } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { PRESETS } from '@renderer/lib/presets'
import { useTheme } from '@renderer/components/theme/ThemeProvider'

interface PresetPreviewProps {
  preset: string
  /** which mode the miniature renders in — dark previews are the loudest signal */
  mode?: 'dark' | 'light'
  className?: string
}

/**
 * A miniature of the shell rendered with THIS preset's real tokens.
 *
 * The trick: `data-theme` + `data-preset` are set on a plain <div>, not on
 * <html>. Because presets.css keys off those attributes, every token
 * (background, card, primary, border, …) resolves locally inside this
 * subtree. No duplicated color values, no hardcoded swatches — if a preset
 * ramp changes, every preview updates automatically.
 */
export function PresetPreview({ preset, mode = 'dark', className }: PresetPreviewProps) {
  return (
    <div
      data-theme={mode}
      data-preset={preset}
      className={cn('overflow-hidden rounded-md border', className)}
      style={{
        background: 'hsl(var(--background))',
        borderColor: 'hsl(var(--border))'
      }}
      aria-hidden="true"
    >
      {/* top bar: tabs + fake window controls */}
      <div
        className="flex h-3 items-center gap-1 px-1"
        style={{
          background: 'hsl(var(--topbar-bg))',
          borderBottom: '1px solid hsl(var(--border))'
        }}
      >
        <span className="h-1 w-4 rounded-sm" style={{ background: 'hsl(var(--tab-active-bg))' }} />
        <span className="h-1 w-3 rounded-sm" style={{ background: 'hsl(var(--muted))' }} />
        <span className="flex-1" />
        <span
          className="h-1 w-1 rounded-full"
          style={{ background: 'hsl(var(--muted-foreground) / 0.6)' }}
        />
        <span
          className="h-1 w-1 rounded-full"
          style={{ background: 'hsl(var(--muted-foreground) / 0.6)' }}
        />
      </div>

      <div className="flex">
        {/* sidebar */}
        <div
          className="hidden w-4 flex-col gap-1 p-1 sm:flex"
          style={{ background: 'hsl(var(--sidebar-bg))' }}
        >
          <span
            className="h-1 w-full rounded-sm"
            style={{ background: 'hsl(var(--sidebar-accent))' }}
          />
          <span
            className="h-1 w-2/3 rounded-sm"
            style={{ background: 'hsl(var(--sidebar-muted) / 0.5)' }}
          />
          <span
            className="h-1 w-2/3 rounded-sm"
            style={{ background: 'hsl(var(--sidebar-muted) / 0.5)' }}
          />
        </div>

        {/* content */}
        <div className="flex-1 space-y-1 p-1.5">
          <div
            className="flex h-6 items-center gap-1 rounded-sm px-1.5"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--card-border))' }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'hsl(var(--primary))' }}
            />
            <span
              className="h-1 flex-1 rounded-sm"
              style={{ background: 'hsl(var(--muted-foreground) / 0.45)' }}
            />
          </div>
          <div className="flex gap-1">
            <span className="h-4 flex-1 rounded-sm" style={{ background: 'hsl(var(--card))' }} />
            <span className="h-4 flex-1 rounded-sm" style={{ background: 'hsl(var(--card))' }} />
            <span
              className="h-4 flex-1 rounded-sm"
              style={{ background: 'hsl(var(--primary) / 0.85)' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface PresetSwitcherProps {
  /** show name + tagline under each swatch */
  showLabels?: boolean
  className?: string
}

/**
 * Compact preset rail — used in Settings → Appearance and in the Theme page
 * header. Clicking a swatch applies the preset instantly (persisted).
 */
export function PresetSwitcher({ showLabels = false, className }: PresetSwitcherProps) {
  const { preset, setPreset } = useTheme()

  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5', className)}>
      {PRESETS.map((p) => {
        const active = p.id === preset
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            aria-pressed={active}
            aria-label={`Use the ${p.name} theme`}
            className={cn(
              'group rounded-lg p-2 text-left transition-colors',
              active ? 'bg-accent' : 'hover:bg-accent/60'
            )}
            style={{ border: `1px solid ${active ? 'hsl(var(--primary))' : 'hsl(var(--border))'}` }}
          >
            <PresetPreview preset={p.id} className="h-14 w-full" />
            <div className="mt-2 flex items-start gap-1.5">
              {active && (
                <Check
                  className="mt-0.5 h-3 w-3 shrink-0"
                  style={{ color: 'hsl(var(--primary))' }}
                />
              )}
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{p.name}</p>
                {showLabels && (
                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                    {p.tagline}
                  </p>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
