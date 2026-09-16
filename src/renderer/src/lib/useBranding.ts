import { useCallback, useEffect, useState } from 'react'

export interface Branding {
  appName: string
  logo: string | null // data URL
}

const BRANDING_KEY = 'settings:branding'

const DEFAULT_BRANDING: Branding = { appName: 'App Shell', logo: null }

/**
 * App branding — name + optional logo (data URL), persisted to the
 * encrypted config. Consumed by the sidebar brand, footer, and settings.
 */
export function useBranding(): {
  branding: Branding
  setAppName: (name: string) => void
  setLogo: (dataUrl: string | null) => void
} {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING)

  useEffect(() => {
    let cancelled = false
    void window.api?.config
      ?.get?.(BRANDING_KEY)
      .then((raw) => {
        if (cancelled) return
        if (raw && typeof raw === 'object') {
          const b = raw as Partial<Branding>
          setBranding({
            appName:
              typeof b.appName === 'string' && b.appName ? b.appName : DEFAULT_BRANDING.appName,
            logo: typeof b.logo === 'string' ? b.logo : null
          })
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const persist = useCallback(async (next: Branding) => {
    setBranding(next)
    try {
      await window.api?.config?.set?.(BRANDING_KEY, next)
    } catch {
      /* preload missing */
    }
  }, [])

  const setAppName = useCallback(
    (name: string) => {
      persist({ ...branding, appName: name || DEFAULT_BRANDING.appName })
    },
    [branding, persist]
  )

  const setLogo = useCallback(
    (dataUrl: string | null) => {
      persist({ ...branding, logo: dataUrl })
    },
    [branding, persist]
  )

  return { branding, setAppName, setLogo }
}
