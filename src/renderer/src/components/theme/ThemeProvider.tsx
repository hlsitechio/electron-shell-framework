import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { applyTheme, DEFAULT_THEME, type Theme } from '@renderer/lib/theme'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

async function loadStoredTheme(): Promise<Theme> {
  try {
    const stored = await window.api?.config?.get?.('theme')
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* preload unavailable (plain browser) — fall back */
  }
  return DEFAULT_THEME
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    void loadStoredTheme().then((t) => {
      if (cancelled) return
      setThemeState(t)
      applyTheme(t)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    applyTheme(t)
    try {
      localStorage.setItem('shell:theme', t)
      void window.api?.config?.set?.('theme', t)
    } catch {
      /* storage unavailable — in-memory only */
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      try {
        localStorage.setItem('shell:theme', next)
        void window.api?.config?.set?.('theme', next)
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  if (!ready) {
    // Brief blank frame to avoid a light/dark flash on startup.
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
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
