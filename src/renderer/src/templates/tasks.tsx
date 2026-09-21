import { Calendar, CheckCircle2, Kanban, ListTodo } from 'lucide-react'
import { GlassCard, StatTile, FilterChips, EmptyState } from '@renderer/widgets'
import { useState } from 'react'
import type { AppTemplate } from './types'

/**
 * TASKS / KANBAN — 23 shipped Electron apps
 * (Trello, Super Productivity, Vikunja, Everdo, Brisqi) plus 7,141 GitHub
 * repos under `project-management` and 3,616 under `kanban`.
 *
 * Column board + task detail. The board is plain flex, so drag-and-drop is
 * additive rather than baked in.
 */

const COLUMNS = [
  { name: 'Backlog', items: ['Pricing page copy', 'Vendor review', 'SLA wording'] },
  { name: 'In progress', items: ['Neon migration', 'Billing webhooks'] },
  { name: 'Review', items: ['Auth hardening'] },
  { name: 'Done', items: ['Preset layer', 'Widget kit'] }
]

function Board() {
  return (
    <div className="h-full overflow-x-auto p-6">
      <div className="flex min-h-0 gap-3">
        {COLUMNS.map((c) => (
          <div key={c.name} className="w-64 shrink-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {c.name}
              </span>
              <span className="mono text-[10px] text-muted-foreground/60">{c.items.length}</span>
            </div>
            <div className="space-y-2">
              {c.items.map((t) => (
                <div key={t} className="glass px-3 py-2">
                  <p className="text-xs">{t}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="chip" style={{ height: '1.25rem', fontSize: '10px' }}>
                      agent
                    </span>
                    <span className="mono text-[10px] text-muted-foreground">2d</span>
                  </div>
                </div>
              ))}
              <button
                className="w-full rounded-md px-3 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:bg-accent/60"
                style={{ border: '1px dashed hsl(var(--border))' }}
              >
                + add task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Today() {
  const [filter, setFilter] = useState('all')
  return (
    <div className="space-y-4 p-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Due today" value="6" delta="+2" progress={60} />
        <StatTile label="Overdue" value="1" delta="-1" progress={10} />
        <StatTile label="Done this week" value="24" delta="+8" progress={80} />
      </div>
      <FilterChips options={['all', 'today', 'week']} value={filter} onChange={setFilter} />
      <GlassCard title="Today" subtitle="Sorted by due time">
        <div className="space-y-1.5">
          {['SLA wording', 'Neon migration', 'Billing webhooks'].map((t) => (
            <div
              key={t}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/60"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="flex-1 text-xs">{t}</span>
              <span className="mono text-[10px] text-muted-foreground">18:00</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

function Timeline() {
  return (
    <div className="space-y-3 p-6">
      <GlassCard title="Upcoming" subtitle="Next 14 days" icon={Calendar}>
        {['Sprint review — Fri', 'Billing cutover — Mon', 'Board sync — Wed'].map((e) => (
          <div key={e} className="flex items-center gap-2 py-1.5">
            <span className="dot" style={{ background: 'hsl(var(--primary))' }} />
            <span className="text-xs">{e}</span>
          </div>
        ))}
      </GlassCard>
      <EmptyState
        title="Nothing scheduled further out"
        hint="Tasks with a due date beyond two weeks appear here."
      />
    </div>
  )
}

export const tasksTemplate: AppTemplate = {
  id: 'tasks',
  name: 'Tasks',
  tagline: 'Kanban board with a today view.',
  description:
    'Twenty-three shipped task apps plus thousands of tutorial repos. A column board, a today list with due times, and a timeline. The board is plain flex so drag-and-drop is a later addition, not a rewrite.',
  icon: Kanban,
  home: 'board',
  preset: 'noguchi',
  layout: { leftWidth: 210, rightOpen: true, rightWidth: 280, bottomOpen: false },
  pages: [
    { id: 'board', label: 'Board', description: 'Kanban columns', icon: Kanban, component: Board },
    { id: 'today', label: 'Today', description: 'Due now', icon: ListTodo, component: Today },
    {
      id: 'timeline',
      label: 'Timeline',
      description: 'Upcoming',
      icon: Calendar,
      component: Timeline,
      rightPanel: Timeline
    }
  ],
  dataShape:
    'tasks: [{ id, title, column, dueAt, tags[], assignee }], columns: [{ id, name, order }]',
  extendWith: [
    'drag and drop between columns',
    'recurring tasks',
    'local sqlite persistence',
    'desktop reminders'
  ]
}
