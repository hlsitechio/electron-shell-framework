import React, { useState } from 'react'
import { X, Copy, Check, Download, Code2, FileJson, ShieldCheck, Rocket } from 'lucide-react'
import { useReframeStore } from '../stores/reframe-store'
import { generateStandaloneClientTsx } from '../export/reframe-codegen'

interface BakeExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export const BakeExportModal: React.FC<BakeExportModalProps> = ({ isOpen, onClose }) => {
  const {
    headerConfig,
    footerConfig,
    panels,
    currentTemplateId,
    selectedThemeKey,
    exportConfigJson
  } = useReframeStore()

  const [activeTab, setActiveTab] = useState<'tsx' | 'json'>('tsx')
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // Generate code dynamically
  const generatedTsx = generateStandaloneClientTsx({
    templateName: currentTemplateId,
    headerConfig,
    footerConfig,
    panels,
    themeKey: selectedThemeKey
  })

  const generatedJson = exportConfigJson()
  const activeContent = activeTab === 'tsx' ? generatedTsx : generatedJson

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const filename =
      activeTab === 'tsx'
        ? `ClientDashboard-${currentTemplateId}.tsx`
        : `client-preset-${currentTemplateId}.json`
    const mime = activeTab === 'tsx' ? 'text/typescript' : 'application/json'

    const blob = new Blob([activeContent], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Publish Standalone App</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Zero Dockview
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Export locked, standalone production code (.tsx) and preset (.json) ready for client
                delivery.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Deliverable Callout */}
        <div className="px-6 py-3 bg-indigo-950/20 border-b border-indigo-900/30 flex items-center justify-between text-xs text-indigo-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Zero-Dockview Guarantee:</strong> The generated deliverable uses native CSS
              Grid and has zero dependencies on Dockview tabs, splitters, or sashes.
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-4">
            <button
              onClick={() => setActiveTab('tsx')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'tsx'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>React Component (.tsx)</span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'json'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Preset Config (.json)</span>
            </button>
          </div>
        </div>

        {/* Code Preview */}
        <div className="flex-1 min-h-[300px] overflow-hidden p-6 bg-zinc-950 flex flex-col">
          <div className="flex items-center justify-between pb-2 text-xs text-zinc-400">
            <span className="font-mono text-zinc-500">
              {activeTab === 'tsx'
                ? `src/components/ClientDashboard-${currentTemplateId}.tsx`
                : `reframe-preset-${currentTemplateId}.json`}
            </span>
            <span className="text-[11px] text-zinc-500">
              {activeContent.split('\n').length} lines
            </span>
          </div>
          <div className="flex-1 overflow-auto rounded-xl bg-zinc-900/80 border border-zinc-800 p-4 font-mono text-xs text-zinc-300 leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700">
            <pre className="whitespace-pre">{activeContent}</pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Click download to save directly into your client project folder.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 border border-zinc-700/60 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-lg shadow-indigo-900/30 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {activeTab === 'tsx' ? '.tsx' : '.json'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
