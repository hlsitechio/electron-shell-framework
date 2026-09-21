import { BookOpen, Newspaper, Rss } from 'lucide-react'
import { useState } from 'react'
import { GlassCard, FilterChips, EmptyState, Pipeline } from '@renderer/widgets'
import type { AppTemplate } from './types'

/**
 * READER — 24 shipped Electron apps
 * (Raven Reader, Fluent Reader, Thorium Reader, Buka, CBETA Reader, homura)
 *
 * Feed list, article pane capped at a readable measure, and a saved shelf.
 * Fully offline once synced — the local-first pattern again.
 */

const FEEDS = [
  { name: 'Hacker News', unread: 24 },
  { name: 'Simon Willison', unread: 3 },
  { name: 'Ars Technica', unread: 11 },
  { name: 'Stratechery', unread: 1 }
]

function Feeds() {
  const [filter, setFilter] = useState('all')
  return (
    <div className="space-y-3 p-6">
      <FilterChips options={['all', 'unread']} value={filter} onChange={setFilter} />
      <GlassCard title="Subscriptions" subtitle="4 feeds · 39 unread" icon={Rss}>
        <div className="space-y-1">
          {FEEDS.filter((f) => filter === 'all' || f.unread > 0).map((f) => (
            <div
              key={f.name}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/60"
            >
              <span className="flex-1 text-xs">{f.name}</span>
              <span className="mono text-[10px] text-muted-foreground">{f.unread}</span>
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard title="Sync" subtitle="How content arrives">
        <Pipeline
          steps={[
            { label: 'Fetch', detail: 'rss/atom' },
            { label: 'Extract', detail: 'readable' },
            { label: 'Store', detail: 'offline' },
            { label: 'Read', detail: 'no JS' }
          ]}
        />
      </GlassCard>
    </div>
  )
}

function Article() {
  return (
    <div className="mx-auto max-w-[68ch] p-8">
      <p className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        hackinghistory · 2h ago
      </p>
      <h1 className="mt-2 text-2xl font-semibold leading-snug">
        How the first spreadsheet changed accounting
      </h1>
      <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          The reading measure is capped on purpose: 65–75 characters per line, no matter how wide
          the window. Full-bleed prose is the fastest way to make a reader app feel cheap.
        </p>
        <p>
          Articles render as plain text by default — no scripts, no trackers — with the sanitised
          HTML available when you want images. That is the whole pitch of an offline reader.
        </p>
      </div>
    </div>
  )
}

function Shelf() {
  return (
    <div className="space-y-3 p-6">
      <GlassCard title="Read later" subtitle="12 saved">
        <div className="space-y-1.5">
          {['The case for local-first', 'Why SQLite is enough', 'Notes on fonts'].map((s) => (
            <div key={s} className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3" /> {s}
            </div>
          ))}
        </div>
      </GlassCard>
      <EmptyState
        title="No highlights yet"
        hint="Select text while reading and it will collect here."
        icon={Newspaper}
      />
    </div>
  )
}

export const readerTemplate: AppTemplate = {
  id: 'reader',
  name: 'Reader',
  tagline: 'Offline RSS and ebook reading.',
  description:
    'Twenty-four shipped reader apps. Subscription list, an article pane hard-capped at a readable measure, and a read-later shelf. Everything is stored locally, so it keeps working with the network down.',
  icon: Newspaper,
  home: 'article',
  preset: 'winter-woods',
  layout: { leftWidth: 230, rightOpen: true, rightWidth: 280, bottomOpen: false },
  pages: [
    {
      id: 'article',
      label: 'Read',
      description: 'Article pane',
      icon: Newspaper,
      component: Article
    },
    {
      id: 'feeds',
      label: 'Feeds',
      description: 'Subscriptions',
      icon: Rss,
      component: Feeds,
      rightPanel: Feeds
    },
    {
      id: 'shelf',
      label: 'Shelf',
      description: 'Saved + highlights',
      icon: BookOpen,
      component: Shelf
    }
  ],
  dataShape:
    'feeds: [{ id, title, url, unread }], articles: [{ id, feedId, title, body, publishedAt, read }]',
  extendWith: [
    'rss/atom parser over IPC',
    'readability extraction',
    'offline article store',
    'epub support'
  ]
}
