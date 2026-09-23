import {
  AppWindow,
  BookOpen,
  Code2,
  Database,
  Film,
  Kanban,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  PenTool,
  Wallet,
  type LucideIcon
} from 'lucide-react'

/**
 * The template CATALOG.
 *
 * Display metadata only — no page components, no page imports. Nothing in
 * this file pulls template code into the boot bundle, which is what keeps
 * the framework core clean: the shell ships, the catalog is browsable, and
 * a template's code is loaded only when someone actually needs it.
 *
 * `evidence` records WHY each template exists — the count of shipped
 * Electron apps in that shape (source: electron/electron-apps registry,
 * 613 apps) so the ordering is defensible instead of a guess.
 */
export interface TemplateMeta {
  id: string
  name: string
  tagline: string
  /** the app shape this replaces, in the user's words */
  ask: string
  icon: LucideIcon
  /** paired color preset (lib/presets.ts) */
  preset: string
  pageCount: number
  /** how many shipped Electron apps have this shape */
  evidence: string
}

export const CATALOG: TemplateMeta[] = [
  {
    id: 'editor',
    name: 'Code Editor',
    tagline: 'Explorer, code surface, terminal, git panel.',
    ask: 'an IDE / code editor / devtool',
    icon: Code2,
    preset: 'carbon',
    pageCount: 3,
    evidence: '83 shipped apps'
  },
  {
    id: 'media',
    name: 'Media Library',
    tagline: 'Browse, inspect and transcode media locally.',
    ask: 'a video/audio/photo library or player',
    icon: Film,
    preset: 'poiesis-purple',
    pageCount: 3,
    evidence: '95 shipped apps'
  },
  {
    id: 'notes',
    name: 'Notes',
    tagline: 'Local-first knowledge base with tags and backlinks.',
    ask: 'a notes / wiki / second-brain app',
    icon: BookOpen,
    preset: 'winter-woods',
    pageCount: 3,
    evidence: '47 shipped apps'
  },
  {
    id: 'devtools',
    name: 'Dev Tools',
    tagline: 'Database GUI, API client and terminal in one shell.',
    ask: 'a database GUI or API client',
    icon: Database,
    preset: 'poiesis-blue',
    pageCount: 4,
    evidence: '52 shipped apps (26 DB + 11 API + 15 terminal)'
  },
  {
    id: 'chat',
    name: 'Chat',
    tagline: 'Channels, threads and a member rail.',
    ask: 'a chat / messaging client',
    icon: MessageSquare,
    preset: 'shadow-peonies',
    pageCount: 3,
    evidence: '37 shipped apps'
  },
  {
    id: 'dashboard',
    name: 'Admin Dashboard',
    tagline: 'KPIs, charts and record tables.',
    ask: 'a dashboard / admin panel / reporting screen',
    icon: LayoutDashboard,
    preset: 'muted-violet',
    pageCount: 3,
    evidence: '45,544 GitHub repos tagged dashboard'
  },
  {
    id: 'tasks',
    name: 'Tasks',
    tagline: 'Kanban board with a today view.',
    ask: 'a task manager / kanban board',
    icon: Kanban,
    preset: 'noguchi',
    pageCount: 3,
    evidence: '23 shipped apps + 7,141 PM repos'
  },
  {
    id: 'workspace',
    name: 'Workspace',
    tagline: 'Many web services in one isolated window.',
    ask: 'an all-in-one wrapper (Franz / Rambox style)',
    icon: AppWindow,
    preset: 'frost',
    pageCount: 2,
    evidence: '11 shipped pure wrappers'
  },
  {
    id: 'reader',
    name: 'Reader',
    tagline: 'Offline RSS and ebook reading.',
    ask: 'an RSS reader / news app',
    icon: Newspaper,
    preset: 'winter-woods',
    pageCount: 3,
    evidence: '24 shipped apps'
  },
  {
    id: 'finance',
    name: 'Finance',
    tagline: 'Accounts, positions and budget.',
    ask: 'a financial dashboard, budget or portfolio app',
    icon: Wallet,
    preset: 'dark-indigo',
    pageCount: 3,
    evidence: '21 shipped apps'
  },
  {
    id: 'writer',
    name: 'AI Writing Studio',
    tagline: 'Document studio with inline critique, review brackets, and style instructions.',
    ask: 'an AI writer / writing studio / document review editor',
    icon: PenTool,
    preset: 'dark-indigo',
    pageCount: 3,
    evidence: '41 shipped apps'
  }
]

/** Free text → template id. A client says "financial dashboard", gets finance. */
const ALIASES: Record<string, string> = {
  writer: 'writer',
  writing: 'writer',
  studio: 'writer',
  author: 'writer',
  manuscript: 'writer',
  copywriting: 'writer',
  draft: 'writer',
  lex: 'writer',
  remark: 'writer',
  financial: 'finance',
  finance: 'finance',
  accounting: 'finance',
  budget: 'finance',
  invoice: 'finance',
  expense: 'finance',
  portfolio: 'finance',
  trading: 'finance',
  dashboard: 'dashboard',
  admin: 'dashboard',
  kpi: 'dashboard',
  metrics: 'dashboard',
  analytics: 'dashboard',
  report: 'dashboard',
  reporting: 'dashboard',
  chat: 'chat',
  messaging: 'chat',
  messenger: 'chat',
  discord: 'chat',
  slack: 'chat',
  notes: 'notes',
  note: 'notes',
  knowledge: 'notes',
  obsidian: 'notes',
  wiki: 'notes',
  markdown: 'notes',
  journal: 'notes',
  editor: 'editor',
  ide: 'editor',
  code: 'editor',
  vscode: 'editor',
  database: 'devtools',
  sql: 'devtools',
  postgres: 'devtools',
  api: 'devtools',
  postman: 'devtools',
  insomnia: 'devtools',
  terminal: 'devtools',
  devtools: 'devtools',
  media: 'media',
  video: 'media',
  audio: 'media',
  music: 'media',
  photo: 'media',
  image: 'media',
  player: 'media',
  transcode: 'media',
  task: 'tasks',
  todo: 'tasks',
  todo2: 'tasks',
  kanban: 'tasks',
  trello: 'tasks',
  project: 'tasks',
  workspace: 'workspace',
  wrapper: 'workspace',
  franz: 'workspace',
  rambox: 'workspace',
  reader: 'reader',
  rss: 'reader',
  news: 'reader',
  feed: 'reader',
  ebook: 'reader',
  book: 'reader'
}

export function resolveTemplateId(query: string): string | null {
  const q = query.toLowerCase()
  // longest alias first so "financial dashboard" resolves on the more specific word
  const keys = Object.keys(ALIASES).sort((a, b) => b.length - a.length)
  for (const k of keys) if (q.includes(k)) return ALIASES[k]
  const byName = CATALOG.find((t) => q.includes(t.name.toLowerCase()))
  return byName ? byName.id : null
}

export function getMeta(id: string): TemplateMeta | null {
  return CATALOG.find((t) => t.id === id) ?? null
}
