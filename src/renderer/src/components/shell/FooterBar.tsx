import { useEffect, useState } from 'react'
import { Badge } from '@renderer/components/ui/badge'
import { useBranding } from '@renderer/lib/useBranding'

interface FooterBarProps {
  appName?: string
}

/**
 * Full-width bottom frame for the main column.
 * Mirrors the reference dashboard footer: left status block,
 * sparse center (version), right status pill. Separated from
 * content by a hairline only — no heavy border.
 */
export function FooterBar({ appName = 'App Shell' }: FooterBarProps) {
  const [version, setVersion] = useState('0.1.0')
  const { branding } = useBranding()
  const displayName = branding.appName || appName

  useEffect(() => {
    void window.api?.app
      ?.version?.()
      .then((v) => setVersion(v))
      .catch(() => {})
  }, [])

  return (
    <footer
      className="flex h-9 shrink-0 items-center gap-4 px-4"
      style={{
        background: 'hsl(var(--topbar-bg))',
        borderTop: '1px solid hsl(var(--border))'
      }}
    >
      {/* left status block */}
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{
            background: 'hsl(var(--success))',
            boxShadow: '0 0 6px hsl(var(--success) / 0.6)'
          }}
        />
        <span className="truncate text-xs text-muted-foreground">All systems operational</span>
      </div>

      {/* spacer */}
      <div className="flex-1" />

      {/* center: version · platform */}
      <Badge variant="secondary" className="hidden sm:inline-flex">
        v{version} · electron
      </Badge>

      {/* right: status pill */}
      <Badge
        variant="outline"
        className="whitespace-nowrap"
        style={{ color: 'hsl(var(--primary))' }}
      >
        {displayName} · online
      </Badge>
    </footer>
  )
}
