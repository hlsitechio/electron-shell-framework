import { create } from 'zustand'
import type { DockviewApi } from 'dockview-react'
import type {
  ReframeConfig,
  AccentColorKey,
  HeaderConfig,
  FooterConfig,
  PanelConfig,
  HeaderTabItem,
  LeftTabItem,
  RightTabItem,
  FooterTabItem,
  LayoutScaffoldType
} from '../types/reframe-types'
import type { WidgetCatalogItem } from '../widgets/catalog/widget-catalog'
import {
  TEMPLATES,
  type TemplateId,
  type ReframeTemplateItem
} from '../templates/reframe-templates'

export { TEMPLATES, type TemplateId, type ReframeTemplateItem }

export interface ThemeInspectorState {
  gap: number
  padding: number
  tabBarHeight: number
  fontSize: number
  borderRadius: number
  tabBorderRadius: number
  sashBorderRadius: number
  borderThickness: number
  groupBgColor: string
  tabBgColor: string
  activeTabBg: string
  activeTabColor: string
  inactiveTabBg: string
  inactiveTabColor: string
  accentColor: AccentColorKey
}

export interface TabWorkspaceState {
  panels: Record<string, PanelConfig>
  layoutJson?: any
  templateId?: TemplateId
}

export interface ReframeStoreState {
  // App mode & UI controls
  mode: 'builder' | 'client'
  isControlsOpen: boolean
  isBakeModalOpen: boolean
  isCatalogModalOpen: boolean
  isTemplateModalOpen: boolean
  catalogPlacementDirection: 'left' | 'right' | 'above' | 'below' | 'stack'
  activeTab: 'theme' | 'controls'
  deviceMode: 'desktop' | 'tablet' | 'mobile'
  selectedThemeKey: string

  // Active Template ID
  currentTemplateId: TemplateId

  // Inspector & Theme parameters (Dockview variables)
  themeInspector: ThemeInspectorState

  // Framing
  headerConfig: HeaderConfig
  footerConfig: FooterConfig

  // Dynamic 4 Framing Zones
  headerTabs: HeaderTabItem[]
  activeHeaderTabId: string

  // Per-Tab Layout & Widget Workspaces
  tabWorkspaces: Record<string, TabWorkspaceState>
  isRestoringLayout: boolean

  leftTabs: LeftTabItem[]
  activeLeftTabId: string
  isLeftSidebarOpen: boolean
  leftSidebarWidth: number

  isRightSidebarOpen: boolean
  rightTabs: RightTabItem[]
  activeRightTabId: string
  rightSidebarWidth: number

  footerTabs: FooterTabItem[]
  activeFooterTabId: string | null
  isBottomDrawerOpen: boolean

  // Panels & Widgets (current active tab)
  panels: Record<string, PanelConfig>

  // Dockview API reference
  dockviewApi: DockviewApi | null

  // Actions
  setMode: (mode: 'builder' | 'client') => void
  toggleControls: () => void
  setIsControlsOpen: (open: boolean) => void
  setIsBakeModalOpen: (open: boolean) => void
  setActiveTab: (tab: 'theme' | 'controls') => void
  setDeviceMode: (mode: 'desktop' | 'tablet' | 'mobile') => void
  setSelectedThemeKey: (themeKey: string) => void
  setDockviewApi: (api: DockviewApi | null) => void
  setTabWorkspaceLayout: (tabId: string, layoutJson: any) => void

  // 4-Zone Tab Actions
  addHeaderTab: (tab: HeaderTabItem) => void
  removeHeaderTab: (id: string) => void
  reorderHeaderTabs: (sourceIndex: number, targetIndex: number) => void
  setActiveHeaderTab: (id: string) => void

  addLeftTab: (tab: LeftTabItem) => void
  removeLeftTab: (id: string) => void
  reorderLeftTabs: (sourceIndex: number, targetIndex: number) => void
  setActiveLeftTab: (id: string) => void
  toggleLeftSidebar: () => void
  setIsLeftSidebarOpen: (open: boolean) => void
  setLeftSidebarWidth: (width: number) => void

  toggleRightSidebar: () => void
  setIsRightSidebarOpen: (open: boolean) => void
  setActiveRightTabId: (id: string) => void
  setRightSidebarWidth: (width: number) => void
  addRightTab: (tab: RightTabItem) => void
  removeRightTab: (id: string) => void

  addFooterTab: (tab: FooterTabItem) => void
  removeFooterTab: (id: string) => void
  reorderFooterTabs: (sourceIndex: number, targetIndex: number) => void
  setActiveFooterTabId: (id: string | null) => void
  toggleBottomDrawer: (tabId?: string) => void
  setIsBottomDrawerOpen: (open: boolean) => void

  // Update theme parameters
  updateThemeInspector: (updates: Partial<ThemeInspectorState>) => void
  resetThemeInspector: () => void

  // Update framing
  updateHeaderConfig: (updates: Partial<HeaderConfig>) => void
  updateFooterConfig: (updates: Partial<FooterConfig>) => void

  // Panel management
  addPanel: (
    panel: PanelConfig,
    position?: { referencePanel?: string; direction?: 'left' | 'right' | 'above' | 'below' }
  ) => void
  removePanel: (id: string) => void
  updatePanel: (id: string, updates: Partial<PanelConfig>) => void

  // Wireframe & Layout Mapping
  targetSlotId: string | null
  setTargetSlotId: (slotId: string | null) => void
  addEmptySlot: (
    direction?: 'right' | 'below' | 'left' | 'above',
    referencePanelId?: string
  ) => void
  scaffoldBlankLayout: (scaffold: LayoutScaffoldType) => void
  fillEmptySlot: (slotId: string, item: WidgetCatalogItem) => void

  // Catalog Modal & Actions
  setIsCatalogModalOpen: (open: boolean) => void
  setCatalogPlacementDirection: (direction: 'left' | 'right' | 'above' | 'below' | 'stack') => void
  insertCatalogWidget: (
    item: WidgetCatalogItem,
    direction?: 'left' | 'right' | 'above' | 'below' | 'stack'
  ) => void

  // Template Switcher
  loadTemplate: (templateId: TemplateId) => void
  clearAllTabsAndPanels: () => void
  setIsTemplateModalOpen: (open: boolean) => void

  // Export / Import
  exportConfigJson: () => string
  importConfigJson: (jsonStr: string) => boolean
}

export const DOCKVIEW_THEMES: Array<{ id: string; name: string; isDark: boolean }> = [
  { id: 'dockview-theme-abyss', name: 'Abyss', isDark: true },
  { id: 'dockview-theme-catppuccin-mocha', name: 'Catppuccin Mocha', isDark: true },
  { id: 'dockview-theme-dark', name: 'Dark', isDark: true },
  { id: 'dockview-theme-dracula', name: 'Dracula', isDark: true },
  { id: 'dockview-theme-github-dark', name: 'GitHub Dark', isDark: true },
  { id: 'dockview-theme-github-light', name: 'GitHub Light', isDark: false },
  { id: 'dockview-theme-light', name: 'Light', isDark: false },
  { id: 'dockview-theme-monokai', name: 'Monokai', isDark: true },
  { id: 'dockview-theme-nord', name: 'Nord', isDark: true },
  { id: 'dockview-theme-solarized-light', name: 'Solarized Light', isDark: false },
  { id: 'dockview-theme-vs', name: 'Visual Studio', isDark: true }
]

const DEFAULT_THEME_INSPECTOR: ThemeInspectorState = {
  gap: 0,
  padding: 0,
  tabBarHeight: 35,
  fontSize: 13,
  borderRadius: 4,
  tabBorderRadius: 4,
  sashBorderRadius: 0,
  borderThickness: 1,
  groupBgColor: '',
  tabBgColor: '',
  activeTabBg: '',
  activeTabColor: '',
  inactiveTabBg: '',
  inactiveTabColor: '',
  accentColor: 'blue'
}

export const useReframeStore = create<ReframeStoreState>((set, get) => ({
  mode: 'builder',
  isControlsOpen: true,
  isBakeModalOpen: false,
  isCatalogModalOpen: false,
  isTemplateModalOpen: false,
  catalogPlacementDirection: 'right',
  targetSlotId: null,
  activeTab: 'theme',
  deviceMode: 'desktop',
  selectedThemeKey: TEMPLATES.executive.themeKey || 'dockview-theme-abyss',
  currentTemplateId: 'executive',
  setIsTemplateModalOpen: (open: boolean) => set({ isTemplateModalOpen: open }),

  // 4 Dynamic Framing Zones (Executive Dashboard Default: 5 pre-made tabs, each with 5 widgets)
  headerTabs: [...TEMPLATES.executive.headerTabs],
  activeHeaderTabId: TEMPLATES.executive.headerTabs[0]?.id || 'tab-exec-kpis',

  // Per-Tab Layout & Widget Workspaces (pre-populated with 5 tabs × 5 widgets = 25 pre-selected widgets)
  tabWorkspaces: Object.entries(TEMPLATES.executive.tabWorkspaces).reduce(
    (acc, [tabId, tabPanels]) => {
      acc[tabId] = {
        panels: { ...tabPanels },
        layoutJson: undefined,
        templateId: 'executive'
      }
      return acc
    },
    {} as Record<string, TabWorkspaceState>
  ),
  isRestoringLayout: false,

  leftTabs: [
    {
      id: 'left-canvas',
      label: 'Main Cockpit',
      viewType: 'canvas',
      icon: 'LayoutGrid',
      closable: false
    },
    {
      id: 'left-directives',
      label: 'Executive Directives',
      viewType: 'notes',
      icon: 'FileText',
      closable: true
    }
  ],
  activeLeftTabId: 'left-canvas',
  isLeftSidebarOpen: true,
  leftSidebarWidth: 240,

  isRightSidebarOpen: true,
  rightSidebarWidth: 360,
  rightTabs: [
    { id: 'widgets', label: 'Widgets', icon: 'Layers' },
    { id: 'theme', label: 'Theme & CSS', icon: 'SlidersHorizontal' },
    { id: 'framing', label: 'Framing', icon: 'Sparkles' },
    { id: 'agent', label: 'AI Agent', icon: 'Bot' }
  ],
  activeRightTabId: 'widgets',

  footerTabs: [],
  activeFooterTabId: null,
  isBottomDrawerOpen: false,

  themeInspector: { ...DEFAULT_THEME_INSPECTOR },

  headerConfig: { ...TEMPLATES.executive.header },
  footerConfig: { ...TEMPLATES.executive.footer },
  panels: { ...TEMPLATES.executive.panels },

  dockviewApi: null,

  setMode: (mode) => {
    if (mode === 'client') {
      const { dockviewApi, activeHeaderTabId, tabWorkspaces, panels } = get()
      let currentLayoutJson: any = undefined
      if (dockviewApi) {
        try {
          currentLayoutJson = dockviewApi.toJSON()
        } catch {
          // ignore
        }
      }
      const updatedWorkspaces = { ...tabWorkspaces }
      if (activeHeaderTabId) {
        updatedWorkspaces[activeHeaderTabId] = {
          ...(updatedWorkspaces[activeHeaderTabId] || {}),
          panels: { ...panels },
          layoutJson: currentLayoutJson || updatedWorkspaces[activeHeaderTabId]?.layoutJson
        }
      }
      set({ mode, tabWorkspaces: updatedWorkspaces })
    } else {
      set({ mode })
    }
  },
  toggleControls: () => set((state) => ({ isControlsOpen: !state.isControlsOpen })),
  setIsControlsOpen: (open) => set({ isControlsOpen: open }),
  setIsBakeModalOpen: (open) => set({ isBakeModalOpen: open }),
  setIsCatalogModalOpen: (open) => set({ isCatalogModalOpen: open }),
  setCatalogPlacementDirection: (direction) => set({ catalogPlacementDirection: direction }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setDeviceMode: (deviceMode) => set({ deviceMode }),
  setSelectedThemeKey: (selectedThemeKey) => set({ selectedThemeKey }),
  setDockviewApi: (dockviewApi) => set({ dockviewApi }),
  setTabWorkspaceLayout: (tabId, layoutJson) =>
    set((state) => ({
      tabWorkspaces: {
        ...state.tabWorkspaces,
        [tabId]: {
          ...(state.tabWorkspaces[tabId] || {}),
          layoutJson
        }
      }
    })),

  // 4-Zone Tab Action Handlers with Per-Tab Layout & Widget Persistence
  addHeaderTab: (tab) => {
    const { activeHeaderTabId, panels, dockviewApi, tabWorkspaces } = get()
    const updatedWorkspaces = { ...tabWorkspaces }

    // 1. Snapshot outgoing tab's panels & dockview layout before moving away
    if (activeHeaderTabId) {
      let currentLayoutJson: any = undefined
      if (dockviewApi) {
        try {
          currentLayoutJson = dockviewApi.toJSON()
        } catch {
          // ignore
        }
      }
      updatedWorkspaces[activeHeaderTabId] = {
        ...(updatedWorkspaces[activeHeaderTabId] || {}),
        panels: { ...panels },
        layoutJson: currentLayoutJson
      }
    }

    // 2. Initialize new tab workspace
    const isBlank = !tab.templateId || tab.templateId === 'blank'
    let newPanels: Record<string, PanelConfig> = {}
    if (!activeHeaderTabId && Object.keys(panels).length > 0) {
      newPanels = { ...panels }
    } else if (!isBlank && tab.templateId && TEMPLATES[tab.templateId]) {
      newPanels = { ...TEMPLATES[tab.templateId].panels }
    }

    updatedWorkspaces[tab.id] = {
      panels: newPanels,
      layoutJson: undefined,
      templateId: tab.templateId
    }

    // 3. Mark isRestoringLayout: true to prevent onDidRemovePanel from wiping store
    set({
      headerTabs: [...get().headerTabs, tab],
      activeHeaderTabId: tab.id,
      panels: newPanels,
      tabWorkspaces: updatedWorkspaces,
      isRestoringLayout: true
    })

    // 4. Update Dockview layout
    if (dockviewApi) {
      try {
        dockviewApi.clear()
        if (Object.keys(newPanels).length > 0) {
          Object.values(newPanels).forEach((p, idx) => {
            dockviewApi.addPanel({
              id: p.id,
              component: p.widgetType,
              title: p.title,
              params: p.widgetProps,
              position: idx === 0 ? undefined : { direction: idx % 2 === 0 ? 'below' : 'right' }
            })
          })
        }
      } catch {
        // ignore
      } finally {
        set({ isRestoringLayout: false })
      }
    } else {
      set({ isRestoringLayout: false })
    }
  },

  removeHeaderTab: (id) => {
    const { headerTabs, activeHeaderTabId, tabWorkspaces, dockviewApi } = get()
    const filtered = headerTabs.filter((t) => t.id !== id)
    const updatedWorkspaces = { ...tabWorkspaces }
    delete updatedWorkspaces[id]

    if (activeHeaderTabId === id) {
      const nextActiveId = filtered[0]?.id || ''
      if (nextActiveId) {
        set({ headerTabs: filtered, tabWorkspaces: updatedWorkspaces })
        get().setActiveHeaderTab(nextActiveId)
      } else {
        if (dockviewApi) {
          try {
            dockviewApi.clear()
          } catch {
            // ignore
          }
        }
        set({
          headerTabs: [],
          activeHeaderTabId: '',
          panels: {},
          tabWorkspaces: updatedWorkspaces
        })
      }
    } else {
      set({
        headerTabs: filtered,
        tabWorkspaces: updatedWorkspaces
      })
    }
  },

  reorderHeaderTabs: (sourceIndex, targetIndex) =>
    set((state) => {
      const next = [...state.headerTabs]
      const [moved] = next.splice(sourceIndex, 1)
      next.splice(targetIndex, 0, moved)
      return { headerTabs: next }
    }),

  setActiveHeaderTab: (id) => {
    const { activeHeaderTabId, headerTabs, panels, dockviewApi, tabWorkspaces } = get()
    if (activeHeaderTabId === id) return

    const targetTab = headerTabs.find((t) => t.id === id)
    if (!targetTab) return

    const updatedWorkspaces = { ...tabWorkspaces }

    // 1. Snapshot outgoing active tab's layout & panels
    if (activeHeaderTabId) {
      let currentLayoutJson: any = undefined
      if (dockviewApi) {
        try {
          currentLayoutJson = dockviewApi.toJSON()
        } catch {
          // ignore
        }
      }
      updatedWorkspaces[activeHeaderTabId] = {
        ...(updatedWorkspaces[activeHeaderTabId] || {}),
        panels: { ...panels },
        layoutJson: currentLayoutJson
      }
    }

    // 2. Fetch or initialize incoming tab workspace
    let targetWorkspace = updatedWorkspaces[id]
    if (!targetWorkspace) {
      const isBlank = !targetTab.templateId || targetTab.templateId === 'blank'
      const initialPanels = isBlank ? {} : { ...TEMPLATES[targetTab.templateId!]?.panels }
      targetWorkspace = {
        panels: initialPanels,
        layoutJson: undefined,
        templateId: targetTab.templateId
      }
      updatedWorkspaces[id] = targetWorkspace
    }

    const targetPanels = targetWorkspace.panels || {}
    const targetLayout = targetWorkspace.layoutJson

    set({
      activeHeaderTabId: id,
      panels: targetPanels,
      tabWorkspaces: updatedWorkspaces,
      isRestoringLayout: true,
      ...(targetTab.templateId ? { currentTemplateId: targetTab.templateId } : {})
    })

    // 3. Restore Dockview canvas
    if (dockviewApi) {
      try {
        dockviewApi.clear()
        let restored = false
        if (targetLayout && targetLayout.grid && targetLayout.grid.root) {
          try {
            dockviewApi.fromJSON(targetLayout)
            restored = dockviewApi.totalPanels > 0
          } catch (layoutErr) {
            console.warn('Failed dockview fromJSON restore, falling back to panel list', layoutErr)
          }
        }
        if (!restored && Object.keys(targetPanels).length > 0) {
          const panelEntries = Object.values(targetPanels)
          if (panelEntries.length === 5) {
            dockviewApi.addPanel({
              id: panelEntries[0].id,
              component: panelEntries[0].widgetType,
              title: panelEntries[0].title,
              params: panelEntries[0].widgetProps
            })
            dockviewApi.addPanel({
              id: panelEntries[1].id,
              component: panelEntries[1].widgetType,
              title: panelEntries[1].title,
              params: panelEntries[1].widgetProps,
              position: { referencePanel: panelEntries[0].id, direction: 'right' }
            })
            dockviewApi.addPanel({
              id: panelEntries[2].id,
              component: panelEntries[2].widgetType,
              title: panelEntries[2].title,
              params: panelEntries[2].widgetProps,
              position: { referencePanel: panelEntries[0].id, direction: 'below' }
            })
            dockviewApi.addPanel({
              id: panelEntries[3].id,
              component: panelEntries[3].widgetType,
              title: panelEntries[3].title,
              params: panelEntries[3].widgetProps,
              position: { referencePanel: panelEntries[1].id, direction: 'below' }
            })
            dockviewApi.addPanel({
              id: panelEntries[4].id,
              component: panelEntries[4].widgetType,
              title: panelEntries[4].title,
              params: panelEntries[4].widgetProps,
              position: { referencePanel: panelEntries[1].id, direction: 'right' }
            })
          } else {
            panelEntries.forEach((p, idx) => {
              dockviewApi.addPanel({
                id: p.id,
                component: p.widgetType,
                title: p.title,
                params: p.widgetProps,
                position: idx === 0 ? undefined : { direction: idx % 2 === 0 ? 'below' : 'right' }
              })
            })
          }
        }
      } catch (err) {
        console.warn('Error switching dockview tab layout', err)
      } finally {
        set({ isRestoringLayout: false })
      }
    } else {
      set({ isRestoringLayout: false })
    }
  },

  addLeftTab: (tab) => {
    const isCanvas = tab.viewType === 'canvas'
    set((state) => ({
      leftTabs: [...state.leftTabs, tab],
      activeLeftTabId: tab.id,
      panels: isCanvas ? {} : state.panels
    }))
    if (isCanvas) {
      const { dockviewApi } = get()
      if (dockviewApi) {
        try {
          dockviewApi.clear()
        } catch {
          // ignore
        }
      }
    }
  },

  removeLeftTab: (id) =>
    set((state) => {
      const filtered = state.leftTabs.filter((t) => t.id !== id)
      return {
        leftTabs: filtered,
        activeLeftTabId:
          state.activeLeftTabId === id ? filtered[0]?.id || '' : state.activeLeftTabId
      }
    }),

  reorderLeftTabs: (sourceIndex, targetIndex) =>
    set((state) => {
      const next = [...state.leftTabs]
      const [moved] = next.splice(sourceIndex, 1)
      next.splice(targetIndex, 0, moved)
      return { leftTabs: next }
    }),

  setActiveLeftTab: (id) => set({ activeLeftTabId: id }),
  toggleLeftSidebar: () => set((state) => ({ isLeftSidebarOpen: !state.isLeftSidebarOpen })),
  setIsLeftSidebarOpen: (open) => set({ isLeftSidebarOpen: open }),
  setLeftSidebarWidth: (width) =>
    set({ leftSidebarWidth: Math.max(160, Math.min(540, Math.round(width))) }),

  toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),
  setIsRightSidebarOpen: (open) => set({ isRightSidebarOpen: open }),
  setActiveRightTabId: (id) => set({ activeRightTabId: id }),
  setRightSidebarWidth: (width) =>
    set({ rightSidebarWidth: Math.max(260, Math.min(720, Math.round(width))) }),
  addRightTab: (tab) =>
    set((state) => ({
      rightTabs: [...state.rightTabs, tab],
      activeRightTabId: tab.id
    })),
  removeRightTab: (id) =>
    set((state) => {
      const filtered = state.rightTabs.filter((t) => t.id !== id)
      return {
        rightTabs: filtered,
        activeRightTabId:
          state.activeRightTabId === id ? filtered[0]?.id || '' : state.activeRightTabId
      }
    }),

  addFooterTab: (tab) =>
    set((state) => ({
      footerTabs: [...state.footerTabs, tab]
    })),

  removeFooterTab: (id) =>
    set((state) => ({
      footerTabs: state.footerTabs.filter((t) => t.id !== id),
      activeFooterTabId: state.activeFooterTabId === id ? null : state.activeFooterTabId
    })),

  reorderFooterTabs: (sourceIndex, targetIndex) =>
    set((state) => {
      const next = [...state.footerTabs]
      const [moved] = next.splice(sourceIndex, 1)
      next.splice(targetIndex, 0, moved)
      return { footerTabs: next }
    }),

  setActiveFooterTabId: (id) => set({ activeFooterTabId: id }),

  toggleBottomDrawer: (tabId) =>
    set((state) => {
      if (tabId && state.activeFooterTabId === tabId && state.isBottomDrawerOpen) {
        return { isBottomDrawerOpen: false }
      }
      return {
        isBottomDrawerOpen: true,
        activeFooterTabId: tabId || state.activeFooterTabId || state.footerTabs[0]?.id || null
      }
    }),

  setIsBottomDrawerOpen: (open) => set({ isBottomDrawerOpen: open }),

  updateThemeInspector: (updates) =>
    set((state) => ({
      themeInspector: { ...state.themeInspector, ...updates }
    })),

  resetThemeInspector: () => set({ themeInspector: { ...DEFAULT_THEME_INSPECTOR } }),

  updateHeaderConfig: (updates) =>
    set((state) => ({
      headerConfig: { ...state.headerConfig, ...updates }
    })),

  updateFooterConfig: (updates) =>
    set((state) => ({
      footerConfig: { ...state.footerConfig, ...updates }
    })),

  addPanel: (panel, position) => {
    const { dockviewApi, panels, activeHeaderTabId, tabWorkspaces } = get()
    const nextPanels = { ...panels, [panel.id]: panel }
    const updatedWorkspaces = { ...tabWorkspaces }
    if (activeHeaderTabId) {
      updatedWorkspaces[activeHeaderTabId] = {
        ...(updatedWorkspaces[activeHeaderTabId] || {}),
        panels: nextPanels
      }
    }
    set({
      panels: nextPanels,
      tabWorkspaces: updatedWorkspaces
    })

    if (dockviewApi) {
      try {
        dockviewApi.addPanel({
          id: panel.id,
          component: panel.widgetType,
          title: panel.title,
          params: panel.widgetProps,
          position: position?.referencePanel
            ? {
                referencePanel: position.referencePanel,
                direction: position.direction
              }
            : position?.direction
              ? {
                  direction: position.direction
                }
              : undefined
        })
      } catch (err) {
        console.warn('Failed to add panel to dockview layout', err)
      }
    }
  },

  setTargetSlotId: (slotId) => set({ targetSlotId: slotId }),

  addEmptySlot: (direction = 'right', referencePanelId) => {
    const { panels, addPanel } = get()
    const id = `slot-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
    const isColumn = direction === 'right' || direction === 'left'
    const title = isColumn ? 'Empty Column' : 'Empty Row'

    const panelList = Object.keys(panels)
    let refId = referencePanelId
    if (!refId && panelList.length > 0) {
      refId = panelList[panelList.length - 1]
    }

    addPanel(
      {
        id,
        title,
        widgetType: 'empty',
        widgetProps: {},
        closable: true
      },
      refId ? { referencePanel: refId, direction } : undefined
    )
  },

  scaffoldBlankLayout: (scaffold) => {
    const { dockviewApi, activeHeaderTabId, tabWorkspaces } = get()

    let newPanels: Record<string, PanelConfig> = {}

    if (scaffold === '1-slot') {
      newPanels = {
        'slot-1': {
          id: 'slot-1',
          title: 'Empty Slot',
          widgetType: 'empty',
          widgetProps: {},
          closable: true
        }
      }
    } else if (scaffold === '2-columns') {
      newPanels = {
        'slot-1': {
          id: 'slot-1',
          title: 'Empty Column 1',
          widgetType: 'empty',
          widgetProps: {},
          closable: true
        },
        'slot-2': {
          id: 'slot-2',
          title: 'Empty Column 2',
          widgetType: 'empty',
          widgetProps: {},
          closable: true
        }
      }
    } else if (scaffold === '3-columns') {
      newPanels = {
        'slot-1': {
          id: 'slot-1',
          title: 'Empty Column 1',
          widgetType: 'empty',
          widgetProps: {},
          closable: true
        },
        'slot-2': {
          id: 'slot-2',
          title: 'Empty Column 2',
          widgetType: 'empty',
          widgetProps: {},
          closable: true
        },
        'slot-3': {
          id: 'slot-3',
          title: 'Empty Column 3',
          widgetType: 'empty',
          widgetProps: {},
          closable: true
        }
      }
    } else if (scaffold === '2x2-grid') {
      newPanels = {
        'slot-1': {
          id: 'slot-1',
          title: 'Quadrant 1',
          widgetType: 'empty',
          widgetProps: {},
          closable: true
        },
        'slot-2': {
          id: 'slot-2',
          title: 'Quadrant 2',
          widgetType: 'empty',
          widgetProps: {},
          closable: true
        },
        'slot-3': {
          id: 'slot-3',
          title: 'Quadrant 3',
          widgetType: 'empty',
          widgetProps: {},
          closable: true
        },
        'slot-4': {
          id: 'slot-4',
          title: 'Quadrant 4',
          widgetType: 'empty',
          widgetProps: {},
          closable: true
        }
      }
    } else if (scaffold === 'header-2-col') {
      newPanels = {
        'slot-top': {
          id: 'slot-top',
          title: 'Top Banner Slot',
          widgetType: 'empty',
          widgetProps: {},
          closable: true
        },
        'slot-left': {
          id: 'slot-left',
          title: 'Left Column Slot',
          widgetType: 'empty',
          widgetProps: {},
          closable: true
        },
        'slot-right': {
          id: 'slot-right',
          title: 'Right Column Slot',
          widgetType: 'empty',
          widgetProps: {},
          closable: true
        }
      }
    } else if (scaffold === '3-rows') {
      newPanels = {
        'slot-row1': {
          id: 'slot-row1',
          title: 'Empty Row 1',
          widgetType: 'empty',
          widgetProps: {},
          closable: true
        },
        'slot-row2': {
          id: 'slot-row2',
          title: 'Empty Row 2',
          widgetType: 'empty',
          widgetProps: {},
          closable: true
        },
        'slot-row3': {
          id: 'slot-row3',
          title: 'Empty Row 3',
          widgetType: 'empty',
          widgetProps: {},
          closable: true
        }
      }
    }

    const updatedWorkspaces = { ...tabWorkspaces }
    if (activeHeaderTabId) {
      updatedWorkspaces[activeHeaderTabId] = {
        ...(updatedWorkspaces[activeHeaderTabId] || {}),
        panels: newPanels,
        layoutJson: undefined
      }
    }

    set({
      panels: newPanels,
      tabWorkspaces: updatedWorkspaces,
      isRestoringLayout: true
    })

    if (dockviewApi) {
      try {
        dockviewApi.clear()
        if (scaffold === '1-slot') {
          dockviewApi.addPanel({
            id: 'slot-1',
            component: 'empty',
            title: 'Empty Slot',
            params: {}
          })
        } else if (scaffold === '2-columns') {
          dockviewApi.addPanel({
            id: 'slot-1',
            component: 'empty',
            title: 'Empty Column 1',
            params: {}
          })
          dockviewApi.addPanel({
            id: 'slot-2',
            component: 'empty',
            title: 'Empty Column 2',
            params: {},
            position: { referencePanel: 'slot-1', direction: 'right' }
          })
        } else if (scaffold === '3-columns') {
          dockviewApi.addPanel({
            id: 'slot-1',
            component: 'empty',
            title: 'Empty Column 1',
            params: {}
          })
          dockviewApi.addPanel({
            id: 'slot-2',
            component: 'empty',
            title: 'Empty Column 2',
            params: {},
            position: { referencePanel: 'slot-1', direction: 'right' }
          })
          dockviewApi.addPanel({
            id: 'slot-3',
            component: 'empty',
            title: 'Empty Column 3',
            params: {},
            position: { referencePanel: 'slot-2', direction: 'right' }
          })
        } else if (scaffold === '2x2-grid') {
          dockviewApi.addPanel({
            id: 'slot-1',
            component: 'empty',
            title: 'Quadrant 1',
            params: {}
          })
          dockviewApi.addPanel({
            id: 'slot-2',
            component: 'empty',
            title: 'Quadrant 2',
            params: {},
            position: { referencePanel: 'slot-1', direction: 'right' }
          })
          dockviewApi.addPanel({
            id: 'slot-3',
            component: 'empty',
            title: 'Quadrant 3',
            params: {},
            position: { referencePanel: 'slot-1', direction: 'below' }
          })
          dockviewApi.addPanel({
            id: 'slot-4',
            component: 'empty',
            title: 'Quadrant 4',
            params: {},
            position: { referencePanel: 'slot-2', direction: 'below' }
          })
        } else if (scaffold === 'header-2-col') {
          dockviewApi.addPanel({
            id: 'slot-top',
            component: 'empty',
            title: 'Top Banner Slot',
            params: {}
          })
          dockviewApi.addPanel({
            id: 'slot-left',
            component: 'empty',
            title: 'Left Column Slot',
            params: {},
            position: { referencePanel: 'slot-top', direction: 'below' }
          })
          dockviewApi.addPanel({
            id: 'slot-right',
            component: 'empty',
            title: 'Right Column Slot',
            params: {},
            position: { referencePanel: 'slot-left', direction: 'right' }
          })
        } else if (scaffold === '3-rows') {
          dockviewApi.addPanel({
            id: 'slot-row1',
            component: 'empty',
            title: 'Empty Row 1',
            params: {}
          })
          dockviewApi.addPanel({
            id: 'slot-row2',
            component: 'empty',
            title: 'Empty Row 2',
            params: {},
            position: { referencePanel: 'slot-row1', direction: 'below' }
          })
          dockviewApi.addPanel({
            id: 'slot-row3',
            component: 'empty',
            title: 'Empty Row 3',
            params: {},
            position: { referencePanel: 'slot-row2', direction: 'below' }
          })
        }
      } catch (err) {
        console.warn('Failed to scaffold layout in dockview', err)
      } finally {
        set({ isRestoringLayout: false })
      }
    } else {
      set({ isRestoringLayout: false })
    }
  },

  fillEmptySlot: (slotId, item) => {
    const { dockviewApi, panels, activeHeaderTabId, tabWorkspaces } = get()
    if (!panels[slotId]) return

    const newId = `${item.widgetType}-${Date.now().toString(36)}`
    const newPanelConfig: PanelConfig = {
      id: newId,
      title: item.title,
      widgetType: item.widgetType,
      widgetProps: { ...item.defaultProps },
      closable: true
    }

    const nextPanels = { ...panels }
    delete nextPanels[slotId]
    nextPanels[newId] = newPanelConfig

    const updatedWorkspaces = { ...tabWorkspaces }
    if (activeHeaderTabId) {
      updatedWorkspaces[activeHeaderTabId] = {
        ...(updatedWorkspaces[activeHeaderTabId] || {}),
        panels: nextPanels
      }
    }

    set({
      panels: nextPanels,
      tabWorkspaces: updatedWorkspaces,
      targetSlotId: null,
      isRestoringLayout: true
    })

    if (dockviewApi) {
      try {
        const oldPanel = dockviewApi.getPanel(slotId)
        dockviewApi.addPanel({
          id: newId,
          component: item.widgetType,
          title: item.title,
          params: item.defaultProps,
          position: { referencePanel: slotId, direction: 'within' }
        })
        if (oldPanel) {
          dockviewApi.removePanel(oldPanel)
        }
      } catch (err) {
        console.warn('Failed to replace empty slot in dockview', err)
      } finally {
        set({ isRestoringLayout: false })
      }
    } else {
      set({ isRestoringLayout: false })
    }
  },

  insertCatalogWidget: (item, direction) => {
    const { targetSlotId, fillEmptySlot, addPanel, catalogPlacementDirection } = get()
    if (targetSlotId) {
      fillEmptySlot(targetSlotId, item)
      return
    }

    const targetDir = direction || item.defaultDirection || catalogPlacementDirection || 'right'
    const id = `${item.widgetType}-${Date.now()}`
    const panelConfig: PanelConfig = {
      id,
      title: item.title,
      widgetType: item.widgetType,
      widgetProps: { ...item.defaultProps },
      closable: true
    }

    if (targetDir === 'stack') {
      addPanel(panelConfig)
    } else {
      addPanel(panelConfig, { direction: targetDir })
    }
  },

  removePanel: (id) => {
    const { dockviewApi, panels, activeHeaderTabId, tabWorkspaces } = get()
    const nextPanels = { ...panels }
    delete nextPanels[id]
    const updatedWorkspaces = { ...tabWorkspaces }
    if (activeHeaderTabId) {
      updatedWorkspaces[activeHeaderTabId] = {
        ...(updatedWorkspaces[activeHeaderTabId] || {}),
        panels: nextPanels
      }
    }
    set({
      panels: nextPanels,
      tabWorkspaces: updatedWorkspaces
    })

    if (dockviewApi) {
      try {
        const panel = dockviewApi.getPanel(id)
        if (panel) {
          dockviewApi.removePanel(panel)
        }
      } catch (err) {
        console.warn('Failed to remove panel from dockview', err)
      }
    }
  },

  updatePanel: (id, updates) => {
    const { panels, dockviewApi, activeHeaderTabId, tabWorkspaces } = get()
    if (!panels[id]) return

    const updated = { ...panels[id], ...updates }
    const nextPanels = {
      ...panels,
      [id]: updated
    }
    const updatedWorkspaces = { ...tabWorkspaces }
    if (activeHeaderTabId) {
      updatedWorkspaces[activeHeaderTabId] = {
        ...(updatedWorkspaces[activeHeaderTabId] || {}),
        panels: nextPanels
      }
    }
    set({
      panels: nextPanels,
      tabWorkspaces: updatedWorkspaces
    })

    if (dockviewApi && updates.title) {
      try {
        const panel = dockviewApi.getPanel(id)
        if (panel) {
          panel.setTitle(updates.title)
        }
      } catch (err) {
        console.warn('Failed to update panel title in dockview', err)
      }
    }
  },

  loadTemplate: (templateId) => {
    const template = TEMPLATES[templateId]
    if (!template) return

    const { dockviewApi } = get()

    if (templateId === 'blank') {
      if (dockviewApi) {
        try {
          dockviewApi.clear()
        } catch {
          // ignore
        }
      }
      set({
        currentTemplateId: 'blank',
        selectedThemeKey: template.themeKey,
        headerConfig: { ...template.header },
        footerConfig: { ...template.footer },
        headerTabs: [],
        activeHeaderTabId: '',
        tabWorkspaces: {},
        leftTabs: [],
        activeLeftTabId: '',
        footerTabs: [],
        activeFooterTabId: null,
        isBottomDrawerOpen: false,
        panels: {}
      })
      return
    }

    const newTabs =
      template.headerTabs && template.headerTabs.length > 0
        ? [...template.headerTabs]
        : [
            {
              id: `tab-${templateId}`,
              label: template.name,
              templateId,
              icon: template.icon || 'Layers'
            }
          ]

    const newWorkspaces: Record<string, TabWorkspaceState> = {}
    if (template.tabWorkspaces && Object.keys(template.tabWorkspaces).length > 0) {
      Object.entries(template.tabWorkspaces).forEach(([tabId, tabPanels]) => {
        newWorkspaces[tabId] = {
          panels: { ...tabPanels },
          layoutJson: undefined,
          templateId
        }
      })
    } else {
      newTabs.forEach((tab) => {
        newWorkspaces[tab.id] = {
          panels: { ...template.panels },
          layoutJson: undefined,
          templateId
        }
      })
    }

    const initialActiveId = newTabs[0]?.id || ''
    const initialPanels =
      initialActiveId && newWorkspaces[initialActiveId]
        ? { ...newWorkspaces[initialActiveId].panels }
        : { ...template.panels }

    set({
      currentTemplateId: templateId,
      selectedThemeKey: template.themeKey,
      headerConfig: { ...template.header },
      footerConfig: { ...template.footer },
      headerTabs: newTabs,
      activeHeaderTabId: initialActiveId,
      tabWorkspaces: newWorkspaces,
      panels: initialPanels,
      isRestoringLayout: true
    })

    if (dockviewApi) {
      try {
        dockviewApi.clear()
        const panelEntries = Object.values(initialPanels)
        if (panelEntries.length === 5) {
          dockviewApi.addPanel({
            id: panelEntries[0].id,
            component: panelEntries[0].widgetType,
            title: panelEntries[0].title,
            params: panelEntries[0].widgetProps
          })
          dockviewApi.addPanel({
            id: panelEntries[1].id,
            component: panelEntries[1].widgetType,
            title: panelEntries[1].title,
            params: panelEntries[1].widgetProps,
            position: { referencePanel: panelEntries[0].id, direction: 'right' }
          })
          dockviewApi.addPanel({
            id: panelEntries[2].id,
            component: panelEntries[2].widgetType,
            title: panelEntries[2].title,
            params: panelEntries[2].widgetProps,
            position: { referencePanel: panelEntries[0].id, direction: 'below' }
          })
          dockviewApi.addPanel({
            id: panelEntries[3].id,
            component: panelEntries[3].widgetType,
            title: panelEntries[3].title,
            params: panelEntries[3].widgetProps,
            position: { referencePanel: panelEntries[1].id, direction: 'below' }
          })
          dockviewApi.addPanel({
            id: panelEntries[4].id,
            component: panelEntries[4].widgetType,
            title: panelEntries[4].title,
            params: panelEntries[4].widgetProps,
            position: { referencePanel: panelEntries[1].id, direction: 'right' }
          })
        } else {
          panelEntries.forEach((p, idx) => {
            dockviewApi.addPanel({
              id: p.id,
              component: p.widgetType,
              title: p.title,
              params: p.widgetProps,
              position: idx === 0 ? undefined : { direction: idx % 2 === 0 ? 'below' : 'right' }
            })
          })
        }
      } catch (err) {
        console.warn('Failed to load template into dockview', err)
      } finally {
        set({ isRestoringLayout: false })
      }
    } else {
      set({ isRestoringLayout: false })
    }
  },

  clearAllTabsAndPanels: () => {
    const { dockviewApi } = get()
    if (dockviewApi) {
      try {
        dockviewApi.clear()
      } catch {
        // ignore
      }
    }
    set({
      headerTabs: [],
      activeHeaderTabId: '',
      tabWorkspaces: {},
      leftTabs: [],
      activeLeftTabId: '',
      rightTabs: [],
      activeRightTabId: '',
      footerTabs: [],
      activeFooterTabId: null,
      isBottomDrawerOpen: false,
      panels: {}
    })
  },

  exportConfigJson: () => {
    const state = get()
    let serializedLayout = null
    if (state.dockviewApi) {
      try {
        serializedLayout = state.dockviewApi.toJSON()
      } catch {
        serializedLayout = null
      }
    }

    const config: ReframeConfig = {
      id: `reframe-${Date.now()}`,
      version: '1.0.0',
      meta: {
        name: TEMPLATES[state.currentTemplateId]?.name || 'Custom Reframe Template',
        description:
          TEMPLATES[state.currentTemplateId]?.description || 'Exported client deliverable',
        targetClient: 'Enterprise Deliverable',
        lastModified: new Date().toISOString()
      },
      mode: state.mode,
      framing: {
        header: state.headerConfig,
        footer: state.footerConfig
      },
      theme: {
        mode: 'dark',
        accentColor: state.themeInspector.accentColor,
        density: 'comfortable'
      },
      panels: state.panels,
      dockviewLayout: serializedLayout
    }

    return JSON.stringify(config, null, 2)
  },

  importConfigJson: (jsonStr) => {
    try {
      const config = JSON.parse(jsonStr) as ReframeConfig
      if (!config.framing || !config.panels) return false

      set({
        headerConfig: config.framing.header,
        footerConfig: config.framing.footer,
        panels: config.panels
      })

      const { dockviewApi } = get()
      if (dockviewApi) {
        if (config.dockviewLayout) {
          dockviewApi.fromJSON(config.dockviewLayout)
        } else {
          dockviewApi.clear()
          Object.values(config.panels).forEach((p, idx) => {
            dockviewApi.addPanel({
              id: p.id,
              component: p.widgetType,
              title: p.title,
              params: p.widgetProps,
              position: idx === 0 ? undefined : { direction: idx % 2 === 0 ? 'below' : 'right' }
            })
          })
        }
      }
      return true
    } catch (err) {
      console.error('Failed to import Reframe config:', err)
      return false
    }
  }
}))

if (typeof window !== 'undefined') {
  ;(window as any).__REFRAME_STORE__ = useReframeStore
}
