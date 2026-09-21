/**
 * Widget kit — copy-paste building blocks for app shells.
 *
 * Every widget renders a sane demo with ZERO props (so the gallery is a
 * single loop) and takes real data through props. All of them read the
 * preset tokens, so they re-skin with data-preset automatically.
 */
export { GlassCard } from './GlassCard'
export { StatTile } from './StatTile'
export { AgentCard } from './AgentCard'
export { CapabilityBars } from './CapabilityBars'
export { ChartWidget } from './ChartWidget'
export { ChatWidget } from './ChatWidget'
export { TerminalWidget } from './TerminalWidget'
export { Pipeline } from './Pipeline'
export { FilterChips } from './FilterChips'
export { EmptyState } from './EmptyState'
export { DataTable } from './DataTable'

export type { StatTileProps } from './StatTile'
export type { AgentCardData, AgentCardProps } from './AgentCard'
export type { Capability, CapabilityBarsProps } from './CapabilityBars'
export type { ChartWidgetProps } from './ChartWidget'
export type { ChatBubbleData, ChatWidgetProps } from './ChatWidget'
export type { TerminalLine, TerminalWidgetProps } from './TerminalWidget'
export type { PipelineStep, PipelineProps } from './Pipeline'
export type { FilterChipsProps } from './FilterChips'
export type { EmptyStateProps } from './EmptyState'
export type { DataTableProps, TableColumn, TableRow } from './DataTable'
