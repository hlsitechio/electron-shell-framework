export type Theme = 'dark' | 'light'

export const DEFAULT_THEME: Theme = 'dark'

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
}

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem('shell:theme')
  if (stored === 'light' || stored === 'dark') return stored
  return DEFAULT_THEME
}
