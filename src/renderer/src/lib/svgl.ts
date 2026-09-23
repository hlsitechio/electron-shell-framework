import { SVGL_BUNDLED } from './svgl-data'

export type SvglTheme = 'dark' | 'light'

/**
 * Normalizes an SVGL slug (e.g. 'Tailwind CSS' -> 'tailwindcss', 'GitHub' -> 'github')
 */
export function normalizeSvglName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/^svgl[:/]/, '')
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_-]/g, '')
}

/**
 * Returns bundled SVG markup if available for the given icon and theme mode.
 */
export function getBundledSvgl(name: string, theme: SvglTheme = 'dark'): string | null {
  const slug = normalizeSvglName(name)
  // Check theme-specific variant first (e.g. github_dark, react_light)
  const themedKey = `${slug}_${theme}`
  if (SVGL_BUNDLED[themedKey]) {
    return SVGL_BUNDLED[themedKey]
  }
  // Check default/universal variant
  if (SVGL_BUNDLED[slug]) {
    return SVGL_BUNDLED[slug]
  }
  return null
}

const memoryCache = new Map<string, string>()

/**
 * Fetches an SVGL icon from svgl.app with offline caching.
 */
export async function fetchSvglSvg(
  name: string,
  theme: SvglTheme = 'dark'
): Promise<string | null> {
  const bundled = getBundledSvgl(name, theme)
  if (bundled) return bundled

  const slug = normalizeSvglName(name)
  const cacheKey = `svgl:${slug}:${theme}`

  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(cacheKey)
      if (stored) {
        memoryCache.set(cacheKey, stored)
        return stored
      }
    } catch {
      /* localStorage unavailable */
    }
  }

  // Attempt live fetch from svgl.app
  const candidates = [
    `https://svgl.app/library/${slug}_${theme}.svg`,
    `https://svgl.app/library/${slug}.svg`
  ]

  for (const url of candidates) {
    try {
      const res = await fetch(url)
      if (res.ok) {
        const text = await res.text()
        if (text.includes('<svg')) {
          memoryCache.set(cacheKey, text)
          try {
            window.localStorage?.setItem(cacheKey, text)
          } catch {
            /* storage limit */
          }
          return text
        }
      }
    } catch {
      /* network error */
    }
  }

  return null
}

export { SvglIcon, svgl, type SvglIconProps } from '@renderer/components/ui/SvglIcon'

/**
 * List of bundled SVGL icon names available offline with zero latency.
 */
export const BUNDLED_SVGL_NAMES = [
  'electron',
  'react',
  'typescript',
  'tailwindcss',
  'vite',
  'github',
  'openai',
  'anthropic',
  'supabase',
  'docker',
  'python',
  'nodejs'
] as const
