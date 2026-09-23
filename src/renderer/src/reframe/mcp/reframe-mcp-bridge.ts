import { useReframeStore } from '../stores/reframe-store'
import { generateStandaloneClientTsx } from '../export/reframe-codegen'
import type { PanelConfig, WidgetType } from '../types/reframe-types'

let isBridgeInitialized = false
let unsubscribeAction: (() => void) | null = null
let unsubscribeStore: (() => void) | null = null

export function initReframeMcpBridge(): () => void {
  if (isBridgeInitialized) {
    return () => {}
  }

  if (typeof window === 'undefined' || !window.api?.mcp) {
    console.warn('[reframe-mcp] window.api.mcp not available in this environment')
    return () => {}
  }

  isBridgeInitialized = true

  // 1. Initial State Push to Main Process cache
  const pushCurrentState = () => {
    try {
      const state = useReframeStore.getState()
      window.api.mcp.pushState({
        mode: state.mode,
        currentTemplateId: state.currentTemplateId,
        headerTabs: state.headerTabs,
        activeHeaderTabId: state.activeHeaderTabId,
        leftTabs: state.leftTabs,
        activeLeftTabId: state.activeLeftTabId,
        footerTabs: state.footerTabs,
        activeFooterTabId: state.activeFooterTabId,
        panels: state.panels,
        panelCount: Object.keys(state.panels).length,
        themeInspector: state.themeInspector,
        headerConfig: state.headerConfig,
        footerConfig: state.footerConfig,
        leftSidebarWidth: state.leftSidebarWidth,
        rightSidebarWidth: state.rightSidebarWidth
      })
    } catch (err) {
      console.warn('[reframe-mcp] Failed to push state:', err)
    }
  }

  pushCurrentState()

  // 2. Continuous State Synchronization on store updates (debounced)
  let debounceTimer: any = null
  unsubscribeStore = useReframeStore.subscribe(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(pushCurrentState, 100)
  })

  // 3. Handle incoming AI agent tool calls from Electron Main process
  unsubscribeAction = window.api.mcp.onMcpAction(async ({ toolName, params }) => {
    const store = useReframeStore.getState()

    const executeAction = async (): Promise<any> => {
      switch (toolName) {
        case 'reframe_set_mode': {
          const targetMode = params.mode as 'builder' | 'client'
          if (targetMode !== 'builder' && targetMode !== 'client') {
            throw new Error('mode must be "builder" or "client"')
          }
          store.setMode(targetMode)
          return { success: true, mode: targetMode }
        }

        case 'reframe_load_template': {
          const { templateId } = params
          store.loadTemplate(templateId)
          return {
            success: true,
            templateId,
            panelCount: Object.keys(useReframeStore.getState().panels).length
          }
        }

        case 'reframe_clear_all': {
          store.clearAllTabsAndPanels()
          return { success: true, message: 'All tabs and panels cleared to blank playground' }
        }

        case 'reframe_list_tabs': {
          return {
            headerTabs: store.headerTabs,
            activeHeaderTabId: store.activeHeaderTabId,
            leftTabs: store.leftTabs,
            activeLeftTabId: store.activeLeftTabId,
            footerTabs: store.footerTabs,
            activeFooterTabId: store.activeFooterTabId
          }
        }

        case 'reframe_create_tab': {
          const { zone, label, viewType, url, value } = params
          const id = params.id || `tab-${Date.now()}`

          if (zone === 'header') {
            store.addHeaderTab({
              id,
              label,
              icon: 'Layers',
              closable: true
            })
            return { success: true, zone, id, label }
          } else if (zone === 'left') {
            store.addLeftTab({
              id,
              label,
              viewType: viewType || 'canvas',
              url: url || undefined,
              icon:
                viewType === 'notes' ? 'FileText' : viewType === 'embed' ? 'Globe' : 'LayoutGrid',
              closable: true
            })
            return { success: true, zone, id, label, viewType: viewType || 'canvas' }
          } else if (zone === 'footer') {
            store.addFooterTab({
              id,
              label,
              value: value || 'Online',
              status: 'online',
              content: `Live telemetry channel for ${label}.`,
              closable: true
            })
            return { success: true, zone, id, label, value: value || 'Online' }
          } else {
            throw new Error(`Invalid zone "${zone}". Must be "header", "left", or "footer".`)
          }
        }

        case 'reframe_remove_tab': {
          const { zone, tabId } = params
          let targetZone = zone
          if (!targetZone) {
            if (store.headerTabs.some((t) => t.id === tabId)) targetZone = 'header'
            else if (store.leftTabs.some((t) => t.id === tabId)) targetZone = 'left'
            else if (store.footerTabs.some((t) => t.id === tabId)) targetZone = 'footer'
            else targetZone = 'header'
          }
          if (targetZone === 'header') {
            store.removeHeaderTab(tabId)
          } else if (targetZone === 'left') {
            store.removeLeftTab(tabId)
          } else if (targetZone === 'footer') {
            store.removeFooterTab(tabId)
          } else {
            throw new Error(`Invalid zone "${targetZone}"`)
          }
          return { success: true, removedTabId: tabId, zone: targetZone }
        }

        case 'reframe_select_tab': {
          const { zone, tabId } = params
          let targetZone = zone
          if (!targetZone) {
            if (store.headerTabs.some((t) => t.id === tabId)) targetZone = 'header'
            else if (store.leftTabs.some((t) => t.id === tabId)) targetZone = 'left'
            else if (store.footerTabs.some((t) => t.id === tabId)) targetZone = 'footer'
            else targetZone = 'header'
          }
          if (targetZone === 'header') {
            store.setActiveHeaderTab(tabId)
          } else if (targetZone === 'left') {
            store.setActiveLeftTab(tabId)
          } else if (targetZone === 'footer') {
            store.setActiveFooterTabId(tabId)
          }
          return { success: true, selectedTabId: tabId, zone: targetZone }
        }

        case 'reframe_list_widgets': {
          return {
            panelCount: Object.keys(store.panels).length,
            panels: store.panels
          }
        }

        case 'reframe_add_widget': {
          const { widgetType, title, props, direction } = params
          const normalizedType = widgetType === 'metric' ? 'kpi' : widgetType
          const id = params.id || `${normalizedType}-${Date.now()}`
          const panel: PanelConfig = {
            id,
            title: title || `${normalizedType.toUpperCase()} Widget`,
            widgetType: normalizedType as WidgetType,
            widgetProps: props || {},
            closable: true
          }

          store.addPanel(panel, direction ? { direction } : undefined)
          return { success: true, mountedPanel: panel }
        }

        case 'reframe_remove_widget': {
          const { panelId } = params
          store.removePanel(panelId)
          return { success: true, removedPanelId: panelId }
        }

        case 'reframe_update_widget': {
          const { panelId, title, props } = params
          store.updatePanel(panelId, {
            ...(title ? { title } : {}),
            ...(props ? { widgetProps: props } : {})
          })
          return { success: true, updatedPanelId: panelId }
        }

        case 'reframe_update_theme': {
          const updates: Record<string, any> = {}
          if (params.borderThickness !== undefined) updates.borderThickness = params.borderThickness
          if (params.tabBarHeight !== undefined) updates.tabBarHeight = params.tabBarHeight
          if (params.fontSize !== undefined) updates.fontSize = params.fontSize
          if (params.borderRadius !== undefined) updates.borderRadius = params.borderRadius

          if (Object.keys(updates).length > 0) {
            store.updateThemeInspector(updates)
          }

          if (params.leftSidebarWidth !== undefined) {
            store.setLeftSidebarWidth(params.leftSidebarWidth)
          }
          if (params.rightSidebarWidth !== undefined) {
            store.setRightSidebarWidth(params.rightSidebarWidth)
          }
          if (params.selectedThemeKey !== undefined) {
            store.setSelectedThemeKey(params.selectedThemeKey)
          }

          return { success: true, theme: useReframeStore.getState().themeInspector }
        }

        case 'reframe_update_framing': {
          if (params.headerTitle || params.headerSubtitle) {
            store.updateHeaderConfig({
              ...(params.headerTitle ? { title: params.headerTitle } : {}),
              ...(params.headerSubtitle ? { subtitle: params.headerSubtitle } : {})
            })
          }
          if (params.footerLeftText || params.footerStatusLabel) {
            store.updateFooterConfig({
              ...(params.footerLeftText ? { leftText: params.footerLeftText } : {}),
              ...(params.footerStatusLabel ? { statusLabel: params.footerStatusLabel } : {})
            })
          }
          return {
            success: true,
            framing: { header: store.headerConfig, footer: store.footerConfig }
          }
        }

        case 'reframe_bake_deliverable':
        case 'reframe_publish_app': {
          const tsx = generateStandaloneClientTsx({
            templateName: store.currentTemplateId,
            headerConfig: store.headerConfig,
            footerConfig: store.footerConfig,
            panels: store.panels
          })
          const manifest = store.exportConfigJson()
          return {
            success: true,
            componentName: 'ClientDashboard',
            code: tsx,
            manifest: JSON.parse(manifest)
          }
        }

        default:
          throw new Error(`Unknown MCP action "${toolName}"`)
      }
    }

    const result = await executeAction()
    pushCurrentState()
    return result
  })

  return () => {
    isBridgeInitialized = false
    if (unsubscribeAction) unsubscribeAction()
    if (unsubscribeStore) unsubscribeStore()
  }
}
