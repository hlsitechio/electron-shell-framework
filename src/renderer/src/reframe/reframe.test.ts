import { describe, it, expect, beforeEach } from 'vitest'
import { useReframeStore } from './stores/reframe-store'
import { REFRAME_WIDGET_COMPONENTS } from './widgets/reframe-widgets'

describe('Reframe Platform & Store', () => {
  beforeEach(() => {
    useReframeStore.getState().loadTemplate('executive')
    useReframeStore.getState().setMode('builder')
    useReframeStore.getState().resetThemeInspector()
  })

  it('initializes with default builder mode and executive template', () => {
    const state = useReframeStore.getState()
    expect(state.mode).toBe('builder')
    expect(state.currentTemplateId).toBe('executive')
    expect(state.headerConfig.title).toBe('Apex Capital Analytics')
    expect(state.headerConfig.fontFamily).toBe('outfit')
    expect(state.footerConfig.statusState).toBe('online')
    expect(Object.keys(state.panels).length).toBeGreaterThan(0)
  })

  it('switches seamlessly between builder and client deliverable modes', () => {
    const { setMode } = useReframeStore.getState()
    setMode('client')
    expect(useReframeStore.getState().mode).toBe('client')

    setMode('builder')
    expect(useReframeStore.getState().mode).toBe('builder')
  })

  it('updates theme inspector parameters and resets cleanly', () => {
    const { updateThemeInspector, resetThemeInspector } = useReframeStore.getState()

    updateThemeInspector({
      gap: 8,
      padding: 12,
      tabBarHeight: 42,
      fontSize: 14,
      borderRadius: 8
    })

    let state = useReframeStore.getState()
    expect(state.themeInspector.gap).toBe(8)
    expect(state.themeInspector.padding).toBe(12)
    expect(state.themeInspector.tabBarHeight).toBe(42)
    expect(state.themeInspector.fontSize).toBe(14)
    expect(state.themeInspector.borderRadius).toBe(8)

    resetThemeInspector()
    state = useReframeStore.getState()
    expect(state.themeInspector.gap).toBe(0)
    expect(state.themeInspector.padding).toBe(0)
    expect(state.themeInspector.tabBarHeight).toBe(35)
    expect(state.themeInspector.fontSize).toBe(13)
  })

  it('updates header and footer framing dynamically', () => {
    const { updateHeaderConfig, updateFooterConfig } = useReframeStore.getState()

    updateHeaderConfig({
      title: 'Bespoke Client Terminal',
      subtitle: 'Customized Live UI',
      fontFamily: 'jetbrains',
      titleSize: '2xl'
    })

    updateFooterConfig({
      leftText: 'Custom Left Node',
      statusLabel: 'Hardened & Ready',
      statusState: 'synced'
    })

    const state = useReframeStore.getState()
    expect(state.headerConfig.title).toBe('Bespoke Client Terminal')
    expect(state.headerConfig.fontFamily).toBe('jetbrains')
    expect(state.headerConfig.titleSize).toBe('2xl')
    expect(state.footerConfig.leftText).toBe('Custom Left Node')
    expect(state.footerConfig.statusLabel).toBe('Hardened & Ready')
    expect(state.footerConfig.statusState).toBe('synced')
  })

  it('loads pre-built UI templates on demand', () => {
    const { loadTemplate } = useReframeStore.getState()

    // Test Operations template
    loadTemplate('operations')
    let state = useReframeStore.getState()
    expect(state.currentTemplateId).toBe('operations')
    expect(state.selectedThemeKey).toBe('dockview-theme-dracula')
    expect(state.headerConfig.title).toBe('PulseOps Control Plane')
    expect(state.panels['kpi-infra']).toBeDefined()

    // Test Engineering template
    loadTemplate('engineering')
    state = useReframeStore.getState()
    expect(state.currentTemplateId).toBe('engineering')
    expect(state.selectedThemeKey).toBe('dockview-theme-monokai')
    expect(state.headerConfig.title).toBe('DevForge Terminal Matrix')

    // Test Minimal template
    loadTemplate('minimal')
    state = useReframeStore.getState()
    expect(state.currentTemplateId).toBe('minimal')
    expect(state.headerConfig.title).toBe('Cockpit Minimal Hub')
  })

  it('exports and imports valid JSON template configurations', () => {
    const { exportConfigJson, importConfigJson } = useReframeStore.getState()

    const exported = exportConfigJson()
    expect(typeof exported).toBe('string')
    const parsed = JSON.parse(exported)
    expect(parsed.framing.header.title).toBe('Apex Capital Analytics')
    expect(parsed.panels).toBeDefined()

    // Modify and import
    parsed.framing.header.title = 'Imported Enterprise Suite'
    const success = importConfigJson(JSON.stringify(parsed))
    expect(success).toBe(true)
    expect(useReframeStore.getState().headerConfig.title).toBe('Imported Enterprise Suite')
  })

  it('registers all required dockview widget types', () => {
    const expectedWidgets = ['kpi', 'chart', 'table', 'notes', 'activity', 'actionpad', 'embed']
    for (const type of expectedWidgets) {
      expect(REFRAME_WIDGET_COMPONENTS[type]).toBeDefined()
    }
  })

  it('manages bake deliverable modal open and close states', () => {
    const { setIsBakeModalOpen } = useReframeStore.getState()
    expect(useReframeStore.getState().isBakeModalOpen).toBe(false)

    setIsBakeModalOpen(true)
    expect(useReframeStore.getState().isBakeModalOpen).toBe(true)

    setIsBakeModalOpen(false)
    expect(useReframeStore.getState().isBakeModalOpen).toBe(false)
  })

  it('generates a clean standalone React TSX component without Dockview dependencies', async () => {
    const { generateStandaloneClientTsx } = await import('./export/reframe-codegen')
    const state = useReframeStore.getState()

    const tsx = generateStandaloneClientTsx({
      templateName: state.currentTemplateId,
      headerConfig: state.headerConfig,
      footerConfig: state.footerConfig,
      panels: state.panels
    })

    expect(typeof tsx).toBe('string')
    expect(tsx).toContain('export const ClientDashboard: React.FC')
    expect(tsx).toContain(state.headerConfig.title)
    expect(tsx).toContain(state.footerConfig.statusLabel)

    // ZERO DOCKVIEW GUARANTEE
    expect(tsx).not.toContain('dockview-react')
    expect(tsx).not.toContain('dockview.css')
    expect(tsx).not.toContain('DockviewReact')
    expect(tsx).not.toContain('DockviewApi')
  })

  it('manages dynamic Header Tabs (add, reorder, remove, switch)', () => {
    const { addHeaderTab, removeHeaderTab, reorderHeaderTabs, setActiveHeaderTab } =
      useReframeStore.getState()

    // Add tab
    addHeaderTab({ id: 'test-hdr', label: 'Custom Header Tab', closable: true })
    let state = useReframeStore.getState()
    expect(state.headerTabs.some((t) => t.id === 'test-hdr')).toBe(true)
    expect(state.activeHeaderTabId).toBe('test-hdr')

    // Reorder tabs
    const initialFirst = state.headerTabs[0].id
    reorderHeaderTabs(0, 1)
    state = useReframeStore.getState()
    expect(state.headerTabs[1].id).toBe(initialFirst)

    // Switch tab
    setActiveHeaderTab('tab-operations')
    state = useReframeStore.getState()
    expect(state.activeHeaderTabId).toBe('tab-operations')
    expect(state.currentTemplateId).toBe('operations')

    // Remove tab with red X
    removeHeaderTab('test-hdr')
    state = useReframeStore.getState()
    expect(state.headerTabs.some((t) => t.id === 'test-hdr')).toBe(false)
  })

  it('manages dynamic Left Sidebar Tabs (add, reorder, remove, viewTypes)', () => {
    const { addLeftTab, removeLeftTab, reorderLeftTabs, setActiveLeftTab } =
      useReframeStore.getState()

    // Add Left tab
    addLeftTab({ id: 'test-left', label: 'API Notes', viewType: 'notes', closable: true })
    let state = useReframeStore.getState()
    expect(state.leftTabs.some((t) => t.id === 'test-left')).toBe(true)
    expect(state.activeLeftTabId).toBe('test-left')

    // Switch Left tab
    setActiveLeftTab('left-canvas')
    expect(useReframeStore.getState().activeLeftTabId).toBe('left-canvas')

    // Reorder Left tabs
    reorderLeftTabs(0, 1)
    state = useReframeStore.getState()
    expect(state.leftTabs.length).toBeGreaterThan(1)

    // Remove Left tab with red X
    removeLeftTab('test-left')
    state = useReframeStore.getState()
    expect(state.leftTabs.some((t) => t.id === 'test-left')).toBe(false)
  })

  it('manages dynamic Right Sidebar Inspector Tabs (add, remove, toggle)', () => {
    const { toggleRightSidebar, addRightTab, removeRightTab, setActiveRightTabId } =
      useReframeStore.getState()

    // Toggle right sidebar
    const initialOpen = useReframeStore.getState().isRightSidebarOpen
    toggleRightSidebar()
    expect(useReframeStore.getState().isRightSidebarOpen).toBe(!initialOpen)
    toggleRightSidebar()
    expect(useReframeStore.getState().isRightSidebarOpen).toBe(initialOpen)

    // Add right tab
    addRightTab({ id: 'test-right', label: 'Inspector Plus' })
    let state = useReframeStore.getState()
    expect(state.rightTabs.some((t) => t.id === 'test-right')).toBe(true)
    expect(state.activeRightTabId).toBe('test-right')

    // Switch right tab
    setActiveRightTabId('theme')
    expect(useReframeStore.getState().activeRightTabId).toBe('theme')

    // Remove right tab with red X
    removeRightTab('test-right')
    state = useReframeStore.getState()
    expect(state.rightTabs.some((t) => t.id === 'test-right')).toBe(false)
  })

  it('manages dynamic Nav Footer Status Tabs (add, remove, reorder, drawer toggle)', () => {
    const { addFooterTab, removeFooterTab, reorderFooterTabs, toggleBottomDrawer } =
      useReframeStore.getState()

    // Add footer status tab
    addFooterTab({
      id: 'foot-test',
      label: 'Database Ping',
      value: '4ms',
      status: 'online',
      closable: true
    })
    let state = useReframeStore.getState()
    expect(state.footerTabs.some((t) => t.id === 'foot-test')).toBe(true)

    // Toggle bottom detail drawer
    expect(state.isBottomDrawerOpen).toBe(false)
    toggleBottomDrawer('foot-test')
    state = useReframeStore.getState()
    expect(state.isBottomDrawerOpen).toBe(true)
    expect(state.activeFooterTabId).toBe('foot-test')

    // Toggle off
    toggleBottomDrawer('foot-test')
    state = useReframeStore.getState()
    expect(state.isBottomDrawerOpen).toBe(false)

    // Reorder footer tabs
    reorderFooterTabs(0, 1)
    state = useReframeStore.getState()
    expect(state.footerTabs.length).toBeGreaterThan(1)

    // Remove footer tab with red X
    removeFooterTab('foot-test')
    state = useReframeStore.getState()
    expect(state.footerTabs.some((t) => t.id === 'foot-test')).toBe(false)
  })

  it('manages resizable Left and Right sidebar widths with clamp limits', () => {
    const { setLeftSidebarWidth, setRightSidebarWidth } = useReframeStore.getState()

    // Test Left Sidebar width
    expect(useReframeStore.getState().leftSidebarWidth).toBe(240)
    setLeftSidebarWidth(320)
    expect(useReframeStore.getState().leftSidebarWidth).toBe(320)

    // Clamp min (160)
    setLeftSidebarWidth(50)
    expect(useReframeStore.getState().leftSidebarWidth).toBe(160)

    // Clamp max (480)
    setLeftSidebarWidth(900)
    expect(useReframeStore.getState().leftSidebarWidth).toBe(480)

    // Test Right Sidebar width
    expect(useReframeStore.getState().rightSidebarWidth).toBe(360)
    setRightSidebarWidth(450)
    expect(useReframeStore.getState().rightSidebarWidth).toBe(450)

    // Clamp min (260)
    setRightSidebarWidth(100)
    expect(useReframeStore.getState().rightSidebarWidth).toBe(260)

    // Clamp max (640)
    setRightSidebarWidth(1200)
    expect(useReframeStore.getState().rightSidebarWidth).toBe(640)
  })

  it('manages adjustable border thickness in ThemeInspectorState', () => {
    const { updateThemeInspector, resetThemeInspector } = useReframeStore.getState()

    expect(useReframeStore.getState().themeInspector.borderThickness).toBe(1)

    updateThemeInspector({ borderThickness: 4 })
    expect(useReframeStore.getState().themeInspector.borderThickness).toBe(4)

    updateThemeInspector({ borderThickness: 8 })
    expect(useReframeStore.getState().themeInspector.borderThickness).toBe(8)

    resetThemeInspector()
    expect(useReframeStore.getState().themeInspector.borderThickness).toBe(1)
  })

  it('initializes new blank tabs with empty panels ready for the center plus button', () => {
    const { addHeaderTab, addLeftTab } = useReframeStore.getState()

    // Create a new blank header tab
    addHeaderTab({
      id: 'blank-tab-1',
      label: 'New Blank Canvas',
      templateId: 'blank',
      closable: true
    })

    let state = useReframeStore.getState()
    expect(state.activeHeaderTabId).toBe('blank-tab-1')
    expect(Object.keys(state.panels).length).toBe(0)

    // Create a new canvas left tab
    addLeftTab({
      id: 'blank-left-1',
      label: 'New Canvas View',
      viewType: 'canvas',
      closable: true
    })

    state = useReframeStore.getState()
    expect(state.activeLeftTabId).toBe('blank-left-1')
    expect(Object.keys(state.panels).length).toBe(0)
  })

  it('resets to totally empty playground when loading the blank template', () => {
    const { loadTemplate } = useReframeStore.getState()

    loadTemplate('blank')
    const state = useReframeStore.getState()
    expect(state.currentTemplateId).toBe('blank')
    expect(state.headerTabs.length).toBe(0)
    expect(state.leftTabs.length).toBe(0)
    expect(state.footerTabs.length).toBe(0)
    expect(Object.keys(state.panels).length).toBe(0)
  })

  it('preserves empty state when passing from builder mode to client mode and back', () => {
    const { loadTemplate, setMode } = useReframeStore.getState()

    // Start with totally empty playground
    loadTemplate('blank')
    let state = useReframeStore.getState()
    expect(state.mode).toBe('builder')
    expect(Object.keys(state.panels).length).toBe(0)
    expect(state.headerTabs.length).toBe(0)

    // Pass from builder mode to client mode
    setMode('client')
    state = useReframeStore.getState()
    expect(state.mode).toBe('client')
    // Stays completely empty
    expect(Object.keys(state.panels).length).toBe(0)
    expect(state.headerTabs.length).toBe(0)

    // Return from client mode to builder mode
    setMode('builder')
    state = useReframeStore.getState()
    expect(state.mode).toBe('builder')
    // Keeps exactly from where left off: empty playground ready for center + button
    expect(Object.keys(state.panels).length).toBe(0)
    expect(state.headerTabs.length).toBe(0)
  })

  it('preserves added panels and widgets when passing to client mode and back to builder mode', () => {
    const { loadTemplate, setMode, addPanel } = useReframeStore.getState()

    // Start empty
    loadTemplate('blank')

    // Add widgets via center + button action
    addPanel({
      id: 'kpi-live-1',
      title: 'Active Revenue Stream',
      widgetType: 'kpi',
      widgetProps: { value: '$45,000' }
    })
    addPanel({
      id: 'chart-live-1',
      title: 'Telemetry Trend',
      widgetType: 'chart',
      widgetProps: { chartType: 'line' }
    })

    let state = useReframeStore.getState()
    expect(Object.keys(state.panels).length).toBe(2)
    expect(state.panels['kpi-live-1']).toBeDefined()
    expect(state.panels['chart-live-1']).toBeDefined()

    // Switch to client mode: panels must be intact for client grid
    setMode('client')
    state = useReframeStore.getState()
    expect(state.mode).toBe('client')
    expect(Object.keys(state.panels).length).toBe(2)
    expect(state.panels['kpi-live-1'].title).toBe('Active Revenue Stream')

    // Switch back to builder mode: panels must remain intact exactly where left off
    setMode('builder')
    state = useReframeStore.getState()
    expect(state.mode).toBe('builder')
    expect(Object.keys(state.panels).length).toBe(2)
    expect(state.panels['chart-live-1'].title).toBe('Telemetry Trend')
  })

  it('preserves tab widgets and layout when creating Tab 2 and switching back to Tab 1', () => {
    const { loadTemplate, addHeaderTab, setActiveHeaderTab, addPanel } = useReframeStore.getState()

    // 1. Start clean
    loadTemplate('blank')
    expect(useReframeStore.getState().headerTabs.length).toBe(0)

    // 2. User creates Tab 1
    addHeaderTab({ id: 'user-tab-1', label: 'Tab 1', closable: true })
    expect(useReframeStore.getState().activeHeaderTabId).toBe('user-tab-1')
    expect(Object.keys(useReframeStore.getState().panels).length).toBe(0)

    // 3. User begins to populate Tab 1 with widgets
    addPanel({
      id: 'kpi-tab1',
      title: 'Tab 1 Metric',
      widgetType: 'kpi',
      widgetProps: { value: '99.9%' }
    })
    addPanel({
      id: 'chart-tab1',
      title: 'Tab 1 Trend',
      widgetType: 'chart',
      widgetProps: { chartType: 'area' }
    })

    let state = useReframeStore.getState()
    expect(Object.keys(state.panels).length).toBe(2)
    expect(state.panels['kpi-tab1']).toBeDefined()
    expect(state.panels['chart-tab1']).toBeDefined()

    // 4. User creates Tab 2
    addHeaderTab({ id: 'user-tab-2', label: 'Tab 2', closable: true })
    state = useReframeStore.getState()
    expect(state.activeHeaderTabId).toBe('user-tab-2')
    // Tab 2 starts as clean empty canvas
    expect(Object.keys(state.panels).length).toBe(0)

    // User populates Tab 2 with a table widget
    addPanel({
      id: 'table-tab2',
      title: 'Tab 2 Table',
      widgetType: 'table',
      widgetProps: { columns: [], rows: [] }
    })
    state = useReframeStore.getState()
    expect(Object.keys(state.panels).length).toBe(1)
    expect(state.panels['table-tab2']).toBeDefined()

    // 5. User switches back to Tab 1
    setActiveHeaderTab('user-tab-1')
    state = useReframeStore.getState()
    expect(state.activeHeaderTabId).toBe('user-tab-1')
    // Tab 1 widgets are NOT gone — all 2 panels are perfectly preserved!
    expect(Object.keys(state.panels).length).toBe(2)
    expect(state.panels['kpi-tab1']).toBeDefined()
    expect(state.panels['kpi-tab1'].title).toBe('Tab 1 Metric')
    expect(state.panels['chart-tab1']).toBeDefined()
    expect(state.panels['chart-tab1'].title).toBe('Tab 1 Trend')

    // 6. User switches back to Tab 2
    setActiveHeaderTab('user-tab-2')
    state = useReframeStore.getState()
    expect(state.activeHeaderTabId).toBe('user-tab-2')
    expect(Object.keys(state.panels).length).toBe(1)
    expect(state.panels['table-tab2']).toBeDefined()
  })
})
