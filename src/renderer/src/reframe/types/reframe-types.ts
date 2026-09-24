export type FontFamilyKey = 'inter' | 'jetbrains' | 'outfit' | 'geist' | 'fira' | 'system'

export interface HeaderAction {
  id: string
  label: string
  icon?: string
  actionType: 'refresh' | 'export' | 'alert' | 'link'
  target?: string
}

export interface HeaderConfig {
  visible: boolean
  title: string
  subtitle: string
  badge?: string
  fontFamily: FontFamilyKey
  titleSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl'
  titleWeight: 'normal' | 'medium' | 'semibold' | 'bold'
  showLogo: boolean
  logoIcon: string
  customLogoUrl?: string
  actions: HeaderAction[]
  showWindowControls: boolean
}

export interface FooterConfig {
  visible: boolean
  leftText: string
  centerText: string
  rightText: string
  statusState: 'online' | 'synced' | 'busy' | 'custom'
  statusLabel: string
  fontFamily: FontFamilyKey
  fontSize: 'xs' | 'sm' | 'base'
}

export type AccentColorKey = 'default' | 'emerald' | 'blue' | 'amber' | 'violet' | 'rose'
export type LayoutDensity = 'compact' | 'comfortable' | 'spacious'

export interface ReframeThemeConfig {
  mode: 'dark' | 'light' | 'auto'
  accentColor: AccentColorKey
  density: LayoutDensity
}

export type WidgetType =
  | 'kpi'
  | 'chart'
  | 'table'
  | 'notes'
  | 'activity'
  | 'embed'
  | 'actionpad'
  | 'terminal'
  | 'cluster'
  | 'empty'
  | 'aichat'
  | 'chat'
  | 'aiagent'
  | 'agent'
  | 'aiprompt'
  | 'prompt'
  | 'airag'
  | 'rag'
  | 'aicode'
  | 'code'
  | 'clock'
  | 'digitalclock'
  | 'worldclock'
  | 'calendar'
  | 'agenda'
  | 'pomodoro'
  | 'timer'
  | 'tasks'
  | 'todo'
  | 'calculator'
  | 'calc'
  | 'weather'
  | 'recorder'
  | 'meeting-record'
  | 'transcript'
  | 'meeting-transcript'
  | 'summary'
  | 'meeting-summary'
  | 'minutes'
  | 'meeting-actions'
  | 'talk-time'
  | 'agenda-timer'
  | 'meeting-qa'
  | 'briefing'
  | 'doc-markdown'
  | 'markdown'
  | 'md'
  | 'doc-pdf'
  | 'pdf'
  | 'doc-docx'
  | 'docx'
  | 'doc-txt'
  | 'txt'
  | 'doc-diff'
  | 'diff'
  | 'doc-code'
  | 'doc-csv'
  | 'csv'
  | 'doc-summarizer'
  | 'doc-ai'
  | 'doc-metadata'
  | 'doc-reader'
  | 'focus-reader'
  | 'doc-swagger'
  | 'swagger'
  | 'openapi'
  | 'doc-contract'
  | 'contract'

export type LayoutScaffoldType =
  '1-slot' | '2-columns' | '3-columns' | '2x2-grid' | 'header-2-col' | '3-rows'

export interface KpiWidgetProps {
  label: string
  value: string | number
  delta?: string
  deltaType?: 'positive' | 'negative' | 'neutral'
  subtext?: string
  icon?: string
  colorAccent?: string
}

export interface ChartWidgetProps {
  title: string
  chartType: 'area' | 'line' | 'bar'
  dataKey: string
  timeRange?: string
  color?: string
}

export interface TableWidgetProps {
  title: string
  columns: Array<{ key: string; header: string; width?: string }>
  rows: Array<Record<string, any>>
  searchable?: boolean
}

export interface NotesWidgetProps {
  title: string
  content: string
}

export interface ActivityWidgetProps {
  title: string
  filterSeverity?: 'all' | 'info' | 'warn' | 'error'
}

export interface EmbedWidgetProps {
  title: string
  url: string
}

export interface ActionPadWidgetProps {
  title: string
  actions: Array<{ id: string; label: string; icon?: string; description?: string }>
}

export interface PanelConfig {
  id: string
  title: string
  widgetType: WidgetType
  widgetProps: Record<string, any>
  closable?: boolean
}

export interface ReframeMeta {
  name: string
  description: string
  targetClient: string
  lastModified: string
}

export interface ReframeConfig {
  id: string
  version: string
  meta: ReframeMeta
  mode: 'builder' | 'client'
  framing: {
    header: HeaderConfig
    footer: FooterConfig
  }
  theme: ReframeThemeConfig
  panels: Record<string, PanelConfig>
  dockviewLayout?: any
}

export const FONT_MAP: Record<FontFamilyKey, string> = {
  inter: 'Inter, system-ui, -apple-system, sans-serif',
  jetbrains: '"JetBrains Mono", monospace',
  outfit: '"Outfit", system-ui, -apple-system, sans-serif',
  geist: '"Geist", system-ui, -apple-system, sans-serif',
  fira: '"Fira Code", monospace',
  system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
}

export const ACCENT_MAP: Record<
  AccentColorKey,
  { text: string; bg: string; border: string; ring: string }
> = {
  default: {
    text: 'text-zinc-200',
    bg: 'bg-zinc-800',
    border: 'border-zinc-700',
    ring: 'ring-zinc-600'
  },
  emerald: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    ring: 'ring-emerald-500'
  },
  blue: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    ring: 'ring-blue-500'
  },
  amber: {
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    ring: 'ring-amber-500'
  },
  violet: {
    text: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    ring: 'ring-violet-500'
  },
  rose: {
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    ring: 'ring-rose-500'
  }
}

export type TemplateId =
  | 'executive'
  | 'ai-studio'
  | 'operations'
  | 'engineering'
  | 'meetings'
  | 'documents'
  | 'productivity'
  | 'analytics'
  | 'security'
  | 'minimal'
  | 'blank'

export interface HeaderTabItem {
  id: string
  label: string
  icon?: string
  templateId?: TemplateId
  closable?: boolean
}

export interface LeftTabItem {
  id: string
  label: string
  icon?: string
  viewType: 'canvas' | 'embed' | 'notes'
  url?: string
  content?: string
  templateId?: TemplateId
  closable?: boolean
}

export interface RightTabItem {
  id: string
  label: string
  icon?: string
}

export interface FooterTabItem {
  id: string
  label: string
  value?: string
  status?: 'online' | 'synced' | 'busy' | 'custom'
  icon?: string
  content?: string
  closable?: boolean
}
