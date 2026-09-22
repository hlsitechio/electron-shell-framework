import type { ReactNode } from 'react'

interface StudioTopBarProps {
  /** Breadcrumb / document path — left side. */
  breadcrumb?: ReactNode
  /** Doc-level actions: word count, revisions, export… — right side, before controls. */
  actions?: ReactNode
  /** Window controls visibility (auto from platform). */
  isMac?: boolean
}

import { WindowControls } from './WindowControls'

/**
 * Studio top bar — a document action bar, not a tab strip.
 *
 * The dashboard top bar (`TabBar`) IS the navigation: tabs are how you move
 * between pages. A studio app navigates through the sidebar tree instead, so its
 * top bar answers a different question — *where am I, and what can I do to this
 * document*. Same chrome (drag region, window controls, 44px height) so the app
 * still looks like one window.
 *
 *   [ Projects / test / Draft ]        [ 1,240 words · v8 ]   [-][□][×]
 */
export function StudioTopBar({ breadcrumb, actions, isMac }: StudioTopBarProps) {
  return (
    <div
      className="app-drag flex h-11 shrink-0 items-center gap-3 border-b px-3"
      style={{
        borderColor: 'hsl(var(--border))',
        background: 'hsl(var(--topbar-bg))'
      }}
    >
      <div className="app-no-drag flex min-w-0 flex-1 items-center gap-2">{breadcrumb}</div>

      {actions && <div className="app-no-drag flex shrink-0 items-center gap-1.5">{actions}</div>}

      <WindowControls isMac={isMac} />
    </div>
  )
}
