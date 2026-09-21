import { useMemo, useSyncExternalStore } from 'react'
import { Palette, Sparkles } from 'lucide-react'
import { GlassCard } from '@renderer/widgets'
import { PresetSwitcher } from '@renderer/components/theme/PresetSwitcher'
import { useTheme } from '@renderer/components/theme/ThemeProvider'

/** Tokens surfaced in the inspector — the ones a designer actually tunes. */
const INSPECT = [
  '--background',
  '--card',
  '--primary',
  '--accent',
  '--border',
  '--muted-foreground',
  '--sidebar-bg',
  '--topbar-bg',
  '--success',
  '--chart-1'
]

/**
 * The token list is read from the DOM (getComputedStyle) because that is the
 * only honest source — the CSS cascade already resolved preset + mode.
 * `useSyncExternalStore` subscribes to attribute changes on <html>, so the
 * read happens as a normal render pass instead of a setState-in-effect.
 */
function subscribeToThemeAttrs(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-preset', 'data-theme']
  })
  return () => observer.disconnect()
}

function snapshotThemeKey(): string {
  const el = document.documentElement
  return `${el.getAttribute('data-preset') ?? ''}|${el.getAttribute('data-theme') ?? ''}`
}

function TokenInspector() {
  const { preset, theme } = useTheme()
  const themeKey = useSyncExternalStore(subscribeToThemeAttrs, snapshotThemeKey)

  const tokens = useMemo(() => {
    // themeKey is the dependency that guarantees a fresh read per preset/mode
    void themeKey
    const cs = getComputedStyle(document.documentElement)
    return INSPECT.map((name) => ({
      name,
      value: cs.getPropertyValue(name).trim(),
      color: `hsl(${cs.getPropertyValue(name).trim()})`
    }))
  }, [themeKey])

  return (
    <GlassCard
      title="Live tokens"
      subtitle={`Resolved from data-preset="${preset}" · data-theme="${theme}"`}
      icon={Palette}
    >
      <div className="grid gap-1.5 sm:grid-cols-2">
        {tokens.map((t) => (
          <div
            key={t.name}
            className="flex items-center gap-2 rounded-md px-2 py-1.5"
            style={{ background: 'hsl(var(--muted) / 0.5)' }}
          >
            <span
              className="h-4 w-4 shrink-0 rounded"
              style={{ background: t.color, border: '1px solid hsl(var(--border))' }}
            />
            <span className="mono min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
              {t.name}
            </span>
            <span className="mono shrink-0 text-[10px] text-muted-foreground/70">{t.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        These are the live computed values — the same variables the widgets below read. Change the
        preset and they all move together.
      </p>
    </GlassCard>
  )
}

/**
 * Themes page — the preset gallery.
 *
 * Pick one of the 10 app shells and the whole framework re-skins: frame,
 * sidebars, widgets, charts. Nothing here is decoration — every swatch is
 * rendered with the preset's real tokens.
 */
export function ThemesPage() {
  const { presetMeta } = useTheme()

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Themes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ten ready-made app shells. Pick one — frame, sidebars, charts and every widget re-skin
          instantly.
        </p>
      </div>

      <GlassCard
        title={presetMeta.name}
        subtitle={presetMeta.tagline}
        icon={Sparkles}
        action={
          <span className="mono rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {presetMeta.id}
          </span>
        }
      >
        <p className="text-xs leading-relaxed text-muted-foreground">{presetMeta.description}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              mood
            </p>
            <p className="mt-1 text-xs">{presetMeta.mood}</p>
          </div>
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              best for
            </p>
            <p className="mt-1 text-xs">{presetMeta.bestFor.join(' · ')}</p>
          </div>
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              source
            </p>
            <p className="mt-1 text-xs">{presetMeta.source}</p>
          </div>
        </div>
      </GlassCard>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Presets</h2>
        <PresetSwitcher showLabels />
      </div>

      <TokenInspector />
    </div>
  )
}
