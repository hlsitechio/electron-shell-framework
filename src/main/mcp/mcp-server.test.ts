import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { McpServer } from './mcp-server'
import http from 'node:http'

describe('Native Reframe MCP Server', () => {
  let server: McpServer
  const testPort = 3988

  beforeAll(async () => {
    server = new McpServer(testPort)
    await server.start()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('initializes and reports running status', () => {
    const status = server.getStatus()
    expect(status.running).toBe(true)
    expect(status.port).toBe(testPort)
    expect(status.sseUrl).toContain(String(testPort))
  })

  it('handles MCP initialize JSON-RPC request', async () => {
    const response = await server.processJsonRpcRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        clientInfo: { name: 'test-agent', version: '1.0.0' }
      }
    })

    expect(response.jsonrpc).toBe('2.0')
    expect(response.id).toBe(1)
    expect(response.result).toBeDefined()
    expect(response.result.protocolVersion).toBe('2024-11-05')
    expect(response.result.serverInfo.name).toBe('reframe-electron-mcp')
    expect(response.result.capabilities.tools).toBeDefined()
    expect(response.result.capabilities.resources).toBeDefined()
    expect(response.result.capabilities.prompts).toBeDefined()
  })

  it('handles tools/list request and registers all platform tools', async () => {
    const response = await server.processJsonRpcRequest({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list'
    })

    expect(response.result).toBeDefined()
    const tools = response.result.tools
    expect(Array.isArray(tools)).toBe(true)
    expect(tools.length).toBeGreaterThanOrEqual(14)

    const toolNames = tools.map((t: any) => t.name)
    expect(toolNames).toContain('reframe_get_state')
    expect(toolNames).toContain('reframe_set_mode')
    expect(toolNames).toContain('reframe_load_template')
    expect(toolNames).toContain('reframe_clear_all')
    expect(toolNames).toContain('reframe_create_tab')
    expect(toolNames).toContain('reframe_remove_tab')
    expect(toolNames).toContain('reframe_add_widget')
    expect(toolNames).toContain('reframe_remove_widget')
    expect(toolNames).toContain('reframe_update_theme')
    expect(toolNames).toContain('reframe_bake_deliverable')
    expect(toolNames).toContain('reframe_publish_app')
    expect(toolNames).toContain('reframe_take_screenshot')
  })

  it('handles resources/list and resources/read requests', async () => {
    const listRes = await server.processJsonRpcRequest({
      jsonrpc: '2.0',
      id: 3,
      method: 'resources/list'
    })

    expect(listRes.result.resources).toBeDefined()
    expect(listRes.result.resources.length).toBeGreaterThanOrEqual(4)

    const readRes = await server.processJsonRpcRequest({
      jsonrpc: '2.0',
      id: 4,
      method: 'resources/read',
      params: { uri: 'reframe://state/current' }
    })

    expect(readRes.result.contents).toBeDefined()
    expect(readRes.result.contents[0].uri).toBe('reframe://state/current')
  })

  it('handles prompts/list and prompts/get requests', async () => {
    const listRes = await server.processJsonRpcRequest({
      jsonrpc: '2.0',
      id: 5,
      method: 'prompts/list'
    })

    expect(listRes.result.prompts).toBeDefined()
    expect(listRes.result.prompts.length).toBeGreaterThanOrEqual(3)

    const getRes = await server.processJsonRpcRequest({
      jsonrpc: '2.0',
      id: 6,
      method: 'prompts/get',
      params: { name: 'design_executive_dashboard', arguments: { clientName: 'Apex Capital' } }
    })

    expect(getRes.result.messages).toBeDefined()
    expect(getRes.result.messages[0].content.text).toContain('Apex Capital')
  })

  it('returns method not found error on unknown method', async () => {
    const response = await server.processJsonRpcRequest({
      jsonrpc: '2.0',
      id: 7,
      method: 'unknown/method'
    })

    expect(response.error).toBeDefined()
    expect(response.error?.code).toBe(-32601)
  })

  it('responds over local HTTP /status endpoint', async () => {
    const statusData: any = await new Promise((resolve, reject) => {
      http
        .get(`http://127.0.0.1:${testPort}/status`, (res) => {
          let raw = ''
          res.on('data', (c) => (raw += c))
          res.on('end', () => resolve(JSON.parse(raw)))
        })
        .on('error', reject)
    })

    expect(statusData.running).toBe(true)
    expect(statusData.port).toBe(testPort)
  })

  it('processes tool calls over HTTP POST /message endpoint', async () => {
    const postBody = JSON.stringify({
      jsonrpc: '2.0',
      id: 8,
      method: 'tools/list'
    })

    const responseData: any = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: testPort,
          path: '/message',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postBody)
          }
        },
        (res) => {
          let raw = ''
          res.on('data', (c) => (raw += c))
          res.on('end', () => resolve(JSON.parse(raw)))
        }
      )
      req.on('error', reject)
      req.write(postBody)
      req.end()
    })

    expect(responseData.result.tools).toBeDefined()
    expect(responseData.result.tools.length).toBeGreaterThan(0)
  })
})
