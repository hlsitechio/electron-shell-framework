import { StudioSidebar } from './StudioSidebar'
import { StudioTopBar } from './StudioTopBar'
import { RightPanel } from './RightPanel'
import { ResizeHandle } from './ResizeHandle'
import type { ShellModeProps } from '@renderer/types/shell'

/**
 * Studio layout — content-first composition.
 *
 * No tab strip: the tree navigates. No footer bar: a studio wants the full
 * height for the document. The right dock appears only when the app supplies
 * content for it, so a document with no remarks is a wider canvas.
 */
export function StudioLayout({ pages, activeId, platform, slots }: ShellModeProps) {
  const activePage = pages.find((p) => p.id === activeId) ?? pages[0]

  const rightDock = slots?.rightDock ?? (activePage?.rightPanel ? <activePage.rightPanel /> : null)

  return (
    <div
      className="flex h-full w-full overflow-hidden"
      style={{ background: 'hsl(var(--background))' }}
    >
      <StudioSidebar
        header={slots?.sidebarHeader}
        sectionLabel="Workspace"
        footer={slots?.sidebarFooter}
      >
        {slots?.sidebarTree}
      </StudioSidebar>

      <ResizeHandle side="left" />

      <div className="flex min-w-0 flex-1 flex-col">
        <StudioTopBar
          breadcrumb={slots?.breadcrumb}
          actions={slots?.topBarActions}
          isMac={platform === 'darwin'}
        />

        <div className="flex min-h-0 flex-1">
          <main
            className="min-w-0 flex-1 overflow-auto"
            style={{
              background:
                'radial-gradient(900px 600px at 30% -8%, hsl(var(--accent) / 0.06), transparent 55%), hsl(var(--content-bg))'
            }}
          >
            {slots?.content ?? (activePage ? <activePage.component /> : null)}
          </main>

          {rightDock && (
            <>
              <ResizeHandle side="right" />
              <RightPanel>{rightDock}</RightPanel>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
