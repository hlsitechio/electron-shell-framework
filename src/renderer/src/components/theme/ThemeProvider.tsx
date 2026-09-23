import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { applyTheme, DEFAULT_THEME, type Theme } from '@renderer/lib/theme'
import {
  applyPreset,
  DEFAULT_PRESET,
  getPreset,
  isPresetId,
  type ThemePreset
} from '@renderer/lib/presets'

interface ThemeContextValue {
  /** light/dark mode */
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  /** the active preset id (see lib/presets.ts) */
  preset: string
  /** full metadata for the active preset */
  presetMeta: ThemePreset
  setPreset: (preset: string) => void
  resetPreset: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * Mode + preset are two independent axes:
 *   data-theme   → light | dark
 *   data-preset  → one of the 10 app shells in styles/presets.css
 * Both must be present on <html> for the preset tokens to resolve.
 */
async function loadStored(prefKey: string, storageKey: string): Promise<string | null> {
  try {
    const stored = await window.api?.config?.get?.(prefKey)
    if (typeof stored === 'string') return stored
  } catch {
    /* preload unavailable (plain browser) — fall back to localStorage */
  }
  try {
    return localStorage.getItem(storageKey)
  } catch {
    return null
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)
  const [preset, setPresetState] = useState<string>(DEFAULT_PRESET)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    void Promise.all([
      loadStored('theme', 'shell:theme'),
      loadStored('theme:preset', 'shell:preset')
    ]).then(([storedTheme, storedPreset]) => {
      if (cancelled) return
      const t: Theme =
        storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : DEFAULT_THEME
      const p = isPresetId(storedPreset) ? storedPreset : DEFAULT_PRESET
      setThemeState(t)
      setPresetState(p)
      applyTheme(t)
      applyPreset(p)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const persist = useCallback((key: string, value: string, storageKey: string) => {
    try {
      localStorage.setItem(storageKey, value)
      void window.api?.config?.set?.(key, value)
    } catch {
      /* storage unavailable — in-memory only */
    }
  }, [])

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t)
      applyTheme(t)
      persist('theme', t, 'shell:theme')
    },
    [persist]
  )

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      persist('theme', next, 'shell:theme')
      return next
    })
  }, [persist])

  const setPreset = useCallback(
    (id: string) => {
      const safe = isPresetId(id) ? id : DEFAULT_PRESET
      setPresetState(safe)
      applyPreset(safe)
      persist('theme:preset', safe, 'shell:preset')
    },
    [persist]
  )

  const resetPreset = useCallback(() => setPreset(DEFAULT_PRESET), [setPreset])

  useEffect(() => {
    ;(window as unknown as { __shellSetPreset?: (p: string) => void }).__shellSetPreset = setPreset
    ;(window as unknown as { __shellSetTheme?: (t: Theme) => void }).__shellSetTheme = setTheme
  }, [setPreset, setTheme])

  if (!ready) {
    // Brief blank frame to avoid a light/dark/preset flash on startup.
    return (
      <div
        style={{
          height: '100%',
          background: 'hsl(var(--background))'
        }}
      />
    )
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        preset,
        presetMeta: getPreset(preset),
        setPreset,
        resetPreset
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
