import React from 'react'
import './styles/reframe.css'
import { ReframeHeader } from './components/ReframeHeader'
import { ReframeFooter } from './components/ReframeFooter'
import { DockviewCanvas } from './components/DockviewCanvas'
import { NativeClientGrid } from './components/NativeClientGrid'
import { ReframeControlsDrawer } from './components/ReframeControlsDrawer'
import { BakeExportModal } from './components/BakeExportModal'
import { useReframeStore } from './stores/reframe-store'
import { Wrench, Rocket } from 'lucide-react'

export const ReframeApp: React.FC = () => {
  const { mode, setMode, isBakeModalOpen, setIsBakeModalOpen } = useReframeStore()

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden relative select-none">
      {/* Dynamic Header Framing */}
      <ReframeHeader />

      {/* Center Layout Workspace: Dockview Canvas (Builder) vs. Native Client Grid (Deliverable) */}
      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 h-full min-w-0 relative">
          {mode === 'builder' ? <DockviewCanvas /> : <NativeClientGrid />}
        </div>

        {/* Builder Mode Controls & Theme Drawer */}
        {mode === 'builder' && <ReframeControlsDrawer />}
      </main>

      {/* Dynamic Footer Framing */}
      <ReframeFooter />

      {/* Floating Action Buttons for Client Deliverable View */}
      {mode === 'client' && (
        <div className="fixed bottom-10 right-6 flex items-center gap-2 z-50">
          <button
            onClick={() => setIsBakeModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-2xl flex items-center gap-1.5 backdrop-blur border border-indigo-400/40 transition-all"
            title="Publish standalone application code (.tsx) and preset (.json)"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Publish App</span>
          </button>

          <button
            onClick={() => setMode('builder')}
            className="px-3.5 py-1.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold shadow-2xl flex items-center gap-1.5 backdrop-blur border border-zinc-700/60 transition-all group"
            title="Exit Client Preview Mode and return to Builder"
          >
            <Wrench className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
            <span>Return to Builder</span>
          </button>
        </div>
      )}

      {/* Standalone Bake & Export Deliverable Modal */}
      <BakeExportModal isOpen={isBakeModalOpen} onClose={() => setIsBakeModalOpen(false)} />
    </div>
  )
}

export default ReframeApp
