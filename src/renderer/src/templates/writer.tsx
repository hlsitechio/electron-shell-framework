import {
  PenTool,
  Files,
  Sliders,
  Sparkles,
  Check,
  RotateCcw,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  Quote,
  Clock,
  Download,
  Bell,
  Trash2,
  Plus,
  BookOpen,
  ArrowRight,
  Settings2
} from 'lucide-react'
import { useState } from 'react'
import { GlassCard, StatTile, FilterChips } from '@renderer/widgets'
import type { AppTemplate } from './types'

/**
 * AI WRITING STUDIO — 41 shipped AI writing & author tools
 * (Lex, Notion AI, Hemingway, Scrivener, Ulysses, iA Writer)
 *
 * A modern AI writing and editing studio. Features document management,
 * rich text editing with in-place AI rewrite approval brackets,
 * custom genre and style instructions, and a contextual review dock.
 */

interface RemarkItem {
  id: string
  passage: string
  critique: string
  suggestion: string
  status: 'pending_suggestion' | 'active' | 'applied' | 'approved'
  isAi?: boolean
}

const INITIAL_REMARKS: RemarkItem[] = [
  {
    id: 'rem-1',
    passage: 'This is an example of what we can do with this new system.',
    critique: 'Too vague and passive — state what we can actually achieve directly.',
    suggestion: 'This architecture enables real-time, local-first intelligence directly on device.',
    status: 'pending_suggestion',
    isAi: true
  },
  {
    id: 'rem-2',
    passage: 'We should probably consider improving the latency as soon as possible.',
    critique: 'Hedging language ("probably consider") weakens the recommendation.',
    suggestion: 'We will optimize end-to-end latency below 50ms in this sprint.',
    status: 'active',
    isAi: false
  }
]

const INITIAL_DOC = {
  title: 'Local Intelligence Architecture Draft',
  updated: 'Just now',
  words: 482,
  revisions: 4,
  content: `Modern desktop computing is witnessing a renaissance. As client hardware gains dedicated neural accelerators, the assumption that intelligent applications require remote cloud round-trips is dissolving.

This is an example of what we can do with this new system. By keeping computation bounded to the local machine, applications achieve zero network latency, zero per-token inference charges, and complete data privacy.

We should probably consider improving the latency as soon as possible. Furthermore, local file vaults guarantee that user records never leave the device boundary.`
}

const GENRES = [
  'Technical',
  'Academic',
  'Essays',
  'Fiction',
  'Business',
  'Newsletter',
  'Copywriting',
  'Product Spec',
  'Memoir',
  'Speech'
]

const RULES = [
  'Prefer active verbs over passive constructions.',
  'Cut hedging words (probably, perhaps, somewhat).',
  'State concrete metrics rather than qualitative claims.',
  'Keep paragraphs under four sentences for digital reading.'
]

/* =========================================================================
   1. STUDIO EDITOR PAGE
   ========================================================================= */

function EditorPage() {
  const [docContent, setDocContent] = useState(INITIAL_DOC.content)
  const [activeApproval, setActiveApproval] = useState<{
    original: string
    suggested: string
  } | null>({
    original: 'This is an example of what we can do with this new system.',
    suggested: 'This architecture enables real-time, local-first intelligence directly on device.'
  })

  const handleApprove = () => {
    if (!activeApproval) return
    setDocContent((prev) => prev.replace(activeApproval.original, activeApproval.suggested))
    setActiveApproval(null)
  }

  const handleRevert = () => {
    setActiveApproval(null)
  }

  const paragraphs = docContent.split('\n\n')

  return (
    <div className="flex h-full flex-col">
      {/* Top action toolbar */}
      <div className="flex items-center justify-between border-b border-card-border/60 bg-card/40 px-6 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-white/10 hover:text-foreground">
            <Heading1 className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-white/10 hover:text-foreground">
            <Heading2 className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-white/10 hover:text-foreground">
            <Heading3 className="h-3.5 w-3.5" />
          </button>
          <div className="mx-1.5 h-3.5 w-[1px] bg-border" />
          <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-white/10 hover:text-foreground">
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-white/10 hover:text-foreground">
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-white/10 hover:text-foreground">
            <Strikethrough className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-white/10 hover:text-foreground">
            <Code className="h-3.5 w-3.5" />
          </button>
          <div className="mx-1.5 h-3.5 w-[1px] bg-border" />
          <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-white/10 hover:text-foreground">
            <List className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-white/10 hover:text-foreground">
            <Quote className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>4 revisions</span>
          </div>
          <button className="flex items-center gap-1.5 rounded-md border border-card-border/70 bg-card/60 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-card">
            <Download className="h-3 w-3" />
            <span>Export</span>
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-md border border-card-border/70 bg-card/60 text-muted-foreground hover:text-foreground">
            <Bell className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Passage Approval Banner (Active when AI rewrite is staged) */}
      {activeApproval && (
        <div className="flex items-center justify-between border-b border-emerald-500/20 bg-emerald-950/30 px-6 py-2 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold tracking-wide uppercase">1 Passage to Approve</span>
            <span className="text-emerald-400/80">Review AI suggestion before finalizing</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleApprove}
              className="flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-500"
            >
              <Check className="h-3 w-3" />
              <span>Approve rewrite</span>
            </button>
            <button
              onClick={handleRevert}
              className="flex items-center gap-1 rounded border border-emerald-700/60 bg-emerald-900/40 px-2.5 py-1 text-[11px] font-medium text-emerald-200 hover:bg-emerald-900/70"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Revert</span>
            </button>
          </div>
        </div>
      )}

      {/* Editor Content Canvas */}
      <div className="flex-1 overflow-y-auto p-10">
        <div className="mx-auto max-w-[75ch] space-y-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {INITIAL_DOC.title}
            </h1>
            <p className="mono mt-2 text-xs text-muted-foreground">
              {INITIAL_DOC.words} words · Edited {INITIAL_DOC.updated} · English (US)
            </p>
          </div>

          <div className="space-y-4 text-base leading-relaxed text-foreground/90 font-serif">
            <p>{paragraphs[0] || INITIAL_DOC.content}</p>

            {/* Render passage with approval bracket if active */}
            {activeApproval ? (
              <div className="relative my-3 rounded-md border-l-2 border-emerald-500 bg-emerald-500/10 p-3 text-emerald-100">
                <div className="flex items-center justify-between pb-1.5 text-xs text-emerald-400 font-sans">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="h-3 w-3" /> AI Proposed Rewrite
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleApprove}
                      className="rounded bg-emerald-600/80 p-1 hover:bg-emerald-500 text-white"
                      title="Approve rewrite"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      onClick={handleRevert}
                      className="rounded bg-emerald-900/80 p-1 hover:bg-emerald-800 text-emerald-200"
                      title="Revert rewrite"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <p className="line-through opacity-60 text-sm mb-1">{activeApproval.original}</p>
                <p className="font-semibold text-emerald-200">{activeApproval.suggested}</p>
              </div>
            ) : (
              <p>{paragraphs[1]}</p>
            )}

            {paragraphs[2] && <p>{paragraphs[2]}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   2. DOCUMENTS & PROJECTS OVERVIEW PAGE
   ========================================================================= */

function DocumentsPage() {
  const [filter, setFilter] = useState('all')

  const docs = [
    {
      title: 'Local Intelligence Architecture Draft',
      project: 'Engineering',
      words: 482,
      remarks: 2,
      updated: '2h ago'
    },
    {
      title: 'Quarterly Shareholder Letter',
      project: 'Business',
      words: 1240,
      remarks: 0,
      updated: '1d ago'
    },
    {
      title: 'System Prompt Engineering Guide',
      project: 'Research',
      words: 890,
      remarks: 4,
      updated: '3d ago'
    },
    {
      title: 'Product Launch Narrative',
      project: 'Marketing',
      words: 615,
      remarks: 1,
      updated: '5d ago'
    }
  ]

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Manuscripts & Documents</h2>
          <p className="text-xs text-muted-foreground">
            Manage your project vaults, drafts, and active review threads
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:opacity-90">
          <Plus className="h-3.5 w-3.5" />
          <span>New Document</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatTile label="Total Documents" value="4" delta="+2 this week" progress={75} />
        <StatTile label="Words Penned" value="3,227" delta="+1.2k" progress={65} />
        <StatTile label="Active Remarks" value="7" delta="+3 pending AI" progress={40} />
        <StatTile label="Rules Enforced" value="4 / 40" delta="10% active" progress={10} />
      </div>

      <div className="space-y-3">
        <FilterChips
          options={['all', 'Engineering', 'Business', 'Research', 'Marketing']}
          value={filter}
          onChange={setFilter}
        />

        <div className="space-y-2">
          {docs
            .filter((d) => filter === 'all' || d.project === filter)
            .map((doc) => (
              <div
                key={doc.title}
                className="glass flex items-center justify-between px-4 py-3 hover:border-primary/50 transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{doc.title}</h3>
                    <p className="mono text-[11px] text-muted-foreground">
                      {doc.project} · {doc.words} words
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  {doc.remarks > 0 ? (
                    <span className="rounded bg-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {doc.remarks} remarks
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-[11px]">Clean</span>
                  )}
                  <span className="mono text-muted-foreground text-[11px]">{doc.updated}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   3. STYLE GUIDELINES & RULES PAGE
   ========================================================================= */

function InstructionsPage() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([
    'Technical',
    'Essays',
    'Product Spec'
  ])

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h2 className="text-xl font-semibold">Style, Genres & Writing Rules</h2>
        <p className="text-xs text-muted-foreground">
          Define tone constraints and synthesis principles enforced by the local AI engine
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <GlassCard
          title="Active Writing Genres"
          subtitle="Select target tones for auto-suggestions"
        >
          <div className="flex flex-wrap gap-2 pt-2">
            {GENRES.map((g) => {
              const active = selectedGenres.includes(g)
              return (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'border border-card-border bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground'
                  }`}
                >
                  {g}
                </button>
              )
            })}
          </div>
        </GlassCard>

        <GlassCard title="Document Voice Prompt" subtitle="Custom prompt instructions">
          <textarea
            className="w-full rounded-md border border-card-border/70 bg-black/20 p-3 text-xs leading-relaxed text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
            rows={4}
            defaultValue="Write for senior technical architects. Prioritize conciseness, concrete architectural tradeoffs, and avoid marketing fluff or buzzwords."
          />
        </GlassCard>
      </div>

      <GlassCard title="Synthesized Writing Rules" subtitle="Extracted from accepted critique">
        <div className="space-y-2 pt-2">
          {RULES.map((rule, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded border border-card-border/60 bg-card/40 px-3.5 py-2 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="mono flex h-5 w-5 items-center justify-center rounded bg-primary/20 text-[10px] font-bold text-primary">
                  {idx + 1}
                </span>
                <span className="text-foreground">{rule}</span>
              </div>
              <button className="text-muted-foreground hover:text-rose-400">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

/* =========================================================================
   4. CONTEXTUAL REVIEW & REMARKS RIGHT DOCK
   ========================================================================= */

function ReviewDock() {
  const [remarks, setRemarks] = useState<RemarkItem[]>(INITIAL_REMARKS)
  const [autoSuggest, setAutoSuggest] = useState(true)

  const handleApply = (id: string) => {
    setRemarks((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'applied' } : r)))
  }

  const handleSkip = (id: string) => {
    setRemarks((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-card-border pb-3">
          <div className="flex items-center gap-2">
            <h3 className="mono text-xs font-bold tracking-wider uppercase text-foreground">
              Remarks
            </h3>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary">
              {remarks.length}
            </span>
          </div>
          <button className="text-[11px] font-medium text-primary hover:underline">
            Apply all ({remarks.length})
          </button>
        </div>

        {/* Suggestion & Remarks Cards */}
        <div className="space-y-3">
          {remarks.map((rem) => (
            <div
              key={rem.id}
              className={`rounded-lg border p-3.5 transition-all ${
                rem.isAi
                  ? 'border-emerald-500/30 bg-emerald-950/20'
                  : 'border-card-border bg-card/60'
              }`}
            >
              <div className="flex items-center justify-between pb-1.5">
                {rem.isAi ? (
                  <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    <Sparkles className="h-2.5 w-2.5" /> AI SUGGESTION
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    ACTIVE REMARK
                  </span>
                )}
                <span className="mono text-[10px] text-muted-foreground">Tab to remark</span>
              </div>

              <blockquote className="my-1.5 border-l-2 border-primary/50 pl-2 text-xs italic text-muted-foreground">
                &ldquo;{rem.passage}&rdquo;
              </blockquote>

              <p className="text-xs text-foreground/90 font-medium mb-2">{rem.critique}</p>

              <div className="flex items-center justify-between pt-2 border-t border-card-border/50">
                <button
                  onClick={() => handleSkip(rem.id)}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Skip
                </button>
                <button
                  onClick={() => handleApply(rem.id)}
                  className="flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow hover:opacity-90"
                >
                  <Check className="h-3 w-3" />
                  <span>Apply</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions for this document */}
        <div className="rounded-lg border border-card-border/70 bg-card/40 p-3 text-xs">
          <div className="flex items-center justify-between pb-1 text-muted-foreground">
            <span className="font-semibold uppercase text-[10px]">Instructions for this doc</span>
            <Settings2 className="h-3 w-3" />
          </div>
          <p className="text-[11px] text-foreground/80">
            Check grammar, conciseness, and active voice.
          </p>
        </div>
      </div>

      {/* Auto-suggest footer toggle */}
      <div className="flex items-center justify-between border-t border-card-border pt-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoSuggest(!autoSuggest)}
            className={`h-4 w-7 rounded-full p-0.5 transition-colors ${
              autoSuggest ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`h-3 w-3 rounded-full bg-white transition-transform ${
                autoSuggest ? 'translate-x-3' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="mono text-[11px] text-muted-foreground">AUTO-SUGGEST</span>
        </div>
        <button className="text-[11px] font-medium text-primary hover:underline">
          Suggest now
        </button>
      </div>
    </div>
  )
}

/* =========================================================================
   5. TEMPLATE CONTRACT EXPORT
   ========================================================================= */

export const writerTemplate: AppTemplate = {
  id: 'writer',
  name: 'AI Writing Studio',
  tagline: 'Document studio with inline critique, review brackets, and style instructions.',
  description:
    'A modern AI writing and editing studio (inspired by Lex, Notion AI, and Hemingway). Features document management, rich text editing with in-place AI rewrite approval brackets, custom genre and style instructions, and a contextual review dock.',
  icon: PenTool,
  home: 'editor',
  preset: 'dark-indigo',
  layout: {
    leftWidth: 250,
    rightOpen: true,
    rightWidth: 320,
    tabsCollapsed: false,
    bottomOpen: false
  },
  pages: [
    {
      id: 'editor',
      label: 'Studio Editor',
      description: 'Prose surface with in-place AI review brackets',
      category: 'Writing',
      icon: PenTool,
      component: EditorPage,
      rightPanel: ReviewDock,
      showInSidebar: true
    },
    {
      id: 'documents',
      label: 'Documents',
      description: 'Manuscripts, drafts, and active projects',
      category: 'Writing',
      icon: Files,
      component: DocumentsPage,
      showInSidebar: true
    },
    {
      id: 'instructions',
      label: 'Style & Guidelines',
      description: 'Writing rules, tone constraints, and genre prompts',
      category: 'Writing',
      icon: Sliders,
      component: InstructionsPage,
      showInSidebar: true
    }
  ],
  dataShape:
    'projects: [{ id, name, documents: [{ id, title, content, wordCount, remarks: [{ id, passage, critique, suggestion, status }] }] }], instructions: { language, genres[], customPrompt, rules[] }',
  extendWith: [
    'local Ollama LLM integration',
    'export to Markdown / DOCX / PDF',
    'diff history timeline',
    'custom writing rules synthesis'
  ]
}
