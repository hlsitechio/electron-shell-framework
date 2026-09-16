import {
  Bell,
  BellOff,
  PanelRightClose,
  PanelRightOpen,
  ScrollText,
  Send,
  TerminalSquare
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Button } from '@renderer/components/ui/button'
import { cn } from '@renderer/lib/utils'
import { useUiStore } from '@renderer/stores/ui-store'

interface RightPanelProps {
  children?: ReactNode
}

type View = 'notifications' | 'log'

interface Notice {
  id: number
  text: string
  time: string
  read: boolean
}

const now = (): string => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

/**
 * Right sidebar — hosts the Bell (notifications) and Log (activity) views.
 * Ships with a demo toast + a sample user-log entry to show the pattern.
 */
export function RightPanel({ children }: RightPanelProps) {
  const { rightOpen, rightWidth, toggleRight } = useUiStore()
  const [view, setView] = useState<View>('notifications')
  const [notices, setNotices] = useState<Notice[]>([
    { id: 1, text: 'Welcome to the shell — this is a test toast.', time: now(), read: false }
  ])
  const [log, setLog] = useState<string[]>([`[${now()}] user joined — demo session started`])
  const [draft, setDraft] = useState('')

  const addToast = () => {
    const text = draft.trim() || 'New toast notification'
    setNotices((n) => [{ id: Date.now(), text, time: now(), read: false }, ...n])
    setLog((l) => [`[${now()}] action: "${text}"`, ...l])
    setDraft('')
  }

  const markAll = () => setNotices((n) => n.map((x) => ({ ...x, read: true })))

  return (
    <div
      className="flex h-full flex-col shrink-0 overflow-hidden"
      style={{
        width: rightOpen ? rightWidth : 36,
        background: 'hsl(var(--rightpanel-bg))',
        borderLeft: '1px solid hsl(var(--rightpanel-border))',
        transition: 'width 160ms ease'
      }}
    >
      {rightOpen ? (
        <>
          {/* header: Bell + Log toggle */}
          <div
            className="flex h-10 shrink-0 items-center justify-between border-b px-2"
            style={{ borderColor: 'hsl(var(--rightpanel-border))' }}
          >
            <div className="flex items-center gap-1">
              <button
                onClick={() => setView('notifications')}
                className={cn(
                  'flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium transition-colors',
                  view === 'notifications'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-tab-hover-bg'
                )}
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="h-3.5 w-3.5" />
                Notifications
              </button>
              <button
                onClick={() => setView('log')}
                className={cn(
                  'flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium transition-colors',
                  view === 'log'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-tab-hover-bg'
                )}
                aria-label="Activity log"
                title="Activity log"
              >
                <ScrollText className="h-3.5 w-3.5" />
                Log
              </button>
            </div>
            <button
              onClick={toggleRight}
              className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-accent"
              style={{ borderRadius: 2 }}
              aria-label="Close panel"
              title="Close panel"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>

          {/* body */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {view === 'notifications' ? (
              <>
                <div
                  className="flex shrink-0 gap-1.5 border-b p-2"
                  style={{ borderColor: 'hsl(var(--rightpanel-border))' }}
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Test toast message…"
                    className="h-7 min-w-0 flex-1 rounded border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
                    onKeyDown={(e) => e.key === 'Enter' && addToast()}
                  />
                  <Button
                    size="sm"
                    onClick={addToast}
                    className="h-7 shrink-0 px-2"
                    aria-label="Send toast"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {notices.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                      <BellOff className="h-6 w-6 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No notifications</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {notices.map((n) => (
                        <li
                          key={n.id}
                          className={cn(
                            'rounded border p-2 text-xs',
                            n.read ? 'border-border' : 'border-primary/40'
                          )}
                          style={{
                            background: n.read ? 'hsl(var(--card))' : 'hsl(var(--accent) / 0.25)'
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <Bell className="h-3 w-3 shrink-0" />
                            <span className="truncate">{n.text}</span>
                          </div>
                          <p className="mt-1 text-[10px] text-muted-foreground">{n.time}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  onClick={markAll}
                  className="shrink-0 border-t py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  style={{ borderColor: 'hsl(var(--rightpanel-border))' }}
                >
                  Mark all as read
                </button>
              </>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px] leading-5">
                  {log.map((line, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <TerminalSquare className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                      <span className="text-foreground">{line}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setLog((l) => [`[${now()}] user action: example log entry`, ...l])}
                  className="shrink-0 border-t py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  style={{ borderColor: 'hsl(var(--rightpanel-border))' }}
                >
                  + Add sample log
                </button>
              </>
            )}
            {children && <div className="shrink-0 border-t border-border p-3">{children}</div>}
          </div>
        </>
      ) : (
        /* collapsed: slim rail with reopen arrow only */
        <div className="flex h-full flex-col items-center py-2">
          <button
            onClick={toggleRight}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors',
              'hover:bg-accent hover:text-accent-foreground'
            )}
            aria-label="Open panel"
            title="Open panel"
          >
            <PanelRightOpen className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
