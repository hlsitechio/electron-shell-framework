import http from 'node:http'
import fs from 'node:fs'
import { log, logFilePath } from '../logging'
import { REFRAME_MCP_TOOLS } from './mcp-tools'
import { REFRAME_MCP_RESOURCES, REFRAME_MCP_PROMPTS } from './mcp-resources'
import {
  dispatchActionToRenderer,
  getCachedPlatformState,
  captureWindowScreenshot,
  broadcastActionLogToRenderer,
  registerMcpIpc
} from './mcp-ipc'
import type {
  McpJsonRpcRequest,
  McpJsonRpcResponse,
  McpServerStatus,
  McpActionLogItem
} from '../../shared/mcp-types'

interface SseClient {
  id: string
  res: http.ServerResponse
}

export class McpServer {
  private server: http.Server | null = null
  private port: number = 3920
  private startTime: number = Date.now()
  private totalInvocations: number = 0
  private sseClients: Map<string, SseClient> = new Map()
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(port = 3920) {
    this.port = port
  }

  public getStatus(): McpServerStatus {
    return {
      running: this.server !== null && this.server.listening,
      port: this.port,
      sseUrl: `http://127.0.0.1:${this.port}/sse`,
      clientCount: this.sseClients.size,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      totalInvocations: this.totalInvocations
    }
  }

  public start(): Promise<void> {
    registerMcpIpc(() => this.getStatus())

    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleHttpRequest(req, res)
      })

      this.server.on('error', (err: any) => {
        log.error('[mcp-server] Server error:', err)
        if (err.code === 'EADDRINUSE') {
          log.warn(`[mcp-server] Port ${this.port} is in use, retrying on port ${this.port + 1}`)
          this.port += 1
          this.server?.listen(this.port, '127.0.0.1')
        } else {
          reject(err)
        }
      })

      this.server.listen(this.port, '127.0.0.1', () => {
        log.info(`[mcp-server] Native MCP Server listening on http://127.0.0.1:${this.port}`)
        this.startHeartbeat()
        resolve()
      })
    })
  }

  public stop(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    for (const client of this.sseClients.values()) {
      try {
        client.res.end()
      } catch {
        // ignore
      }
    }
    this.sseClients.clear()

    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          log.info('[mcp-server] Server stopped')
          this.server = null
          resolve()
        })
      } else {
        resolve()
      }
    })
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const client of this.sseClients.values()) {
        try {
          client.res.write(': ping\n\n')
        } catch {
          this.sseClients.delete(client.id)
        }
      }
    }, 15000)
  }

  private handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    // Enable CORS for local AI agents (Cursor, web dev tools, Antigravity)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`)

    // 1. Health & status check
    if (parsedUrl.pathname === '/status' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(this.getStatus(), null, 2))
      return
    }

    // 2. Server-Sent Events (SSE) stream endpoint for MCP clients
    if (parsedUrl.pathname === '/sse' && req.method === 'GET') {
      this.handleSseConnection(req, res)
      return
    }

    // 3. MCP JSON-RPC message endpoint
    if (
      (parsedUrl.pathname === '/message' || parsedUrl.pathname === '/') &&
      req.method === 'POST'
    ) {
      this.handlePostMessage(req, res, parsedUrl)
      return
    }

    // Fallback 404
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Endpoint not found' }))
  }

  private handleSseConnection(req: http.IncomingMessage, res: http.ServerResponse): void {
    const sessionId = `mcp-ses-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    })

    const client: SseClient = { id: sessionId, res }
    this.sseClients.set(sessionId, client)

    log.info(
      `[mcp-server] AI Agent connected via SSE (Session: ${sessionId}). Total clients: ${this.sseClients.size}`
    )

    // According to MCP SSE spec, initial event is "endpoint" carrying the POST URL
    res.write(`event: endpoint\ndata: /message?sessionId=${sessionId}\n\n`)

    req.on('close', () => {
      this.sseClients.delete(sessionId)
      log.info(
        `[mcp-server] AI Agent disconnected (Session: ${sessionId}). Total clients: ${this.sseClients.size}`
      )
    })
  }

  private handlePostMessage(req: http.IncomingMessage, res: http.ServerResponse, url: URL): void {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', async () => {
      try {
        const jsonRpcReq = JSON.parse(body) as McpJsonRpcRequest
        const sessionId = url.searchParams.get('sessionId')

        const response = await this.processJsonRpcRequest(jsonRpcReq)

        // Return HTTP response
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(response))

        // If client is subscribed via SSE, also broadcast the response
        if (sessionId && this.sseClients.has(sessionId)) {
          const client = this.sseClients.get(sessionId)!
          client.res.write(`event: message\ndata: ${JSON.stringify(response)}\n\n`)
        }
      } catch (err: any) {
        log.error('[mcp-server] Error processing JSON-RPC request:', err)
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: {
              code: -32700,
              message: 'Parse error: ' + (err?.message || 'Invalid JSON')
            }
          })
        )
      }
    })
  }

  public async processJsonRpcRequest(req: McpJsonRpcRequest): Promise<McpJsonRpcResponse> {
    const { id, method, params } = req
    this.totalInvocations++

    switch (method) {
      case 'initialize': {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: {
              name: 'reframe-electron-mcp',
              version: '1.0.0'
            },
            capabilities: {
              tools: {},
              resources: {},
              prompts: {}
            }
          }
        }
      }

      case 'notifications/initialized': {
        return {
          jsonrpc: '2.0',
          id,
          result: {}
        }
      }

      case 'ping': {
        return {
          jsonrpc: '2.0',
          id,
          result: {}
        }
      }

      case 'tools/list': {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: REFRAME_MCP_TOOLS
          }
        }
      }

      case 'tools/call': {
        const toolName = params?.name
        const toolArgs = params?.arguments || {}
        return await this.handleToolCall(id, toolName, toolArgs)
      }

      case 'resources/list': {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            resources: REFRAME_MCP_RESOURCES
          }
        }
      }

      case 'resources/read': {
        const uri = params?.uri
        return await this.handleResourceRead(id, uri)
      }

      case 'prompts/list': {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            prompts: REFRAME_MCP_PROMPTS
          }
        }
      }

      case 'prompts/get': {
        const promptName = params?.name
        return this.handlePromptGet(id, promptName, params?.arguments)
      }

      default: {
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method "${method}" not found`
          }
        }
      }
    }
  }

  private async handleToolCall(
    id: string | number,
    toolName: string,
    args: Record<string, any>
  ): Promise<McpJsonRpcResponse> {
    log.info(`[mcp-server] Tool call: ${toolName} with args:`, JSON.stringify(args))

    try {
      let resultData: any = null

      // Local Main Process tools
      if (toolName === 'reframe_get_state') {
        const cached = getCachedPlatformState()
        resultData = cached || { message: 'Platform state initializing or window not loaded' }
      } else if (toolName === 'reframe_take_screenshot') {
        const dataUrl = await captureWindowScreenshot()
        resultData = {
          format: 'image/png',
          dataUrl,
          capturedAt: new Date().toISOString()
        }
      } else {
        // Dispatched to Renderer
        resultData = await dispatchActionToRenderer(toolName, args)
      }

      const logItem: McpActionLogItem = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        toolName,
        params: args,
        success: true,
        resultSummary:
          typeof resultData === 'object'
            ? JSON.stringify(resultData).slice(0, 80)
            : String(resultData)
      }
      broadcastActionLogToRenderer(logItem)

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text:
                typeof resultData === 'string' ? resultData : JSON.stringify(resultData, null, 2)
            }
          ]
        }
      }
    } catch (err: any) {
      log.error(`[mcp-server] Tool call error for ${toolName}:`, err)

      const logItem: McpActionLogItem = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        toolName,
        params: args,
        success: false,
        error: err?.message || 'Tool execution failed'
      }
      broadcastActionLogToRenderer(logItem)

      return {
        jsonrpc: '2.0',
        id,
        result: {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Error executing ${toolName}: ${err?.message || 'Unknown error'}`
            }
          ]
        }
      }
    }
  }

  private async handleResourceRead(id: string | number, uri: string): Promise<McpJsonRpcResponse> {
    const state = getCachedPlatformState()

    switch (uri) {
      case 'reframe://state/current': {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(state || {}, null, 2)
              }
            ]
          }
        }
      }

      case 'reframe://layout/dockview': {
        const panels = state?.panels || {}
        return {
          jsonrpc: '2.0',
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({ panelCount: Object.keys(panels).length, panels }, null, 2)
              }
            ]
          }
        }
      }

      case 'reframe://telemetry/footer': {
        const footerTabs = state?.footerTabs || []
        return {
          jsonrpc: '2.0',
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(footerTabs, null, 2)
              }
            ]
          }
        }
      }

      case 'reframe://logs/app': {
        let logContent = 'No logs available'
        try {
          const path = logFilePath()
          if (fs.existsSync(path)) {
            const raw = fs.readFileSync(path, 'utf8')
            logContent = raw.split('\n').slice(-100).join('\n')
          }
        } catch (e: any) {
          logContent = `Could not read logs: ${e.message}`
        }
        return {
          jsonrpc: '2.0',
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: 'text/plain',
                text: logContent
              }
            ]
          }
        }
      }

      default: {
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32602,
            message: `Resource URI "${uri}" not found`
          }
        }
      }
    }
  }

  private handlePromptGet(
    id: string | number,
    promptName: string,
    args?: Record<string, any>
  ): McpJsonRpcResponse {
    if (promptName === 'design_executive_dashboard') {
      const client = args?.clientName || 'Acme Global Holdings'
      return {
        jsonrpc: '2.0',
        id,
        result: {
          description: 'Design executive dashboard workflow prompt',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `You are connected to the live Reframe Electron Platform via MCP. Please construct a modern Executive KPI Dashboard for client "${client}".
Steps:
1. Call \`reframe_load_template\` with templateId: "blank" to clear the board.
2. Call \`reframe_create_tab\` to create a Header tab "Executive Overview".
3. Call \`reframe_add_widget\` to mount 1 KPI metric widget and 1 live chart widget.
4. Call \`reframe_update_theme\` to set borderThickness to 2 and selectedThemeKey to "dockview-theme-abyss".
5. Call \`reframe_set_mode\` to "client" to present the final result.`
              }
            }
          ]
        }
      }
    }

    if (promptName === 'audit_platform_layout') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          description: 'Platform layout audit prompt',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Please audit the current Reframe layout:
1. Call \`reframe_get_state\` to inspect all active panels and tabs.
2. Evaluate layout density, color scheme, and panel distribution.
3. Suggest 2-3 specific improvements or apply them directly via \`reframe_update_theme\`.`
              }
            }
          ]
        }
      }
    }

    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32602,
        message: `Prompt "${promptName}" not found`
      }
    }
  }
}

// Global server instance
export const mcpServer = new McpServer(3920)
