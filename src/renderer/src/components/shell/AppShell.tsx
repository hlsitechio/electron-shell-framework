import { BottomPanel } from '@renderer/components/shell/BottomPanel'
import { FooterBar } from '@renderer/components/shell/FooterBar'
import { RightPanel } from '@renderer/components/shell/RightPanel'
import { ResizeHandle } from '@renderer/components/shell/ResizeHandle'
import { Sidebar } from '@renderer/components/shell/Sidebar'
import { TabBar } from '@renderer/components/shell/TabBar'
import { useTabsStore } from '@renderer/stores/tabs-store'
import { useEffect, useState } from 'react'
import type { PageDefinition } from '@renderer/types/pages'

/** Fallback content shown when the active page declares no rightPanel. */
function DefaultRightPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Context</h3>
        <p className="text-xs text-muted-foreground">
          No page-specific panel declared — register a `rightPanel` in the page entry to fill this.
        </p>
      </div>
    </div>
  )
}

interface AppShellProps {
  pages: PageDefinition[]
  title?: string
}

/**
 * The reusable layout engine.
 *
 *   ┌──────────┬───────────────────────────────────────┬──────────┐
 *   │          │ TabBar — single top bar: tabs + collapse + controls │          │
 *   │  Left    ├───────────────────────────────────────┤  Right   │
 *   │ Sidebar  │ TabBar (pages from the registry)      │  Panel   │
 *   │ (nav,    ├───────────────────────────────────────┤ (page    │
 *   │  collaps-│ Content — active page                 │  context)│
 *   │  ible)   │                                       │          │
 *   └──────────┴───────────────────────────────────────┴──────────┘
 *   ┌───────────────────────────────────────────────────────────┐
 *   │ FooterBar — full-width status frame                       │
 *   └───────────────────────────────────────────────────────────┘
 */
export function AppShell({ pages, title = 'App Shell' }: AppShellProps) {
  const { activeId, setActive } = useTabsStore()
  const [platform, setPlatform] = useState<string | undefined>(undefined)

  useEffect(() => {
    window.api?.app
      ?.ping?.()
      .then((r: { pong: boolean; platform: string }) => setPlatform(r.platform))
      .catch(() => {})
  }, [])

  const activePage = pages.find((p) => p.id === activeId) ?? pages[0]

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
      style={{ background: 'hsl(var(--background))' }}
    >
      <div className="flex min-h-0 flex-1">
        {/* Left sidebar rail */}
        <Sidebar pages={pages} activeId={activePage.id} onSelect={setActive} />
        <ResizeHandle side="left" />

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <TabBar pages={pages} platform={platform} />
          <div className="flex min-h-0 flex-1">
            <main
              className="min-w-0 flex-1 overflow-auto"
              style={{
                background:
                  'radial-gradient(1100px 700px at 28% -5%, hsl(var(--accent) / 0.10), transparent 55%), hsl(var(--content-bg))'
              }}
            >
              <activePage.component />
            </main>
            {activePage.rightPanel ? (
              <>
                <ResizeHandle side="right" />
                <RightPanel>
                  <activePage.rightPanel />
                </RightPanel>
              </>
            ) : (
              <>
                <ResizeHandle side="right" />
                <RightPanel>
                  <DefaultRightPanel />
                </RightPanel>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible bottom panel (terminal-style) */}
      <BottomPanel />

      {/* Full-width footer frame */}
      <FooterBar appName={title} />
    </div>
  )
}
