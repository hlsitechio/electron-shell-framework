import React, { useEffect, useRef, useCallback } from 'react'
import { DockviewReact, DockviewReadyEvent, DockviewApi } from 'dockview-react'
import { useReframeStore } from '../stores/reframe-store'
import { REFRAME_WIDGET_COMPONENTS } from '../widgets/reframe-widgets'
import { Plus, Hash, BarChart2, Table as TableIcon, FileText, Activity, Zap } from 'lucide-react'

export const DockviewCanvas: React.FC = () => {
  const { mode, selectedThemeKey, themeInspector, panels, setDockviewApi, deviceMode, addPanel } =
    useReframeStore()

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
      }

      return () => {
        removeSub.dispose()
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

      {/* Floating "+ Widget" button when Dockview has active panels */}
      {!isEmpty && mode === 'builder' && (
        <div className="absolute top-2 right-3 z-30 flex items-center gap-1.5">
          <button
            onClick={() => handleAddWidget('kpi')}
            className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all hover:border-zinc-600"
            title="Add another widget into layout"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-300" />
            <span>Add Widget</span>
          </button>
        </div>
      )}

      {/* ── EMPTY CANVAS STATE: CLEAN ARCHITECTURAL DESIGN ──────── */}
      {isEmpty && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-zinc-950 select-none">
          <div className="w-full max-w-md p-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm flex flex-col items-center text-center space-y-6 shadow-xl relative overflow-hidden group">
            {/* Center plus button */}
            <button
              onClick={() => handleAddWidget('kpi')}
              className="group/btn flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
              title="Click to add widget and load Dockview"
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-850 border border-zinc-700 group-hover/btn:border-zinc-500 group-hover/btn:bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover/btn:text-white transition-all shadow-sm">
                <Plus
                  className="w-8 h-8 transition-transform duration-200 group-hover/btn:rotate-90"
                  strokeWidth={2}
                />
              </div>
            </button>

            {/* Title & subtitle */}
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white tracking-tight">
                Add Widget to Canvas
              </h3>
              <p className="text-xs text-zinc-300 max-w-sm leading-relaxed">
                Click <span className="text-white font-semibold">+</span> to load Dockview, or
                choose a widget below to start your layout.
              </p>
            </div>

            {/* Quick 1-click widget selection chips */}
            <div className="grid grid-cols-3 gap-2 w-full pt-1">
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
        </div>
      )}
    </div>
  )
}
