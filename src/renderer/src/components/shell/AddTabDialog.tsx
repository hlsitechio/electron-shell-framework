import React, { useState } from 'react'
import {
  X,
  Plus,
  Layout,
  Layers,
  Globe,
  Activity,
  FileText,
  BarChart3,
  Terminal,
  Shield,
  Zap,
  Sparkles,
  Database,
  Server,
  Workflow,
  Clock,
  Compass,
  Check
} from 'lucide-react'
import { useCustomPagesStore, CustomPageConfig } from '@renderer/stores/custom-pages-store'
import { useTabsStore } from '@renderer/stores/tabs-store'
import type { TemplateId } from '@renderer/reframe/stores/reframe-store'

const AVAILABLE_ICONS = [
  { name: 'Layout', icon: Layout },
  { name: 'Layers', icon: Layers },
  { name: 'Globe', icon: Globe },
  { name: 'Activity', icon: Activity },
  { name: 'FileText', icon: FileText },
  { name: 'BarChart3', icon: BarChart3 },
  { name: 'Terminal', icon: Terminal },
  { name: 'Shield', icon: Shield },
  { name: 'Zap', icon: Zap },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Database', icon: Database },
  { name: 'Server', icon: Server },
  { name: 'Workflow', icon: Workflow },
  { name: 'Clock', icon: Clock },
  { name: 'Compass', icon: Compass }
]

export const AddTabDialog: React.FC = () => {
  const { isAddTabOpen, setIsAddTabOpen, addCustomPage } = useCustomPagesStore()
  const { setActive } = useTabsStore()

  const [label, setLabel] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('Layers')
  const [tabType, setTabType] = useState<'reframe' | 'embed' | 'notes'>('reframe')
  const [templateId, setTemplateId] = useState<TemplateId>('executive')
  const [embedUrl, setEmbedUrl] = useState('https://dockview.dev')
  const [notesContent, setNotesContent] = useState('')
  const [category, setCategory] = useState<'Workspace' | 'Ship' | 'Design' | 'Custom'>('Workspace')

  if (!isAddTabOpen) return null

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return

    const id = `custom-tab-${Date.now()}`
    const newPage: CustomPageConfig = {
      id,
      label: label.trim(),
      iconName: selectedIcon,
      category,
      type: tabType,
      props: {
        templateId: tabType === 'reframe' ? templateId : undefined,
        url: tabType === 'embed' ? embedUrl : undefined,
        notesContent: tabType === 'notes' ? notesContent : undefined
      }
    }

    addCustomPage(newPage)
    setActive(id)
    setIsAddTabOpen(false)

    // Reset form
    setLabel('')
    setNotesContent('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Add New Sidebar Tab</h3>
              <p className="text-xs text-zinc-400">
                Create a dynamic view, Dockview layout, or web embed
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddTabOpen(false)}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleCreate}
          className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]"
        >
          {/* Tab Label */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">Tab Label / Name</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Analytics Hub, Client Runbook, Linear..."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700/80 rounded-lg text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Tab Content Type */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">Tab Type & View</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTabType('reframe')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  tabType === 'reframe'
                    ? 'bg-blue-600/20 border-blue-500 text-white font-medium shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <div className="font-semibold text-xs mb-0.5">🧩 Dockview Canvas</div>
                <div className="text-[10px] text-zinc-400">Reframe layout preset</div>
              </button>

              <button
                type="button"
                onClick={() => setTabType('embed')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  tabType === 'embed'
                    ? 'bg-blue-600/20 border-blue-500 text-white font-medium shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <div className="font-semibold text-xs mb-0.5">🌐 Web Embed</div>
                <div className="text-[10px] text-zinc-400">URL / SaaS dashboard</div>
              </button>

              <button
                type="button"
                onClick={() => setTabType('notes')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  tabType === 'notes'
                    ? 'bg-blue-600/20 border-blue-500 text-white font-medium shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <div className="font-semibold text-xs mb-0.5">📝 Notes & Runbook</div>
                <div className="text-[10px] text-zinc-400">Rich Markdown docs</div>
              </button>
            </div>
          </div>

          {/* Conditional Sub-settings based on type */}
          {tabType === 'reframe' && (
            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-2">
              <label className="block text-zinc-400 font-medium">Starter Dockview Template</label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value as TemplateId)}
                className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="executive">Executive Portfolio Dashboard</option>
                <option value="operations">Operations & SRE Telemetry Monitor</option>
                <option value="analytics">Product Funnel & Analytics</option>
                <option value="engineering">DevForge Terminal Matrix</option>
                <option value="minimal">Minimal Executive KPI Hub</option>
              </select>
            </div>
          )}

          {tabType === 'embed' && (
            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-2">
              <label className="block text-zinc-400 font-medium">Target URL to Embed</label>
              <input
                type="url"
                required
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {tabType === 'notes' && (
            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-2">
              <label className="block text-zinc-400 font-medium">Initial Notes Content</label>
              <textarea
                rows={3}
                value={notesContent}
                onChange={(e) => setNotesContent(e.target.value)}
                placeholder="Enter markdown notes or instructions for this tab..."
                className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-blue-500 resize-none font-mono text-[11px]"
              />
            </div>
          )}

          {/* Icon Picker */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">Tab Icon</label>
            <div className="grid grid-cols-5 gap-1.5 p-2 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              {AVAILABLE_ICONS.map(({ name, icon: IconComponent }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedIcon(name)}
                  className={`p-2 rounded flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedIcon === name
                      ? 'bg-blue-600 text-white font-semibold shadow'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                  title={name}
                >
                  <IconComponent className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Group Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="Workspace">Workspace</option>
                <option value="Ship">Ship</option>
                <option value="Design">Design</option>
                <option value="Custom">Custom Group</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAddTabOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create Tab</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
