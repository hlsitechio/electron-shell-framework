import React from 'react'
import {
  Monitor,
  Tablet,
  Smartphone,
  SlidersHorizontal,
  Eye,
  Wrench,
  Sparkles,
  Share2,
  Layers,
  Activity,
  BarChart3,
  Terminal,
  Shield,
  Zap,
  RefreshCw,
  ChevronDown
} from 'lucide-react'
import { useReframeStore, DOCKVIEW_THEMES, TEMPLATES, TemplateId } from '../stores/reframe-store'
import { FONT_MAP } from '../types/reframe-types'

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Layers,
  Activity,
  BarChart3,
  Terminal,
  Sparkles,
  Shield,
  Zap,
  RefreshCw
}

export const ReframeHeader: React.FC = () => {
  const {
    mode,
    setMode,
    isControlsOpen,
    toggleControls,
    deviceMode,
    setDeviceMode,
    selectedThemeKey,
    setSelectedThemeKey,
    currentTemplateId,
    loadTemplate,
    headerConfig,
    setIsBakeModalOpen
  } = useReframeStore()

  const LogoIconComponent = ICON_MAP[headerConfig.logoIcon] || Layers
  const fontStyle = { fontFamily: FONT_MAP[headerConfig.fontFamily] || FONT_MAP.inter }

  // Size classes
  const sizeClass =
    headerConfig.titleSize === 'sm'
      ? 'text-sm'
      : headerConfig.titleSize === 'base'
        ? 'text-base'
        : headerConfig.titleSize === 'lg'
          ? 'text-lg'
          : headerConfig.titleSize === '2xl'
            ? 'text-2xl'
            : 'text-xl'

  const weightClass =
    headerConfig.titleWeight === 'normal'
      ? 'font-normal'
      : headerConfig.titleWeight === 'medium'
        ? 'font-medium'
        : headerConfig.titleWeight === 'bold'
          ? 'font-bold'
          : 'font-semibold'

  return (
    <header
      className="app-drag border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-4 select-none shrink-0 z-30 transition-all"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      onDoubleClick={(e) => {
        if (e.target === e.currentTarget) {
          window.api?.window?.maximize?.()
        }
      }}
    >
      {/* Left: Branding & Dynamic Framing Title */}
      <div className="flex items-center gap-3 min-w-0" style={fontStyle}>
        {headerConfig.showLogo && (
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <LogoIconComponent className="w-4 h-4" />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className={`${sizeClass} ${weightClass} text-white tracking-tight truncate`}>
              {headerConfig.title}
            </h1>
            {headerConfig.badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shrink-0">
                {headerConfig.badge}
              </span>
            )}
          </div>
          {headerConfig.subtitle && (
            <p className="text-xs text-zinc-400 truncate mt-0.5">{headerConfig.subtitle}</p>
          )}
        </div>
      </div>

      {/* Draggable empty middle spacing */}
      <div
        className="app-drag flex-1 h-full min-w-4 cursor-default"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        onDoubleClick={() => window.api?.window?.maximize?.()}
        title="Double-click to toggle maximize • Drag to move window"
      />

      {/* Right / Controls Area */}
      <div
        className="app-no-drag flex items-center gap-2 shrink-0"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Device toggle (desktop / tablet / phone preview) */}
        {mode === 'builder' && (
          <div className="hidden md:flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-zinc-400">
            <button
              onClick={() => setDeviceMode('desktop')}
              title="Desktop viewport"
              className={`p-1.5 rounded ${deviceMode === 'desktop' ? 'bg-zinc-800 text-white' : 'hover:text-zinc-200'}`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              title="Tablet preview"
              className={`p-1.5 rounded ${deviceMode === 'tablet' ? 'bg-zinc-800 text-white' : 'hover:text-zinc-200'}`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              title="Mobile preview"
              className={`p-1.5 rounded ${deviceMode === 'mobile' ? 'bg-zinc-800 text-white' : 'hover:text-zinc-200'}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Template Selector dropdown */}
        {mode === 'builder' && (
          <div className="relative">
            <select
              value={currentTemplateId}
              onChange={(e) => loadTemplate(e.target.value as TemplateId)}
              className="appearance-none bg-zinc-900 border border-zinc-700/80 hover:border-zinc-500 text-zinc-200 text-xs rounded-lg px-3 py-1.5 pr-8 focus:outline-none cursor-pointer"
            >
              {Object.entries(TEMPLATES).map(([key, t]) => (
                <option key={key} value={key}>
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-2 pointer-events-none" />
          </div>
        )}

        {/* Dockview Theme Pill Selector (Matches dockview.dev screenshot) */}
        {mode === 'builder' && (
          <div className="relative">
            <select
              value={selectedThemeKey}
              onChange={(e) => setSelectedThemeKey(e.target.value)}
              className="appearance-none bg-indigo-950/60 border border-indigo-700/60 hover:border-indigo-400 text-indigo-200 font-medium text-xs rounded-lg px-3 py-1.5 pr-8 focus:outline-none cursor-pointer shadow-sm"
            >
              {DOCKVIEW_THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-300 absolute right-2.5 top-2 pointer-events-none" />
          </div>
        )}

        {/* Controls & Theme Button (Matches dockview.dev screenshot) */}
        {mode === 'builder' && (
          <button
            onClick={toggleControls}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition-all ${
              isControlsOpen
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Controls & Theme</span>
          </button>
        )}

        {/* Publish Standalone App (Zero-Dockview) */}
        <button
          onClick={() => setIsBakeModalOpen(true)}
          title="Publish standalone application code (.tsx) and preset (.json)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-100 hover:text-white shadow-sm transition-all border border-zinc-700 hover:border-zinc-600"
        >
          <Share2 className="w-3.5 h-3.5 text-zinc-300" />
          <span>Publish App</span>
        </button>

        {/* Mode Switcher (Builder Mode ⟷ Client Deliverable View) */}
        {mode === 'builder' ? (
          <button
            onClick={() => setMode('client')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white shadow-sm transition-all border border-zinc-700"
            title="Preview clean client deliverable without builder controls"
          >
            <Eye className="w-3.5 h-3.5 text-zinc-300" />
            <span>Client View</span>
          </button>
        ) : (
          <button
            onClick={() => setMode('builder')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-750 text-zinc-100 hover:text-white shadow-sm transition-all border border-zinc-700"
            title="Return to builder platform"
          >
            <Wrench className="w-3.5 h-3.5 text-zinc-300" />
            <span>Builder Mode</span>
          </button>
        )}
      </div>
    </header>
  )
}
