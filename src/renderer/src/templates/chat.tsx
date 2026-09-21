import { Hash, MessageSquare, Users } from 'lucide-react'
import { useState } from 'react'
import { ChatWidget, GlassCard, FilterChips } from '@renderer/widgets'
import type { AppTemplate } from './types'

/**
 * CHAT / MESSAGING CLIENT — 37 shipped Electron apps
 * (Discord, Slack, Signal, WhatsApp, Mattermost, Rocket.Chat, Zulip)
 *
 * Channel/thread list, reading pane, member rail. Works against any
 * protocol you add over IPC — the shell only owns the layout.
 */

const CHANNELS = [
  { name: 'general', unread: 0 },
  { name: 'engineering', unread: 4 },
  { name: 'design-crit', unread: 12 },
  { name: 'releases', unread: 0 }
]

const DMS = ['dana.k', 'sam.t', 'bot.ops']

function ChannelList() {
  const [filter, setFilter] = useState('all')
  return (
    <div className="space-y-3 p-6">
      <FilterChips options={['all', 'unread']} value={filter} onChange={setFilter} />
      <GlassCard title="Channels" subtitle="4 channels · 16 unread">
        <div className="space-y-1">
          {CHANNELS.filter((c) => filter === 'all' || c.unread > 0).map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/60"
            >
              <Hash className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-xs">{c.name}</span>
              {c.unread > 0 && (
                <span
                  className="mono rounded-full px-1.5 text-[10px]"
                  style={{
                    background: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))'
                  }}
                >
                  {c.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard title="Direct messages" subtitle="3 conversations">
        <div className="space-y-1">
          {DMS.map((d) => (
            <div
              key={d}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/60"
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[9px]"
                style={{ background: 'hsl(var(--muted))' }}
              >
                {d.slice(0, 1).toUpperCase()}
              </span>
              <span className="text-xs">{d}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

function Members() {
  return (
    <div className="p-6">
      <GlassCard title="Members" subtitle="12 online">
        <div className="space-y-1.5">
          {['dana.k', 'sam.t', 'bot.ops', 'h.larose', 'ops-runner'].map((m, i) => (
            <div key={m} className="flex items-center gap-2">
              <span
                className="dot"
                style={{
                  background: i < 3 ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))'
                }}
              />
              <span className="text-xs text-muted-foreground">{m}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

function Thread() {
  return (
    <div className="h-full p-4">
      <ChatWidget
        title="#engineering"
        placeholder="Message #engineering…"
        messages={[
          { id: 1, author: 'dana.k', text: 'The migration ran clean — 1.2M rows.' },
          { id: 2, author: 'You', text: 'Nice. Rollback plan still armed?', mine: true },
          { id: 3, author: 'dana.k', text: 'Yes, snapshot kept for 7 days.' },
          { id: 4, author: 'sam.t', text: 'Can we get a chart of p95 after?' }
        ]}
      />
    </div>
  )
}

export const chatTemplate: AppTemplate = {
  id: 'chat',
  name: 'Chat',
  tagline: 'Channels, threads and a member rail.',
  description:
    'Thirty-seven shipped Electron apps are messaging clients — the most familiar desktop layout there is. Channel list, reading pane, member panel. The transport is yours; the shell owns the frame.',
  icon: MessageSquare,
  home: 'thread',
  preset: 'shadow-peonies',
  layout: { leftWidth: 250, rightOpen: true, rightWidth: 260, bottomOpen: false },
  pages: [
    {
      id: 'thread',
      label: 'Thread',
      description: 'Conversation',
      icon: MessageSquare,
      component: Thread
    },
    {
      id: 'channels',
      label: 'Channels',
      description: 'Channels + DMs',
      icon: Hash,
      component: ChannelList,
      rightPanel: ChannelList
    },
    { id: 'members', label: 'Members', description: 'Presence', icon: Users, component: Members }
  ],
  dataShape:
    'channels: [{ id, name, unread }], messages: [{ id, channelId, authorId, body, at }], members: [{ id, handle, presence }]',
  extendWith: ['websocket transport', 'message search', 'threads and reactions', 'file attachments']
}
