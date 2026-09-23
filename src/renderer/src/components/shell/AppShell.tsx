import { BottomPanel } from '@renderer/components/shell/BottomPanel'
import { FooterBar } from '@renderer/components/shell/FooterBar'
import { RightPanel } from '@renderer/components/shell/RightPanel'
import { ResizeHandle } from '@renderer/components/shell/ResizeHandle'
import { Sidebar } from '@renderer/components/shell/Sidebar'
import { TabBar } from '@renderer/components/shell/TabBar'
import { StudioLayout } from '@renderer/components/shell/StudioLayout'
import { CompactLayout } from '@renderer/components/shell/CompactLayout'
import { useTabsStore } from '@renderer/stores/tabs-store'
import { useUiStore } from '@renderer/stores/ui-store'
import { useCockpitStore } from '@renderer/stores/cockpit-store'
import { useGlobalShortcuts } from '@renderer/lib/useGlobalShortcuts'
import { CommandPalette } from '@renderer/components/palette/CommandPalette'
import { GitDiffModal } from '@renderer/components/git/GitDiffModal'
import { BranchSwitchboardDialog } from '@renderer/components/git/BranchSwitchboardDialog'
import { GitUpdateDialog } from '@renderer/components/git/GitUpdateDialog'
import { useEffect, useState } from 'react'
import type { PageDefinition } from '@renderer/types/pages'
import type { ShellMode, ShellSlots } from '@renderer/types/shell'

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
  /**
   * Composition mode. Defaults to `dashboard`, so every existing app is
   * unaffected by this prop.
   *
   *   dashboard  tabs as navigation, page registry, per-page right inspector
   *   studio     sidebar tree as navigation, document action bar
   *   compact    navigation folded into the top bar, full-bleed content
   */
  mode?: ShellMode
  /** Mode-specific content — see ShellSlots. */
  slots?: ShellSlots
}

/**
 * The reusable layout engine.
 *
 * Supports three native compositions (`dashboard`, `studio`, `compact`):
 * - `dashboard`: Primary house layout with collapsible sidebar, dynamic tab strip,
 *   content workspace, per-page right inspector, bottom panel, and status footer.
 * - `studio`: Content-first composition with hierarchical workspace tree sidebar,
 *   document action bar, and contextual review dock (see docs/SHELL-MODES.md).
 * - `compact`: Streamlined utility layout with folded top bar navigation and full-bleed content.
 */
export function AppShell({ pages, title = 'App Shell', mode = 'dashboard', slots }: AppShellProps) {
  const { activeId, setActive } = useTabsStore()
  const {
    paletteOpen,
    setPaletteOpen,
    diffRepo,
    closeDiff,
    branchRepo,
    closeBranchSwitchboard,
    updateRepo,
    closeGitUpdate,
    openDiff,
    openBranchSwitchboard,
    openGitUpdate
  } = useUiStore()
  const { refresh } = useCockpitStore()
  const [platform, setPlatform] = useState<string | undefined>(undefined)

  useGlobalShortcuts({
    onTogglePalette: () => setPaletteOpen(!paletteOpen)
  })

  useEffect(() => {
    window.api?.app
      ?.ping?.()
      .then((r: { pong: boolean; platform: string }) => setPlatform(r.platform))
      .catch(() => {})
  }, [])

  const activePage = pages.find((p) => p.id === activeId) ?? pages[0]

  const modals = (
    <>
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onOpenDiff={openDiff}
        onOpenBranches={openBranchSwitchboard}
        onOpenUpdate={openGitUpdate}
      />
      <GitDiffModal
        repo={diffRepo}
        open={Boolean(diffRepo)}
        onOpenChange={(open) => !open && closeDiff()}
        onChanged={() => void refresh(false)}
      />
      <BranchSwitchboardDialog
        repo={branchRepo}
        open={Boolean(branchRepo)}
        onOpenChange={(open) => !open && closeBranchSwitchboard()}
        onChanged={() => void refresh(false)}
      />
      <GitUpdateDialog
        repoIdOrPath={updateRepo?.id}
        repoName={updateRepo?.name}
        open={Boolean(updateRepo)}
        onOpenChange={(open) => !open && closeGitUpdate()}
        onUpdated={() => void refresh(false)}
      />
    </>
  )

  if (mode === 'studio') {
    return (
      <>
        <StudioLayout
          pages={pages}
          activeId={activePage.id}
          onSelect={setActive}
          title={title}
          platform={platform}
          slots={slots}
        />
        {modals}
      </>
    )
  }

  if (mode === 'compact') {
    return (
      <>
        <CompactLayout
          pages={pages}
          activeId={activePage.id}
          onSelect={setActive}
          title={title}
          platform={platform}
          slots={slots}
        />
        {modals}
      </>
    )
  }

  // ── dashboard (original composition, unchanged) ─────────────────────────
  return (
    <>
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
                {slots?.content ?? <activePage.component />}
              </main>
              {slots?.rightDock ? (
                <>
                  <ResizeHandle side="right" />
                  <RightPanel>{slots.rightDock}</RightPanel>
                </>
              ) : activePage.rightPanel ? (
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

        {/* Collapsible bottom panel (PTY docks into it via slots.bottomDock) */}
        <BottomPanel>{slots?.bottomDock}</BottomPanel>

        {/* Full-width footer frame */}
        <FooterBar appName={title} />
      </div>
      {modals}
    </>
  )
}
