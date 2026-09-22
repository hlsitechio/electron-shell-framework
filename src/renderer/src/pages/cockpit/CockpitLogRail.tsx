import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, Braces, ScrollText, Search } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { useCockpitStore } from '@renderer/stores/cockpit-store'

/**
 * The right rail — a real activity log.
 *
 * Every line here is emitted by the MAIN process: git scans, `gh` queries,
 * build output line-by-line, PTY attach/close, worktree commands. It is the
 * app's console, so when something fails you can read the actual reason
 * instead of guessing.
 *
 * "Notify" mode is the same stream filtered to warnings/errors/successes —
 * that is the bell: things worth your attention, drawn from real events.
 */

const LEVEL_COLOR: Record<string, string> = {
  info: 'hsl(var(--muted-foreground))',
  success: 'hsl(var(--success))',
  warn: 'hsl(var(--warning))',
  error: 'hsl(var(--destructive))'
}

function timeOf(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function CockpitLogRail(): React.JSX.Element {
  const logs = useCockpitStore((s) => s.logs)
  const [view, setView] = useState<'log' | 'notify'>('log')
  const [query, setQuery] = useState('')
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const lastSeenId = useRef(0)

  const notable = useMemo(() => logs.filter((l) => l.level !== 'info'), [logs])

  // Count events that arrived while the Notify view was closed. Deferred a tick
  // so the update is not synchronous inside the effect body.
  useEffect(() => {
    const newest = notable[notable.length - 1]
    if (!newest) return
    const timer = setTimeout(() => {
      if (view === 'notify') {
        lastSeenId.current = newest.id
        setUnread(0)
      } else {
        setUnread(notable.filter((l) => l.id > lastSeenId.current).length)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [notable, view])

  const source = view === 'log' ? logs : notable
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q ? source.filter((l) => l.text.toLowerCase().includes(q)) : source
    return list.slice(-400)
  }, [source, query])

  // Autoscroll while the user is already at the bottom.
  useEffect(() => {
    const el = bottomRef.current
    if (!el) return
    const parent = el.parentElement
    if (!parent) return
    const nearBottom = parent.scrollHeight - parent.scrollTop - parent.clientHeight < 120
    if (nearBottom) el.scrollIntoView({ block: 'end' })
  }, [visible.length])

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* header */}
      <div
        className="flex h-9 shrink-0 items-center gap-1 px-2"
        style={{ borderBottom: '1px solid hsl(var(--border))' }}
      >
        <Button
          size="sm"
          variant={view === 'log' ? 'secondary' : 'ghost'}
          className="h-7 gap-1.5 px-2 text-[11px]"
          onClick={() => setView('log')}
        >
          <ScrollText className="h-3.5 w-3.5" />
          Activity
          <span className="mono text-[10px] text-muted-foreground">{logs.length}</span>
        </Button>
        <Button
          size="sm"
          variant={view === 'notify' ? 'secondary' : 'ghost'}
          className="relative h-7 gap-1.5 px-2 text-[11px]"
          onClick={() => setView('notify')}
        >
          <Bell className="h-3.5 w-3.5" />
          Notify
          {unread > 0 && view !== 'notify' && (
            <span
              className="mono absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px]"
              style={{
                background: 'hsl(var(--destructive))',
                color: 'hsl(var(--destructive-foreground))'
              }}
            >
              {unread > 99 ? '99' : unread}
            </span>
          )}
        </Button>
      </div>

      {/* filter */}
      <div className="relative shrink-0 px-2 py-2">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter activity…"
          className="mono h-7 pl-7 text-[11px]"
        />
      </div>

      {/* stream */}
      <div className="min-h-0 flex-1 overflow-auto px-2 pb-2">
        {visible.length === 0 ? (
          <div
            className="hatched rounded-md p-4 text-center"
            style={{ border: '1px dashed hsl(var(--border))' }}
          >
            <Braces className="mx-auto mb-2 h-4 w-4 text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground">
              {view === 'log'
                ? 'No activity yet. Rescan a repo, run a script or open a terminal — every action lands here.'
                : 'Nothing needs your attention.'}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {visible.map((line) => (
              <div
                key={line.id}
                className="mono flex gap-1.5 rounded px-1.5 py-1 text-[10.5px] leading-relaxed hover:bg-accent/30"
              >
                <span className="shrink-0 text-muted-foreground/60">{timeOf(line.timestamp)}</span>
                <span
                  className="min-w-0 flex-1 whitespace-pre-wrap break-words"
                  style={{ color: LEVEL_COLOR[line.level] }}
                >
                  {line.text}
                </span>
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* footer hint */}
      <div
        className="mono shrink-0 px-3 py-1.5 text-[9.5px] text-muted-foreground"
        style={{ borderTop: '1px solid hsl(var(--border))' }}
      >
        live from the main process ·{' '}
        {useCockpitStore.getState().connected ? 'connected' : 'offline'}
      </div>
    </div>
  )
}
