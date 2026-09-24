import React, { useEffect, useRef, useCallback, useState } from 'react'
import { DockviewReact, DockviewReadyEvent, DockviewApi } from 'dockview-react'
import { useReframeStore } from '../stores/reframe-store'
import { REFRAME_WIDGET_COMPONENTS } from '../widgets/reframe-widgets'
import {
  Plus,
  Hash,
  BarChart2,
  Table as TableIcon,
  FileText,
  Activity,
  Zap,
  Layers,
  Columns,
  Rows,
  LayoutGrid,
  ChevronDown
} from 'lucide-react'

export const DockviewCanvas: React.FC = () => {
  const {
    mode,
    selectedThemeKey,
    themeInspector,
    panels,
    setDockviewApi,
    deviceMode,
    addPanel,
    setIsCatalogModalOpen,
    addEmptySlot,
    scaffoldBlankLayout
  } = useReframeStore()

  const [isScaffoldMenuOpen, setIsScaffoldMenuOpen] = useState(false)

  const apiRef = useRef<DockviewApi | null>(null)
  const isUnmountingRef = useRef(false)
  const isClearingRef = useRef(false)

  useEffect(() => {
    isUnmountingRef.current = false
    return () => {
      isUnmountingRef.current = true
    }
  }, [])

  // Sync dockview layout when store panels become empty
  useEffect(() => {
    const count = Object.keys(panels).length
    if (count === 0 && apiRef.current && apiRef.current.totalPanels > 0) {
      try {
        apiRef.current.clear()
      } catch {
        // ignore
      }
    }
  }, [panels])

  const containerRef = useRef<HTMLDivElement>(null)

  // Re-layout and synchronize Dockview whenever returning to builder mode
  useEffect(() => {
    if (mode === 'builder') {
      const raf = requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'))
        if (apiRef.current) {
          try {
            const el = containerRef.current
            if (el && el.clientWidth > 0 && el.clientHeight > 0) {
              apiRef.current.layout(el.clientWidth, el.clientHeight)
            }
            // If store has panels but dockview is empty, populate dockview
            const storePanelList = Object.values(panels)
            if (storePanelList.length > 0 && apiRef.current.totalPanels === 0) {
              storePanelList.forEach((p, idx) => {
                apiRef.current?.addPanel({
                  id: p.id,
                  component: p.widgetType,
                  title: p.title,
                  params: p.widgetProps,
                  position: idx === 0 ? undefined : { direction: idx % 2 === 0 ? 'below' : 'right' }
                })
              })
            }
          } catch (err) {
            console.warn('Dockview layout refresh failed', err)
          }
        }
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [mode, panels])

  // Initialize Dockview layout on ready
  const onReady = useCallback(
    (event: DockviewReadyEvent) => {
      apiRef.current = event.api
      setDockviewApi(event.api)

      // Listen to panel close events to keep store and UI in sync
      const removeSub = event.api.onDidRemovePanel((e) => {
        const { isRestoringLayout, activeHeaderTabId, tabWorkspaces } = useReframeStore.getState()
        if (
          isUnmountingRef.current ||
          isClearingRef.current ||
          isRestoringLayout ||
          (event.api as any).isDisposed
        ) {
          return
        }
        const currentPanels = useReframeStore.getState().panels
        if (currentPanels[e.id]) {
          const next = { ...currentPanels }
          delete next[e.id]
          const updatedWorkspaces = { ...tabWorkspaces }
          if (activeHeaderTabId) {
            updatedWorkspaces[activeHeaderTabId] = {
              ...(updatedWorkspaces[activeHeaderTabId] || {}),
              panels: next
            }
          }
          useReframeStore.setState({ panels: next, tabWorkspaces: updatedWorkspaces })
        }
      })

      // Populate layout with active tab's saved layout or panels if any
      isClearingRef.current = true
      try {
        event.api.clear()
      } finally {
        isClearingRef.current = false
      }

      const { tabWorkspaces, activeHeaderTabId } = useReframeStore.getState()
      const activeWorkspace = activeHeaderTabId ? tabWorkspaces[activeHeaderTabId] : undefined
      const savedLayout = activeWorkspace?.layoutJson

      let restored = false
      if (savedLayout && savedLayout.grid && savedLayout.grid.root) {
        try {
          event.api.fromJSON(savedLayout)
          restored = event.api.totalPanels > 0
        } catch {
          // fallback to manual panels
        }
      }

      if (!restored) {
        const panelList = Object.values(panels)
        panelList.forEach((p, idx) => {
          try {
            if (idx === 0) {
              event.api.addPanel({
                id: p.id,
                component: p.widgetType,
                title: p.title,
                params: p.widgetProps
              })
            } else if (idx === 1) {
              event.api.addPanel({
                id: p.id,
                component: p.widgetType,
                title: p.title,
                params: p.widgetProps,
                position: { referencePanel: panelList[0].id, direction: 'right' }
              })
            } else if (idx === 2) {
              event.api.addPanel({
                id: p.id,
                component: p.widgetType,
                title: p.title,
                params: p.widgetProps,
                position: { referencePanel: panelList[0].id, direction: 'below' }
              })
            } else {
              event.api.addPanel({
                id: p.id,
                component: p.widgetType,
                title: p.title,
                params: p.widgetProps,
                position: { referencePanel: panelList[1].id, direction: 'below' }
              })
            }
          } catch (err) {
            console.warn('Error placing initial panel:', p.id, err)
          }
        })

        // Snapshot initial layout immediately so Client View has it from the start
        try {
          const initialLayout = event.api.toJSON()
          const { activeHeaderTabId, tabWorkspaces } = useReframeStore.getState()
          if (activeHeaderTabId && initialLayout?.grid?.root) {
            const updated = { ...tabWorkspaces }
            updated[activeHeaderTabId] = {
              ...(updated[activeHeaderTabId] || {}),
              layoutJson: initialLayout
            }
            useReframeStore.setState({ tabWorkspaces: updated })
          }
        } catch {
          // ignore
        }
      }

      // Continuously synchronize Dockview's live layout tree to active tab workspace
      const layoutSub = event.api.onDidLayoutChange(() => {
        if (isUnmountingRef.current || isClearingRef.current || (event.api as any).isDisposed) {
          return
        }
        try {
          const currentLayoutJson = event.api.toJSON()
          const { activeHeaderTabId, tabWorkspaces } = useReframeStore.getState()
          if (activeHeaderTabId && currentLayoutJson?.grid?.root) {
            const updatedWorkspaces = { ...tabWorkspaces }
            updatedWorkspaces[activeHeaderTabId] = {
              ...(updatedWorkspaces[activeHeaderTabId] || {}),
              layoutJson: currentLayoutJson
            }
            useReframeStore.setState({ tabWorkspaces: updatedWorkspaces })
          }
        } catch {
          // ignore
        }
      })

      return () => {
        removeSub.dispose()
        layoutSub.dispose()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setDockviewApi(null)
    }
  }, [setDockviewApi])

  const handleAddWidget = (
    widgetType: 'kpi' | 'chart' | 'table' | 'notes' | 'activity' | 'actionpad'
  ) => {
    const id = `${widgetType}-${Date.now()}`
    const defaultTitles = {
      kpi: 'Executive Metric Tile',
      chart: 'Real-time Chart',
      table: 'Active Entity Table',
      notes: 'Operational Runbook',
      activity: 'Live Log Stream',
      actionpad: 'Command Triggers'
    }

    addPanel({
      id,
      title: defaultTitles[widgetType],
      widgetType,
      widgetProps: {},
      closable: true
    })
  }

  // Custom CSS variable overrides reflecting the "Controls & Theme" sliders
  const dynamicStyle: React.CSSProperties = {
    ['--dv-tabs-and-actions-container-height' as any]: `${themeInspector.tabBarHeight}px`,
    ['--dv-tab-font-size' as any]: `${themeInspector.fontSize}px`,
    ['--dv-border-radius' as any]: `${themeInspector.borderRadius}px`,
    ['--dv-tab-group-chip-border-radius' as any]: `${themeInspector.tabBorderRadius}px`,
    padding: themeInspector.padding > 0 ? `${themeInspector.padding}px` : undefined,
    ...(themeInspector.groupBgColor
      ? { ['--dv-group-view-background-color' as any]: themeInspector.groupBgColor }
      : {}),
    ...(themeInspector.activeTabBg
      ? {
          ['--dv-activegroup-visiblepanel-tab-background-color' as any]: themeInspector.activeTabBg
        }
      : {}),
    ...(themeInspector.activeTabColor
      ? { ['--dv-activegroup-visiblepanel-tab-color' as any]: themeInspector.activeTabColor }
      : {})
  }

  const frameClass =
    deviceMode === 'tablet'
      ? 'reframe-frame-tablet'
      : deviceMode === 'mobile'
        ? 'reframe-frame-mobile'
        : 'reframe-frame-desktop'

  const clientModeClass = mode === 'client' ? 'reframe-client-mode' : ''
  const isEmpty = Object.keys(panels).length === 0

  return (
    <div ref={containerRef} className={`reframe-canvas ${frameClass} relative w-full h-full`}>
      {/* Dockview Container */}
      <div
        className={`reframe-dockview ${selectedThemeKey} ${clientModeClass} w-full h-full`}
        style={dynamicStyle}
      >
        <DockviewReact
          components={REFRAME_WIDGET_COMPONENTS}
          onReady={onReady}
          className="w-full h-full"
        />
      </div>

      {/* Floating Canvas Action Toolbar when Dockview has active panels */}
      {!isEmpty && mode === 'builder' && (
        <div className="absolute top-2 right-3 z-30 flex items-center gap-1.5 bg-zinc-950/80 backdrop-blur-md p-1 rounded-lg border border-zinc-800 shadow-md">
          {/* Quick empty column & row buttons */}
          <button
            onClick={() => addEmptySlot('right')}
            className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Add a new blank column to the right"
          >
            <Columns className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ Column</span>
          </button>

          <button
            onClick={() => addEmptySlot('below')}
            className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Add a new blank row below"
          >
            <Rows className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Row</span>
          </button>

          {/* Layout Scaffolding Popover Menu */}
          <div className="relative">
            <button
              onClick={() => setIsScaffoldMenuOpen(!isScaffoldMenuOpen)}
              className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Scaffold a new wireframe grid layout"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-zinc-400" />
              <span>Layout</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {isScaffoldMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-zinc-900 border border-zinc-700 p-1.5 shadow-xl z-50 space-y-1 select-none animate-in fade-in duration-100"
                onClick={() => setIsScaffoldMenuOpen(false)}
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-2 py-1">
                  Wireframe Scaffolds
                </div>
                <button
                  onClick={() => scaffoldBlankLayout('2-columns')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center justify-between"
                >
                  <span>2 Columns (50/50)</span>
                  <Columns className="w-3.5 h-3.5 text-zinc-500" />
                </button>
                <button
                  onClick={() => scaffoldBlankLayout('3-columns')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center justify-between"
                >
                  <span>3 Columns (33%)</span>
                  <Columns className="w-3.5 h-3.5 text-zinc-500" />
                </button>
                <button
                  onClick={() => scaffoldBlankLayout('2x2-grid')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center justify-between"
                >
                  <span>2x2 Grid (4 Slots)</span>
                  <LayoutGrid className="w-3.5 h-3.5 text-zinc-500" />
                </button>
                <button
                  onClick={() => scaffoldBlankLayout('header-2-col')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center justify-between"
                >
                  <span>Top Hero + 2 Col</span>
                  <LayoutGrid className="w-3.5 h-3.5 text-zinc-500" />
                </button>
                <button
                  onClick={() => scaffoldBlankLayout('3-rows')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center justify-between"
                >
                  <span>3-Row Stack</span>
                  <Rows className="w-3.5 h-3.5 text-zinc-500" />
                </button>
                <button
                  onClick={() => scaffoldBlankLayout('1-slot')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center justify-between"
                >
                  <span>Single Blank Slot</span>
                  <Plus className="w-3.5 h-3.5 text-zinc-500" />
                </button>
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-zinc-800 mx-0.5" />

          {/* Add Widget Button */}
          <button
            onClick={() => setIsCatalogModalOpen(true)}
            className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            title="Browse 42+ pre-made widgets"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Widget</span>
          </button>
        </div>
      )}

      {/* ── EMPTY CANVAS STATE: CLEAN ARCHITECTURAL WIREFRAME & WIDGET CHOICES ──────── */}
      {isEmpty && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-zinc-950 select-none overflow-y-auto">
          <div className="w-full max-w-lg p-7 rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-md flex flex-col items-center text-center space-y-5 shadow-2xl relative overflow-hidden group">
            {/* Header */}
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white tracking-tight">
                Design Your Workspace
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                Map a blank layout grid first without any widgets, or start immediately with
                pre-built blocks.
              </p>
            </div>

            {/* SECTION 1: Map Blank Wireframe Grid */}
            <div className="w-full space-y-2 text-left pt-1">
              <div className="flex items-center justify-between text-xs text-zinc-300 font-semibold px-1">
                <span>1. Map Blank Layout (No Widgets)</span>
                <span className="text-[10px] text-indigo-400 font-mono">Wireframe Mode</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => scaffoldBlankLayout('2-columns')}
                  className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-indigo-500/70 hover:bg-zinc-850 text-xs font-medium text-zinc-200 hover:text-white flex flex-col items-center gap-1.5 transition-all group/item shadow-sm"
                  title="2 equal columns side-by-side"
                >
                  <Columns className="w-4 h-4 text-zinc-400 group-hover/item:text-indigo-400 transition-colors" />
                  <span>2 Columns</span>
                </button>

                <button
                  onClick={() => scaffoldBlankLayout('3-columns')}
                  className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-indigo-500/70 hover:bg-zinc-850 text-xs font-medium text-zinc-200 hover:text-white flex flex-col items-center gap-1.5 transition-all group/item shadow-sm"
                  title="3 equal columns side-by-side"
                >
                  <Columns className="w-4 h-4 text-zinc-400 group-hover/item:text-indigo-400 transition-colors" />
                  <span>3 Columns</span>
                </button>

                <button
                  onClick={() => scaffoldBlankLayout('2x2-grid')}
                  className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-indigo-500/70 hover:bg-zinc-850 text-xs font-medium text-zinc-200 hover:text-white flex flex-col items-center gap-1.5 transition-all group/item shadow-sm"
                  title="4 quadrant layout"
                >
                  <LayoutGrid className="w-4 h-4 text-zinc-400 group-hover/item:text-indigo-400 transition-colors" />
                  <span>2x2 Grid</span>
                </button>

                <button
                  onClick={() => scaffoldBlankLayout('header-2-col')}
                  className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-indigo-500/70 hover:bg-zinc-850 text-xs font-medium text-zinc-200 hover:text-white flex flex-col items-center gap-1.5 transition-all group/item shadow-sm"
                  title="Top banner and 2 bottom columns"
                >
                  <LayoutGrid className="w-4 h-4 text-zinc-400 group-hover/item:text-indigo-400 transition-colors" />
                  <span>Hero + 2 Col</span>
                </button>

                <button
                  onClick={() => scaffoldBlankLayout('3-rows')}
                  className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-indigo-500/70 hover:bg-zinc-850 text-xs font-medium text-zinc-200 hover:text-white flex flex-col items-center gap-1.5 transition-all group/item shadow-sm"
                  title="3 horizontal rows stacked"
                >
                  <Rows className="w-4 h-4 text-zinc-400 group-hover/item:text-indigo-400 transition-colors" />
                  <span>3 Rows</span>
                </button>

                <button
                  onClick={() => scaffoldBlankLayout('1-slot')}
                  className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-indigo-500/70 hover:bg-zinc-850 text-xs font-medium text-zinc-200 hover:text-white flex flex-col items-center gap-1.5 transition-all group/item shadow-sm"
                  title="Single empty wireframe slot"
                >
                  <Plus className="w-4 h-4 text-zinc-400 group-hover/item:text-indigo-400 transition-colors" />
                  <span>1 Blank Slot</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-zinc-800" />
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                OR
              </span>
              <div className="flex-1 h-[1px] bg-zinc-800" />
            </div>

            {/* SECTION 2: Populate with Pre-built Blocks */}
            <div className="w-full space-y-2 text-left">
              <div className="flex items-center justify-between text-xs text-zinc-300 font-semibold px-1">
                <span>2. Start with Client Widgets</span>
                <span className="text-[10px] text-zinc-500 font-mono">Instant Blocks</span>
              </div>

              {/* Quick 1-click widget selection chips */}
              <div className="grid grid-cols-3 gap-2 w-full">
                <button
                  onClick={() => handleAddWidget('kpi')}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-xs font-medium text-zinc-200 hover:text-white flex flex-col items-center gap-1.5 transition-all group/item shadow-sm"
                >
                  <Hash className="w-4 h-4 text-zinc-400 group-hover/item:text-indigo-400 transition-colors" />
                  <span>KPI Hub</span>
                </button>

                <button
                  onClick={() => handleAddWidget('chart')}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-xs font-medium text-zinc-200 hover:text-white flex flex-col items-center gap-1.5 transition-all group/item shadow-sm"
                >
                  <BarChart2 className="w-4 h-4 text-zinc-400 group-hover/item:text-indigo-400 transition-colors" />
                  <span>Live Chart</span>
                </button>

                <button
                  onClick={() => handleAddWidget('table')}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-xs font-medium text-zinc-200 hover:text-white flex flex-col items-center gap-1.5 transition-all group/item shadow-sm"
                >
                  <TableIcon className="w-4 h-4 text-zinc-400 group-hover/item:text-indigo-400 transition-colors" />
                  <span>Data Table</span>
                </button>

                <button
                  onClick={() => handleAddWidget('notes')}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-xs font-medium text-zinc-200 hover:text-white flex flex-col items-center gap-1.5 transition-all group/item shadow-sm"
                >
                  <FileText className="w-4 h-4 text-zinc-400 group-hover/item:text-indigo-400 transition-colors" />
                  <span>Runbook</span>
                </button>

                <button
                  onClick={() => handleAddWidget('activity')}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-xs font-medium text-zinc-200 hover:text-white flex flex-col items-center gap-1.5 transition-all group/item shadow-sm"
                >
                  <Activity className="w-4 h-4 text-zinc-400 group-hover/item:text-indigo-400 transition-colors" />
                  <span>Event Stream</span>
                </button>

                <button
                  onClick={() => handleAddWidget('actionpad')}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-xs font-medium text-zinc-200 hover:text-white flex flex-col items-center gap-1.5 transition-all group/item shadow-sm"
                >
                  <Zap className="w-4 h-4 text-zinc-400 group-hover/item:text-indigo-400 transition-colors" />
                  <span>Action Pad</span>
                </button>
              </div>
            </div>

            {/* Browse Full Catalog Button */}
            <button
              onClick={() => setIsCatalogModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-zinc-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Browse Full Catalog (42+ Pre-made Widgets)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
