import React, { useEffect, useState } from 'react'
import { Bot, Copy, Check, Radio, RefreshCw, Terminal, Activity, Sparkles } from 'lucide-react'
import type { McpServerStatus, McpActionLogItem } from '../../../../shared/mcp-types'

export const McpAgentInspector: React.FC = () => {
  const [status, setStatus] = useState<McpServerStatus | null>(null)
  const [logs, setLogs] = useState<McpActionLogItem[]>([])
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchStatus = async () => {
    if (window.api?.mcp?.getStatus) {
      try {
        setIsRefreshing(true)
        const s = await window.api.mcp.getStatus()
        setStatus(s)
      } catch (err) {
        console.warn('Failed to fetch MCP status:', err)
      } finally {
        setIsRefreshing(false)
      }
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 3000)

    // Listen to live tool call logs
    let unsubscribeLog: (() => void) | null = null
    if (window.api?.mcp?.onActionLog) {
      unsubscribeLog = window.api.mcp.onActionLog((logItem) => {
        setLogs((prev) => [logItem, ...prev].slice(0, 30))
      })
    }

    return () => {
      clearInterval(interval)
      if (unsubscribeLog) unsubscribeLog()
    }
  }, [])

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const sseEndpoint = status?.sseUrl || 'http://127.0.0.1:3920/sse'
  const claudeDesktopConfig = JSON.stringify(
    {
      mcpServers: {
        reframe: {
          command: 'node',
          args: [`<PATH_TO_APP>/scripts/mcp-stdio-bridge.js`]
        }
      }
    },
    null,
    2
  )

  const cursorMcpConfig = JSON.stringify(
    {
      mcpServers: {
        reframe: {
          url: sseEndpoint
        }
      }
    },
    null,
    2
  )

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-5 text-xs text-zinc-300 select-none">
      {/* ── 1. ACTIVE MCP SERVER STATUS BANNER ───────────────────── */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-zinc-900/60 to-purple-950/30 border border-indigo-500/30 shadow-lg relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-bold text-white tracking-tight">Native MCP Server Active</span>
          </div>

          <button
            onClick={fetchStatus}
            disabled={isRefreshing}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
            title="Refresh Status"
          >
            <RefreshCw
              className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`}
            />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
          <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Port</div>
            <div className="font-semibold text-indigo-300">{status?.port || 3920}</div>
          </div>

          <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Connected</div>
            <div className="font-semibold text-emerald-400">{status?.clientCount || 0} agents</div>
          </div>

          <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Invocations</div>
            <div className="font-semibold text-zinc-200">{status?.totalInvocations || 0}</div>
          </div>
        </div>

        <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1">
          <span className="font-mono text-zinc-500 truncate max-w-[180px]">{sseEndpoint}</span>
          <button
            onClick={() => copyToClipboard('sseUrl', sseEndpoint)}
            className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-medium"
          >
            {copiedKey === 'sseUrl' ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>{copiedKey === 'sseUrl' ? 'Copied' : 'Copy URL'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. AGENT CONNECTIVITY CONFIGURATIONS ──────────────────── */}
      <div className="space-y-3">
        <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-indigo-400" />
          <span>Connect AI Agents</span>
        </div>

        {/* Cursor & Antigravity Config Card */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-zinc-200">Cursor / Antigravity / SSE</span>
            </div>
            <button
              onClick={() => copyToClipboard('cursor', cursorMcpConfig)}
              className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white"
            >
              {copiedKey === 'cursor' ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>{copiedKey === 'cursor' ? 'Copied JSON' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Add as an SSE MCP server with URL{' '}
            <code className="text-indigo-300 font-mono">{sseEndpoint}</code>.
          </p>
        </div>

        {/* Claude Desktop Config Card */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-zinc-200">Claude Desktop (Stdio)</span>
            </div>
            <button
              onClick={() => copyToClipboard('claude', claudeDesktopConfig)}
              className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white"
            >
              {copiedKey === 'claude' ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>{copiedKey === 'claude' ? 'Copied JSON' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Paste into your{' '}
            <code className="text-zinc-300 font-mono">claude_desktop_config.json</code> to let
            Claude control Dockview layouts live.
          </p>
        </div>
      </div>

      {/* ── 3. REAL-TIME AI TOOL CALL LOGS ───────────────────────── */}
      <div className="space-y-2.5 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Agent Invocations Stream</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">{logs.length} calls</span>
        </div>

        <div className="flex-1 overflow-y-auto rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-2.5 space-y-2 min-h-[140px] max-h-[260px] scrollbar-thin scrollbar-thumb-zinc-700">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-zinc-500 space-y-1">
              <Radio className="w-5 h-5 text-zinc-600 animate-pulse" />
              <p className="text-xs">Listening for agent commands...</p>
              <p className="text-[10px] text-zinc-600">
                Connect Claude or Cursor to start manipulating the canvas.
              </p>
            </div>
          ) : (
            logs.map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-lg bg-zinc-900/70 border border-zinc-800/80 flex flex-col space-y-1 font-mono text-[11px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {item.success ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    )}
                    <span className="font-semibold text-indigo-300">{item.toolName}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">{item.timestamp}</span>
                </div>

                <div className="text-[10px] text-zinc-400 truncate">
                  {JSON.stringify(item.params)}
                </div>

                {item.error ? (
                  <div className="text-[10px] text-rose-400 font-medium">{item.error}</div>
                ) : (
                  item.resultSummary && (
                    <div className="text-[10px] text-zinc-500 truncate">
                      &rarr; {item.resultSummary}
                    </div>
                  )
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
