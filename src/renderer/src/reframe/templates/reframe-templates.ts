import type {
  HeaderConfig,
  FooterConfig,
  PanelConfig,
  HeaderTabItem,
  TemplateId
} from '../types/reframe-types'

export type { TemplateId }

export interface ReframeTemplateItem {
  id: TemplateId
  name: string
  description: string
  themeKey: string
  category:
    | 'Finance'
    | 'AI & Agents'
    | 'DevOps'
    | 'Engineering'
    | 'Meetings'
    | 'Documents'
    | 'Productivity'
    | 'Analytics'
    | 'Security'
    | 'Minimal'
  icon: string
  header: HeaderConfig
  footer: FooterConfig
  headerTabs: HeaderTabItem[]
  tabWorkspaces: Record<string, Record<string, PanelConfig>>
  panels: Record<string, PanelConfig>
}

export const TEMPLATES: Record<TemplateId, ReframeTemplateItem> = {
  // ── 1. EXECUTIVE & FINANCIAL SUITE ──────────────────────────────────────────
  executive: {
    id: 'executive',
    name: 'Executive Financial Suite',
    description:
      'C-suite executive intelligence: portfolio performance, liquidity yield curves, deal pipelines, and strategic directives across 5 pre-made workspaces.',
    themeKey: 'dockview-theme-abyss',
    category: 'Finance',
    icon: 'Layers',
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
    headerTabs: [
      { id: 'tab-exec-suite', label: 'Executive Suite', templateId: 'executive', icon: 'Layers' },
      {
        id: 'tab-exec-markets',
        label: 'Markets & Yield',
        templateId: 'executive',
        icon: 'TrendingUp'
      },
      {
        id: 'tab-exec-ops',
        label: 'Operations & Fleet',
        templateId: 'executive',
        icon: 'Activity'
      },
      {
        id: 'tab-exec-contracts',
        label: 'Deal Documents',
        templateId: 'executive',
        icon: 'FileText'
      },
      {
        id: 'tab-exec-sync',
        label: 'Board Sync & Tasks',
        templateId: 'executive',
        icon: 'Calendar'
      }
    ],
    tabWorkspaces: {
      'tab-exec-suite': {
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
                label: 'Net ARR',
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
            content: `### Executive Liquidity & Expansion Directive (Q3)\n\n* **Capital Allocation Target:** $50M AUM threshold projected for October 1st.\n* **Key Deliverables:**\n  1. Complete automated compliance reporting across EU and North America entities.\n  2. Deploy high-frequency data pipelines for client portfolio visibility.\n  3. Harden internal access policies prior to SOC2 Type II audit.`
          }
        },
        'calc-valuation': {
          id: 'calc-valuation',
          title: 'Valuation & Forecast Math',
          widgetType: 'calculator',
          closable: true,
          widgetProps: { title: 'Executive Valuation Math' }
        }
      },
      'tab-exec-markets': {
        'chart-yield': {
          id: 'chart-yield',
          title: 'Treasury Yield & Spread Analysis',
          widgetType: 'chart',
          closable: true,
          widgetProps: {
            title: '10-Year vs 2-Year Treasury Yield Spread',
            chartType: 'line',
            dataKey: 'spread',
            timeRange: '6 Months'
          }
        },
        'table-allocations': {
          id: 'table-allocations',
          title: 'Asset Allocation & Portfolio Weights',
          widgetType: 'table',
          closable: true,
          widgetProps: {
            title: 'Portfolio Breakdown',
            columns: [
              { key: 'assetClass', header: 'Asset Class' },
              { key: 'allocation', header: 'Target Allocation' },
              { key: 'actual', header: 'Current' },
              { key: 'variance', header: 'Variance' },
              { key: 'action', header: 'Rebalance Action' }
            ],
            rows: [
              {
                assetClass: 'Equities (Tech & SaaS)',
                allocation: '40.0%',
                actual: '43.2%',
                variance: '+3.2%',
                action: 'Trim'
              },
              {
                assetClass: 'Fixed Income & Treasuries',
                allocation: '30.0%',
                actual: '28.1%',
                variance: '-1.9%',
                action: 'Buy'
              },
              {
                assetClass: 'Private Venture Capital',
                allocation: '20.0%',
                actual: '19.4%',
                variance: '-0.6%',
                action: 'Hold'
              },
              {
                assetClass: 'Cash & Short-Term Liquidity',
                allocation: '10.0%',
                actual: '9.3%',
                variance: '-0.7%',
                action: 'Deploy'
              }
            ]
          }
        },
        'kpi-indices': {
          id: 'kpi-indices',
          title: 'Market Indices',
          widgetType: 'kpi',
          closable: true,
          widgetProps: {
            items: [
              { label: 'S&P 500', value: '5,842.10', delta: '+0.84%', deltaType: 'positive' },
              { label: 'NASDAQ', value: '18,340.50', delta: '+1.12%', deltaType: 'positive' },
              { label: '10Y Yield', value: '3.78%', delta: '-4 bps', deltaType: 'positive' },
              { label: 'VIX Volatility', value: '14.20', delta: '-1.8%', deltaType: 'positive' }
            ]
          }
        },
        'actionpad-capital': {
          id: 'actionpad-capital',
          title: 'Capital Actions',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            title: 'Capital Deployment Actions',
            actions: [
              {
                id: 'rebalance',
                label: 'Execute Rebalance Run',
                description: 'Trims over-indexed equity tranches'
              },
              {
                id: 'hedge',
                label: 'Order FX Currency Hedge',
                description: 'Locks EUR/USD at 1.092 parity'
              },
              {
                id: 'sweep',
                label: 'Nightly Treasury Sweep',
                description: 'Sweeps idle cash to 5.1% yield fund'
              }
            ]
          }
        },
        'notes-macro': {
          id: 'notes-macro',
          title: 'Macro Assessment',
          widgetType: 'notes',
          closable: true,
          widgetProps: {
            title: 'Q3 Federal Policy Notes',
            content:
              'Fed policy remains neutral. Liquidity reserves buffered for Q4 acquisitions. Treasury yield inversion resolved with positive curve slope.'
          }
        }
      },
      'tab-exec-ops': {
        'kpi-infra': {
          id: 'kpi-infra',
          title: 'Infrastructure Vital Signs',
          widgetType: 'kpi',
          closable: true,
          widgetProps: {
            items: [
              { label: 'System Uptime', value: '99.995%', delta: '+0.02%', deltaType: 'positive' },
              { label: 'Median Latency', value: '14.2ms', delta: '-2.1ms', deltaType: 'positive' },
              { label: 'Compute Pool', value: '38.4%', delta: '+4.1%', deltaType: 'neutral' },
              { label: 'Data Ingestion', value: '142 k/s', delta: '+12 k/s', deltaType: 'positive' }
            ]
          }
        },
        'cluster-topology': {
          id: 'cluster-topology',
          title: 'Global Gateway Topology',
          widgetType: 'cluster',
          closable: true,
          widgetProps: { title: 'Global Node Matrix' }
        },
        'stream-activity': {
          id: 'stream-activity',
          title: 'Real-time Event Stream',
          widgetType: 'activity',
          closable: true,
          widgetProps: { title: 'Audit Log' }
        },
        'table-services': {
          id: 'table-services',
          title: 'Critical Services Health',
          widgetType: 'table',
          closable: true,
          widgetProps: {
            title: 'Core Microservices',
            columns: [
              { key: 'service', header: 'Service' },
              { key: 'pods', header: 'Pods' },
              { key: 'latency', header: 'p99' },
              { key: 'status', header: 'Status' }
            ],
            rows: [
              { service: 'api-gateway', pods: '16/16', latency: '6ms', status: 'Healthy' },
              { service: 'auth-tokens', pods: '8/8', latency: '11ms', status: 'Healthy' },
              { service: 'ledger-sync', pods: '4/4', latency: '24ms', status: 'Healthy' }
            ]
          }
        },
        'actionpad-ops': {
          id: 'actionpad-ops',
          title: 'Ops Triggers',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            title: 'Emergency Actions',
            actions: [
              {
                id: 'flush',
                label: 'Purge Edge Cache',
                description: 'Invalidates worldwide CDN distribution'
              },
              {
                id: 'failover',
                label: 'Test Secondary Failover',
                description: 'Simulates zero-downtime switchover'
              }
            ]
          }
        }
      },
      'tab-exec-contracts': {
        'doc-contract-deal': {
          id: 'doc-contract-deal',
          title: 'Series B Term Sheet Review',
          widgetType: 'doc-contract',
          closable: true,
          widgetProps: {}
        },
        'doc-pdf-audit': {
          id: 'doc-pdf-audit',
          title: 'Financial Audit Report',
          widgetType: 'doc-pdf',
          closable: true,
          widgetProps: { title: 'Q3 Independent Audit Statement.pdf' }
        },
        'doc-markdown-memo': {
          id: 'doc-markdown-memo',
          title: 'Confidential Information Memo',
          widgetType: 'doc-markdown',
          closable: true,
          widgetProps: { title: 'Board Memo (CIM).md' }
        },
        'doc-summarizer-deal': {
          id: 'doc-summarizer-deal',
          title: 'Executive Summary AI',
          widgetType: 'doc-summarizer',
          closable: true,
          widgetProps: {}
        },
        'doc-metadata-legal': {
          id: 'doc-metadata-legal',
          title: 'Signature & Hash Registry',
          widgetType: 'doc-metadata',
          closable: true,
          widgetProps: {}
        }
      },
      'tab-exec-sync': {
        'recorder-board': {
          id: 'recorder-board',
          title: 'Board Sync Voice Memo',
          widgetType: 'recorder',
          closable: true,
          widgetProps: {}
        },
        'transcript-board': {
          id: 'transcript-board',
          title: 'Live Board Meeting Transcript',
          widgetType: 'transcript',
          closable: true,
          widgetProps: {}
        },
        'summary-board': {
          id: 'summary-board',
          title: 'Executive Minutes & Actions',
          widgetType: 'summary',
          closable: true,
          widgetProps: {}
        },
        'pomodoro-session': {
          id: 'pomodoro-session',
          title: '45-min Deep Focus Block',
          widgetType: 'pomodoro',
          closable: true,
          widgetProps: {}
        },
        'tasks-board': {
          id: 'tasks-board',
          title: 'Executive Action Items',
          widgetType: 'tasks',
          closable: true,
          widgetProps: {}
        }
      }
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
              label: 'Net ARR',
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
          content: 'Targeting $50M AUM by Q4 with automated regulatory compliance.'
        }
      },
      'calc-valuation': {
        id: 'calc-valuation',
        title: 'Valuation & Forecast Math',
        widgetType: 'calculator',
        closable: true,
        widgetProps: { title: 'Executive Valuation Math' }
      }
    }
  },

  // ── 2. AI AGENT & PROMPT STUDIO ─────────────────────────────────────────────
  'ai-studio': {
    id: 'ai-studio',
    name: 'AI Agent & Prompt Studio',
    description:
      'Autonomous intelligence suite: multi-agent pipelines, prompt engineering laboratory, RAG vector retrieval, and audio transcription.',
    themeKey: 'dockview-theme-catppuccin-mocha',
    category: 'AI & Agents',
    icon: 'BrainCircuit',
    header: {
      visible: true,
      title: 'Cognitive Matrix Studio',
      subtitle: 'Multi-Agent Autonomous Orchestration & Evaluation Hub',
      badge: 'Agent Mesh v3.1',
      fontFamily: 'geist',
      titleSize: 'xl',
      titleWeight: 'bold',
      showLogo: true,
      logoIcon: 'BrainCircuit',
      actions: [
        { id: 'eval', label: 'Run Evaluation Suite', icon: 'Play', actionType: 'refresh' },
        { id: 'export-weights', label: 'Export Artifacts', icon: 'Download', actionType: 'export' }
      ],
      showWindowControls: true
    },
    footer: {
      visible: true,
      leftText: 'Active Model: Claude 3.7 Sonnet / Gemini 2.5 Pro',
      centerText: 'Context Window: 128k/1M tokens used',
      rightText: 'Vector Index: 4.8M embeddings synced',
      statusState: 'online',
      statusLabel: 'LLM Cluster Active',
      fontFamily: 'geist',
      fontSize: 'xs'
    },
    headerTabs: [
      { id: 'tab-ai-chat', label: 'Reasoning & Chat', templateId: 'ai-studio', icon: 'Bot' },
      {
        id: 'tab-ai-agents',
        label: 'Autonomous Agents',
        templateId: 'ai-studio',
        icon: 'BrainCircuit'
      },
      { id: 'tab-ai-rag', label: 'RAG & Vector Hub', templateId: 'ai-studio', icon: 'Database' },
      { id: 'tab-ai-voice', label: 'Audio & Speech', templateId: 'ai-studio', icon: 'Mic' },
      {
        id: 'tab-ai-eval',
        label: 'Evaluation & Benchmarks',
        templateId: 'ai-studio',
        icon: 'Sparkles'
      }
    ],
    tabWorkspaces: {
      'tab-ai-chat': {
        'aichat-main': {
          id: 'aichat-main',
          title: 'Cognitive Chat Assistant',
          widgetType: 'aichat',
          closable: false,
          widgetProps: {}
        },
        'aiprompt-lab': {
          id: 'aiprompt-lab',
          title: 'Prompt Engineering Lab',
          widgetType: 'aiprompt',
          closable: true,
          widgetProps: {}
        },
        'aicode-gen': {
          id: 'aicode-gen',
          title: 'Reactive Component Synthesizer',
          widgetType: 'aicode',
          closable: true,
          widgetProps: {}
        },
        'notes-scratchpad': {
          id: 'notes-scratchpad',
          title: 'System Persona & Prompt Library',
          widgetType: 'notes',
          closable: true,
          widgetProps: { title: 'System Instructions (v3)' }
        },
        'tasks-ai-sprint': {
          id: 'tasks-ai-sprint',
          title: 'AI Engineering Sprint',
          widgetType: 'tasks',
          closable: true,
          widgetProps: {}
        }
      },
      'tab-ai-agents': {
        'aiagent-pipeline': {
          id: 'aiagent-pipeline',
          title: 'Multi-Agent Autonomous Pipeline',
          widgetType: 'aiagent',
          closable: false,
          widgetProps: {}
        },
        'cluster-agent-net': {
          id: 'cluster-agent-net',
          title: 'Agent Swarm Communication Mesh',
          widgetType: 'cluster',
          closable: true,
          widgetProps: { title: 'Agent Graph' }
        },
        'activity-agent-stream': {
          id: 'activity-agent-stream',
          title: 'Agent Step-by-Step Reasoner Trace',
          widgetType: 'activity',
          closable: true,
          widgetProps: { title: 'Reasoning Traces' }
        },
        'terminal-agent-cli': {
          id: 'terminal-agent-cli',
          title: 'Agent Python / Tool Sandbox',
          widgetType: 'terminal',
          closable: true,
          widgetProps: {}
        },
        'actionpad-agent-exec': {
          id: 'actionpad-agent-exec',
          title: 'Swarm Controls',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            title: 'Agent Controls',
            actions: [
              {
                id: 'spawn',
                label: 'Spawn Specialized Sub-Agent',
                description: 'Creates researcher agent'
              },
              {
                id: 'halt',
                label: 'Halt Execution Loop',
                description: 'Immediately pauses agent steps'
              }
            ]
          }
        }
      },
      'tab-ai-rag': {
        'airag-retriever': {
          id: 'airag-retriever',
          title: 'RAG Knowledge Retriever',
          widgetType: 'airag',
          closable: false,
          widgetProps: {}
        },
        'doc-markdown-corpus': {
          id: 'doc-markdown-corpus',
          title: 'Domain Knowledge Base.md',
          widgetType: 'doc-markdown',
          closable: true,
          widgetProps: {}
        },
        'doc-pdf-whitepaper': {
          id: 'doc-pdf-whitepaper',
          title: 'Attention Is All You Need.pdf',
          widgetType: 'doc-pdf',
          closable: true,
          widgetProps: { title: 'LLM Whitepaper.pdf' }
        },
        'doc-txt-raw': {
          id: 'doc-txt-raw',
          title: 'Token Weights Stream.txt',
          widgetType: 'doc-txt',
          closable: true,
          widgetProps: {}
        },
        'doc-summarizer-rag': {
          id: 'doc-summarizer-rag',
          title: 'Semantic Density Summarizer',
          widgetType: 'doc-summarizer',
          closable: true,
          widgetProps: {}
        }
      },
      'tab-ai-voice': {
        'recorder-voice': {
          id: 'recorder-voice',
          title: 'Multimodal Audio Ingest',
          widgetType: 'recorder',
          closable: false,
          widgetProps: {}
        },
        'transcript-voice': {
          id: 'transcript-voice',
          title: 'Whisper Real-Time Transcription',
          widgetType: 'transcript',
          closable: true,
          widgetProps: {}
        },
        'summary-voice': {
          id: 'summary-voice',
          title: 'AI Key Takeaways & Bullets',
          widgetType: 'summary',
          closable: true,
          widgetProps: {}
        },
        'meeting-actions-voice': {
          id: 'meeting-actions-voice',
          title: 'Automated Action Extraction',
          widgetType: 'meeting-actions',
          closable: true,
          widgetProps: {}
        },
        'talk-time-voice': {
          id: 'talk-time-voice',
          title: 'Speaker Diarization Metrics',
          widgetType: 'talk-time',
          closable: true,
          widgetProps: {}
        }
      },
      'tab-ai-eval': {
        'kpi-eval': {
          id: 'kpi-eval',
          title: 'Model Benchmark Vital Signs',
          widgetType: 'kpi',
          closable: false,
          widgetProps: {
            items: [
              {
                label: 'Token Throughput',
                value: '184 tok/s',
                delta: '+22.4%',
                deltaType: 'positive'
              },
              {
                label: 'Time to First Token',
                value: '240 ms',
                delta: '-45 ms',
                deltaType: 'positive'
              },
              { label: 'MMLU Score', value: '88.6%', delta: '+1.4%', deltaType: 'positive' },
              {
                label: 'Avg Cost / 1k Query',
                value: '$0.0034',
                delta: '-12.8%',
                deltaType: 'positive'
              }
            ]
          }
        },
        'chart-eval-curve': {
          id: 'chart-eval-curve',
          title: 'Inference Latency vs Batch Size',
          widgetType: 'chart',
          closable: true,
          widgetProps: { chartType: 'line', dataKey: 'latency' }
        },
        'table-leaderboard': {
          id: 'table-leaderboard',
          title: 'Model ELO & Arena Rankings',
          widgetType: 'table',
          closable: true,
          widgetProps: {
            columns: [
              { key: 'model', header: 'Model' },
              { key: 'elo', header: 'Arena ELO' },
              { key: 'coding', header: 'HumanEval' },
              { key: 'pricing', header: 'Input/Output 1M' }
            ],
            rows: [
              { model: 'Gemini 2.5 Pro', elo: '1340', coding: '89.2%', pricing: '$1.25 / $5.00' },
              {
                model: 'Claude 3.7 Sonnet',
                elo: '1336',
                coding: '88.9%',
                pricing: '$3.00 / $15.00'
              },
              { model: 'GPT-4.5 Preview', elo: '1328', coding: '87.4%', pricing: '$5.00 / $20.00' }
            ]
          }
        },
        'clock-zones': {
          id: 'clock-zones',
          title: 'Global Compute Regions Clock',
          widgetType: 'clock',
          closable: true,
          widgetProps: {}
        },
        'actionpad-deploy': {
          id: 'actionpad-deploy',
          title: 'Model Rollout',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            actions: [
              {
                id: 'canary',
                label: 'Deploy Canary Weights',
                description: 'Routes 5% traffic to new model'
              },
              {
                id: 'rollback',
                label: 'Emergency Rollback',
                description: 'Reverts back to stable baseline'
              }
            ]
          }
        }
      }
    },
    panels: {
      'aichat-main': {
        id: 'aichat-main',
        title: 'Cognitive Chat Assistant',
        widgetType: 'aichat',
        closable: false,
        widgetProps: {}
      },
      'aiprompt-lab': {
        id: 'aiprompt-lab',
        title: 'Prompt Engineering Lab',
        widgetType: 'aiprompt',
        closable: true,
        widgetProps: {}
      },
      'aicode-gen': {
        id: 'aicode-gen',
        title: 'Reactive Component Synthesizer',
        widgetType: 'aicode',
        closable: true,
        widgetProps: {}
      },
      'notes-scratchpad': {
        id: 'notes-scratchpad',
        title: 'System Persona & Prompt Library',
        widgetType: 'notes',
        closable: true,
        widgetProps: { title: 'System Instructions (v3)' }
      },
      'tasks-ai-sprint': {
        id: 'tasks-ai-sprint',
        title: 'AI Engineering Sprint',
        widgetType: 'tasks',
        closable: true,
        widgetProps: {}
      }
    }
  },

  // ── 3. SRE & CLOUD OPERATIONS HUB ───────────────────────────────────────────
  operations: {
    id: 'operations',
    name: 'SRE & Cloud Operations Hub',
    description:
      'Distributed systems observability: cluster vital signs, Kubernetes pod mesh, live event streams, and terminal consoles across 5 operational views.',
    themeKey: 'dockview-theme-dracula',
    category: 'DevOps',
    icon: 'Activity',
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
    headerTabs: [
      { id: 'tab-ops-vital', label: 'Vital Signs', templateId: 'operations', icon: 'Activity' },
      {
        id: 'tab-ops-fleet',
        label: 'Fleet & Terminal',
        templateId: 'operations',
        icon: 'Terminal'
      },
      {
        id: 'tab-ops-incident',
        label: 'Incident Response',
        templateId: 'operations',
        icon: 'AlertTriangle'
      },
      {
        id: 'tab-ops-runbooks',
        label: 'Runbooks & Docs',
        templateId: 'operations',
        icon: 'FileText'
      },
      { id: 'tab-ops-oncall', label: 'On-Call Command', templateId: 'operations', icon: 'Clock' }
    ],
    tabWorkspaces: {
      'tab-ops-vital': {
        'kpi-vital': {
          id: 'kpi-vital',
          title: 'Infrastructure Vital Signs',
          widgetType: 'kpi',
          closable: false,
          widgetProps: {
            items: [
              { label: 'Cluster Uptime', value: '99.995%', delta: '+0.02%', deltaType: 'positive' },
              { label: 'Median Latency', value: '14.2ms', delta: '-2.1ms', deltaType: 'positive' },
              { label: 'CPU Allocation', value: '38.4%', delta: '+4.1%', deltaType: 'neutral' },
              { label: 'Ingest Rate', value: '142 k/s', delta: '+12 k/s', deltaType: 'positive' }
            ]
          }
        },
        'chart-latency': {
          id: 'chart-latency',
          title: 'Global Edge Latency Distribution',
          widgetType: 'chart',
          closable: true,
          widgetProps: { chartType: 'area', dataKey: 'latency' }
        },
        'cluster-k8s': {
          id: 'cluster-k8s',
          title: 'Kubernetes Pod Topology',
          widgetType: 'cluster',
          closable: true,
          widgetProps: {}
        },
        'activity-live': {
          id: 'activity-live',
          title: 'Cluster Event Log',
          widgetType: 'activity',
          closable: true,
          widgetProps: {}
        },
        'actionpad-hot': {
          id: 'actionpad-hot',
          title: 'SRE Fast Triggers',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            actions: [
              {
                id: 'purge',
                label: 'Purge Edge CDN Cache',
                description: 'Invalidates worldwide edge caches'
              },
              {
                id: 'rotate',
                label: 'Rotate Session Salts',
                description: 'Zero-downtime secret rotation'
              }
            ]
          }
        }
      },
      'tab-ops-fleet': {
        'terminal-sre': {
          id: 'terminal-sre',
          title: 'Production Cloud Shell (SSH)',
          widgetType: 'terminal',
          closable: false,
          widgetProps: {}
        },
        'table-fleet': {
          id: 'table-fleet',
          title: 'Microservices & Endpoints',
          widgetType: 'table',
          closable: true,
          widgetProps: {
            columns: [
              { key: 'service', header: 'Service' },
              { key: 'replicas', header: 'Replicas' },
              { key: 'p95', header: 'p95' },
              { key: 'health', header: 'Health' }
            ],
            rows: [
              { service: 'api-gateway', replicas: '12/12', p95: '8ms', health: 'Healthy' },
              { service: 'auth-tokens', replicas: '6/6', p95: '12ms', health: 'Healthy' },
              { service: 'billing-stripe', replicas: '4/4', p95: '45ms', health: 'Healthy' }
            ]
          }
        },
        'kpi-fleet-nodes': {
          id: 'kpi-fleet-nodes',
          title: 'Fleet Memory & IOPS',
          widgetType: 'kpi',
          closable: true,
          widgetProps: {
            items: [
              { label: 'Memory Pressure', value: '42.1%', delta: '-1.4%', deltaType: 'positive' },
              { label: 'EBS Disk IOPS', value: '18,400', delta: '+800', deltaType: 'neutral' }
            ]
          }
        },
        'notes-runbook': {
          id: 'notes-runbook',
          title: 'DR Runbook & Escalation Matrix',
          widgetType: 'notes',
          closable: true,
          widgetProps: { title: 'Disaster Recovery Plan' }
        },
        'calc-capacity': {
          id: 'calc-capacity',
          title: 'Node Sizing & Capacity Math',
          widgetType: 'calculator',
          closable: true,
          widgetProps: {}
        }
      },
      'tab-ops-incident': {
        'activity-incidents': {
          id: 'activity-incidents',
          title: 'Security Incident Stream',
          widgetType: 'activity',
          closable: false,
          widgetProps: {}
        },
        'doc-diff-deploy': {
          id: 'doc-diff-deploy',
          title: 'Canary Manifest Diff (v2.4 vs v2.5)',
          widgetType: 'doc-diff',
          closable: true,
          widgetProps: {}
        },
        'doc-code-trace': {
          id: 'doc-code-trace',
          title: 'Exception Stacktrace Viewer',
          widgetType: 'doc-code',
          closable: true,
          widgetProps: {}
        },
        'table-active-alerts': {
          id: 'table-active-alerts',
          title: 'Active PagerDuty Queue',
          widgetType: 'table',
          closable: true,
          widgetProps: {
            columns: [
              { key: 'severity', header: 'Sev' },
              { key: 'alert', header: 'Alert' },
              { key: 'target', header: 'Service' },
              { key: 'status', header: 'State' }
            ],
            rows: [
              {
                severity: 'P2',
                alert: 'High Gateway Latency',
                target: 'api-gateway',
                status: 'Investigating'
              },
              {
                severity: 'P3',
                alert: 'Redis Memory 82%',
                target: 'cache-redis',
                status: 'Monitoring'
              }
            ]
          }
        },
        'actionpad-contain': {
          id: 'actionpad-contain',
          title: 'Incident Containment',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            actions: [
              {
                id: 'isolate',
                label: 'Isolate Degraded Zone',
                description: 'Routes traffic away from us-east-1a'
              },
              {
                id: 'warroom',
                label: 'Launch Emergency War Room',
                description: 'Notifies engineers on Slack'
              }
            ]
          }
        }
      },
      'tab-ops-runbooks': {
        'doc-markdown-dr': {
          id: 'doc-markdown-dr',
          title: 'Standard Incident Runbook.md',
          widgetType: 'doc-markdown',
          closable: false,
          widgetProps: {}
        },
        'doc-swagger-api': {
          id: 'doc-swagger-api',
          title: 'Internal API OpenAPI Spec',
          widgetType: 'doc-swagger',
          closable: true,
          widgetProps: {}
        },
        'doc-metadata-pki': {
          id: 'doc-metadata-pki',
          title: 'SSL/TLS Certificate Expiration Audit',
          widgetType: 'doc-metadata',
          closable: true,
          widgetProps: {}
        },
        'tasks-postmortem': {
          id: 'tasks-postmortem',
          title: 'Incident Resolution Checklist',
          widgetType: 'tasks',
          closable: true,
          widgetProps: {}
        },
        'notes-mitigation': {
          id: 'notes-mitigation',
          title: 'Post-Mortem Root Cause Analysis',
          widgetType: 'notes',
          closable: true,
          widgetProps: { title: 'RCA Root Cause Notes' }
        }
      },
      'tab-ops-oncall': {
        'clock-utc': {
          id: 'clock-utc',
          title: 'UTC & Global Datacenter Clocks',
          widgetType: 'clock',
          closable: false,
          widgetProps: {}
        },
        'pomodoro-shift': {
          id: 'pomodoro-shift',
          title: '60-min Incident Watch Sprint',
          widgetType: 'pomodoro',
          closable: true,
          widgetProps: {}
        },
        'tasks-handoff': {
          id: 'tasks-handoff',
          title: 'On-Call Shift Handoff Verification',
          widgetType: 'tasks',
          closable: true,
          widgetProps: {}
        },
        'aichat-devops': {
          id: 'aichat-devops',
          title: 'DevOps Copilot & Log Diagnostic',
          widgetType: 'aichat',
          closable: true,
          widgetProps: {}
        },
        'actionpad-pager': {
          id: 'actionpad-pager',
          title: 'On-Call Controls',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            actions: [
              {
                id: 'ack',
                label: 'Acknowledge All P1 Alerts',
                description: 'Signals to team that on-call is active'
              },
              {
                id: 'handover',
                label: 'Complete Shift Handover',
                description: 'Transfers secondary duty'
              }
            ]
          }
        }
      }
    },
    panels: {
      'kpi-vital': {
        id: 'kpi-vital',
        title: 'Infrastructure Vital Signs',
        widgetType: 'kpi',
        closable: false,
        widgetProps: {
          items: [
            { label: 'Cluster Uptime', value: '99.995%', delta: '+0.02%', deltaType: 'positive' },
            { label: 'Median Latency', value: '14.2ms', delta: '-2.1ms', deltaType: 'positive' },
            { label: 'CPU Allocation', value: '38.4%', delta: '+4.1%', deltaType: 'neutral' },
            { label: 'Ingest Rate', value: '142 k/s', delta: '+12 k/s', deltaType: 'positive' }
          ]
        }
      },
      'chart-latency': {
        id: 'chart-latency',
        title: 'Global Edge Latency Distribution',
        widgetType: 'chart',
        closable: true,
        widgetProps: { chartType: 'area', dataKey: 'latency' }
      },
      'cluster-k8s': {
        id: 'cluster-k8s',
        title: 'Kubernetes Pod Topology',
        widgetType: 'cluster',
        closable: true,
        widgetProps: {}
      },
      'activity-live': {
        id: 'activity-live',
        title: 'Cluster Event Log',
        widgetType: 'activity',
        closable: true,
        widgetProps: {}
      },
      'actionpad-hot': {
        id: 'actionpad-hot',
        title: 'SRE Fast Triggers',
        widgetType: 'actionpad',
        closable: true,
        widgetProps: {
          actions: [
            {
              id: 'purge',
              label: 'Purge Edge CDN Cache',
              description: 'Invalidates worldwide edge caches'
            },
            {
              id: 'rotate',
              label: 'Rotate Session Salts',
              description: 'Zero-downtime secret rotation'
            }
          ]
        }
      }
    }
  },

  // ── 4. DEVELOPER FORGE & CODE COCKPIT ───────────────────────────────────────
  engineering: {
    id: 'engineering',
    name: 'Developer Forge & Code Cockpit',
    description:
      'Full engineering workspace: multi-language code viewers, interactive terminal CLI, side-by-side git diffs, and sprint issue boards.',
    themeKey: 'dockview-theme-github-dark',
    category: 'Engineering',
    icon: 'Terminal',
    header: {
      visible: true,
      title: 'DevForge Engineering Matrix',
      subtitle: 'Full-Stack Developer Sandbox & Microservice Compiler',
      badge: 'Build Passing',
      fontFamily: 'jetbrains',
      titleSize: 'lg',
      titleWeight: 'bold',
      showLogo: true,
      logoIcon: 'Terminal',
      actions: [
        { id: 'git-sync', label: 'Git Pull origin/main', icon: 'Download', actionType: 'refresh' },
        { id: 'build-run', label: 'Compile Release', icon: 'Play', actionType: 'alert' }
      ],
      showWindowControls: true
    },
    footer: {
      visible: true,
      leftText: 'Branch: feat/hybrid-view (Clean)',
      centerText: 'TypeScript: 0 Errors · ESLint: Clean',
      rightText: 'Tests: 116/116 Passing',
      statusState: 'online',
      statusLabel: 'Dev Environment Ready',
      fontFamily: 'jetbrains',
      fontSize: 'xs'
    },
    headerTabs: [
      { id: 'tab-eng-code', label: 'Code Matrix', templateId: 'engineering', icon: 'Code2' },
      { id: 'tab-eng-api', label: 'API & Services', templateId: 'engineering', icon: 'Network' },
      { id: 'tab-eng-ai', label: 'AI Pair Programmer', templateId: 'engineering', icon: 'Bot' },
      {
        id: 'tab-eng-releases',
        label: 'Release Gate',
        templateId: 'engineering',
        icon: 'PackageCheck'
      },
      {
        id: 'tab-eng-sprints',
        label: 'Sprint & Velocity',
        templateId: 'engineering',
        icon: 'ListTodo'
      }
    ],
    tabWorkspaces: {
      'tab-eng-code': {
        'doc-code-main': {
          id: 'doc-code-main',
          title: 'Source Code (TypeScript/React)',
          widgetType: 'doc-code',
          closable: false,
          widgetProps: {}
        },
        'terminal-eng': {
          id: 'terminal-eng',
          title: 'Interactive Developer Terminal',
          widgetType: 'terminal',
          closable: true,
          widgetProps: {}
        },
        'doc-diff-git': {
          id: 'doc-diff-git',
          title: 'Side-by-Side Git Branch Diff',
          widgetType: 'doc-diff',
          closable: true,
          widgetProps: {}
        },
        'tasks-sprint': {
          id: 'tasks-sprint',
          title: 'Engineering Sprint Backlog',
          widgetType: 'tasks',
          closable: true,
          widgetProps: {}
        },
        'notes-arch': {
          id: 'notes-arch',
          title: 'Architecture RFC & Specs',
          widgetType: 'notes',
          closable: true,
          widgetProps: { title: 'System Design RFC #42' }
        }
      },
      'tab-eng-api': {
        'doc-swagger-spec': {
          id: 'doc-swagger-spec',
          title: 'Interactive OpenAPI Schema',
          widgetType: 'doc-swagger',
          closable: false,
          widgetProps: {}
        },
        'table-endpoints': {
          id: 'table-endpoints',
          title: 'REST Endpoints & Handlers',
          widgetType: 'table',
          closable: true,
          widgetProps: {
            columns: [
              { key: 'method', header: 'Method' },
              { key: 'path', header: 'Path' },
              { key: 'status', header: 'Status' }
            ],
            rows: [
              { method: 'POST', path: '/v1/agent/run', status: '200 OK' },
              { method: 'GET', path: '/v1/workspace/tabs', status: '200 OK' },
              { method: 'PUT', path: '/v1/theme/preset', status: '200 OK' }
            ]
          }
        },
        'activity-requests': {
          id: 'activity-requests',
          title: 'API Telemetry Stream',
          widgetType: 'activity',
          closable: true,
          widgetProps: {}
        },
        'kpi-api-perf': {
          id: 'kpi-api-perf',
          title: 'API Throughput & Latency',
          widgetType: 'kpi',
          closable: true,
          widgetProps: {
            items: [
              { label: 'Requests/sec', value: '4,280', delta: '+14%', deltaType: 'positive' },
              { label: 'Cache Hit %', value: '94.2%', delta: '+2.1%', deltaType: 'positive' }
            ]
          }
        },
        'actionpad-curl': {
          id: 'actionpad-curl',
          title: 'Testing Triggers',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            actions: [
              {
                id: 'test',
                label: 'Run Vitest Unit Suite',
                description: 'Executes all test files'
              },
              { id: 'lint', label: 'Run Linter & Prettier', description: 'Verifies zero warnings' }
            ]
          }
        }
      },
      'tab-eng-ai': {
        'aicode-eng': {
          id: 'aicode-eng',
          title: 'Reactive Code Synthesizer',
          widgetType: 'aicode',
          closable: false,
          widgetProps: {}
        },
        'aichat-pair': {
          id: 'aichat-pair',
          title: 'Pair Programming Copilot',
          widgetType: 'aichat',
          closable: true,
          widgetProps: {}
        },
        'aiprompt-refactor': {
          id: 'aiprompt-refactor',
          title: 'Refactoring Prompts Lab',
          widgetType: 'aiprompt',
          closable: true,
          widgetProps: {}
        },
        'airag-codebase': {
          id: 'airag-codebase',
          title: 'Codebase Vector Index Search',
          widgetType: 'airag',
          closable: true,
          widgetProps: {}
        },
        'terminal-build': {
          id: 'terminal-build',
          title: 'Compiler & Hot Reload Shell',
          widgetType: 'terminal',
          closable: true,
          widgetProps: {}
        }
      },
      'tab-eng-releases': {
        'doc-markdown-changelog': {
          id: 'doc-markdown-changelog',
          title: 'CHANGELOG.md (Semantic Versioning)',
          widgetType: 'doc-markdown',
          closable: false,
          widgetProps: {}
        },
        'doc-txt-license': {
          id: 'doc-txt-license',
          title: 'LICENSE & Third-Party Disclaimers',
          widgetType: 'doc-txt',
          closable: true,
          widgetProps: {}
        },
        'doc-metadata-hashes': {
          id: 'doc-metadata-hashes',
          title: 'Binary Artifact SHA256 Verification',
          widgetType: 'doc-metadata',
          closable: true,
          widgetProps: {}
        },
        'doc-summarizer-pr': {
          id: 'doc-summarizer-pr',
          title: 'Automated PR Summary Generator',
          widgetType: 'doc-summarizer',
          closable: true,
          widgetProps: {}
        },
        'tasks-release-checklist': {
          id: 'tasks-release-checklist',
          title: 'Production Release Gates',
          widgetType: 'tasks',
          closable: true,
          widgetProps: {}
        }
      },
      'tab-eng-sprints': {
        'pomodoro-dev': {
          id: 'pomodoro-dev',
          title: '25-min Clean Code Pomodoro Block',
          widgetType: 'pomodoro',
          closable: false,
          widgetProps: {}
        },
        'calendar-standup': {
          id: 'calendar-standup',
          title: 'Daily Standups & Scrum Sprints',
          widgetType: 'calendar',
          closable: true,
          widgetProps: {}
        },
        'tasks-pr-review': {
          id: 'tasks-pr-review',
          title: 'Open PR Review Queue',
          widgetType: 'tasks',
          closable: true,
          widgetProps: {}
        },
        'calc-points': {
          id: 'calc-points',
          title: 'Story Point Velocity Math',
          widgetType: 'calculator',
          closable: true,
          widgetProps: {}
        },
        'clock-dev-teams': {
          id: 'clock-dev-teams',
          title: 'Distributed Team Timezones',
          widgetType: 'clock',
          closable: true,
          widgetProps: {}
        }
      }
    },
    panels: {
      'doc-code-main': {
        id: 'doc-code-main',
        title: 'Source Code (TypeScript/React)',
        widgetType: 'doc-code',
        closable: false,
        widgetProps: {}
      },
      'terminal-eng': {
        id: 'terminal-eng',
        title: 'Interactive Developer Terminal',
        widgetType: 'terminal',
        closable: true,
        widgetProps: {}
      },
      'doc-diff-git': {
        id: 'doc-diff-git',
        title: 'Side-by-Side Git Branch Diff',
        widgetType: 'doc-diff',
        closable: true,
        widgetProps: {}
      },
      'tasks-sprint': {
        id: 'tasks-sprint',
        title: 'Engineering Sprint Backlog',
        widgetType: 'tasks',
        closable: true,
        widgetProps: {}
      },
      'notes-arch': {
        id: 'notes-arch',
        title: 'Architecture RFC & Specs',
        widgetType: 'notes',
        closable: true,
        widgetProps: { title: 'System Design RFC #42' }
      }
    }
  },

  // ── 5. SMART MEETING & VOICE INTELLIGENCE ───────────────────────────────────
  meetings: {
    id: 'meetings',
    name: 'Smart Meeting & Voice Intelligence',
    description:
      'Executive conference intelligence: live audio recording, real-time transcription, AI minutes synthesis, and action item trackers across 5 tabs.',
    themeKey: 'dockview-theme-nord',
    category: 'Meetings',
    icon: 'Mic',
    header: {
      visible: true,
      title: 'Vocalis Meeting Intelligence',
      subtitle: 'Executive Audio Recording, Transcription & Action Extraction',
      badge: 'Live Audio Ingest',
      fontFamily: 'outfit',
      titleSize: 'lg',
      titleWeight: 'bold',
      showLogo: true,
      logoIcon: 'Mic',
      actions: [
        { id: 'record-toggle', label: 'Start Recording', icon: 'Play', actionType: 'alert' },
        {
          id: 'export-minutes',
          label: 'Export Minutes PDF',
          icon: 'Download',
          actionType: 'export'
        }
      ],
      showWindowControls: true
    },
    footer: {
      visible: true,
      leftText: 'Audio Source: High-Definition Input (48kHz)',
      centerText: 'Active Transcription: Whisper v3 Turbo',
      rightText: 'Speakers Identified: 4 Detected',
      statusState: 'online',
      statusLabel: 'Acoustic Engine Ready',
      fontFamily: 'outfit',
      fontSize: 'xs'
    },
    headerTabs: [
      { id: 'tab-meet-live', label: 'Live Conference', templateId: 'meetings', icon: 'Mic' },
      {
        id: 'tab-meet-agenda',
        label: 'Agenda & Timekeeper',
        templateId: 'meetings',
        icon: 'Clock'
      },
      {
        id: 'tab-meet-synthesis',
        label: 'Post-Meeting AI',
        templateId: 'meetings',
        icon: 'Sparkles'
      },
      {
        id: 'tab-meet-contracts',
        label: 'Document Review',
        templateId: 'meetings',
        icon: 'FileText'
      },
      {
        id: 'tab-meet-execution',
        label: 'Sprint Actioning',
        templateId: 'meetings',
        icon: 'CheckSquare'
      }
    ],
    tabWorkspaces: {
      'tab-meet-live': {
        'recorder-conf': {
          id: 'recorder-conf',
          title: 'High-Fidelity Audio Ingest',
          widgetType: 'recorder',
          closable: false,
          widgetProps: {}
        },
        'transcript-conf': {
          id: 'transcript-conf',
          title: 'Real-Time Speech-to-Text Stream',
          widgetType: 'transcript',
          closable: true,
          widgetProps: {}
        },
        'summary-conf': {
          id: 'summary-conf',
          title: 'Real-Time Key Takeaways & Bullets',
          widgetType: 'summary',
          closable: true,
          widgetProps: {}
        },
        'meeting-actions-conf': {
          id: 'meeting-actions-conf',
          title: 'Action Items & Assignees',
          widgetType: 'meeting-actions',
          closable: true,
          widgetProps: {}
        },
        'talk-time-conf': {
          id: 'talk-time-conf',
          title: 'Speaker Airtime Participation',
          widgetType: 'talk-time',
          closable: true,
          widgetProps: {}
        }
      },
      'tab-meet-agenda': {
        'agenda-timer-conf': {
          id: 'agenda-timer-conf',
          title: 'Topic Pacing & Agenda Clock',
          widgetType: 'agenda-timer',
          closable: false,
          widgetProps: {}
        },
        'calendar-conf': {
          id: 'calendar-conf',
          title: 'Meeting Calendar & Attendee Roster',
          widgetType: 'calendar',
          closable: true,
          widgetProps: {}
        },
        'meeting-qa-conf': {
          id: 'meeting-qa-conf',
          title: 'Live Audience Q&A Upvote Queue',
          widgetType: 'meeting-qa',
          closable: true,
          widgetProps: {}
        },
        'tasks-prep': {
          id: 'tasks-prep',
          title: 'Facilitator Checklist',
          widgetType: 'tasks',
          closable: true,
          widgetProps: {}
        },
        'notes-agenda-draft': {
          id: 'notes-agenda-draft',
          title: 'Collaborative Agenda Draft',
          widgetType: 'notes',
          closable: true,
          widgetProps: { title: 'Sprint Retrospective Agenda' }
        }
      },
      'tab-meet-synthesis': {
        'doc-summarizer-minutes': {
          id: 'doc-summarizer-minutes',
          title: 'AI Executive Minutes Synthesis',
          widgetType: 'doc-summarizer',
          closable: false,
          widgetProps: {}
        },
        'doc-markdown-notes': {
          id: 'doc-markdown-notes',
          title: 'Formatted Executive Minutes Export',
          widgetType: 'doc-markdown',
          closable: true,
          widgetProps: { title: 'Executive Summary Minutes.md' }
        },
        'doc-reader-transcript': {
          id: 'doc-reader-transcript',
          title: 'Searchable Full Transcript Archive',
          widgetType: 'doc-reader',
          closable: true,
          widgetProps: {}
        },
        'table-roster': {
          id: 'table-roster',
          title: 'Attendee Attendance Ledger',
          widgetType: 'table',
          closable: true,
          widgetProps: {
            columns: [
              { key: 'name', header: 'Participant' },
              { key: 'role', header: 'Role' },
              { key: 'attendance', header: 'Duration' }
            ],
            rows: [
              { name: 'Sarah Lin', role: 'Head of Product', attendance: '45m (100%)' },
              { name: 'Marcus Vance', role: 'VP Engineering', attendance: '45m (100%)' },
              { name: 'Elena Rostova', role: 'Chief Financial Officer', attendance: '42m (93%)' }
            ]
          }
        },
        'actionpad-dispatch': {
          id: 'actionpad-dispatch',
          title: 'Dispatch Minutes',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            actions: [
              {
                id: 'email',
                label: 'Broadcast Minutes to Attendees',
                description: 'Emails PDF summary and tasks'
              },
              {
                id: 'sync-jira',
                label: 'Push Action Items to Jira',
                description: 'Creates issues for extracted tasks'
              }
            ]
          }
        }
      },
      'tab-meet-contracts': {
        'doc-contract-meet': {
          id: 'doc-contract-meet',
          title: 'Partnership Agreement Clause Review',
          widgetType: 'doc-contract',
          closable: false,
          widgetProps: {}
        },
        'doc-pdf-deck': {
          id: 'doc-pdf-deck',
          title: 'Presentation Pitch Deck.pdf',
          widgetType: 'doc-pdf',
          closable: true,
          widgetProps: { title: 'Q3 Board Deck.pdf' }
        },
        'doc-metadata-signing': {
          id: 'doc-metadata-signing',
          title: 'Signoff Authority Status',
          widgetType: 'doc-metadata',
          closable: true,
          widgetProps: {}
        },
        'notes-legal-notes': {
          id: 'notes-legal-notes',
          title: 'Counsel Remarks & Annotations',
          widgetType: 'notes',
          closable: true,
          widgetProps: { title: 'Counsel Legal Notes' }
        },
        'kpi-approval': {
          id: 'kpi-approval',
          title: 'Deal Signoff Status',
          widgetType: 'kpi',
          closable: true,
          widgetProps: {
            items: [
              {
                label: 'Required Signoffs',
                value: '4/4',
                delta: 'Complete',
                deltaType: 'positive'
              },
              {
                label: 'Approval Cycle',
                value: '2.4 days',
                delta: '-1.1 days',
                deltaType: 'positive'
              }
            ]
          }
        }
      },
      'tab-meet-execution': {
        'tasks-assigned': {
          id: 'tasks-assigned',
          title: 'Committed Meeting Action Items',
          widgetType: 'tasks',
          closable: false,
          widgetProps: {}
        },
        'pomodoro-post': {
          id: 'pomodoro-post',
          title: '30-min Immediate Follow-up Sprint',
          widgetType: 'pomodoro',
          closable: true,
          widgetProps: {}
        },
        'aichat-email': {
          id: 'aichat-email',
          title: 'Follow-Up Communication Drafter',
          widgetType: 'aichat',
          closable: true,
          widgetProps: {}
        },
        'clock-client-times': {
          id: 'clock-client-times',
          title: 'Global Stakeholder Timezones',
          widgetType: 'clock',
          closable: true,
          widgetProps: {}
        },
        'actionpad-calendar': {
          id: 'actionpad-calendar',
          title: 'Schedule Actions',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            actions: [
              {
                id: 'next',
                label: 'Schedule Follow-Up Sync',
                description: 'Invites all 4 attendees for next Tuesday'
              },
              {
                id: 'remind',
                label: 'Set Deadline Reminders',
                description: 'Schedules 48-hour check-in'
              }
            ]
          }
        }
      }
    },
    panels: {
      'recorder-conf': {
        id: 'recorder-conf',
        title: 'High-Fidelity Audio Ingest',
        widgetType: 'recorder',
        closable: false,
        widgetProps: {}
      },
      'transcript-conf': {
        id: 'transcript-conf',
        title: 'Real-Time Speech-to-Text Stream',
        widgetType: 'transcript',
        closable: true,
        widgetProps: {}
      },
      'summary-conf': {
        id: 'summary-conf',
        title: 'Real-Time Key Takeaways & Bullets',
        widgetType: 'summary',
        closable: true,
        widgetProps: {}
      },
      'meeting-actions-conf': {
        id: 'meeting-actions-conf',
        title: 'Action Items & Assignees',
        widgetType: 'meeting-actions',
        closable: true,
        widgetProps: {}
      },
      'talk-time-conf': {
        id: 'talk-time-conf',
        title: 'Speaker Airtime Participation',
        widgetType: 'talk-time',
        closable: true,
        widgetProps: {}
      }
    }
  },

  // ── 6. DOCUMENT KNOWLEDGE & CONTRACT HUB ────────────────────────────────────
  documents: {
    id: 'documents',
    name: 'Document Knowledge & Contract Hub',
    description:
      'Universal document intelligence: Markdown, dual-page PDF, Word DOCX, text readers, contract audits, and OpenAPI specs across 5 structured tabs.',
    themeKey: 'dockview-theme-solarized-light',
    category: 'Documents',
    icon: 'FileText',
    header: {
      visible: true,
      title: 'Legalese & Document Studio',
      subtitle: 'Multi-Format Reader, Contract Audit & Semantic Knowledge Suite',
      badge: 'DOCX / PDF / MD / TXT',
      fontFamily: 'outfit',
      titleSize: 'lg',
      titleWeight: 'bold',
      showLogo: true,
      logoIcon: 'FileText',
      actions: [
        { id: 'sign', label: 'Stamp Cryptographic Signature', icon: 'Check', actionType: 'alert' },
        { id: 'export-all', label: 'Compile Binder', icon: 'Download', actionType: 'export' }
      ],
      showWindowControls: true
    },
    footer: {
      visible: true,
      leftText: 'Active Binder: Master Services Agreement v4.2',
      centerText: 'Integrity: SHA256 Verified · 0 Tamper Events',
      rightText: 'Storage: Local Encrypted File System',
      statusState: 'online',
      statusLabel: 'Document Engine Ready',
      fontFamily: 'outfit',
      fontSize: 'xs'
    },
    headerTabs: [
      {
        id: 'tab-doc-readers',
        label: 'Multi-Format Viewers',
        templateId: 'documents',
        icon: 'BookOpen'
      },
      {
        id: 'tab-doc-legal',
        label: 'Contracts & Redlines',
        templateId: 'documents',
        icon: 'FileCheck'
      },
      { id: 'tab-doc-tech', label: 'Technical Specs', templateId: 'documents', icon: 'Code2' },
      {
        id: 'tab-doc-data',
        label: 'Spreadsheets & CSV',
        templateId: 'documents',
        icon: 'FileSpreadsheet'
      },
      {
        id: 'tab-doc-research',
        label: 'Knowledge Retrieval',
        templateId: 'documents',
        icon: 'Database'
      }
    ],
    tabWorkspaces: {
      'tab-doc-readers': {
        'doc-markdown-main': {
          id: 'doc-markdown-main',
          title: 'Executive Proposal.md',
          widgetType: 'doc-markdown',
          closable: false,
          widgetProps: {}
        },
        'doc-pdf-main': {
          id: 'doc-pdf-main',
          title: 'Master Service Agreement.pdf',
          widgetType: 'doc-pdf',
          closable: true,
          widgetProps: { title: 'Contract.pdf' }
        },
        'doc-docx-main': {
          id: 'doc-docx-main',
          title: 'Business Plan.docx',
          widgetType: 'doc-docx',
          closable: true,
          widgetProps: {}
        },
        'doc-txt-main': {
          id: 'doc-txt-main',
          title: 'System Architecture.txt',
          widgetType: 'doc-txt',
          closable: true,
          widgetProps: {}
        },
        'doc-reader-focus': {
          id: 'doc-reader-focus',
          title: 'Distraction-Free Focus Reader',
          widgetType: 'doc-reader',
          closable: true,
          widgetProps: {}
        }
      },
      'tab-doc-legal': {
        'doc-contract-audit': {
          id: 'doc-contract-audit',
          title: 'Master Service Agreement Review',
          widgetType: 'doc-contract',
          closable: false,
          widgetProps: {}
        },
        'doc-diff-clauses': {
          id: 'doc-diff-clauses',
          title: 'Redline Clause Comparison',
          widgetType: 'doc-diff',
          closable: true,
          widgetProps: {}
        },
        'doc-metadata-hashes': {
          id: 'doc-metadata-hashes',
          title: 'Document Hash Verification Registry',
          widgetType: 'doc-metadata',
          closable: true,
          widgetProps: {}
        },
        'doc-summarizer-legal': {
          id: 'doc-summarizer-legal',
          title: 'AI Legal Risk Matrix',
          widgetType: 'doc-summarizer',
          closable: true,
          widgetProps: {}
        },
        'tasks-compliance': {
          id: 'tasks-compliance',
          title: 'Legal Compliance Checklist',
          widgetType: 'tasks',
          closable: true,
          widgetProps: {}
        }
      },
      'tab-doc-tech': {
        'doc-swagger-api': {
          id: 'doc-swagger-api',
          title: 'Cloud Gateway OpenAPI Spec',
          widgetType: 'doc-swagger',
          closable: false,
          widgetProps: {}
        },
        'doc-code-ref': {
          id: 'doc-code-ref',
          title: 'Reference Implementation (TS)',
          widgetType: 'doc-code',
          closable: true,
          widgetProps: {}
        },
        'terminal-doc': {
          id: 'terminal-doc',
          title: 'Schema Linter & Docs CLI',
          widgetType: 'terminal',
          closable: true,
          widgetProps: {}
        },
        'notes-spec-notes': {
          id: 'notes-spec-notes',
          title: 'API Design Remarks',
          widgetType: 'notes',
          closable: true,
          widgetProps: { title: 'REST Contract Annotations' }
        },
        'table-specs': {
          id: 'table-specs',
          title: 'Schema Definitions Catalog',
          widgetType: 'table',
          closable: true,
          widgetProps: {
            columns: [
              { key: 'entity', header: 'Entity' },
              { key: 'type', header: 'Type' },
              { key: 'required', header: 'Required' }
            ],
            rows: [
              { entity: 'WorkspaceId', type: 'UUID v4', required: 'Yes' },
              { entity: 'PresetTokens', type: 'JSON Object', required: 'Yes' },
              { entity: 'Timestamp', type: 'ISO 8601', required: 'No' }
            ]
          }
        }
      },
      'tab-doc-data': {
        'doc-csv-ledger': {
          id: 'doc-csv-ledger',
          title: 'Corporate Financial Spreadsheet',
          widgetType: 'doc-csv',
          closable: false,
          widgetProps: {}
        },
        'table-parsed': {
          id: 'table-parsed',
          title: 'Summary Aggregations',
          widgetType: 'table',
          closable: true,
          widgetProps: {
            columns: [
              { key: 'category', header: 'Category' },
              { key: 'budget', header: 'Budget' },
              { key: 'actual', header: 'Actual' }
            ],
            rows: [
              { category: 'Engineering & Compute', budget: '$180,000', actual: '$164,200' },
              { category: 'Sales & Growth', budget: '$120,000', actual: '$118,500' },
              { category: 'Operations & G&A', budget: '$60,000', actual: '$58,100' }
            ]
          }
        },
        'chart-data-plot': {
          id: 'chart-data-plot',
          title: 'Spreadsheet Variance Area Chart',
          widgetType: 'chart',
          closable: true,
          widgetProps: { chartType: 'area', dataKey: 'variance' }
        },
        'calc-math': {
          id: 'calc-math',
          title: 'Formula Calculation Verification',
          widgetType: 'calculator',
          closable: true,
          widgetProps: {}
        },
        'kpi-data-metrics': {
          id: 'kpi-data-metrics',
          title: 'Dataset Quality Vital Signs',
          widgetType: 'kpi',
          closable: true,
          widgetProps: {
            items: [
              { label: 'Total Rows', value: '42,180', delta: '+1.2k', deltaType: 'positive' },
              { label: 'Null Value %', value: '0.00%', delta: 'Clean', deltaType: 'positive' }
            ]
          }
        }
      },
      'tab-doc-research': {
        'airag-kb': {
          id: 'airag-kb',
          title: 'Neural Document Search (RAG)',
          widgetType: 'airag',
          closable: false,
          widgetProps: {}
        },
        'aichat-doc-qa': {
          id: 'aichat-doc-qa',
          title: 'Document Interrogation Copilot',
          widgetType: 'aichat',
          closable: true,
          widgetProps: {}
        },
        'notes-citations': {
          id: 'notes-citations',
          title: 'Academic Citations & References',
          widgetType: 'notes',
          closable: true,
          widgetProps: { title: 'Bibliography & Case Law' }
        },
        'calendar-deadlines': {
          id: 'calendar-deadlines',
          title: 'Filing & Audit Deadlines',
          widgetType: 'calendar',
          closable: true,
          widgetProps: {}
        },
        'actionpad-publish': {
          id: 'actionpad-publish',
          title: 'Publish Binder',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            actions: [
              {
                id: 'watermark',
                label: 'Apply Confidential Watermark',
                description: 'Stamps investor ID on every page'
              },
              {
                id: 'compile',
                label: 'Export Complete PDF Dossier',
                description: 'Combines all 5 formats into one binder'
              }
            ]
          }
        }
      }
    },
    panels: {
      'doc-markdown-main': {
        id: 'doc-markdown-main',
        title: 'Executive Proposal.md',
        widgetType: 'doc-markdown',
        closable: false,
        widgetProps: {}
      },
      'doc-pdf-main': {
        id: 'doc-pdf-main',
        title: 'Master Service Agreement.pdf',
        widgetType: 'doc-pdf',
        closable: true,
        widgetProps: { title: 'Contract.pdf' }
      },
      'doc-docx-main': {
        id: 'doc-docx-main',
        title: 'Business Plan.docx',
        widgetType: 'doc-docx',
        closable: true,
        widgetProps: {}
      },
      'doc-txt-main': {
        id: 'doc-txt-main',
        title: 'System Architecture.txt',
        widgetType: 'doc-txt',
        closable: true,
        widgetProps: {}
      },
      'doc-reader-focus': {
        id: 'doc-reader-focus',
        title: 'Distraction-Free Focus Reader',
        widgetType: 'doc-reader',
        closable: true,
        widgetProps: {}
      }
    }
  },

  // ── 7. PERSONAL FOCUS & DAILY COMMAND ───────────────────────────────────────
  productivity: {
    id: 'productivity',
    name: 'Personal Focus & Daily Command',
    description:
      'High-performance personal productivity suite: World clocks, Pomodoro focus cycles, priority task checklists, voice capture, and weekly retrospectives.',
    themeKey: 'dockview-theme-vs',
    category: 'Productivity',
    icon: 'Timer',
    header: {
      visible: true,
      title: 'Aura Personal Command Hub',
      subtitle: 'Deep Work Sprint Pacing, Task Execution & Reflective Synthesis',
      badge: 'Focus Mode On',
      fontFamily: 'outfit',
      titleSize: 'lg',
      titleWeight: 'bold',
      showLogo: true,
      logoIcon: 'Timer',
      actions: [
        { id: 'pomo-start', label: 'Start 25m Focus Block', icon: 'Play', actionType: 'alert' },
        { id: 'plan-day', label: 'Plan Tomorrow', icon: 'Check', actionType: 'refresh' }
      ],
      showWindowControls: true
    },
    footer: {
      visible: true,
      leftText: 'Focus Streak: 6 Sprints Completed Today',
      centerText: 'Active Mode: Deep Work Sprint #7',
      rightText: 'Daily Habits: 5/5 Passing',
      statusState: 'online',
      statusLabel: 'Flow State Active',
      fontFamily: 'outfit',
      fontSize: 'xs'
    },
    headerTabs: [
      { id: 'tab-prod-focus', label: 'Daily Command', templateId: 'productivity', icon: 'Clock' },
      {
        id: 'tab-prod-projects',
        label: 'Projects & Backlog',
        templateId: 'productivity',
        icon: 'ListTodo'
      },
      { id: 'tab-prod-voice', label: 'Audio & Journal', templateId: 'productivity', icon: 'Mic' },
      {
        id: 'tab-prod-reference',
        label: 'Knowledge & Tools',
        templateId: 'productivity',
        icon: 'BookOpen'
      },
      {
        id: 'tab-prod-retro',
        label: 'Weekly Retrospective',
        templateId: 'productivity',
        icon: 'TrendingUp'
      }
    ],
    tabWorkspaces: {
      'tab-prod-focus': {
        'clock-world': {
          id: 'clock-world',
          title: 'Digital World Clock & Timezones',
          widgetType: 'clock',
          closable: false,
          widgetProps: {}
        },
        'pomodoro-timer': {
          id: 'pomodoro-timer',
          title: 'Pomodoro Focus Sprint Timer',
          widgetType: 'pomodoro',
          closable: true,
          widgetProps: {}
        },
        'tasks-today': {
          id: 'tasks-today',
          title: 'Priority 1 Daily Action Checklist',
          widgetType: 'tasks',
          closable: true,
          widgetProps: {}
        },
        'notes-today': {
          id: 'notes-today',
          title: 'Rapid Capture Scratchpad',
          widgetType: 'notes',
          closable: true,
          widgetProps: { title: 'Daily Stream of Consciousness' }
        },
        'calendar-today': {
          id: 'calendar-today',
          title: 'Today’s Calendar Agenda',
          widgetType: 'calendar',
          closable: true,
          widgetProps: {}
        }
      },
      'tab-prod-projects': {
        'tasks-milestones': {
          id: 'tasks-milestones',
          title: 'Active Milestones & Deliverables',
          widgetType: 'tasks',
          closable: false,
          widgetProps: {}
        },
        'table-deliverables': {
          id: 'table-deliverables',
          title: 'Project Deliverable Progress',
          widgetType: 'table',
          closable: true,
          widgetProps: {
            columns: [
              { key: 'project', header: 'Project' },
              { key: 'owner', header: 'Owner' },
              { key: 'progress', header: 'Progress' }
            ],
            rows: [
              { project: 'Electron Framework v0.4', owner: 'Self', progress: '95%' },
              { project: 'Client Financial Dashboard', owner: 'Sarah', progress: '80%' },
              { project: 'Q4 Budget Strategy', owner: 'Team', progress: '60%' }
            ]
          }
        },
        'chart-burnup': {
          id: 'chart-burnup',
          title: 'Weekly Task Completion Burnup',
          widgetType: 'chart',
          closable: true,
          widgetProps: { chartType: 'line', dataKey: 'tasks' }
        },
        'kpi-velocity': {
          id: 'kpi-velocity',
          title: 'Personal Flow Efficiency',
          widgetType: 'kpi',
          closable: true,
          widgetProps: {
            items: [
              { label: 'Deep Work Hours', value: '5.8h', delta: '+1.2h', deltaType: 'positive' },
              { label: 'Tasks Closed', value: '14', delta: '+4', deltaType: 'positive' }
            ]
          }
        },
        'actionpad-project': {
          id: 'actionpad-project',
          title: 'Workflow Actions',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            actions: [
              {
                id: 'archive',
                label: 'Archive Completed Items',
                description: 'Moves finished tasks to retro'
              },
              {
                id: 'timesheet',
                label: 'Export Daily Timesheet',
                description: 'Generates CSV invoice log'
              }
            ]
          }
        }
      },
      'tab-prod-voice': {
        'recorder-memos': {
          id: 'recorder-memos',
          title: 'Audio Journal & Voice Notes',
          widgetType: 'recorder',
          closable: false,
          widgetProps: {}
        },
        'transcript-memos': {
          id: 'transcript-memos',
          title: 'Real-Time Voice-to-Text Transcription',
          widgetType: 'transcript',
          closable: true,
          widgetProps: {}
        },
        'summary-memos': {
          id: 'summary-memos',
          title: 'Key Insights & Idea Synthesis',
          widgetType: 'summary',
          closable: true,
          widgetProps: {}
        },
        'meeting-actions-prod': {
          id: 'meeting-actions-prod',
          title: 'Extracted Personal Tasks',
          widgetType: 'meeting-actions',
          closable: true,
          widgetProps: {}
        },
        'notes-journal': {
          id: 'notes-journal',
          title: 'Evening Reflection Journal',
          widgetType: 'notes',
          closable: true,
          widgetProps: { title: 'Evening Log & Gratitude' }
        }
      },
      'tab-prod-reference': {
        'doc-markdown-wiki': {
          id: 'doc-markdown-wiki',
          title: 'Personal Knowledge Wiki.md',
          widgetType: 'doc-markdown',
          closable: false,
          widgetProps: {}
        },
        'doc-reader-articles': {
          id: 'doc-reader-articles',
          title: 'Read-It-Later Longform Reader',
          widgetType: 'doc-reader',
          closable: true,
          widgetProps: {}
        },
        'aichat-thinking': {
          id: 'aichat-thinking',
          title: 'Cognitive Brainstorming Assistant',
          widgetType: 'aichat',
          closable: true,
          widgetProps: {}
        },
        'calc-quick': {
          id: 'calc-quick',
          title: 'Desk Math Calculator',
          widgetType: 'calculator',
          closable: true,
          widgetProps: {}
        },
        'weather-local': {
          id: 'weather-local',
          title: 'Local Conditions & Forecast',
          widgetType: 'weather',
          closable: true,
          widgetProps: {}
        }
      },
      'tab-prod-retro': {
        'chart-hours': {
          id: 'chart-hours',
          title: 'Deep Work Distribution by Project',
          widgetType: 'chart',
          closable: false,
          widgetProps: { chartType: 'bar', dataKey: 'hours' }
        },
        'kpi-goals': {
          id: 'kpi-goals',
          title: 'Weekly Goal Scorecard',
          widgetType: 'kpi',
          closable: true,
          widgetProps: {
            items: [
              { label: 'Weekly Goals Met', value: '9/10', delta: '+1', deltaType: 'positive' },
              { label: 'Habit Consistency', value: '94%', delta: '+6%', deltaType: 'positive' }
            ]
          }
        },
        'notes-retro': {
          id: 'notes-retro',
          title: 'Weekly Wins & Kaizen Improvements',
          widgetType: 'notes',
          closable: true,
          widgetProps: { title: 'Weekly Retrospective Notes' }
        },
        'calendar-next-week': {
          id: 'calendar-next-week',
          title: 'Next Sprint Blueprint',
          widgetType: 'calendar',
          closable: true,
          widgetProps: {}
        },
        'actionpad-reset': {
          id: 'actionpad-reset',
          title: 'End-of-Week Ritual',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            actions: [
              {
                id: 'wipe',
                label: 'Reset Focus Counters',
                description: 'Clears streak for fresh Monday'
              },
              {
                id: 'backup',
                label: 'Export Local Markdown Vault',
                description: 'Backs up journal to disk'
              }
            ]
          }
        }
      }
    },
    panels: {
      'clock-world': {
        id: 'clock-world',
        title: 'Digital World Clock & Timezones',
        widgetType: 'clock',
        closable: false,
        widgetProps: {}
      },
      'pomodoro-timer': {
        id: 'pomodoro-timer',
        title: 'Pomodoro Focus Sprint Timer',
        widgetType: 'pomodoro',
        closable: true,
        widgetProps: {}
      },
      'tasks-today': {
        id: 'tasks-today',
        title: 'Priority 1 Daily Action Checklist',
        widgetType: 'tasks',
        closable: true,
        widgetProps: {}
      },
      'notes-today': {
        id: 'notes-today',
        title: 'Rapid Capture Scratchpad',
        widgetType: 'notes',
        closable: true,
        widgetProps: { title: 'Daily Stream of Consciousness' }
      },
      'calendar-today': {
        id: 'calendar-today',
        title: 'Today’s Calendar Agenda',
        widgetType: 'calendar',
        closable: true,
        widgetProps: {}
      }
    }
  },

  // ── 8. PRODUCT GROWTH & COHORT ANALYTICS ────────────────────────────────────
  analytics: {
    id: 'analytics',
    name: 'Product Growth & Cohort Analytics',
    description:
      'Growth engine diagnostics: acquisition funnels, retention matrices, user journey analytics, and monetization playbooks across 5 analytical views.',
    themeKey: 'dockview-theme-nord',
    category: 'Analytics',
    icon: 'BarChart2',
    header: {
      visible: true,
      title: 'Vanguard Growth Studio',
      subtitle: 'Cohort Analysis & Product Funnel Diagnostics',
      badge: 'Cohort Engine',
      fontFamily: 'inter',
      titleSize: 'lg',
      titleWeight: 'semibold',
      showLogo: true,
      logoIcon: 'BarChart2',
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
    headerTabs: [
      {
        id: 'tab-ana-funnel',
        label: 'Funnel Velocity',
        templateId: 'analytics',
        icon: 'TrendingUp'
      },
      {
        id: 'tab-ana-engagement',
        label: 'User Engagement',
        templateId: 'analytics',
        icon: 'Activity'
      },
      {
        id: 'tab-ana-monetization',
        label: 'Revenue & LTV',
        templateId: 'analytics',
        icon: 'Layers'
      },
      { id: 'tab-ana-experiments', label: 'A/B Experiments', templateId: 'analytics', icon: 'Zap' },
      {
        id: 'tab-ana-runbook',
        label: 'Tracking & Specs',
        templateId: 'analytics',
        icon: 'FileText'
      }
    ],
    tabWorkspaces: {
      'tab-ana-funnel': {
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
                deltaType: 'positive'
              },
              { label: 'Activation Rate', value: '62.4%', delta: '+3.1%', deltaType: 'positive' },
              {
                label: 'Weekly Active Users',
                value: '28,490',
                delta: '+18.2%',
                deltaType: 'positive'
              },
              { label: 'Paid Expansion', value: '18.9%', delta: '+1.5%', deltaType: 'positive' }
            ]
          }
        },
        'chart-funnel': {
          id: 'chart-funnel',
          title: 'Funnel Step Drop-Off Velocity',
          widgetType: 'chart',
          closable: true,
          widgetProps: { chartType: 'bar', dataKey: 'conversions' }
        },
        'table-cohorts': {
          id: 'table-cohorts',
          title: 'Customer Cohort Retention Matrix',
          widgetType: 'table',
          closable: true,
          widgetProps: {
            columns: [
              { key: 'cohort', header: 'Cohort' },
              { key: 'users', header: 'Users' },
              { key: 'w1', header: 'W1' },
              { key: 'w4', header: 'W4' },
              { key: 'w8', header: 'W8' }
            ],
            rows: [
              { cohort: '2026-08 Enterprise', users: '1,420', w1: '94%', w4: '88%', w8: '85%' },
              { cohort: '2026-07 Growth', users: '3,840', w1: '91%', w4: '82%', w8: '79%' },
              { cohort: '2026-06 Self-Serve', users: '12,900', w1: '78%', w4: '64%', w8: '59%' }
            ]
          }
        },
        'notes-growth': {
          id: 'notes-growth',
          title: 'Growth Optimization Hypotheses',
          widgetType: 'notes',
          closable: true,
          widgetProps: { title: 'Q3 Experiment Hypotheses' }
        },
        'actionpad-cohort': {
          id: 'actionpad-cohort',
          title: 'Cohort Triggers',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            actions: [
              {
                id: 'export',
                label: 'Export Cohort to CSV',
                description: 'Downloads full user breakdown'
              },
              {
                id: 'reengage',
                label: 'Trigger Re-engagement Flow',
                description: 'Sends automated win-back sequence'
              }
            ]
          }
        }
      },
      'tab-ana-engagement': {
        'chart-dau': {
          id: 'chart-dau',
          title: 'Daily Active Users & Session Frequency',
          widgetType: 'chart',
          closable: false,
          widgetProps: { chartType: 'line', dataKey: 'dau' }
        },
        'table-journeys': {
          id: 'table-journeys',
          title: 'High-Value User Path Flow',
          widgetType: 'table',
          closable: true,
          widgetProps: {
            columns: [
              { key: 'path', header: 'User Path' },
              { key: 'users', header: 'Volume' },
              { key: 'conversion', header: 'Conversion' }
            ],
            rows: [
              { path: 'Landing → Demo → Invite Team', users: '8,420', conversion: '64.2%' },
              { path: 'Docs → API Key → CLI Install', users: '4,190', conversion: '78.5%' }
            ]
          }
        },
        'kpi-stickiness': {
          id: 'kpi-stickiness',
          title: 'Stickiness Metrics',
          widgetType: 'kpi',
          closable: true,
          widgetProps: {
            items: [
              { label: 'DAU/MAU Ratio', value: '54.2%', delta: '+3.1%', deltaType: 'positive' },
              {
                label: 'Avg Session Length',
                value: '8.4 mins',
                delta: '+1.2m',
                deltaType: 'positive'
              }
            ]
          }
        },
        'activity-users': {
          id: 'activity-users',
          title: 'Real-Time User Clickstream Log',
          widgetType: 'activity',
          closable: true,
          widgetProps: {}
        },
        'actionpad-segments': {
          id: 'actionpad-segments',
          title: 'Segment Actions',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            actions: [
              {
                id: 'sync-hubspot',
                label: 'Sync Segments to CRM',
                description: 'Updates HubSpot contacts'
              },
              {
                id: 'webhook',
                label: 'Dispatch Webhook Event',
                description: 'Emits user.engaged event'
              }
            ]
          }
        }
      },
      'tab-ana-monetization': {
        'kpi-revenue': {
          id: 'kpi-revenue',
          title: 'Monetization Metrics',
          widgetType: 'kpi',
          closable: false,
          widgetProps: {
            items: [
              { label: 'Net MRR', value: '$420,000', delta: '+8.4%', deltaType: 'positive' },
              { label: 'ARPU', value: '$84.20', delta: '+4.2%', deltaType: 'positive' },
              { label: 'Gross Churn', value: '0.82%', delta: '-0.14%', deltaType: 'positive' }
            ]
          }
        },
        'chart-mrr': {
          id: 'chart-mrr',
          title: 'Monthly Recurring Revenue Trajectory',
          widgetType: 'chart',
          closable: true,
          widgetProps: { chartType: 'area', dataKey: 'mrr' }
        },
        'table-pricing': {
          id: 'table-pricing',
          title: 'Subscription Tiers & Seats',
          widgetType: 'table',
          closable: true,
          widgetProps: {
            columns: [
              { key: 'plan', header: 'Tier' },
              { key: 'accounts', header: 'Accounts' },
              { key: 'mrr', header: 'MRR Contribution' }
            ],
            rows: [
              { plan: 'Enterprise Dedicated', accounts: '48', mrr: '$240,000 (57%)' },
              { plan: 'Team Pro', accounts: '320', mrr: '$128,000 (30%)' },
              { plan: 'Starter Developer', accounts: '1,040', mrr: '$52,000 (13%)' }
            ]
          }
        },
        'calc-ltv': {
          id: 'calc-ltv',
          title: 'LTV/CAC & Payback Period Math',
          widgetType: 'calculator',
          closable: true,
          widgetProps: {}
        },
        'notes-pricing': {
          id: 'notes-pricing',
          title: 'Pricing Expansion Playbook',
          widgetType: 'notes',
          closable: true,
          widgetProps: { title: 'Q4 Seat Pricing Strategy' }
        }
      },
      'tab-ana-experiments': {
        'table-experiments': {
          id: 'table-experiments',
          title: 'Active A/B Test Matrix',
          widgetType: 'table',
          closable: false,
          widgetProps: {
            columns: [
              { key: 'test', header: 'Experiment' },
              { key: 'lift', header: 'Conversion Lift' },
              { key: 'pvalue', header: 'p-Value' },
              { key: 'status', header: 'Decision' }
            ],
            rows: [
              {
                test: 'EXP-104: 1-Click SSO Signup',
                lift: '+18.4%',
                pvalue: '0.001',
                status: 'Ship Variant'
              },
              {
                test: 'EXP-105: Dark Mode Hero Preview',
                lift: '+4.2%',
                pvalue: '0.042',
                status: 'Ship Variant'
              }
            ]
          }
        },
        'chart-ab-variance': {
          id: 'chart-ab-variance',
          title: 'Statistical Significance Distribution',
          widgetType: 'chart',
          closable: true,
          widgetProps: { chartType: 'line', dataKey: 'variance' }
        },
        'kpi-sample': {
          id: 'kpi-sample',
          title: 'Experiment Sample',
          widgetType: 'kpi',
          closable: true,
          widgetProps: {
            items: [
              {
                label: 'Sample Size',
                value: '124,000',
                delta: '100% Target Met',
                deltaType: 'positive'
              },
              {
                label: 'Confidence Score',
                value: '99.2%',
                delta: 'Statistically Significant',
                deltaType: 'positive'
              }
            ]
          }
        },
        'actionpad-flags': {
          id: 'actionpad-flags',
          title: 'Feature Flag Controls',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            actions: [
              {
                id: 'rollout',
                label: 'Rollout Variant B to 100%',
                description: 'Deploys winning variant to all users'
              },
              {
                id: 'kill',
                label: 'Halt Experiment',
                description: 'Instantly rolls back to baseline control'
              }
            ]
          }
        },
        'activity-exp': {
          id: 'activity-exp',
          title: 'Variant Assignment Stream',
          widgetType: 'activity',
          closable: true,
          widgetProps: {}
        }
      },
      'tab-ana-runbook': {
        'doc-markdown-tracking': {
          id: 'doc-markdown-tracking',
          title: 'Event Taxonomy & Tracking Plan.md',
          widgetType: 'doc-markdown',
          closable: false,
          widgetProps: {}
        },
        'doc-csv-raw': {
          id: 'doc-csv-raw',
          title: 'Raw Clickstream Telemetry.csv',
          widgetType: 'doc-csv',
          closable: true,
          widgetProps: {}
        },
        'doc-summarizer-insights': {
          id: 'doc-summarizer-insights',
          title: 'Automated AI Cohort Insights',
          widgetType: 'doc-summarizer',
          closable: true,
          widgetProps: {}
        },
        'tasks-growth-backlog': {
          id: 'tasks-growth-backlog',
          title: 'Growth Engineering Sprint Tasks',
          widgetType: 'tasks',
          closable: true,
          widgetProps: {}
        },
        'aichat-analyst': {
          id: 'aichat-analyst',
          title: 'Natural Language SQL Analyst',
          widgetType: 'aichat',
          closable: true,
          widgetProps: {}
        }
      }
    },
    panels: {
      'kpi-growth': {
        id: 'kpi-growth',
        title: 'Product Funnel KPIs',
        widgetType: 'kpi',
        closable: false,
        widgetProps: {
          items: [
            { label: 'Signup Conversion', value: '4.82%', delta: '+0.64%', deltaType: 'positive' },
            { label: 'Activation Rate', value: '62.4%', delta: '+3.1%', deltaType: 'positive' },
            {
              label: 'Weekly Active Users',
              value: '28,490',
              delta: '+18.2%',
              deltaType: 'positive'
            },
            { label: 'Paid Expansion', value: '18.9%', delta: '+1.5%', deltaType: 'positive' }
          ]
        }
      },
      'chart-funnel': {
        id: 'chart-funnel',
        title: 'Funnel Step Drop-Off Velocity',
        widgetType: 'chart',
        closable: true,
        widgetProps: { chartType: 'bar', dataKey: 'conversions' }
      },
      'table-cohorts': {
        id: 'table-cohorts',
        title: 'Customer Cohort Retention Matrix',
        widgetType: 'table',
        closable: true,
        widgetProps: {
          columns: [
            { key: 'cohort', header: 'Cohort' },
            { key: 'users', header: 'Users' },
            { key: 'w1', header: 'W1' },
            { key: 'w4', header: 'W4' },
            { key: 'w8', header: 'W8' }
          ],
          rows: [
            { cohort: '2026-08 Enterprise', users: '1,420', w1: '94%', w4: '88%', w8: '85%' },
            { cohort: '2026-07 Growth', users: '3,840', w1: '91%', w4: '82%', w8: '79%' }
          ]
        }
      },
      'notes-growth': {
        id: 'notes-growth',
        title: 'Growth Optimization Hypotheses',
        widgetType: 'notes',
        closable: true,
        widgetProps: { title: 'Q3 Experiment Hypotheses' }
      },
      'actionpad-cohort': {
        id: 'actionpad-cohort',
        title: 'Cohort Triggers',
        widgetType: 'actionpad',
        closable: true,
        widgetProps: {
          actions: [
            {
              id: 'export',
              label: 'Export Cohort to CSV',
              description: 'Downloads full user breakdown'
            }
          ]
        }
      }
    }
  },

  // ── 9. CYBERSECURITY & THREAT SOC CENTER ─────────────────────────────────────
  security: {
    id: 'security',
    name: 'Cybersecurity & Threat SOC Center',
    description:
      'Information security command: attack surface topologies, real-time SIEM streams, active CVE monitors, and emergency quarantine controls across 5 defense tabs.',
    themeKey: 'dockview-theme-monokai',
    category: 'Security',
    icon: 'Shield',
    header: {
      visible: true,
      title: 'Aegis Security Operations Center (SOC)',
      subtitle: 'Real-Time Threat Detection, Incident Forensics & Zero-Trust Defense',
      badge: 'DEFCON 4 (Nominal)',
      fontFamily: 'jetbrains',
      titleSize: 'lg',
      titleWeight: 'bold',
      showLogo: true,
      logoIcon: 'Shield',
      actions: [
        { id: 'lockdown', label: 'Trigger Shield Lockdown', icon: 'Lock', actionType: 'alert' },
        { id: 'soc-export', label: 'Export Audit Log', icon: 'Download', actionType: 'export' }
      ],
      showWindowControls: true
    },
    footer: {
      visible: true,
      leftText: 'Firewall: 18,400 Requests Filtered / Min',
      centerText: 'Active Threats: 0 Critical · 2 Mitigated',
      rightText: 'SOC2 Type II: Compliant & Monitored',
      statusState: 'online',
      statusLabel: 'Perimeter Secure',
      fontFamily: 'jetbrains',
      fontSize: 'xs'
    },
    headerTabs: [
      { id: 'tab-sec-soc', label: 'Threat Command', templateId: 'security', icon: 'Shield' },
      { id: 'tab-sec-endpoints', label: 'Endpoints & WAF', templateId: 'security', icon: 'Server' },
      {
        id: 'tab-sec-incident',
        label: 'Incident Forensics',
        templateId: 'security',
        icon: 'AlertTriangle'
      },
      {
        id: 'tab-sec-compliance',
        label: 'Policy & Audit',
        templateId: 'security',
        icon: 'FileCheck'
      },
      { id: 'tab-sec-intel', label: 'Threat Intelligence', templateId: 'security', icon: 'Globe' }
    ],
    tabWorkspaces: {
      'tab-sec-soc': {
        'kpi-threat': {
          id: 'kpi-threat',
          title: 'Threat Posture Vital Signs',
          widgetType: 'kpi',
          closable: false,
          widgetProps: {
            items: [
              {
                label: 'Threat Severity',
                value: 'Low (0/10)',
                delta: 'Nominal',
                deltaType: 'positive'
              },
              { label: 'DDoS Drops', value: '42.8k/hr', delta: '-12%', deltaType: 'positive' },
              {
                label: 'Mean Time to Detect',
                value: '42 secs',
                delta: '-15s',
                deltaType: 'positive'
              },
              { label: 'Compliance Score', value: '98.4%', delta: '+0.8%', deltaType: 'positive' }
            ]
          }
        },
        'cluster-surfaces': {
          id: 'cluster-surfaces',
          title: 'Attack Surface & Ingress Mesh',
          widgetType: 'cluster',
          closable: true,
          widgetProps: {}
        },
        'activity-soc-stream': {
          id: 'activity-soc-stream',
          title: 'Live SIEM Intrusion & WAF Stream',
          widgetType: 'activity',
          closable: true,
          widgetProps: {}
        },
        'table-cves': {
          id: 'table-cves',
          title: 'Vulnerability & Patch Registry',
          widgetType: 'table',
          closable: true,
          widgetProps: {
            columns: [
              { key: 'cve', header: 'CVE ID' },
              { key: 'severity', header: 'Severity' },
              { key: 'component', header: 'Component' },
              { key: 'status', header: 'Remediation' }
            ],
            rows: [
              {
                cve: 'CVE-2026-1048',
                severity: 'Medium',
                component: 'openssl-3.2',
                status: 'Patched'
              },
              { cve: 'CVE-2026-0812', severity: 'Low', component: 'curl-lib', status: 'Verified' }
            ]
          }
        },
        'actionpad-lockdown': {
          id: 'actionpad-lockdown',
          title: 'Containment Triggers',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            actions: [
              {
                id: 'lock',
                label: 'Revoke All Stale API Tokens',
                description: 'Forces immediate re-auth across fleet'
              },
              {
                id: 'underattack',
                label: 'Enable Under-Attack Cloudflare Rule',
                description: 'Enforces JS challenge worldwide'
              }
            ]
          }
        }
      },
      'tab-sec-endpoints': {
        'table-endpoints-sec': {
          id: 'table-endpoints-sec',
          title: 'Monitored Fleet Agents',
          widgetType: 'table',
          closable: false,
          widgetProps: {
            columns: [
              { key: 'host', header: 'Hostname' },
              { key: 'ip', header: 'Private IP' },
              { key: 'agent', header: 'EDR Status' }
            ],
            rows: [
              { host: 'prod-node-01', ip: '10.0.1.14', agent: 'Protected' },
              { host: 'prod-node-02', ip: '10.0.1.15', agent: 'Protected' }
            ]
          }
        },
        'kpi-waf': {
          id: 'kpi-waf',
          title: 'WAF Filter Metrics',
          widgetType: 'kpi',
          closable: true,
          widgetProps: {
            items: [
              {
                label: 'Blocked Malicious IPs',
                value: '1,420',
                delta: '+84',
                deltaType: 'neutral'
              },
              { label: 'TLS 1.3 Adoption', value: '99.8%', delta: '+0.1%', deltaType: 'positive' }
            ]
          }
        },
        'terminal-soc': {
          id: 'terminal-soc',
          title: 'Network Probe & Forensic Shell',
          widgetType: 'terminal',
          closable: true,
          widgetProps: {}
        },
        'chart-traffic': {
          id: 'chart-traffic',
          title: 'Anomalous Traffic Spike Chart',
          widgetType: 'chart',
          closable: true,
          widgetProps: { chartType: 'line', dataKey: 'traffic' }
        },
        'actionpad-quarantine': {
          id: 'actionpad-quarantine',
          title: 'Node Isolation',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            actions: [
              {
                id: 'isolate',
                label: 'Isolate Host from VPC',
                description: 'Cuts network ingress while preserving RAM'
              }
            ]
          }
        }
      },
      'tab-sec-incident': {
        'activity-audit': {
          id: 'activity-audit',
          title: 'Immutable SOC2 Security Audit Trail',
          widgetType: 'activity',
          closable: false,
          widgetProps: {}
        },
        'doc-diff-config': {
          id: 'doc-diff-config',
          title: 'Security Group Policy Diff',
          widgetType: 'doc-diff',
          closable: true,
          widgetProps: {}
        },
        'doc-code-payload': {
          id: 'doc-code-payload',
          title: 'Decompiled Suspicious Payload',
          widgetType: 'doc-code',
          closable: true,
          widgetProps: {}
        },
        'notes-incident-log': {
          id: 'notes-incident-log',
          title: 'War-Room Incident Timeline',
          widgetType: 'notes',
          closable: true,
          widgetProps: { title: 'Incident Response Timeline' }
        },
        'tasks-containment': {
          id: 'tasks-containment',
          title: 'NIST Containment Steps',
          widgetType: 'tasks',
          closable: true,
          widgetProps: {}
        }
      },
      'tab-sec-compliance': {
        'doc-markdown-policy': {
          id: 'doc-markdown-policy',
          title: 'Enterprise InfoSec Policy.md',
          widgetType: 'doc-markdown',
          closable: false,
          widgetProps: {}
        },
        'doc-contract-dpa': {
          id: 'doc-contract-dpa',
          title: 'Third-Party Vendor DPA & Security Annex',
          widgetType: 'doc-contract',
          closable: true,
          widgetProps: {}
        },
        'doc-metadata-certs': {
          id: 'doc-metadata-certs',
          title: 'PKI Certificate Fingerprints',
          widgetType: 'doc-metadata',
          closable: true,
          widgetProps: {}
        },
        'tasks-soc2-audit': {
          id: 'tasks-soc2-audit',
          title: 'SOC2 Type II Readiness Checklist',
          widgetType: 'tasks',
          closable: true,
          widgetProps: {}
        },
        'kpi-compliance': {
          id: 'kpi-compliance',
          title: 'Compliance Vital Signs',
          widgetType: 'kpi',
          closable: true,
          widgetProps: {
            items: [
              {
                label: 'Access Controls',
                value: '100% MFA',
                delta: 'Enforced',
                deltaType: 'positive'
              },
              {
                label: 'Encryption At Rest',
                value: 'AES-256',
                delta: 'Verified',
                deltaType: 'positive'
              }
            ]
          }
        }
      },
      'tab-sec-intel': {
        'aichat-sec': {
          id: 'aichat-sec',
          title: 'Forensic Analyst AI Copilot',
          widgetType: 'aichat',
          closable: false,
          widgetProps: {}
        },
        'airag-mitre': {
          id: 'airag-mitre',
          title: 'MITRE ATT&CK Matrix Vector Search',
          widgetType: 'airag',
          closable: true,
          widgetProps: {}
        },
        'notes-iocs': {
          id: 'notes-iocs',
          title: 'Known Threat Actor IOCs',
          widgetType: 'notes',
          closable: true,
          widgetProps: { title: 'IOC Hashes & C2 IPs' }
        },
        'clock-incident-time': {
          id: 'clock-incident-time',
          title: 'Global Incident Coordinated Clock',
          widgetType: 'clock',
          closable: true,
          widgetProps: {}
        },
        'actionpad-threat-share': {
          id: 'actionpad-threat-share',
          title: 'Threat Intel Actions',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            actions: [
              {
                id: 'cisa',
                label: 'Report Incident to CISA',
                description: 'Generates standardized STIX/TAXII report'
              }
            ]
          }
        }
      }
    },
    panels: {
      'kpi-threat': {
        id: 'kpi-threat',
        title: 'Threat Posture Vital Signs',
        widgetType: 'kpi',
        closable: false,
        widgetProps: {
          items: [
            {
              label: 'Threat Severity',
              value: 'Low (0/10)',
              delta: 'Nominal',
              deltaType: 'positive'
            },
            { label: 'DDoS Drops', value: '42.8k/hr', delta: '-12%', deltaType: 'positive' },
            { label: 'Mean Time to Detect', value: '42 secs', delta: '-15s', deltaType: 'positive' }
          ]
        }
      },
      'cluster-surfaces': {
        id: 'cluster-surfaces',
        title: 'Attack Surface & Ingress Mesh',
        widgetType: 'cluster',
        closable: true,
        widgetProps: {}
      },
      'activity-soc-stream': {
        id: 'activity-soc-stream',
        title: 'Live SIEM Intrusion & WAF Stream',
        widgetType: 'activity',
        closable: true,
        widgetProps: {}
      },
      'table-cves': {
        id: 'table-cves',
        title: 'Vulnerability & Patch Registry',
        widgetType: 'table',
        closable: true,
        widgetProps: {
          columns: [
            { key: 'cve', header: 'CVE ID' },
            { key: 'severity', header: 'Severity' }
          ],
          rows: [{ cve: 'CVE-2026-1048', severity: 'Medium' }]
        }
      },
      'actionpad-lockdown': {
        id: 'actionpad-lockdown',
        title: 'Containment Triggers',
        widgetType: 'actionpad',
        closable: true,
        widgetProps: {
          actions: [
            {
              id: 'lock',
              label: 'Revoke All Stale API Tokens',
              description: 'Forces immediate re-auth across fleet'
            }
          ]
        }
      }
    }
  },

  // ── 10. MINIMALIST STARTER HUB ──────────────────────────────────────────────
  minimal: {
    id: 'minimal',
    name: 'Minimalist Starter Hub',
    description:
      'Clean, versatile 5-tab foundation: essential KPIs, developer tools, AI chat, document viewer, and time trackers ready to personalize.',
    themeKey: 'dockview-theme-dark',
    category: 'Minimal',
    icon: 'LayoutGrid',
    header: {
      visible: true,
      title: 'Minimal Command Center',
      subtitle: 'Versatile Starter Hub & Uncluttered Workspace',
      badge: 'Lightweight',
      fontFamily: 'outfit',
      titleSize: 'base',
      titleWeight: 'medium',
      showLogo: true,
      logoIcon: 'LayoutGrid',
      actions: [{ id: 'new-widget', label: 'Add Widget', icon: 'Plus', actionType: 'refresh' }],
      showWindowControls: true
    },
    footer: {
      visible: true,
      leftText: 'Workspace: Minimal Foundation',
      centerText: 'Panels: 5 Curated Widgets',
      rightText: 'Ready to customize',
      statusState: 'online',
      statusLabel: 'Ready',
      fontFamily: 'outfit',
      fontSize: 'xs'
    },
    headerTabs: [
      { id: 'tab-min-main', label: 'Primary Cockpit', templateId: 'minimal', icon: 'LayoutGrid' },
      { id: 'tab-min-dev', label: 'Developer Tools', templateId: 'minimal', icon: 'Terminal' },
      { id: 'tab-min-ai', label: 'AI Assistant', templateId: 'minimal', icon: 'Bot' },
      { id: 'tab-min-docs', label: 'Document Hub', templateId: 'minimal', icon: 'FileText' },
      { id: 'tab-min-time', label: 'Time & Focus', templateId: 'minimal', icon: 'Clock' }
    ],
    tabWorkspaces: {
      'tab-min-main': {
        'kpi-min': {
          id: 'kpi-min',
          title: 'Daily Goal Targets',
          widgetType: 'kpi',
          closable: false,
          widgetProps: {
            items: [
              { label: 'Weekly Goals Met', value: '4/5', delta: '+1', deltaType: 'positive' },
              { label: 'Sprint Velocity', value: '38 pts', delta: '+4 pts', deltaType: 'positive' }
            ]
          }
        },
        'chart-min': {
          id: 'chart-min',
          title: 'Activity Trajectory',
          widgetType: 'chart',
          closable: true,
          widgetProps: { chartType: 'area', dataKey: 'activity' }
        },
        'notes-min': {
          id: 'notes-min',
          title: 'Clean Scratchpad',
          widgetType: 'notes',
          closable: true,
          widgetProps: { title: 'Quick Notes' }
        },
        'tasks-min': {
          id: 'tasks-min',
          title: 'Primary Todo Checklist',
          widgetType: 'tasks',
          closable: true,
          widgetProps: {}
        },
        'calculator-min': {
          id: 'calculator-min',
          title: 'Desk Math Calculator',
          widgetType: 'calculator',
          closable: true,
          widgetProps: {}
        }
      },
      'tab-min-dev': {
        'terminal-min': {
          id: 'terminal-min',
          title: 'Interactive Shell',
          widgetType: 'terminal',
          closable: false,
          widgetProps: {}
        },
        'doc-code-min': {
          id: 'doc-code-min',
          title: 'Code Viewer',
          widgetType: 'doc-code',
          closable: true,
          widgetProps: {}
        },
        'doc-markdown-min': {
          id: 'doc-markdown-min',
          title: 'Markdown Notes',
          widgetType: 'doc-markdown',
          closable: true,
          widgetProps: {}
        },
        'activity-min': {
          id: 'activity-min',
          title: 'Command Log',
          widgetType: 'activity',
          closable: true,
          widgetProps: {}
        },
        'actionpad-min': {
          id: 'actionpad-min',
          title: 'Build Actions',
          widgetType: 'actionpad',
          closable: true,
          widgetProps: {
            actions: [
              { id: 'build', label: 'Build App', description: 'Triggers local compilation' }
            ]
          }
        }
      },
      'tab-min-ai': {
        'aichat-min': {
          id: 'aichat-min',
          title: 'AI Assistant',
          widgetType: 'aichat',
          closable: false,
          widgetProps: {}
        },
        'aiprompt-min': {
          id: 'aiprompt-min',
          title: 'Prompt Tester',
          widgetType: 'aiprompt',
          closable: true,
          widgetProps: {}
        },
        'aicode-min': {
          id: 'aicode-min',
          title: 'Code Generator',
          widgetType: 'aicode',
          closable: true,
          widgetProps: {}
        },
        'airag-min': {
          id: 'airag-min',
          title: 'Vector Search',
          widgetType: 'airag',
          closable: true,
          widgetProps: {}
        },
        'notes-ai-output': {
          id: 'notes-ai-output',
          title: 'Saved AI Generations',
          widgetType: 'notes',
          closable: true,
          widgetProps: { title: 'AI Insights' }
        }
      },
      'tab-min-docs': {
        'doc-markdown-doc': {
          id: 'doc-markdown-doc',
          title: 'Markdown Reader',
          widgetType: 'doc-markdown',
          closable: false,
          widgetProps: {}
        },
        'doc-pdf-doc': {
          id: 'doc-pdf-doc',
          title: 'PDF Viewer',
          widgetType: 'doc-pdf',
          closable: true,
          widgetProps: { title: 'Overview.pdf' }
        },
        'doc-txt-doc': {
          id: 'doc-txt-doc',
          title: 'Text File Reader',
          widgetType: 'doc-txt',
          closable: true,
          widgetProps: {}
        },
        'doc-reader-doc': {
          id: 'doc-reader-doc',
          title: 'Reading Mode',
          widgetType: 'doc-reader',
          closable: true,
          widgetProps: {}
        },
        'doc-summarizer-doc': {
          id: 'doc-summarizer-doc',
          title: 'Document Summary',
          widgetType: 'doc-summarizer',
          closable: true,
          widgetProps: {}
        }
      },
      'tab-min-time': {
        'clock-min': {
          id: 'clock-min',
          title: 'Desk Clock',
          widgetType: 'clock',
          closable: false,
          widgetProps: {}
        },
        'calendar-min': {
          id: 'calendar-min',
          title: 'Calendar Agenda',
          widgetType: 'calendar',
          closable: true,
          widgetProps: {}
        },
        'pomodoro-min': {
          id: 'pomodoro-min',
          title: 'Pomodoro Timer',
          widgetType: 'pomodoro',
          closable: true,
          widgetProps: {}
        },
        'tasks-habits': {
          id: 'tasks-habits',
          title: 'Habits & Goals',
          widgetType: 'tasks',
          closable: true,
          widgetProps: {}
        },
        'weather-min': {
          id: 'weather-min',
          title: 'Local Weather',
          widgetType: 'weather',
          closable: true,
          widgetProps: {}
        }
      }
    },
    panels: {
      'kpi-min': {
        id: 'kpi-min',
        title: 'Daily Goal Targets',
        widgetType: 'kpi',
        closable: false,
        widgetProps: {
          items: [
            { label: 'Weekly Goals Met', value: '4/5', delta: '+1', deltaType: 'positive' },
            { label: 'Sprint Velocity', value: '38 pts', delta: '+4 pts', deltaType: 'positive' }
          ]
        }
      },
      'chart-min': {
        id: 'chart-min',
        title: 'Activity Trajectory',
        widgetType: 'chart',
        closable: true,
        widgetProps: { chartType: 'area', dataKey: 'activity' }
      },
      'notes-min': {
        id: 'notes-min',
        title: 'Clean Scratchpad',
        widgetType: 'notes',
        closable: true,
        widgetProps: { title: 'Quick Notes' }
      },
      'tasks-min': {
        id: 'tasks-min',
        title: 'Primary Todo Checklist',
        widgetType: 'tasks',
        closable: true,
        widgetProps: {}
      },
      'calculator-min': {
        id: 'calculator-min',
        title: 'Desk Math Calculator',
        widgetType: 'calculator',
        closable: true,
        widgetProps: {}
      }
    }
  },

  // ── 11. BLANK CANVAS (CLEAN SLATE) ──────────────────────────────────────────
  blank: {
    id: 'blank',
    name: 'Blank Canvas (Clean Slate)',
    description:
      'Completely unpopulated playground with zero tabs or widgets. Build your custom layout from scratch.',
    themeKey: 'dockview-theme-dark',
    category: 'Minimal',
    icon: 'Plus',
    header: {
      visible: true,
      title: 'Blank Workspace',
      subtitle: 'Build your custom dashboard from scratch',
      fontFamily: 'inter',
      titleSize: 'base',
      titleWeight: 'medium',
      showLogo: false,
      logoIcon: 'Layout',
      actions: [],
      showWindowControls: true
    },
    footer: {
      visible: true,
      leftText: 'Ready',
      centerText: 'Empty Canvas',
      rightText: 'Click + to add widgets',
      statusState: 'online',
      statusLabel: 'Ready',
      fontFamily: 'inter',
      fontSize: 'xs'
    },
    headerTabs: [],
    tabWorkspaces: {},
    panels: {}
  }
}
