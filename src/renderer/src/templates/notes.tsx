import { BookOpen, FileText, Tag } from 'lucide-react'
import { useState } from 'react'
import { GlassCard, FilterChips } from '@renderer/widgets'
import type { AppTemplate } from './types'

/**
 * NOTES / KNOWLEDGE BASE — 47 shipped Electron apps
 * (Obsidian, Joplin, Simplenote, Standard Notes, Zettlr, Trilium, Notable)
 *
 * The most profitable Electron niche: local-first, subscription or one-time
 * license, zero backend cost. The shell provides auth-free offline storage
 * via the encrypted config store; notes themselves are files.
 */

const NOTES = [
  { title: 'Pricing model — final', tags: ['business'], updated: '2h ago' },
  { title: 'Migration plan to Neon', tags: ['infra'], updated: '1d ago' },
  { title: 'Reading notes: Madeira', tags: ['research'], updated: '3d ago' },
  { title: 'Sprint retro — week 38', tags: ['team'], updated: '5d ago' },
  { title: 'API surface brainstorm', tags: ['dev'], updated: '1w ago' }
]

function NotesList() {
  const [filter, setFilter] = useState('all')
  return (
    <div className="space-y-3 p-6">
      <FilterChips
        options={['all', 'business', 'infra', 'research', 'team']}
        value={filter}
        onChange={setFilter}
      />
      <div className="space-y-1.5">
        {NOTES.map((n) => (
          <div
            key={n.title}
            className="glass flex items-center gap-3 px-3 py-2.5"
            style={{ cursor: 'pointer' }}
          >
            <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: 'hsl(var(--primary))' }} />
            <span className="min-w-0 flex-1 truncate text-sm">{n.title}</span>
            <span className="mono shrink-0 text-[10px] text-muted-foreground">{n.updated}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NotesGraph() {
  return (
    <div className="space-y-3 p-6">
      <GlassCard title="Backlinks" subtitle="What links to this note">
        <div className="space-y-1.5">
          {['Pricing model — final', 'Onboarding flow'].map((b) => (
            <div key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3" /> {b}
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard title="Tags" subtitle="Across the vault">
        <div className="flex flex-wrap gap-1.5">
          {['business', 'infra', 'research', 'team', 'dev'].map((t) => (
            <span key={t} className="chip">
              <Tag className="h-3 w-3" />
              {t}
            </span>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

function NotesEditor() {
  return (
    <div className="mx-auto max-w-[70ch] p-8">
      <h1 className="text-2xl font-semibold">Pricing model — final</h1>
      <p className="mono mt-1 text-[11px] text-muted-foreground">
        edited 2h ago · 412 words · 3 backlinks
      </p>
      <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          Prose stays capped at a readable measure no matter how wide the window gets — that is the
          house rule (65–75ch). The editor here is the whole content surface, so swapping in a real
          markdown editor is a single component change.
        </p>
        <p>
          Notes in this template are plain text with a tag list. Search, backlinks and the graph
          view are additive: they read the same note list.
        </p>
      </div>
    </div>
  )
}

export const notesTemplate: AppTemplate = {
  id: 'notes',
  name: 'Notes',
  tagline: 'Local-first knowledge base with tags and backlinks.',
  description:
    'The most common Electron app shape in the wild (47 shipped apps): a list of notes, a reading/editing pane, a tag rail and a backlink panel. Works fully offline — no backend, no auth.',
  icon: BookOpen,
  home: 'notes',
  preset: 'winter-woods',
  layout: {
    leftWidth: 240,
    rightOpen: true,
    rightWidth: 280,
    tabsCollapsed: false,
    bottomOpen: false
  },
  pages: [
    { id: 'notes', label: 'Notes', description: 'All notes', icon: BookOpen, component: NotesList },
    {
      id: 'editor',
      label: 'Editor',
      description: 'Reading pane',
      icon: FileText,
      component: NotesEditor
    },
    {
      id: 'tags',
      label: 'Tags',
      description: 'Tags + backlinks',
      icon: Tag,
      component: NotesGraph,
      rightPanel: NotesGraph
    }
  ],
  dataShape: 'notes: [{ id, title, body, tags[], updatedAt }], links: [{ fromId, toId, label }]',
  extendWith: ['markdown editor', 'full-text search index', 'graph view', 'git-backed vault sync']
}
