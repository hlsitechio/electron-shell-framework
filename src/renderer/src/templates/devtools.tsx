import { Database, ListTree, Send, Terminal as TermIcon } from 'lucide-react'
import { useState } from 'react'
import { GlassCard, DataTable, FilterChips, TerminalWidget } from '@renderer/widgets'
import type { AppTemplate } from './types'

/**
 * DEV TOOLS — 138 shipped apps in this category
 * Database GUI 26 (MongoDB Compass, Postico, Antares, Beekeeper, Redis GUI)
 * API/HTTP/GraphQL 11 (Postman, Insomnia, HTTP Toolkit, Advanced REST Client)
 * Terminal 15 (Hyper, Tabby, Extraterm)
 *
 * The classic Electron sweet spot: a remote service + a fast local UI +
 * a persisted connection list. No heavy compute, easy to sell.
 */

const TABLES = [
  { table: 'users', rows: '412K', size: '88 MB' },
  { table: 'memories', rows: '1.2M', size: '640 MB' },
  { table: 'agents', rows: '38', size: '96 KB' },
  { table: 'events', rows: '8.4M', size: '2.1 GB' }
]

function QueryPanel() {
  return (
    <div className="space-y-4 p-6">
      <GlassCard title="Query" subtitle="Cmd+Enter to run">
        <pre
          className="mono rounded-md p-3 text-[11.5px] leading-relaxed"
          style={{ background: 'hsl(var(--background) / 0.6)' }}
        >
          {`select workspace_id, count(*) as n
from memories
where created_at > now() - interval '7 days'
group by 1
order by n desc;`}
        </pre>
      </GlassCard>
      <DataTable
        columns={[
          { key: 'workspace_id', label: 'workspace_id' },
          { key: 'n', label: 'count', numeric: true }
        ]}
        rows={[
          { workspace_id: 'org_3He74aex…', n: '18,204' },
          { workspace_id: 'org_2f8bc1…', n: '4,112' },
          { workspace_id: 'org_9da77e…', n: '902' }
        ]}
      />
    </div>
  )
}

function SchemaPanel() {
  return (
    <div className="space-y-3 p-6">
      <GlassCard title="Tables" subtitle="4 relations · 3.0 GB">
        <div className="space-y-1.5">
          {TABLES.map((t) => (
            <div
              key={t.table}
              className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent/60"
            >
              <Database className="h-3 w-3 shrink-0" style={{ color: 'hsl(var(--primary))' }} />
              <span className="mono flex-1 text-[11px]">{t.table}</span>
              <span className="mono text-[10px] text-muted-foreground">{t.rows}</span>
              <span className="mono text-[10px] text-muted-foreground">{t.size}</span>
            </div>
          ))}
        </div>
      </GlassCard>
      <TerminalWidget
        title="connection"
        lines={[
          { key: 'host', value: 'ep-patient-fog-ay2gr5np.neon.tech', tone: 'accent' },
          { key: 'ssl', value: 'required', tone: 'success' },
          { key: 'pool', value: '2 / 10 active', tone: 'muted' }
        ]}
      />
    </div>
  )
}

function ApiPanel() {
  const [method, setMethod] = useState('GET')
  return (
    <div className="space-y-4 p-6">
      <FilterChips options={['GET', 'POST', 'PUT', 'DELETE']} value={method} onChange={setMethod} />
      <GlassCard title="Request" subtitle={`${method} https://memorify.dev/api/v1`}>
        <pre
          className="mono rounded-md p-3 text-[11.5px] leading-relaxed"
          style={{ background: 'hsl(var(--background) / 0.6)' }}
        >
          {`{
  "agent": "jack-hermes",
  "action": "memory.recall",
  "input": { "query": "pricing model", "limit": 5 }
}`}
        </pre>
      </GlassCard>
      <GlassCard title="Response" subtitle="200 OK · 84 ms">
        <div className="mono space-y-1 text-[11px] text-muted-foreground">
          <p>content-type · application/json</p>
          <p>x-ratelimit-remaining · 96</p>
        </div>
      </GlassCard>
    </div>
  )
}

export const devtoolsTemplate: AppTemplate = {
  id: 'devtools',
  name: 'Dev Tools',
  tagline: 'Database GUI, API client and terminal in one shell.',
  description:
    'The most-proven Electron archetype: a remote service plus a fast local UI and a saved connection list. Combines the three highest-value dev sub-shapes — database GUI (26 apps), HTTP/GraphQL client (11) and terminal (15).',
  icon: Database,
  home: 'query',
  preset: 'poiesis-blue',
  layout: { leftWidth: 210, rightOpen: true, rightWidth: 300, bottomOpen: true },
  pages: [
    {
      id: 'query',
      label: 'Query',
      description: 'SQL + results',
      icon: Database,
      component: QueryPanel
    },
    {
      id: 'schema',
      label: 'Schema',
      description: 'Tables + connection',
      icon: ListTree,
      component: SchemaPanel,
      rightPanel: SchemaPanel
    },
    {
      id: 'api',
      label: 'API Client',
      description: 'Requests + responses',
      icon: Send,
      component: ApiPanel
    },
    {
      id: 'terminal',
      label: 'Terminal',
      description: 'Shell',
      icon: TermIcon,
      component: SchemaPanel
    }
  ],
  dataShape:
    'connections: [{ id, name, driver, host, ssl }], resultSets: [{ columns[], rows[] }], requests: [{ id, method, url, headers, body }]',
  extendWith: [
    'pg/mysql/sqlite drivers over IPC',
    'query history',
    'saved request collections',
    'SSH tunnel'
  ]
}
