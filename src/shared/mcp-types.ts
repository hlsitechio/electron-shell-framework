/**
 * Model Context Protocol (MCP) Shared Definitions
 *
 * Defines the JSON-RPC 2.0 messages, tool schemas, resource schemas,
 * and IPC contracts connecting external AI agents to the Reframe platform.
 */

export interface McpJsonRpcRequest {
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: Record<string, any>
}

export interface McpJsonRpcResponse {
  jsonrpc: '2.0'
  id: string | number | null
  result?: any
  error?: {
    code: number
    message: string
    data?: any
  }
}

export interface McpToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
}

export interface McpResourceDefinition {
  uri: string
  name: string
  description?: string
  mimeType?: string
}

export interface McpPromptDefinition {
  name: string
  description?: string
  arguments?: Array<{
    name: string
    description?: string
    required?: boolean
  }>
}

export interface McpServerStatus {
  running: boolean
  port: number
  sseUrl: string
  clientCount: number
  uptimeSeconds: number
  totalInvocations: number
}

export interface McpActionLogItem {
  id: string
  timestamp: string
  toolName: string
  params: Record<string, any>
  success: boolean
  resultSummary?: string
  error?: string
}

export interface McpIpcBridgeContract {
  invokeAction: (action: string, params: Record<string, any>) => Promise<any>
  pushState: (state: any) => void
  getStatus: () => Promise<McpServerStatus>
  onActionInvoked: (callback: (logItem: McpActionLogItem) => void) => () => void
}
