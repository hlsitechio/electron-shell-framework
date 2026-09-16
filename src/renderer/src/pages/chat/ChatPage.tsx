import { MessageSquare, Paperclip, Send } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback } from '@renderer/components/ui/avatar'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { cn } from '@renderer/lib/utils'

interface ChatMessage {
  id: number
  author: string
  text: string
  mine: boolean
}

const initial: ChatMessage[] = [
  { id: 1, author: 'Colleague', text: 'The shell is looking sharp.', mine: false },
  {
    id: 2,
    author: 'You',
    text: 'Thanks — swapped the demo messages for generic ones.',
    mine: true
  },
  { id: 3, author: 'Colleague', text: 'Clean. Ready for the repo.', mine: false }
]

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initial)
  const [draft, setDraft] = useState('')

  const send = () => {
    if (!draft.trim()) return
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, author: 'You', text: draft.trim(), mine: true }
    ])
    setDraft('')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-6">
        {messages.map((m) => (
          <div key={m.id} className={cn('flex gap-3', m.mine && 'flex-row-reverse')}>
            <Avatar className="h-8 w-8">
              <AvatarFallback>{m.author.slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div
              className={cn('max-w-md rounded-lg bg-card p-3 shadow-xs', m.mine && 'bg-primary/10')}
            >
              <p className="text-xs font-medium text-muted-foreground">{m.author}</p>
              <p className="mt-0.5 text-sm">{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-3" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Attach">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send()
            }}
            placeholder="Message the team…"
            className="flex-1"
          />
          <Button size="icon" onClick={send} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export const ChatIcon = MessageSquare
