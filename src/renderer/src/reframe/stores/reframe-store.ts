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
  FooterTabItem
} from '../types/reframe-types'
import type { WidgetCatalogItem } from '../widgets/catalog/widget-catalog'

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

export type TemplateId =
  'executive' | 'operations' | 'analytics' | 'engineering' | 'minimal' | 'blank'

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

export const TEMPLATES: Record<
  TemplateId,
  {
    name: string
    description: string
    themeKey: string
    header: HeaderConfig
    footer: FooterConfig
    panels: Record<string, PanelConfig>
  }
> = {
  executive: {
    name: 'Executive Dashboard',
    description:
      'High-level financial KPIs, portfolio growth charts, enterprise pipeline, and strategy briefs.',
    themeKey: 'dockview-theme-abyss',
    header: {
      visible: true,
      title: 'Apex Capital Analytics',
      subtitle: 'Portfolio Performance & Executive Directive Console',
      badge: 'Enterprise v2.4',
      fontFamily: 'outfit',
      titleSize: 'xl',
      titleWeight: 'bold',
      showLogo: true,
      logoIcon: 'Layers',
      actions: [
        { id: 'sync', label: 'Sync Portfolios', icon: 'RefreshCw', actionType: 'refresh' },
        { id: 'export-pdf', label: 'Export Brief', icon: 'Download', actionType: 'export' }
      ],
      showWindowControls: true
    },
    footer: {
      visible: true,
      leftText: 'Region: us-east (Northern Virginia)',
      centerText: 'Live Stream: 142 ms latency',
      rightText: 'Apex Core Engine v2.4.1',
      statusState: 'online',
      statusLabel: 'Cluster Healthy',
      fontFamily: 'outfit',
      fontSize: 'xs'
    },
    panels: {
      'kpi-summary': {
        id: 'kpi-summary',
        title: 'Executive Metrics',
        widgetType: 'kpi',
        closable: false,
        widgetProps: {
          items: [
            {
              label: 'Total AUM',
              value: '$48.2M',
              delta: '+14.2% YoY',
              deltaType: 'positive',
              subtext: 'vs $42.2M target'
            },
            {
              label: 'Net Annual Recurring',
              value: '$8.9M',
              delta: '+22.4%',
              deltaType: 'positive',
              subtext: 'Across 142 accounts'
            },
            {
              label: 'Sharpe Ratio',
              value: '2.84',
              delta: '+0.31',
              deltaType: 'positive',
              subtext: 'Risk-adjusted return'
            },
            {
              label: 'Average LTV',
              value: '$68.4K',
              delta: '-1.2%',
              deltaType: 'neutral',
              subtext: '98.4% retention rate'
            }
          ]
        }
      },
      'chart-revenue': {
        id: 'chart-revenue',
        title: 'Revenue & Yield Trajectory',
        widgetType: 'chart',
        closable: true,
        widgetProps: {
          title: 'Monthly Recurring Revenue ($K)',
          chartType: 'area',
          dataKey: 'revenue',
          timeRange: '12 Months'
        }
      },
      'table-holdings': {
        id: 'table-holdings',
        title: 'Enterprise Pipeline & Deal Flow',
        widgetType: 'table',
        closable: true,
        widgetProps: {
          title: 'Active Deal Pipeline',
          columns: [
            { key: 'client', header: 'Client' },
            { key: 'tier', header: 'Tier' },
            { key: 'value', header: 'Est. Deal Value' },
            { key: 'stage', header: 'Stage' },
            { key: 'status', header: 'Status' }
          ],
          rows: [
            {
              client: 'Acme Global Corp',
              tier: 'Tier 1 Enterprise',
              value: '$1,200,000',
              stage: 'Procurement Final',
              status: 'Closing Soon'
            },
            {
              client: 'Helios Biopharma',
              tier: 'Strategic Growth',
              value: '$850,000',
              stage: 'Security Review',
              status: 'In Review'
            },
            {
              client: 'Starlight Financial',
              tier: 'Enterprise Plus',
              value: '$2,400,000',
              stage: 'Contract Signed',
              status: 'Onboarding'
            },
            {
              client: 'Nexus HyperScale',
              tier: 'Tier 1 Enterprise',
              value: '$1,750,000',
              stage: 'Pilot Evaluation',
              status: 'Active Pilot'
            },
            {
              client: 'Crestline Mobility',
              tier: 'Commercial',
              value: '$420,000',
              stage: 'Proposal Sent',
              status: 'Negotiating'
            }
          ]
        }
      },
      'notes-briefing': {
        id: 'notes-briefing',
        title: 'Directive & Runbook',
        widgetType: 'notes',
        closable: true,
        widgetProps: {
          title: 'Q3 Executive Directive',
          content: `### Executive Liquidity & Expansion Directive (Q3)\n\n* **Capital Allocation Target:** $50M AUM threshold projected for October 1st.\n* **Key Deliverables:**\n  1. Complete automated compliance reporting across EU and North America entities.\n  2. Deploy high-frequency data pipelines for client portfolio visibility.\n  3. Harden internal access policies prior to SOC2 Type II audit.\n\n> "Client deliverables should emphasize transparent risk metrics and single-click reporting without unnecessary developer chrome."`
        }
      }
    }
  },

  operations: {
    name: 'Operations & SRE Monitor',
    description:
      'Live infrastructure telemetry, cluster health, real-time activity stream, and action triggers.',
    themeKey: 'dockview-theme-dracula',
    header: {
      visible: true,
      title: 'PulseOps Control Plane',
      subtitle: 'Distributed SRE Telemetry & Observability Hub',
      badge: 'Live Telemetry',
      fontFamily: 'jetbrains',
      titleSize: 'lg',
      titleWeight: 'semibold',
      showLogo: true,
      logoIcon: 'Activity',
      actions: [
        { id: 'cycle', label: 'Drain Inactive', icon: 'Zap', actionType: 'alert' },
        { id: 'refresh', label: 'Poll Health', icon: 'RefreshCw', actionType: 'refresh' }
      ],
      showWindowControls: true
    },
    footer: {
      visible: true,
      leftText: 'Active Pods: 48/48 (100%)',
      centerText: 'Event Ingest: 142k events/sec',
      rightText: 'P99 Latency: 14ms',
      statusState: 'online',
      statusLabel: 'Nominal',
      fontFamily: 'jetbrains',
      fontSize: 'xs'
    },
    panels: {
      'kpi-infra': {
        id: 'kpi-infra',
        title: 'Infrastructure Vital Signs',
        widgetType: 'kpi',
        closable: false,
        widgetProps: {
          items: [
            {
              label: 'Cluster Uptime',
              value: '99.995%',
              delta: '+0.02%',
              deltaType: 'positive',
              subtext: 'Past 30 days'
            },
            {
              label: 'Median Latency',
              value: '14.2ms',
              delta: '-2.1ms',
              deltaType: 'positive',
              subtext: 'Global edge cache'
            },
            {
              label: 'CPU Allocation',
              value: '38.4%',
              delta: '+4.1%',
              deltaType: 'neutral',
              subtext: 'Autoscale ceiling 85%'
            },
            {
              label: 'Ingest Rate',
              value: '142 k/s',
              delta: '+12 k/s',
              deltaType: 'positive',
              subtext: 'Zero dropped frames'
            }
          ]
        }
      },
      'stream-activity': {
        id: 'stream-activity',
        title: 'Live Event Stream',
        widgetType: 'activity',
        closable: true,
        widgetProps: {
          title: 'Cluster Event Log',
          filterSeverity: 'all'
        }
      },
      'table-clusters': {
        id: 'table-clusters',
        title: 'Microservices & Endpoints',
        widgetType: 'table',
        closable: true,
        widgetProps: {
          title: 'Fleet Health Registry',
          columns: [
            { key: 'service', header: 'Service' },
            { key: 'replicas', header: 'Replicas' },
            { key: 'latency', header: 'p95' },
            { key: 'errorRate', header: 'Error %' },
            { key: 'health', header: 'Health' }
          ],
          rows: [
            {
              service: 'api-gateway-core',
              replicas: '12/12',
              latency: '8ms',
              errorRate: '0.001%',
              health: 'Healthy'
            },
            {
              service: 'auth-neon-token',
              replicas: '6/6',
              latency: '12ms',
              errorRate: '0.000%',
              health: 'Healthy'
            },
            {
              service: 'billing-stripe-worker',
              replicas: '4/4',
              latency: '45ms',
              errorRate: '0.005%',
              health: 'Healthy'
            },
            {
              service: 'lakebase-query-mesh',
              replicas: '8/8',
              latency: '19ms',
              errorRate: '0.000%',
              health: 'Healthy'
            },
            {
              service: 'notification-resend',
              replicas: '3/3',
              latency: '82ms',
              errorRate: '0.010%',
              health: 'Healthy'
            }
          ]
        }
      },
      'actionpad-ops': {
        id: 'actionpad-ops',
        title: 'Operational Controls',
        widgetType: 'actionpad',
        closable: true,
        widgetProps: {
          title: 'Fast Action Triggers',
          actions: [
            {
              id: 'flush-cache',
              label: 'Purge Edge CDN Cache',
              description: 'Invalidates edge caches worldwide'
            },
            {
              id: 'cycle-auth',
              label: 'Rotate Session Salts',
              description: 'Gracefully rotates worker session keys'
            },
            {
              id: 'run-diagnostics',
              label: 'Run Full Node Diagnostics',
              description: 'Synthesizes synthetic trace report'
            }
          ]
        }
      }
    }
  },

  analytics: {
    name: 'Product Analytics & Funnel Velocity',
    description:
      'User acquisition funnels, conversion rates, customer cohorts, and behavioral insights.',
    themeKey: 'dockview-theme-nord',
    header: {
      visible: true,
      title: 'Vanguard Growth Studio',
      subtitle: 'Cohort Analysis & Product Funnel Diagnostics',
      badge: 'Cohort Engine',
      fontFamily: 'inter',
      titleSize: 'lg',
      titleWeight: 'semibold',
      showLogo: true,
      logoIcon: 'BarChart3',
      actions: [
        { id: 'refresh', label: 'Refresh Data', icon: 'RefreshCw', actionType: 'refresh' },
        { id: 'export-csv', label: 'Export Cohorts', icon: 'Download', actionType: 'export' }
      ],
      showWindowControls: true
    },
    footer: {
      visible: true,
      leftText: 'Dataset: 2026-Q3 Production Clickstream',
      centerText: 'Sampling: 100% Unsampled',
      rightText: 'Last Computed: 2 mins ago',
      statusState: 'synced',
      statusLabel: 'Sync Complete',
      fontFamily: 'inter',
      fontSize: 'xs'
    },
    panels: {
      'kpi-growth': {
        id: 'kpi-growth',
        title: 'Product Funnel KPIs',
        widgetType: 'kpi',
        closable: false,
        widgetProps: {
          items: [
            {
              label: 'Signup Conversion',
              value: '4.82%',
              delta: '+0.64%',
              deltaType: 'positive',
              subtext: 'Visitors to account'
            },
            {
              label: 'Activation Rate',
              value: '62.4%',
              delta: '+3.1%',
              deltaType: 'positive',
              subtext: 'Setup completed within 24h'
            },
            {
              label: 'Weekly Active Users',
              value: '28,490',
              delta: '+18.2%',
              deltaType: 'positive',
              subtext: 'Engaged 3+ sessions'
            },
            {
              label: 'Paid Expansion',
              value: '18.9%',
              delta: '+1.5%',
              deltaType: 'positive',
              subtext: 'Seat additions'
            }
          ]
        }
      },
      'chart-funnel': {
        id: 'chart-funnel',
        title: 'Conversion Funnel & Volume',
        widgetType: 'chart',
        closable: true,
        widgetProps: {
          title: 'Funnel Step Velocity',
          chartType: 'bar',
          dataKey: 'conversions',
          timeRange: '30 Days'
        }
      },
      'table-cohorts': {
        id: 'table-cohorts',
        title: 'Active Customer Cohorts',
        widgetType: 'table',
        closable: true,
        widgetProps: {
          title: 'Retention by Cohort',
          columns: [
            { key: 'cohort', header: 'Cohort' },
            { key: 'users', header: 'Users' },
            { key: 'w1', header: 'Week 1' },
            { key: 'w4', header: 'Week 4' },
            { key: 'w8', header: 'Week 8' }
          ],
          rows: [
            {
              cohort: '2026-08 (Enterprise Beta)',
              users: '1,420',
              w1: '94%',
              w4: '88%',
              w8: '85%'
            },
            { cohort: '2026-07 (Early Adopters)', users: '3,840', w1: '91%', w4: '82%', w8: '79%' },
            {
              cohort: '2026-06 (Self-Serve Public)',
              users: '12,900',
              w1: '78%',
              w4: '64%',
              w8: '59%'
            },
            {
              cohort: '2026-05 (Developer Preview)',
              users: '5,100',
              w1: '84%',
              w4: '71%',
              w8: '68%'
            }
          ]
        }
      }
    }
  },

  engineering: {
    name: 'DevForge Terminal & Build Matrix',
    description: 'Repository state, CI pipelines, build scripts execution, and package specs.',
    themeKey: 'dockview-theme-monokai',
    header: {
      visible: true,
      title: 'DevForge Terminal Matrix',
      subtitle: 'Monorepo Pipeline & Git Orchestration Suite',
      badge: 'v0.3.0',
      fontFamily: 'fira',
      titleSize: 'lg',
      titleWeight: 'semibold',
      showLogo: true,
      logoIcon: 'Terminal',
      actions: [
        { id: 'build-all', label: 'Trigger Build', icon: 'Hammer', actionType: 'refresh' },
        { id: 'test-all', label: 'Run Vitest', icon: 'Activity', actionType: 'alert' }
      ],
      showWindowControls: true
    },
    footer: {
      visible: true,
      leftText: 'Branch: main @ 7d9a1f2',
      centerText: 'Active Worktrees: 3',
      rightText: 'Build Status: 74/74 Passing',
      statusState: 'online',
      statusLabel: 'All Tests Green',
      fontFamily: 'fira',
      fontSize: 'xs'
    },
    panels: {
      'table-prs': {
        id: 'table-prs',
        title: 'Active Pull Requests',
        widgetType: 'table',
        closable: true,
        widgetProps: {
          title: 'Review Queue',
          columns: [
            { key: 'pr', header: 'PR' },
            { key: 'title', header: 'Title' },
            { key: 'author', header: 'Author' },
            { key: 'ci', header: 'CI' },
            { key: 'status', header: 'Status' }
          ],
          rows: [
            {
              pr: '#142',
              title: 'feat: add Reframe dynamic dockview layout engine',
              author: 'tab_Hub',
              ci: 'Passing',
              status: 'Approved'
            },
            {
              pr: '#141',
              title: 'fix: resolve windows electron focus & merge conflicts',
              author: 'upstream',
              ci: 'Passing',
              status: 'Merged'
            },
            {
              pr: '#138',
              title: 'perf: optimize bundle tree-shaking & icons',
              author: 'core-team',
              ci: 'Passing',
              status: 'Review Needed'
            }
          ]
        }
      },
      'stream-build': {
        id: 'stream-build',
        title: 'Build & Test Log Stream',
        widgetType: 'activity',
        closable: true,
        widgetProps: {
          title: 'Real-time Build Output',
          filterSeverity: 'all'
        }
      },
      'actionpad-scripts': {
        id: 'actionpad-scripts',
        title: 'Script Triggers',
        widgetType: 'actionpad',
        closable: true,
        widgetProps: {
          title: 'Npm Executables',
          actions: [
            {
              id: 'npm-typecheck',
              label: 'npm run typecheck',
              description: 'Run tsc web & node compile checks'
            },
            {
              id: 'npm-test',
              label: 'npm run test',
              description: 'Execute vitest runner (74 tests)'
            },
            {
              id: 'npm-build',
              label: 'npm run build',
              description: 'Compile electron vite bundles'
            }
          ]
        }
      }
    }
  },

  minimal: {
    name: 'Minimal Executive KPI Hub',
    description:
      'Clean, distraction-free metrics overview optimized for client presentation displays.',
    themeKey: 'dockview-theme-catppuccin-mocha',
    header: {
      visible: true,
      title: 'Cockpit Minimal Hub',
      subtitle: 'Distraction-Free Executive Status Display',
      badge: 'Live Client Display',
      fontFamily: 'geist',
      titleSize: 'xl',
      titleWeight: 'bold',
      showLogo: true,
      logoIcon: 'Sparkles',
      actions: [{ id: 'fullscreen', label: 'Fullscreen', icon: 'Maximize2', actionType: 'alert' }],
      showWindowControls: true
    },
    footer: {
      visible: true,
      leftText: 'Live Stream Connected',
      centerText: 'Zero-Downtime Replication',
      rightText: 'Client ID: 9482-B',
      statusState: 'online',
      statusLabel: 'Operating Normally',
      fontFamily: 'geist',
      fontSize: 'xs'
    },
    panels: {
      'kpi-primary': {
        id: 'kpi-primary',
        title: 'Primary Performance Indicators',
        widgetType: 'kpi',
        closable: false,
        widgetProps: {
          items: [
            {
              label: 'Current Valuation',
              value: '$124.5M',
              delta: '+8.4%',
              deltaType: 'positive',
              subtext: 'Latest round evaluation'
            },
            {
              label: 'Monthly Growth Rate',
              value: '18.4%',
              delta: '+2.1%',
              deltaType: 'positive',
              subtext: 'Compounded MoM'
            },
            {
              label: 'Burn Multiple',
              value: '0.82x',
              delta: '-0.14x',
              deltaType: 'positive',
              subtext: 'Capital efficiency benchmark'
            },
            {
              label: 'Net Promoter Score',
              value: '74',
              delta: '+6',
              deltaType: 'positive',
              subtext: 'Top decile benchmark'
            }
          ]
        }
      },
      'chart-trajectory': {
        id: 'chart-trajectory',
        title: 'Growth Trajectory',
        widgetType: 'chart',
        closable: true,
        widgetProps: {
          title: '3-Year Revenue Scaling ($M)',
          chartType: 'area',
          dataKey: 'revenue',
          timeRange: 'Trailing 36 Mo'
        }
      }
    }
  },

  blank: {
    name: 'Blank Slate (Empty Playground)',
    description:
      'Clean empty canvas with zero default tabs or widgets. Ready to build freely from scratch.',
    themeKey: 'dockview-theme-abyss',
    header: {
      visible: true,
      title: 'Blank Playground',
      subtitle: 'Click + to add tabs, widgets, and framing',
      badge: 'Empty Canvas',
      fontFamily: 'inter',
      titleSize: 'lg',
      titleWeight: 'semibold',
      showLogo: true,
      logoIcon: 'Sparkles',
      actions: [],
      showWindowControls: true
    },
    footer: {
      visible: true,
      leftText: 'Empty Canvas',
      centerText: 'Ready',
      rightText: 'v1.0.0',
      statusState: 'online',
      statusLabel: 'Ready',
      fontFamily: 'inter',
      fontSize: 'xs'
    },
    panels: {}
  }
}

export const useReframeStore = create<ReframeStoreState>((set, get) => ({
  mode: 'builder',
  isControlsOpen: true,
  isBakeModalOpen: false,
  isCatalogModalOpen: false,
  catalogPlacementDirection: 'right',
  activeTab: 'theme',
  deviceMode: 'desktop',
  selectedThemeKey: 'dockview-theme-abyss',
  currentTemplateId: 'executive',

  // 4 Dynamic Framing Zones (Executive Dashboard Default)
  headerTabs: [
    { id: 'tab-executive', label: 'Executive Suite', templateId: 'executive', icon: 'Layers' },
    {
      id: 'tab-operations',
      label: 'Operations & SRE',
      templateId: 'operations',
      icon: 'Activity'
    },
    {
      id: 'tab-analytics',
      label: 'Product Analytics',
      templateId: 'analytics',
      icon: 'BarChart3'
    },
    {
      id: 'tab-engineering',
      label: 'DevForge Matrix',
      templateId: 'engineering',
      icon: 'Terminal'
    }
  ],
  activeHeaderTabId: 'tab-executive',

  // Per-Tab Layout & Widget Workspaces
  tabWorkspaces: {},
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
          Object.values(targetPanels).forEach((p, idx) => {
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

  insertCatalogWidget: (item, direction) => {
    const { addPanel, catalogPlacementDirection } = get()
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

    const defaultTabsForTemplate: Record<string, HeaderTabItem[]> = {
      executive: [
        { id: 'tab-executive', label: 'Executive Suite', templateId: 'executive', icon: 'Layers' },
        {
          id: 'tab-operations',
          label: 'Operations & SRE',
          templateId: 'operations',
          icon: 'Activity'
        },
        {
          id: 'tab-analytics',
          label: 'Product Analytics',
          templateId: 'analytics',
          icon: 'BarChart3'
        },
        {
          id: 'tab-engineering',
          label: 'DevForge Matrix',
          templateId: 'engineering',
          icon: 'Terminal'
        }
      ],
      operations: [
        {
          id: 'tab-operations',
          label: 'Operations & SRE',
          templateId: 'operations',
          icon: 'Activity'
        }
      ],
      analytics: [
        {
          id: 'tab-analytics',
          label: 'Product Analytics',
          templateId: 'analytics',
          icon: 'BarChart3'
        }
      ],
      engineering: [
        {
          id: 'tab-engineering',
          label: 'DevForge Matrix',
          templateId: 'engineering',
          icon: 'Terminal'
        }
      ],
      minimal: [{ id: 'tab-minimal', label: 'Minimal Hub', templateId: 'minimal', icon: 'Layers' }]
    }

    const newTabs = defaultTabsForTemplate[templateId] || [
      { id: `tab-${templateId}`, label: template.name, templateId, icon: 'Layers' }
    ]

    const defaultLeftTabs: LeftTabItem[] = [
      { id: 'left-canvas', label: 'Active Layout Canvas', viewType: 'canvas', icon: 'LayoutGrid' },
      { id: 'left-directives', label: 'Directives & Runbook', viewType: 'notes', icon: 'FileText' },
      {
        id: 'left-portal',
        label: 'SaaS Client Preview',
        viewType: 'embed',
        url: 'https://dockview.dev',
        icon: 'Globe'
      }
    ]

    const defaultFooterTabs: FooterTabItem[] = [
      {
        id: 'foot-cluster',
        label: 'Cluster',
        value: '🟢 Healthy',
        status: 'online',
        content: 'Cluster us-east: 48/48 nodes online. Zero packet loss.'
      },
      {
        id: 'foot-latency',
        label: 'Latency',
        value: '⚡ 14ms',
        status: 'synced',
        content: 'Median ping to edge CDN: 14.2ms. P99: 22.8ms.'
      },
      {
        id: 'foot-stream',
        label: 'Stream',
        value: '📦 142k/s',
        status: 'online',
        content: 'Live telemetry ingestion active. Zero dropped frames.'
      },
      {
        id: 'foot-audit',
        label: 'Audit',
        value: '📝 Nominal',
        status: 'custom',
        content: 'SOC2 Compliance rules passing. Real-time audit pipeline synced.'
      }
    ]

    const currentLeftTabs = get().leftTabs
    const newLeftTabs =
      currentLeftTabs.length === 0 && templateId === 'executive' ? defaultLeftTabs : currentLeftTabs

    const currentFooterTabs = get().footerTabs
    const newFooterTabs =
      currentFooterTabs.length === 0 && templateId === 'executive'
        ? defaultFooterTabs
        : currentFooterTabs

    const newWorkspaces: Record<string, TabWorkspaceState> = {}
    newTabs.forEach((tab) => {
      const tabTplId = (tab.templateId || templateId) as TemplateId
      const tabPanels = TEMPLATES[tabTplId]?.panels ? { ...TEMPLATES[tabTplId].panels } : {}
      newWorkspaces[tab.id] = {
        panels: tabPanels,
        layoutJson: undefined,
        templateId: tabTplId
      }
    })

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
      leftTabs: newLeftTabs,
      activeLeftTabId: newLeftTabs[0]?.id || '',
      footerTabs: newFooterTabs,
      panels: initialPanels,
      isRestoringLayout: true
    })

    // If dockviewApi exists, we will re-initialize panels in DockviewCanvas
    if (dockviewApi) {
      try {
        dockviewApi.clear()
        const panelEntries = Object.values(initialPanels)
        panelEntries.forEach((p, idx) => {
          dockviewApi.addPanel({
            id: p.id,
            component: p.widgetType,
            title: p.title,
            params: p.widgetProps,
            position: idx === 0 ? undefined : { direction: idx % 2 === 0 ? 'below' : 'right' }
          })
        })
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
