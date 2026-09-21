import { AppWindow, Grid3x3, Plus, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { GlassCard, FilterChips } from '@renderer/widgets'
import type { AppTemplate } from './types'

/**
 * WORKSPACE — the all-in-one wrapper
 * (Franz, Rambox, Station, WebCatalog, Shift, Multrin, Sidebar-style apps)
 *
 * The lowest-effort, highest-demand client build: several web services in
 * one desktop window with their own sessions. Eleven apps in the registry
 * are purely this, and more hide inside "Productivity".
 *
 * Webviews live in the main process; this is the chrome around them.
 */

const SERVICES = [
  { name: 'Gmail', url: 'mail.google.com', unread: 12, color: '#c4453a' },
  { name: 'Calendar', url: 'calendar.google.com', unread: 0, color: '#3d6fb5' },
  { name: 'Slack', url: 'app.slack.com', unread: 4, color: '#5a4d9e' },
  { name: 'Linear', url: 'linear.app', unread: 7, color: '#7d6bc9' },
  { name: 'Notion', url: 'notion.so', unread: 0, color: '#4a4a4a' },
  { name: 'GitHub', url: 'github.com', unread: 3, color: '#2f6f4f' }
]

function Services() {
  const [filter, setFilter] = useState('all')
  const shown = filter === 'unread' ? SERVICES.filter((s) => s.unread > 0) : SERVICES
  return (
    <div className="space-y-4 p-6">
      <FilterChips options={['all', 'unread']} value={filter} onChange={setFilter} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((s) => (
          <div key={s.name} className="glass flex items-center gap-3 p-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold text-white"
              style={{ background: s.color }}
            >
              {s.name.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{s.name}</p>
              <p className="mono truncate text-[10px] text-muted-foreground">{s.url}</p>
            </div>
            {s.unread > 0 && (
              <span
                className="mono shrink-0 rounded-full px-1.5 text-[10px]"
                style={{
                  background: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))'
                }}
              >
                {s.unread}
              </span>
            )}
          </div>
        ))}
        <button
          className="flex items-center justify-center gap-2 rounded-lg p-3 text-xs text-muted-foreground transition-colors hover:bg-accent/60"
          style={{ border: '1px dashed hsl(var(--border))' }}
        >
          <Plus className="h-3.5 w-3.5" /> Add a service
        </button>
      </div>
    </div>
  )
}

function Sessions() {
  return (
    <div className="space-y-3 p-6">
      <GlassCard title="Sessions" subtitle="Each service gets its own partition">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Isolation is the whole point of this template: every service loads in its own
          <code className="mono mx-1 rounded bg-muted px-1">partition</code>, so logging into one
          account never leaks cookies into another. That is what makes a wrapper viable for work
          accounts.
        </p>
      </GlassCard>
      <GlassCard title="Shortcuts" subtitle="Per service">
        <div className="mono space-y-1 text-[11px] text-muted-foreground">
          <p>ctrl+1 · Gmail</p>
          <p>ctrl+2 · Calendar</p>
          <p>ctrl+3 · Slack</p>
        </div>
      </GlassCard>
    </div>
  )
}

export const workspaceTemplate: AppTemplate = {
  id: 'workspace',
  name: 'Workspace',
  tagline: 'Many web services in one isolated window.',
  description:
    'The all-in-one wrapper (Franz, Rambox, Station, WebCatalog): several web services side by side, each in its own session partition, with per-service shortcuts. The lowest-effort, highest-demand client build there is.',
  icon: AppWindow,
  home: 'services',
  preset: 'frost',
  layout: {
    leftWidth: 90,
    rightOpen: true,
    rightWidth: 280,
    tabsCollapsed: true,
    bottomOpen: false
  },
  pages: [
    {
      id: 'services',
      label: 'Services',
      description: 'Your accounts',
      icon: Grid3x3,
      component: Services
    },
    {
      id: 'sessions',
      label: 'Sessions',
      description: 'Isolation + shortcuts',
      icon: Settings2,
      component: Sessions,
      rightPanel: Sessions
    }
  ],
  dataShape:
    'services: [{ id, name, url, partition, badge, muted }], shortcuts: [{ serviceId, accelerator }]',
  extendWith: [
    'webview or BrowserView host per service',
    'per-service notification badges',
    'custom user-agent per service',
    'workspace profiles (work / personal)'
  ]
}
