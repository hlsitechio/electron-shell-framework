import React, { useState } from 'react'
import {
  SlidersHorizontal,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
  Layout,
  Maximize2,
  Palette,
  Heading,
  Footprints,
  PlusCircle,
  BarChart2,
  Hash,
  Table as TableIcon,
  FileText,
  Activity,
  Zap,
  PackageCheck
} from 'lucide-react'
import { useReframeStore, DOCKVIEW_THEMES } from '../stores/reframe-store'
import type { FontFamilyKey } from '../types/reframe-types'

export const ReframeControlsDrawer: React.FC = () => {
  const {
    isControlsOpen,
    setIsControlsOpen,
    activeTab,
    setActiveTab,
    themeInspector,
    updateThemeInspector,
    resetThemeInspector,
    selectedThemeKey,
    setSelectedThemeKey,
    headerConfig,
    updateHeaderConfig,
    footerConfig,
    updateFooterConfig,
    addPanel,
    setIsBakeModalOpen
  } = useReframeStore()

  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    layout: true,
    radius: true,
    themes: true,
    header: true,
    footer: true,
    addTab: true
  })

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (!isControlsOpen) return null

  // Helper to add widget
  const handleAddWidget = (
    widgetType: 'kpi' | 'chart' | 'table' | 'notes' | 'activity' | 'actionpad',
    direction: 'right' | 'below' | 'stack'
  ) => {
    const id = `panel-${Date.now()}`
    const defaultTitles = {
      kpi: 'Custom Metrics Hub',
      chart: 'Telemetry Trends',
      table: 'Active Entity Table',
      notes: 'Operational Runbook',
      activity: 'Live Log Stream',
      actionpad: 'Command Triggers'
    }

    const panelConfig = {
      id,
      title: defaultTitles[widgetType],
      widgetType,
      widgetProps: {},
      closable: true
    }

    if (direction === 'stack') {
      addPanel(panelConfig)
    } else {
      addPanel(panelConfig, { direction })
    }
  }

  return (
    <aside className="w-80 sm:w-96 bg-zinc-950 border-l border-zinc-800 flex flex-col h-full z-40 select-none shadow-2xl shrink-0 transition-all">
      {/* Header (Exact layout from user screenshot) */}
      <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between gap-2 shrink-0 bg-zinc-900/50">
        <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
          <div className="p-1 rounded bg-blue-600/20 text-blue-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <span>Controls & Theme</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={resetThemeInspector}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700/60"
            title="Reset theme and sliders to defaults"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          <button
            onClick={() => setIsControlsOpen(false)}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Segmented Control: [ Theme ] [ Controls ] */}
      <div className="p-2 border-b border-zinc-800 bg-zinc-900/30 shrink-0">
        <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab('theme')}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'theme'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Theme
          </button>
          <button
            onClick={() => setActiveTab('controls')}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'controls'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Controls
          </button>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* ============================================================
            TAB: THEME (Matches dockview.dev screenshot accordions)
            ============================================================ */}
        {activeTab === 'theme' && (
          <>
            {/* Accordion: Layout */}
            <div className="border border-zinc-800/80 rounded-lg overflow-hidden bg-zinc-900/40">
              <button
                onClick={() => toggleSection('layout')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-zinc-200 hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Layout className="w-3.5 h-3.5 text-blue-400" />
                  <span>Layout</span>
                </div>
                {openSections.layout ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {openSections.layout && (
                <div className="p-3 pt-1 space-y-3 border-t border-zinc-800/60 text-xs">
                  {/* Gap */}
                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>Gap</span>
                      <span className="font-mono text-zinc-300">{themeInspector.gap}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="16"
                      value={themeInspector.gap}
                      onChange={(e) => updateThemeInspector({ gap: Number(e.target.value) })}
                      className="w-full accent-blue-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Spacing Padding */}
                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>Spacing Padding</span>
                      <span className="font-mono text-zinc-300">{themeInspector.padding}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={themeInspector.padding}
                      onChange={(e) => updateThemeInspector({ padding: Number(e.target.value) })}
                      className="w-full accent-blue-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Tab Bar Height */}
                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>Tab Bar Height</span>
                      <span className="font-mono text-zinc-300">
                        {themeInspector.tabBarHeight}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="26"
                      max="52"
                      value={themeInspector.tabBarHeight}
                      onChange={(e) =>
                        updateThemeInspector({ tabBarHeight: Number(e.target.value) })
                      }
                      className="w-full accent-blue-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Font Size */}
                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>Font Size</span>
                      <span className="font-mono text-zinc-300">{themeInspector.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="11"
                      max="16"
                      value={themeInspector.fontSize}
                      onChange={(e) => updateThemeInspector({ fontSize: Number(e.target.value) })}
                      className="w-full accent-blue-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: Radius */}
            <div className="border border-zinc-800/80 rounded-lg overflow-hidden bg-zinc-900/40">
              <button
                onClick={() => toggleSection('radius')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-zinc-200 hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Radius</span>
                </div>
                {openSections.radius ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {openSections.radius && (
                <div className="p-3 pt-1 space-y-3 border-t border-zinc-800/60 text-xs">
                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>Border Radius</span>
                      <span className="font-mono text-zinc-300">
                        {themeInspector.borderRadius}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="16"
                      value={themeInspector.borderRadius}
                      onChange={(e) =>
                        updateThemeInspector({ borderRadius: Number(e.target.value) })
                      }
                      className="w-full accent-blue-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>Tab Border Radius</span>
                      <span className="font-mono text-zinc-300">
                        {themeInspector.tabBorderRadius}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      value={themeInspector.tabBorderRadius}
                      onChange={(e) =>
                        updateThemeInspector({ tabBorderRadius: Number(e.target.value) })
                      }
                      className="w-full accent-blue-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: Dockview Themes */}
            <div className="border border-zinc-800/80 rounded-lg overflow-hidden bg-zinc-900/40">
              <button
                onClick={() => toggleSection('themes')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-zinc-200 hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-blue-400" />
                  <span>Dockview Themes Palette</span>
                </div>
                {openSections.themes ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {openSections.themes && (
                <div className="p-3 pt-1 grid grid-cols-2 gap-1.5 border-t border-zinc-800/60 text-xs">
                  {DOCKVIEW_THEMES.map((th) => (
                    <button
                      key={th.id}
                      onClick={() => setSelectedThemeKey(th.id)}
                      className={`p-2 rounded text-left transition-all ${
                        selectedThemeKey === th.id
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/50 font-semibold'
                          : 'bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800 border border-transparent'
                      }`}
                    >
                      <div className="truncate">{th.name}</div>
                      <div className="text-[10px] text-zinc-500">
                        {th.isDark ? 'Dark Theme' : 'Light Theme'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ============================================================
            TAB: CONTROLS (Framing, Typography, Widgets)
            ============================================================ */}
        {activeTab === 'controls' && (
          <>
            {/* Header Framing Controls */}
            <div className="border border-zinc-800/80 rounded-lg overflow-hidden bg-zinc-900/40">
              <button
                onClick={() => toggleSection('header')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-zinc-200 hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Heading className="w-3.5 h-3.5 text-blue-400" />
                  <span>Header Framing & Fonts</span>
                </div>
                {openSections.header ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {openSections.header && (
                <div className="p-3 pt-1 space-y-2.5 border-t border-zinc-800/60 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">Application Title</label>
                    <input
                      type="text"
                      value={headerConfig.title}
                      onChange={(e) => updateHeaderConfig({ title: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={headerConfig.subtitle}
                      onChange={(e) => updateHeaderConfig({ subtitle: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-zinc-400 block mb-1">Font Family</label>
                      <select
                        value={headerConfig.fontFamily}
                        onChange={(e) =>
                          updateHeaderConfig({ fontFamily: e.target.value as FontFamilyKey })
                        }
                        className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 focus:outline-none cursor-pointer"
                      >
                        <option value="inter">Inter (Sans)</option>
                        <option value="outfit">Outfit (Modern)</option>
                        <option value="geist">Geist (Clean)</option>
                        <option value="jetbrains">JetBrains Mono</option>
                        <option value="fira">Fira Code</option>
                        <option value="system">System UI</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Font Size</label>
                      <select
                        value={headerConfig.titleSize}
                        onChange={(e) => updateHeaderConfig({ titleSize: e.target.value as any })}
                        className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 focus:outline-none cursor-pointer"
                      >
                        <option value="sm">Small</option>
                        <option value="base">Medium</option>
                        <option value="lg">Large</option>
                        <option value="xl">Extra Large</option>
                        <option value="2xl">Hero (2XL)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-zinc-400 block mb-1">Badge Text</label>
                      <input
                        type="text"
                        value={headerConfig.badge || ''}
                        onChange={(e) => updateHeaderConfig({ badge: e.target.value })}
                        placeholder="v2.4 / Enterprise"
                        className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Brand Icon</label>
                      <select
                        value={headerConfig.logoIcon}
                        onChange={(e) => updateHeaderConfig({ logoIcon: e.target.value })}
                        className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 focus:outline-none cursor-pointer"
                      >
                        <option value="Layers">Layers</option>
                        <option value="Activity">Activity</option>
                        <option value="BarChart3">BarChart</option>
                        <option value="Terminal">Terminal</option>
                        <option value="Sparkles">Sparkles</option>
                        <option value="Shield">Shield</option>
                        <option value="Zap">Zap</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Framing Controls */}
            <div className="border border-zinc-800/80 rounded-lg overflow-hidden bg-zinc-900/40">
              <button
                onClick={() => toggleSection('footer')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-zinc-200 hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Footprints className="w-3.5 h-3.5 text-blue-400" />
                  <span>Footer Status Framing</span>
                </div>
                {openSections.footer ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {openSections.footer && (
                <div className="p-3 pt-1 space-y-2.5 border-t border-zinc-800/60 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">Left Slot Text</label>
                    <input
                      type="text"
                      value={footerConfig.leftText}
                      onChange={(e) => updateFooterConfig({ leftText: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Center Text</label>
                    <input
                      type="text"
                      value={footerConfig.centerText}
                      onChange={(e) => updateFooterConfig({ centerText: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-zinc-400 block mb-1">Status State</label>
                      <select
                        value={footerConfig.statusState}
                        onChange={(e) => updateFooterConfig({ statusState: e.target.value as any })}
                        className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 focus:outline-none cursor-pointer"
                      >
                        <option value="online">Online (Green)</option>
                        <option value="synced">Synced (Blue)</option>
                        <option value="busy">Busy (Amber)</option>
                        <option value="custom">Neutral (Gray)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Status Label</label>
                      <input
                        type="text"
                        value={footerConfig.statusLabel}
                        onChange={(e) => updateFooterConfig({ statusLabel: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Add Tab / Drop Widget */}
            <div className="border border-zinc-800/80 rounded-lg overflow-hidden bg-zinc-900/40">
              <button
                onClick={() => toggleSection('addTab')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-zinc-200 hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add Widget to Dockview</span>
                </div>
                {openSections.addTab ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {openSections.addTab && (
                <div className="p-3 pt-1 space-y-2 border-t border-zinc-800/60 text-xs">
                  <p className="text-[11px] text-zinc-400 mb-2">
                    Click to instantly insert a functional widget panel into the active layout:
                  </p>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleAddWidget('kpi', 'below')}
                      className="p-2 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition-colors border border-zinc-700/60 text-left"
                    >
                      <Hash className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="truncate">+ KPI Tile</span>
                    </button>

                    <button
                      onClick={() => handleAddWidget('chart', 'right')}
                      className="p-2 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition-colors border border-zinc-700/60 text-left"
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
                      <span className="truncate">+ Live Chart</span>
                    </button>

                    <button
                      onClick={() => handleAddWidget('table', 'below')}
                      className="p-2 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition-colors border border-zinc-700/60 text-left"
                    >
                      <TableIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="truncate">+ Data Table</span>
                    </button>

                    <button
                      onClick={() => handleAddWidget('notes', 'right')}
                      className="p-2 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition-colors border border-zinc-700/60 text-left"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate">+ Notes Runbook</span>
                    </button>

                    <button
                      onClick={() => handleAddWidget('activity', 'below')}
                      className="p-2 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition-colors border border-zinc-700/60 text-left"
                    >
                      <Activity className="w-3.5 h-3.5 text-rose-400" />
                      <span className="truncate">+ Activity Stream</span>
                    </button>

                    <button
                      onClick={() => handleAddWidget('actionpad', 'right')}
                      className="p-2 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition-colors border border-zinc-700/60 text-left"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span className="truncate">+ Action Pad</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PUBLISH APP PRODUCT (ZERO DOCKVIEW) */}
            <div className="mt-4 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-zinc-200 font-semibold text-xs">
                <PackageCheck className="w-4 h-4 text-indigo-400" />
                <span>Publish Standalone App</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-normal">
                Export locked, standalone React code (.tsx) and client preset (.json) with{' '}
                <strong className="text-white font-medium">zero Dockview runtime</strong>.
              </p>
              <button
                onClick={() => setIsBakeModalOpen(true)}
                className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all border border-zinc-700"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Publish App Now</span>
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
