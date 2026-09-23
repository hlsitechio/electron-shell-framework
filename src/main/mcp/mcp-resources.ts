import type { McpResourceDefinition, McpPromptDefinition } from '../../shared/mcp-types'

export const REFRAME_MCP_RESOURCES: McpResourceDefinition[] = [
  {
    uri: 'reframe://state/current',
    name: 'Current Platform State',
    description:
      'Complete live JSON snapshot of all tabs, Dockview panels, theme settings, and workspace mode.',
    mimeType: 'application/json'
  },
  {
    uri: 'reframe://layout/dockview',
    name: 'Dockview Layout Manifest',
    description: 'Active Dockview grid panels and component configurations.',
    mimeType: 'application/json'
  },
  {
    uri: 'reframe://code/standalone-tsx',
    name: 'Compiled Standalone Deliverable TSX',
    description: 'Generated pure React component code with zero Dockview runtime dependencies.',
    mimeType: 'text/typescript'
  },
  {
    uri: 'reframe://telemetry/footer',
    name: 'Footer Status Telemetry Channels',
    description: 'Live status channels and diagnostic metrics reported by the Nav Footer.',
    mimeType: 'application/json'
  },
  {
    uri: 'reframe://logs/app',
    name: 'Desktop Main Process Logs',
    description: 'Recent execution log entries from the Electron application.',
    mimeType: 'text/plain'
  }
]

export const REFRAME_MCP_PROMPTS: McpPromptDefinition[] = [
  {
    name: 'design_executive_dashboard',
    description:
      'Directs the AI agent to assemble a high-performance executive dashboard with KPI metric tiles, trajectory charts, and activity streams.',
    arguments: [
      {
        name: 'clientName',
        description: 'Target enterprise client name',
        required: false
      },
      {
        name: 'industry',
        description: 'Industry domain (e.g. Fintech, Healthcare, Cloud Infra)',
        required: false
      }
    ]
  },
  {
    name: 'audit_platform_layout',
    description:
      'Directs the AI agent to inspect the current active layout, check contrast, border thickness, widget distribution, and suggest structural improvements.'
  },
  {
    name: 'convert_notes_to_widgets',
    description:
      'Directs the AI agent to read executive directives from the Notes tab and automatically translate them into functional Dockview metric and chart widgets.'
  }
]
