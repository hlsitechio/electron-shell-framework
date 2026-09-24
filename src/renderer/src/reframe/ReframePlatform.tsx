import React from 'react'
import './styles/reframe.css'
import { ReframeNavHeader } from './components/ReframeNavHeader'
import { ReframeLeftSidebar } from './components/ReframeLeftSidebar'
import { ReframeRightSidebar } from './components/ReframeRightSidebar'
import { ReframeNavFooter } from './components/ReframeNavFooter'
import { DockviewCanvas } from './components/DockviewCanvas'
import { NativeClientGrid } from './components/NativeClientGrid'
import { BakeExportModal } from './components/BakeExportModal'
import { WidgetCatalogModal } from './components/WidgetCatalogModal'
import { useReframeStore } from './stores/reframe-store'
import { Wrench, ArrowUpRight, FileText, PackageCheck } from 'lucide-react'
import { initReframeMcpBridge } from './mcp/reframe-mcp-bridge'

export const ReframePlatform: React.FC = () => {
  const {
    mode,
    setMode,
    leftTabs,
    activeLeftTabId,
    isBakeModalOpen,
    setIsBakeModalOpen,
    themeInspector,
    footerTabs
  } = useReframeStore()

  React.useEffect(() => {
    const cleanup = initReframeMcpBridge()
    return () => {
      cleanup()
    }
  }, [])

  const activeLeftTab = leftTabs.find((t) => t.id === activeLeftTabId) || leftTabs[0]

  return (
    <div
      className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden relative select-none font-sans"
      style={
        {
          '--reframe-border-thickness': `${themeInspector?.borderThickness || 1}px`
        } as React.CSSProperties
      }
    >
      {/* ── 1. NAV HEADER WITH DYNAMIC TABS AND + BUTTON ────────── */}
      <ReframeNavHeader />

      {/* ── 2. CENTER MIDDLE ROW (LEFT SIDEBAR | DOCKVIEW | RIGHT SIDEBAR) ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar with Dynamic Tabs & + (shown in builder, or in client only if tabs exist) */}
        {(mode === 'builder' || leftTabs.length > 0) && <ReframeLeftSidebar />}

        {/* Center Main Workspace */}
        <main className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden bg-zinc-950">
          {/* Always-mounted Dockview canvas: kept in DOM to preserve layout geometry & avoid 0x0 collapse */}
          <div
            className={`w-full h-full ${
              mode === 'builder' && (!activeLeftTab || activeLeftTab.viewType === 'canvas')
                ? 'relative z-10 flex flex-col'
                : 'invisible pointer-events-none absolute inset-0'
            }`}
          >
            <DockviewCanvas />
          </div>

          {/* Client deliverable grid (zero dockview runtime) */}
          {mode === 'client' && (!activeLeftTab || activeLeftTab.viewType === 'canvas') && (
            <div className="w-full h-full flex flex-col relative z-20">
              <NativeClientGrid />
            </div>
          )}

          {/* Notes View */}
          {activeLeftTab?.viewType === 'notes' && (
            <div className="w-full h-full relative z-20 overflow-y-auto p-8 bg-zinc-950 flex flex-col max-w-4xl mx-auto">
              <div className="flex items-center gap-2 pb-4 border-b border-zinc-800 mb-6">
                <FileText className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {activeLeftTab.label}
                </h2>
              </div>
              <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed space-y-4">
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <h3 className="text-sm font-semibold text-zinc-200 mb-2">
                    Executive Directives & Operational Runbook
                  </h3>
                  <p className="text-xs text-zinc-400">
                    This dedicated notes and runbook view is built into the Reframe Platform. Use it
                    to record client directives, deployment runbooks, and API contracts.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Core Platform Guidelines
                  </h4>
                  <ul className="list-disc pl-5 text-xs text-zinc-400 space-y-1">
                    <li>
                      All layouts designed in Dockview can be exported as zero-runtime deliverables.
                    </li>
                    <li>
                      Drag-and-drop works seamlessly across Header, Left, and Footer tab zones.
                    </li>
                    <li>
                      Click &quot;Publish App&quot; in the header or inspector to generate pure
                      React code.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Embed View */}
          {activeLeftTab?.viewType === 'embed' && (
            <div className="w-full h-full relative z-20 flex flex-col bg-zinc-950">
              <div className="h-8 px-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <span className="truncate font-mono text-[11px] text-zinc-300">
                  {activeLeftTab.url || 'https://dockview.dev'}
                </span>
                <a
                  href={activeLeftTab.url || 'https://dockview.dev'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-[11px]"
                >
                  <span>Open External</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
              <iframe
                src={activeLeftTab.url || 'https://dockview.dev'}
                className="w-full flex-1 border-0"
                title={activeLeftTab.label}
              />
            </div>
          )}
        </main>

        {/* Right Sidebar Inspector (Widgets, Theme & CSS, Framing) */}
        {mode === 'builder' && <ReframeRightSidebar />}
      </div>

      {/* ── 3. NAV FOOTER WITH DYNAMIC TABS AND + BUTTON ────────── */}
      {(mode === 'builder' || footerTabs.length > 0) && <ReframeNavFooter />}

      {/* ── FLOATING CLIENT VIEW CONTROLS ───────────────────────── */}
      {mode === 'client' && (
        <div className="fixed bottom-12 right-6 flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => setIsBakeModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-zinc-850 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xl flex items-center gap-1.5 backdrop-blur border border-zinc-700 hover:border-zinc-600 transition-all"
            title="Publish standalone application code (.tsx) and preset (.json)"
          >
            <PackageCheck className="w-3.5 h-3.5 text-zinc-300" />
            <span>Publish App</span>
          </button>

          <button
            onClick={() => setMode('builder')}
            className="px-3.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold shadow-xl flex items-center gap-1.5 backdrop-blur border border-zinc-700 transition-all group"
            title="Exit Client Preview Mode and return to Builder"
          >
            <Wrench className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform text-zinc-300" />
            <span>Return to Builder</span>
          </button>
        </div>
      )}

      {/* Standalone Bake & Export Deliverable Modal */}
      <BakeExportModal isOpen={isBakeModalOpen} onClose={() => setIsBakeModalOpen(false)} />

      {/* 42+ Pre-Made Widget Catalog Browser Modal */}
      <WidgetCatalogModal />
    </div>
  )
}

export default ReframePlatform
