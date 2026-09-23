#!/usr/bin/env node
/**
 * Reframe Electron MCP Stdio Bridge
 *
 * Lightweight CLI bridge allowing Stdio-based MCP clients (like Claude Desktop)
 * to communicate seamlessly with the live running Reframe Electron application.
 *
 * Usage with Claude Desktop (claude_desktop_config.json):
 * {
 *   "mcpServers": {
 *     "reframe": {
 *       "command": "node",
 *       "args": ["<PATH_TO_APP>/scripts/mcp-stdio-bridge.js"]
 *     }
 *   }
 * }
 */

const http = require('http')
const readline = require('readline')

const MCP_PORT = process.env.MCP_PORT || 3920
const MCP_HOST = process.env.MCP_HOST || '127.0.0.1'

function sendHttpRequest(bodyStr) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: MCP_HOST,
        port: MCP_PORT,
        path: '/message',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr)
        },
        timeout: 10000
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${data}`))
          }
        })
      }
    )

    req.on('error', (err) => {
      reject(err)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`Timeout connecting to Reframe Electron at ${MCP_HOST}:${MCP_PORT}`))
    })

    req.write(bodyStr)
    req.end()
  })
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

rl.on('line', async (line) => {
  const trimmed = line.trim()
  if (!trimmed) return

  let parsed = null
  try {
    parsed = JSON.parse(trimmed)
  } catch (err) {
    process.stderr.write(`[mcp-stdio-bridge] Parse error: ${err.message}\n`)
    return
  }

  try {
    const response = await sendHttpRequest(trimmed)
    process.stdout.write(JSON.stringify(response) + '\n')
  } catch (err) {
    process.stderr.write(`[mcp-stdio-bridge] Connection error: ${err.message}\n`)

    // Return JSON-RPC error back to client
    const errorResponse = {
      jsonrpc: '2.0',
      id: parsed.id !== undefined ? parsed.id : null,
      error: {
        code: -32000,
        message: `Could not connect to Reframe Electron on http://${MCP_HOST}:${MCP_PORT}. Is the Electron app open? (${err.message})`
      }
    }
    process.stdout.write(JSON.stringify(errorResponse) + '\n')
  }
})

process.stderr.write(
  `[mcp-stdio-bridge] Active, proxying stdio <-> http://${MCP_HOST}:${MCP_PORT}\n`
)
