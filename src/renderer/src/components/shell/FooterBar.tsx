import { useEffect, useState } from 'react'
import { SquareTerminal } from 'lucide-react'
import { Badge } from '@renderer/components/ui/badge'
import { cn } from '@renderer/lib/utils'
import { useBranding } from '@renderer/lib/useBranding'
import { useCockpitStore } from '@renderer/stores/cockpit-store'

interface FooterBarProps {
  appName?: string
}

/**
 * Full-width bottom frame for the main column.
 * Mirrors the reference dashboard footer: left status block,
 * sparse center (version), right status pill. Separated from
 * content by a hairline only — no heavy border.
 *
 * The left dot is bound to a live heartbeat from the main process: it pulses
 * while the daemon ticks and drains to a flat muted dot if the ticks stop, so
 * "alive" is a measured fact rather than a decorative string.
 */
export function FooterBar({ appName = 'App Shell' }: FooterBarProps) {
  const [version, setVersion] = useState('0.1.0')
  const { branding } = useBranding()
  const displayName = branding.appName || appName

  const heartbeat = useCockpitStore((s) => s.heartbeat)
  const terminalRepoId = useCockpitStore((s) => s.terminalRepoId)
  const openTerminal = useCockpitStore((s) => s.openTerminal)
  const [stale, setStale] = useState(false)
  const heartbeatStamp = heartbeat?.timestamp

  // Treat a missing tick for 6s as "the daemon is not reporting". Both state
  // writes are deferred a tick so nothing updates synchronously inside the
  // effect body (React flags that as a cascading render).
  useEffect(() => {
    if (!heartbeatStamp) return
    const freshness = setTimeout(() => setStale(false), 0)
    const expiry = setTimeout(() => setStale(true), 6000)
    return () => {
      clearTimeout(freshness)
      clearTimeout(expiry)
    }
  }, [heartbeatStamp])

  useEffect(() => {
    void window.api?.app
      ?.version?.()
      .then((v) => setVersion(v))
      .catch(() => {})
  }, [])

  const terminalRepo = (useCockpitStore.getState().snapshot?.repos ?? []).find(
    (r) => r.id === terminalRepoId
  )

  const statusText = !heartbeat
    ? 'waiting for the main process…'
    : stale
      ? 'daemon not reporting'
      : `${heartbeat.repoCount} repo${heartbeat.repoCount === 1 ? '' : 's'} · ${heartbeat.terminalCount} shell${heartbeat.terminalCount === 1 ? '' : 's'} · ${heartbeat.runningBuilds} build${heartbeat.runningBuilds === 1 ? '' : 's'} running`

  const dotColor = !heartbeat || stale ? 'hsl(var(--muted-foreground))' : 'hsl(var(--success))'

  return (
    <footer
      className="flex h-9 shrink-0 items-center gap-4 px-4"
      style={{
        background: 'hsl(var(--topbar-bg))',
        borderTop: '1px solid hsl(var(--border))'
      }}
    >
      {/* left status block — live daemon heartbeat */}
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            'h-1.5 w-1.5 shrink-0 rounded-full',
            !stale && heartbeat && 'animate-pulse'
          )}
          style={{
            background: dotColor,
            boxShadow: !stale && heartbeat ? `0 0 6px ${dotColor}` : undefined
          }}
        />
        <span className="truncate text-xs text-muted-foreground">{statusText}</span>
        <span className="mono hidden shrink-0 text-[10px] text-muted-foreground/60 lg:inline">
          uptime {heartbeat ? `${heartbeat.uptimeSeconds}s` : '—'} · pid {heartbeat?.pid ?? '—'}
        </span>
      </div>

      {/* spacer */}
      <div className="flex-1" />

      {/* center: shell target, one click to the PTY */}
      {terminalRepo && (
        <button
          type="button"
          onClick={() => openTerminal(terminalRepo.id)}
          className="mono hidden shrink-0 items-center gap-1.5 rounded-md bg-muted/40 px-2 py-0.5 text-[10.5px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex border border-border/60 shadow-2xs"
          title="Open the terminal panel in this repository"
        >
          <SquareTerminal className="h-3 w-3 text-primary" />
          <span>{terminalRepo.name}</span>
        </button>
      )}

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
