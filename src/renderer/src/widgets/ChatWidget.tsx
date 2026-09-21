import { Send } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback } from '@renderer/components/ui/avatar'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { cn } from '@renderer/lib/utils'

export interface ChatBubbleData {
  id: string | number
  author: string
  text: string
  /** true = the user (right, accent gradient) */
  mine?: boolean
}

export interface ChatWidgetProps {
  messages?: ChatBubbleData[]
  title?: string
  placeholder?: string
  /** disable the composer (display-only usage) */
  readOnly?: boolean
  className?: string
}

const DEFAULT: ChatBubbleData[] = [
  { id: 1, author: 'Agent', text: 'Indexed 412 documents. Want a summary?' },
  { id: 2, author: 'You', text: 'Yes — group them by topic.', mine: true },
  { id: 3, author: 'Agent', text: 'Four clusters: pricing, roadmap, infra, hiring.' }
]

/**
 * Chat bubble pair — them = left glass, you = right accent gradient.
 * Max width 82% so long messages stay readable.
 */
export function ChatWidget({
  messages = DEFAULT,
  title = 'Conversation',
  placeholder = 'Message…',
  readOnly = false,
  className
}: ChatWidgetProps) {
  const [items, setItems] = useState<ChatBubbleData[]>(messages)
  const [draft, setDraft] = useState('')

  const send = () => {
    if (!draft.trim() || readOnly) return
    setItems((prev) => [
      ...prev,
      { id: `local-${prev.length + 1}`, author: 'You', text: draft.trim(), mine: true }
    ])
    setDraft('')
  }

  return (
    <div className={cn('glass flex h-full min-h-0 flex-col p-0', className)}>
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid hsl(var(--border))' }}
      >
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {items.length} msgs
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {items.map((m) => (
          <div key={m.id} className={cn('flex gap-2.5', m.mine && 'flex-row-reverse')}>
            {!m.mine && (
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="text-[11px]">
                  {m.author.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div className={cn('bubble', m.mine ? 'bubble--you' : 'bubble--them')}>{m.text}</div>
          </div>
        ))}
      </div>

      {!readOnly && (
        <div
          className="flex items-center gap-2 p-3"
          style={{ borderTop: '1px solid hsl(var(--border))' }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send()
            }}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button size="icon" onClick={send} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
