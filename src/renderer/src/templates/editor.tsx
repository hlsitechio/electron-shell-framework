import { Code2, FileCode, GitBranch, Terminal as TermIcon } from 'lucide-react'
import { GlassCard, TerminalWidget } from '@renderer/widgets'
import type { AppTemplate } from './types'

/**
 * CODE EDITOR / IDE — 83 shipped Electron apps (largest category)
 * (VS Code, Graviton, Light Table, Bootstrap Studio, Blockbench, PlayCode)
 *
 * Ships the explorer + editor + terminal + git triad. Swap the <pre> for
 * Monaco/CodeMirror and the tree for a real FS read over IPC.
 */

const TREE = [
  'src/',
  '  main/',
  '    index.ts',
  '    ipc.ts',
  '  renderer/',
  '    App.tsx',
  '    registry.tsx',
  'package.json'
]

function EditorSurface() {
  return (
    <div className="grid h-full" style={{ gridTemplateColumns: '200px 1fr' }}>
      <div className="overflow-y-auto p-3" style={{ borderRight: '1px solid hsl(var(--border))' }}>
        <p className="mono mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          explorer
        </p>
        {TREE.map((f) => (
          <div
            key={f}
            className="mono truncate px-1 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
          >
            {f}
          </div>
        ))}
      </div>
      <div className="overflow-y-auto p-4">
        <pre className="mono text-[11.5px] leading-relaxed text-muted-foreground">
          {`export function registerIpc(): void {
  ipcMain.handle('config:get', (_e, key) => configStore.get(key, null))
  ipcMain.handle('config:set', (_e, key, value) => {
    configStore.set(key, value)
    return true
  })

  ipcMain.on('window:minimize', (e) =>
    BrowserWindow.fromWebContents(e.sender)?.minimize())
}`}
        </pre>
      </div>
    </div>
  )
}

function Problems() {
  return (
    <div className="space-y-3 p-6">
      <GlassCard title="Problems" subtitle="0 errors · 2 warnings">
        <div className="space-y-1.5">
          {['src/main/ipc.ts:42 — unused parameter', 'src/renderer/App.tsx:8 — missing key'].map(
            (p) => (
              <div key={p} className="flex items-center gap-2">
                <span className="dot" style={{ background: 'hsl(var(--warning))' }} />
                <span className="mono text-[11px]">{p}</span>
              </div>
            )
          )}
        </div>
      </GlassCard>
      <TerminalWidget
        title="build"
        lines={[
          { key: 'typecheck', value: 'clean', tone: 'success' },
          { key: 'lint', value: '0 problems', tone: 'success' },
          { key: 'test', value: '27 passed', tone: 'success' }
        ]}
      />
    </div>
  )
}

function GitPanel() {
  return (
    <div className="space-y-3 p-6">
      <GlassCard title="Working tree" subtitle="3 changed files">
        <div className="mono space-y-1 text-[11px]">
          <p style={{ color: 'hsl(var(--success))' }}>M src/main/ipc.ts</p>
          <p style={{ color: 'hsl(var(--success))' }}>A src/templates/notes.tsx</p>
          <p style={{ color: 'hsl(var(--warning))' }}>M README.md</p>
        </div>
      </GlassCard>
      <TerminalWidget
        title="git log"
        lines={[
          { key: 'HEAD', value: 'a3cc623 feat: transform', tone: 'accent' },
          { key: 'HEAD~1', value: '5fc3bb9 chore: purge', tone: 'muted' }
        ]}
      />
    </div>
  )
}

export const editorTemplate: AppTemplate = {
  id: 'editor',
  name: 'Code Editor',
  tagline: 'Explorer, code surface, terminal and git panel.',
  description:
    'The single largest Electron category (83 shipped apps). A narrow explorer, a wide editor surface, a bottom terminal strip and a git panel — monochrome by default so your syntax colors are the only color on screen.',
  icon: Code2,
  home: 'editor',
  preset: 'carbon',
  layout: { leftWidth: 190, rightOpen: false, tabsCollapsed: false, bottomOpen: true },
  pages: [
    {
      id: 'editor',
      label: 'Editor',
      description: 'Tree + code',
      icon: FileCode,
      component: EditorSurface
    },
    {
      id: 'problems',
      label: 'Problems',
      description: 'Diagnostics',
      icon: TermIcon,
      component: Problems,
      rightPanel: Problems
    },
    {
      id: 'git',
      label: 'Source Control',
      description: 'Changes + log',
      icon: GitBranch,
      component: GitPanel
    }
  ],
  dataShape:
    'tree: [{ path, kind }], file: { path, language, content }, diagnostics: [{ path, line, message, severity }]',
  extendWith: [
    'Monaco or CodeMirror',
    'file system over IPC',
    'language server diagnostics',
    'command palette'
  ]
}
