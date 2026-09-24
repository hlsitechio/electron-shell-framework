import type { WidgetType } from '../../types/reframe-types'

export interface WidgetCatalogItem {
  id: string
  title: string
  category: 'kpi' | 'analytics' | 'tables' | 'feeds' | 'devops' | 'actions' | 'docs'
  categoryLabel: string
  description: string
  icon: string
  widgetType: WidgetType
  domainBadge: string
  tags: string[]
  defaultProps: Record<string, any>
  defaultDirection?: 'below' | 'right' | 'stack'
}

export const WIDGET_CATEGORIES = [
  { id: 'all', label: 'All Widgets' },
  { id: 'kpi', label: 'KPIs & Metrics' },
  { id: 'analytics', label: 'Charts & Analytics' },
  { id: 'tables', label: 'Data Tables' },
  { id: 'feeds', label: 'Feeds & Logs' },
  { id: 'devops', label: 'Dev & Infrastructure' },
  { id: 'actions', label: 'Action Pads' },
  { id: 'docs', label: 'Docs & Runbooks' }
] as const

export const WIDGET_CATALOG: WidgetCatalogItem[] = [
  /* ============================================================
     1. EXECUTIVE & KPI METRICS (8 Widgets)
     ============================================================ */
  {
    id: 'kpi-executive-summary',
    title: 'Executive Revenue & AUM Summary',
    category: 'kpi',
    categoryLabel: 'KPIs & Metrics',
    description: '4-card ribbon: Total AUM, Net Annual Recurring, Sharpe Ratio, and Average LTV.',
    icon: 'TrendingUp',
    widgetType: 'kpi',
    domainBadge: 'FINANCE',
    tags: ['revenue', 'aum', 'arr', 'financial', 'executive'],
    defaultProps: {
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
    },
    defaultDirection: 'below'
  },
  {
    id: 'kpi-saas-growth',
    title: 'SaaS Growth & Retention KPIs',
    category: 'kpi',
    categoryLabel: 'KPIs & Metrics',
    description:
      'Monthly Recurring Revenue, Net Revenue Retention (NRR), CAC Payback, and LTV:CAC.',
    icon: 'BarChart2',
    widgetType: 'kpi',
    domainBadge: 'SAAS',
    tags: ['saas', 'mrr', 'nrr', 'cac', 'ltv', 'growth'],
    defaultProps: {
      items: [
        {
          label: 'Current MRR',
          value: '$742.5K',
          delta: '+8.4% MoM',
          deltaType: 'positive',
          subtext: '+$57.4K net new MRR'
        },
        {
          label: 'Net Retention (NRR)',
          value: '118.4%',
          delta: '+2.1%',
          deltaType: 'positive',
          subtext: 'Top decile benchmark'
        },
        {
          label: 'CAC Payback Period',
          value: '8.4 mos',
          delta: '-1.1 mos',
          deltaType: 'positive',
          subtext: 'Target < 12 months'
        },
        {
          label: 'LTV:CAC Ratio',
          value: '4.8x',
          delta: '+0.4x',
          deltaType: 'positive',
          subtext: 'Strong unit economics'
        }
      ]
    },
    defaultDirection: 'below'
  },
  {
    id: 'kpi-ecommerce-pulse',
    title: 'E-Commerce Conversion Pulse',
    category: 'kpi',
    categoryLabel: 'KPIs & Metrics',
    description:
      'Daily GMV, Checkout Conversion Rate, Cart Abandonment, and Average Order Value (AOV).',
    icon: 'ShoppingCart',
    widgetType: 'kpi',
    domainBadge: 'RETAIL',
    tags: ['ecommerce', 'gmv', 'conversion', 'orders', 'sales'],
    defaultProps: {
      items: [
        {
          label: 'Daily GMV',
          value: '$248.6K',
          delta: '+16.8%',
          deltaType: 'positive',
          subtext: '3,840 checkout orders'
        },
        {
          label: 'Checkout Conversion',
          value: '3.64%',
          delta: '+0.4%',
          deltaType: 'positive',
          subtext: 'Benchmark 3.1%'
        },
        {
          label: 'Cart Abandonment',
          value: '64.2%',
          delta: '-2.8%',
          deltaType: 'positive',
          subtext: 'Down from 67.0%'
        },
        {
          label: 'Average Order Value',
          value: '$114.20',
          delta: '+$6.40',
          deltaType: 'positive',
          subtext: 'Trending upwards'
        }
      ]
    },
    defaultDirection: 'below'
  },
  {
    id: 'kpi-reliability-sla',
    title: 'DevOps & Reliability SLAs',
    category: 'kpi',
    categoryLabel: 'KPIs & Metrics',
    description:
      'Global Fleet Uptime, P99 API Latency, Error Budget, and Mean Time to Recovery (MTTR).',
    icon: 'ShieldCheck',
    widgetType: 'kpi',
    domainBadge: 'SRE',
    tags: ['uptime', 'latency', 'sre', 'sla', 'devops', 'p99'],
    defaultProps: {
      items: [
        {
          label: 'Global Uptime',
          value: '99.994%',
          delta: 'Target 99.95%',
          deltaType: 'positive',
          subtext: 'Zero sev-1 incidents'
        },
        {
          label: 'P99 Edge Latency',
          value: '14.2ms',
          delta: '-2.1ms',
          deltaType: 'positive',
          subtext: 'Under 25ms threshold'
        },
        {
          label: 'Error Rate',
          value: '0.002%',
          delta: '-0.001%',
          deltaType: 'positive',
          subtext: 'Across 48M requests'
        },
        {
          label: 'MTTR (Recovery)',
          value: '3.8 min',
          delta: '-1.4 min',
          deltaType: 'positive',
          subtext: 'Automated failover'
        }
      ]
    },
    defaultDirection: 'below'
  },
  {
    id: 'kpi-customer-health',
    title: 'Customer Success Health Score',
    category: 'kpi',
    categoryLabel: 'KPIs & Metrics',
    description: 'Active Client Accounts, CSAT Rating, Expansion Pipeline, and At-Risk Flags.',
    icon: 'Users',
    widgetType: 'kpi',
    domainBadge: 'CRM',
    tags: ['csat', 'health', 'churn', 'customers', 'expansion'],
    defaultProps: {
      items: [
        {
          label: 'Active Orgs',
          value: '2,480',
          delta: '+120 this mo',
          deltaType: 'positive',
          subtext: 'Enterprise & Mid-market'
        },
        {
          label: 'Customer CSAT',
          value: '96.2%',
          delta: '+1.4%',
          deltaType: 'positive',
          subtext: 'Based on 480 surveys'
        },
        {
          label: 'Expansion Pipeline',
          value: '$1.84M',
          delta: '+$340K',
          deltaType: 'positive',
          subtext: '42 upsell opportunities'
        },
        {
          label: 'At-Risk Accounts',
          value: '2',
          delta: '-3 accounts',
          deltaType: 'positive',
          subtext: 'Intervention scheduled'
        }
      ]
    },
    defaultDirection: 'below'
  },
  {
    id: 'kpi-marketing-funnel',
    title: 'Marketing Acquisition Funnel',
    category: 'kpi',
    categoryLabel: 'KPIs & Metrics',
    description:
      'Inbound Leads, MQL-to-SQL Conversion, Cost Per Acquisition, and Return on Ad Spend.',
    icon: 'Target',
    widgetType: 'kpi',
    domainBadge: 'GROWTH',
    tags: ['marketing', 'leads', 'roas', 'cpa', 'acquisition'],
    defaultProps: {
      items: [
        {
          label: 'Inbound Leads',
          value: '4,820',
          delta: '+22.5%',
          deltaType: 'positive',
          subtext: 'Top channel: Organic Search'
        },
        {
          label: 'MQL to SQL Rate',
          value: '34.2%',
          delta: '+4.1%',
          deltaType: 'positive',
          subtext: 'High ICP qualification'
        },
        {
          label: 'Blended CAC',
          value: '$42.80',
          delta: '-$6.20',
          deltaType: 'positive',
          subtext: 'Efficient spend ramp'
        },
        {
          label: 'ROAS Multiple',
          value: '5.2x',
          delta: '+0.8x',
          deltaType: 'positive',
          subtext: 'Paid media efficiency'
        }
      ]
    },
    defaultDirection: 'below'
  },
  {
    id: 'kpi-hero-arr',
    title: 'Hero Stat: Total Enterprise ARR',
    category: 'kpi',
    categoryLabel: 'KPIs & Metrics',
    description: 'Single high-impact metric tile focusing on top-line Annual Recurring Revenue.',
    icon: 'DollarSign',
    widgetType: 'kpi',
    domainBadge: 'FINANCE',
    tags: ['hero', 'arr', 'revenue', 'focus'],
    defaultProps: {
      items: [
        {
          label: 'Total Enterprise ARR',
          value: '$14,850,000',
          delta: '+24.8% YoY',
          deltaType: 'positive',
          subtext: 'Paced to exceed $18M annual guidance'
        }
      ]
    },
    defaultDirection: 'below'
  },
  {
    id: 'kpi-hero-fleet',
    title: 'Hero Stat: Distributed Edge Fleet',
    category: 'kpi',
    categoryLabel: 'KPIs & Metrics',
    description: 'Single high-impact infrastructure tile reporting active distributed edge nodes.',
    icon: 'Server',
    widgetType: 'kpi',
    domainBadge: 'INFRA',
    tags: ['fleet', 'nodes', 'servers', 'edge'],
    defaultProps: {
      items: [
        {
          label: 'Active Edge Nodes',
          value: '1,428 / 1,430',
          delta: '99.86% healthy',
          deltaType: 'positive',
          subtext: 'Distributed across 14 multi-cloud zones'
        }
      ]
    },
    defaultDirection: 'below'
  },

  /* ============================================================
     2. ANALYTICS & VISUAL CHARTS (8 Widgets)
     ============================================================ */
  {
    id: 'chart-revenue-trajectory',
    title: 'Monthly Revenue Trajectory',
    category: 'analytics',
    categoryLabel: 'Charts & Analytics',
    description:
      'Gradient area chart plotting monthly recurring revenue trajectory over 9-12 months.',
    icon: 'Activity',
    widgetType: 'chart',
    domainBadge: 'FINANCE',
    tags: ['chart', 'area', 'revenue', 'trajectory', 'finance'],
    defaultProps: {
      title: 'Monthly Recurring Revenue ($K)',
      chartType: 'area',
      dataKey: 'revenue',
      timeRange: 'Trailing 9 Months'
    },
    defaultDirection: 'right'
  },
  {
    id: 'chart-cash-flow',
    title: 'Inflow vs Outflow Cash Trend',
    category: 'analytics',
    categoryLabel: 'Charts & Analytics',
    description: 'Monthly bar chart comparing cash receipts against operational expenditures.',
    icon: 'BarChart2',
    widgetType: 'chart',
    domainBadge: 'FINANCE',
    tags: ['chart', 'bar', 'cashflow', 'burn', 'finance'],
    defaultProps: {
      title: 'Net Monthly Cashflow ($K)',
      chartType: 'bar',
      dataKey: 'revenue',
      timeRange: 'Trailing 9 Months'
    },
    defaultDirection: 'right'
  },
  {
    id: 'chart-api-latency',
    title: 'API Latency & P99 Response Curve',
    category: 'analytics',
    categoryLabel: 'Charts & Analytics',
    description:
      'Precision line chart tracking microsecond and millisecond edge endpoint latencies.',
    icon: 'Clock',
    widgetType: 'chart',
    domainBadge: 'SRE',
    tags: ['chart', 'line', 'latency', 'p99', 'performance'],
    defaultProps: {
      title: 'P99 Edge Latency Profile (ms)',
      chartType: 'line',
      dataKey: 'latency',
      timeRange: 'Trailing 24 Hours'
    },
    defaultDirection: 'right'
  },
  {
    id: 'chart-server-load',
    title: 'Server CPU & Memory Utilization',
    category: 'analytics',
    categoryLabel: 'Charts & Analytics',
    description: 'System resource utilization area curve with warning watermark threshold.',
    icon: 'Cpu',
    widgetType: 'chart',
    domainBadge: 'DEVOPS',
    tags: ['chart', 'area', 'cpu', 'memory', 'utilization'],
    defaultProps: {
      title: 'Cluster Compute Utilization (%)',
      chartType: 'area',
      dataKey: 'conversions',
      timeRange: 'Real-time 15m Window'
    },
    defaultDirection: 'right'
  },
  {
    id: 'chart-cohort-retention',
    title: 'Cohort Retention Survival Curve',
    category: 'analytics',
    categoryLabel: 'Charts & Analytics',
    description: 'Quarterly customer cohort survival lines displaying account retention over time.',
    icon: 'TrendingUp',
    widgetType: 'chart',
    domainBadge: 'GROWTH',
    tags: ['chart', 'line', 'retention', 'cohorts', 'saas'],
    defaultProps: {
      title: 'Quarterly User Retention (%)',
      chartType: 'line',
      dataKey: 'conversions',
      timeRange: '6 Quarter Cohort'
    },
    defaultDirection: 'right'
  },
  {
    id: 'chart-edge-traffic',
    title: 'Regional Edge Request Volume',
    category: 'analytics',
    categoryLabel: 'Charts & Analytics',
    description: 'Bar chart breakdown of request volume across US, EMEA, APAC, and LATAM.',
    icon: 'Globe',
    widgetType: 'chart',
    domainBadge: 'CDN',
    tags: ['chart', 'bar', 'traffic', 'regions', 'cdn'],
    defaultProps: {
      title: 'Inbound Edge Volume (M req/hr)',
      chartType: 'bar',
      dataKey: 'revenue',
      timeRange: 'Trailing 9 Months'
    },
    defaultDirection: 'right'
  },
  {
    id: 'chart-pipeline-funnel',
    title: 'Sales Pipeline Conversion Flow',
    category: 'analytics',
    categoryLabel: 'Charts & Analytics',
    description:
      'Bar chart mapping prospect volume across discovery, qualification, and closing stages.',
    icon: 'Filter',
    widgetType: 'chart',
    domainBadge: 'SALES',
    tags: ['chart', 'bar', 'funnel', 'pipeline', 'sales'],
    defaultProps: {
      title: 'Deal Stage Progression Volume',
      chartType: 'bar',
      dataKey: 'conversions',
      timeRange: 'Active Quarter'
    },
    defaultDirection: 'right'
  },
  {
    id: 'chart-database-iops',
    title: 'Database IOPS & Read/Write Rate',
    category: 'analytics',
    categoryLabel: 'Charts & Analytics',
    description:
      'Continuous line chart monitoring persistent disk read/write throughput per second.',
    icon: 'Database',
    widgetType: 'chart',
    domainBadge: 'DBA',
    tags: ['chart', 'line', 'iops', 'database', 'storage'],
    defaultProps: {
      title: 'Primary DB Cluster IOPS',
      chartType: 'line',
      dataKey: 'latency',
      timeRange: 'Trailing 12 Hours'
    },
    defaultDirection: 'right'
  },

  /* ============================================================
     3. DATA TABLES & ENTITY GRIDS (8 Widgets)
     ============================================================ */
  {
    id: 'table-deal-pipeline',
    title: 'Active Deal Pipeline & Deal Flow',
    category: 'tables',
    categoryLabel: 'Data Tables',
    description:
      'Enterprise pipeline ledger with client names, tiers, deal values, stages, and status pills.',
    icon: 'Table',
    widgetType: 'table',
    domainBadge: 'SALES',
    tags: ['table', 'pipeline', 'deals', 'sales', 'crm'],
    defaultProps: {
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
    },
    defaultDirection: 'below'
  },
  {
    id: 'table-customer-directory',
    title: 'Customer Directory & Tier Status',
    category: 'tables',
    categoryLabel: 'Data Tables',
    description:
      'Searchable roster of customer accounts, subscription tier, MRR contribution, and health score.',
    icon: 'Users',
    widgetType: 'table',
    domainBadge: 'CRM',
    tags: ['table', 'customers', 'accounts', 'directory'],
    defaultProps: {
      title: 'Enterprise Accounts Roster',
      columns: [
        { key: 'account', header: 'Account Name' },
        { key: 'plan', header: 'Plan Tier' },
        { key: 'mrr', header: 'Monthly MRR' },
        { key: 'renewal', header: 'Next Renewal' },
        { key: 'status', header: 'Health' }
      ],
      rows: [
        {
          account: 'Vanguard Logistics',
          plan: 'Enterprise Dedicated',
          mrr: '$45,000',
          renewal: 'Nov 2026',
          status: 'Healthy'
        },
        {
          account: 'Apex Quantum Lab',
          plan: 'High-Throughput HPC',
          mrr: '$72,500',
          renewal: 'Jan 2027',
          status: 'Healthy'
        },
        {
          account: 'Sovereign Bank Corp',
          plan: 'FedRAMP Compliant',
          mrr: '$110,000',
          renewal: 'Dec 2026',
          status: 'High Engagement'
        },
        {
          account: 'Nordic Clean Energy',
          plan: 'Scale Plus',
          mrr: '$28,000',
          renewal: 'Oct 2026',
          status: 'At Risk'
        }
      ]
    },
    defaultDirection: 'below'
  },
  {
    id: 'table-incident-board',
    title: 'Incident Escalation & SRE Post',
    category: 'tables',
    categoryLabel: 'Data Tables',
    description:
      'Critical incident triage board tracking Sev-1 to Sev-3 events, owners, and resolution states.',
    icon: 'AlertOctagon',
    widgetType: 'table',
    domainBadge: 'SRE',
    tags: ['table', 'incidents', 'sre', 'oncall', 'bugs'],
    defaultProps: {
      title: 'Live Incident Triage Board',
      columns: [
        { key: 'ticket', header: 'Ticket' },
        { key: 'severity', header: 'Severity' },
        { key: 'service', header: 'Service' },
        { key: 'lead', header: 'Lead' },
        { key: 'status', header: 'Resolution' }
      ],
      rows: [
        {
          ticket: 'INC-8491',
          severity: 'P2 - High',
          service: 'Auth Gateway',
          lead: 'Sarah M.',
          status: 'Mitigated'
        },
        {
          ticket: 'INC-8488',
          severity: 'P3 - Medium',
          service: 'Async Webhook Ingest',
          lead: 'David K.',
          status: 'Investigating'
        },
        {
          ticket: 'INC-8472',
          severity: 'P1 - Critical',
          service: 'Database Primary Replica',
          lead: 'Alex R.',
          status: 'Resolved'
        }
      ]
    },
    defaultDirection: 'below'
  },
  {
    id: 'table-invoice-ledger',
    title: 'Financial Invoices & Billing Ledger',
    category: 'tables',
    categoryLabel: 'Data Tables',
    description:
      'Enterprise receivable invoices with settlement terms, payment methods, and automated reconciliation.',
    icon: 'Receipt',
    widgetType: 'table',
    domainBadge: 'FINANCE',
    tags: ['table', 'invoices', 'billing', 'finance', 'ledger'],
    defaultProps: {
      title: 'Accounts Receivable Ledger',
      columns: [
        { key: 'inv', header: 'Invoice #' },
        { key: 'client', header: 'Client' },
        { key: 'amount', header: 'Amount' },
        { key: 'due', header: 'Due Date' },
        { key: 'status', header: 'Payment State' }
      ],
      rows: [
        {
          inv: 'INV-2026-081',
          client: 'Starlight Financial',
          amount: '$240,000.00',
          due: 'Net 30 (Oct 1)',
          status: 'Paid'
        },
        {
          inv: 'INV-2026-082',
          client: 'Helios Biopharma',
          amount: '$85,000.00',
          due: 'Net 15 (Sep 28)',
          status: 'Pending Wire'
        },
        {
          inv: 'INV-2026-083',
          client: 'Nexus HyperScale',
          amount: '$175,000.00',
          due: 'Net 30 (Oct 15)',
          status: 'Draft'
        }
      ]
    },
    defaultDirection: 'below'
  },
  {
    id: 'table-fleet-registry',
    title: 'Microservices & Fleet Registry',
    category: 'tables',
    categoryLabel: 'Data Tables',
    description:
      'Inventory of running microservice containers, deployed versions, replica health, and latency.',
    icon: 'Layers',
    widgetType: 'table',
    domainBadge: 'DEVOPS',
    tags: ['table', 'microservices', 'fleet', 'containers', 'kubernetes'],
    defaultProps: {
      title: 'Microservices Topology & Versions',
      columns: [
        { key: 'svc', header: 'Service' },
        { key: 'region', header: 'Primary Region' },
        { key: 'version', header: 'Release' },
        { key: 'pods', header: 'Healthy Pods' },
        { key: 'status', header: 'Health' }
      ],
      rows: [
        {
          svc: 'auth-service',
          region: 'us-east-1',
          version: 'v3.14.2',
          pods: '12 / 12',
          status: 'Healthy'
        },
        {
          svc: 'billing-engine',
          region: 'us-east-1',
          version: 'v2.8.0',
          pods: '6 / 6',
          status: 'Healthy'
        },
        {
          svc: 'event-streamer',
          region: 'eu-west-1',
          version: 'v4.0.1',
          pods: '24 / 24',
          status: 'Healthy'
        },
        {
          svc: 'vector-indexer',
          region: 'us-west-2',
          version: 'v1.9.4',
          pods: '8 / 8',
          status: 'High Memory'
        }
      ]
    },
    defaultDirection: 'below'
  },
  {
    id: 'table-security-audit',
    title: 'Compliance & SOC2 Security Audit',
    category: 'tables',
    categoryLabel: 'Data Tables',
    description:
      'Continuous security audit controls with framework mappings, evidence validation, and sign-offs.',
    icon: 'Shield',
    widgetType: 'table',
    domainBadge: 'SECURITY',
    tags: ['table', 'security', 'audit', 'soc2', 'compliance'],
    defaultProps: {
      title: 'SOC2 Type II Control Matrix',
      columns: [
        { key: 'control', header: 'Control ID' },
        { key: 'framework', header: 'Framework' },
        { key: 'evidence', header: 'Evidence' },
        { key: 'frequency', header: 'Cadence' },
        { key: 'status', header: 'Compliance' }
      ],
      rows: [
        {
          control: 'CC6.1-A',
          framework: 'Access Control',
          evidence: 'MFA Enforcement Audit',
          frequency: 'Continuous',
          status: 'Compliant'
        },
        {
          control: 'CC7.2-B',
          framework: 'Vulnerability',
          evidence: 'Quarterly Pentest Report',
          frequency: 'Quarterly',
          status: 'Verified'
        },
        {
          control: 'CC8.1-C',
          framework: 'Change Mgmt',
          evidence: 'Git PR Dual Sign-off',
          frequency: 'Continuous',
          status: 'Compliant'
        }
      ]
    },
    defaultDirection: 'below'
  },
  {
    id: 'table-team-access',
    title: 'Team Access & Permissions Directory',
    category: 'tables',
    categoryLabel: 'Data Tables',
    description:
      'Internal user permissions table detailing role-based access control (RBAC) and security tiers.',
    icon: 'UserCheck',
    widgetType: 'table',
    domainBadge: 'IAM',
    tags: ['table', 'team', 'iam', 'rbac', 'users'],
    defaultProps: {
      title: 'IAM RBAC Permissions Ledger',
      columns: [
        { key: 'name', header: 'Team Member' },
        { key: 'role', header: 'Assigned Role' },
        { key: 'mfa', header: 'Hardware MFA' },
        { key: 'scope', header: 'Permission Scope' },
        { key: 'status', header: 'Status' }
      ],
      rows: [
        {
          name: 'Elena Rostova',
          role: 'Staff SRE',
          mfa: 'Yubikey 5 FIPS',
          scope: 'Cluster Admin (Prod)',
          status: 'Active'
        },
        {
          name: 'Marcus Chen',
          role: 'Security Architect',
          mfa: 'Yubikey 5 FIPS',
          scope: 'KMS & Vault Admin',
          status: 'Active'
        },
        {
          name: 'Devon Vance',
          role: 'Frontend Engineer',
          mfa: 'WebAuthn',
          scope: 'Read Only (Staging)',
          status: 'Active'
        }
      ]
    },
    defaultDirection: 'below'
  },
  {
    id: 'table-feature-flags',
    title: 'Feature Flag & Rollout Registry',
    category: 'tables',
    categoryLabel: 'Data Tables',
    description:
      'Dynamic feature flags register with targeted percentage rollouts, environments, and safety killswitches.',
    icon: 'ToggleRight',
    widgetType: 'table',
    domainBadge: 'PROD',
    tags: ['table', 'flags', 'rollout', 'features'],
    defaultProps: {
      title: 'Active Feature Flag Rollouts',
      columns: [
        { key: 'flag', header: 'Flag Key' },
        { key: 'target', header: 'Audience' },
        { key: 'rollout', header: 'Rollout %' },
        { key: 'env', header: 'Environment' },
        { key: 'status', header: 'State' }
      ],
      rows: [
        {
          flag: 'ff_dark_cockpit_v2',
          target: 'Enterprise Tier',
          rollout: '100%',
          env: 'Production',
          status: 'Enabled'
        },
        {
          flag: 'ff_instant_settlement',
          target: 'Beta Opt-in',
          rollout: '25%',
          env: 'Production',
          status: 'Gradual Ramp'
        },
        {
          flag: 'ff_vector_cache',
          target: 'Internal Staff',
          rollout: '10%',
          env: 'Staging',
          status: 'Testing'
        }
      ]
    },
    defaultDirection: 'below'
  },

  /* ============================================================
     4. OPERATIONS & STREAM FEEDS (5 Widgets)
     ============================================================ */
  {
    id: 'activity-sre-stream',
    title: 'Live SRE & Infrastructure Stream',
    category: 'feeds',
    categoryLabel: 'Feeds & Logs',
    description: 'Real-time telemetry event stream with timestamped entries and severity tags.',
    icon: 'Radio',
    widgetType: 'activity',
    domainBadge: 'SRE',
    tags: ['logs', 'stream', 'sre', 'events', 'telemetry'],
    defaultProps: {
      title: 'Live System Telemetry Stream',
      filterSeverity: 'all'
    },
    defaultDirection: 'below'
  },
  {
    id: 'activity-security-audit',
    title: 'Security & Authentication Audit Trail',
    category: 'feeds',
    categoryLabel: 'Feeds & Logs',
    description: 'Zero-trust authentication events, privilege elevations, and anomalous IP alerts.',
    icon: 'Lock',
    widgetType: 'activity',
    domainBadge: 'SECURITY',
    tags: ['security', 'auth', 'audit', 'logs', 'identity'],
    defaultProps: {
      title: 'Identity & Authentication Audit Trail',
      filterSeverity: 'warn'
    },
    defaultDirection: 'below'
  },
  {
    id: 'activity-cd-pipeline',
    title: 'Continuous Deployment & Release Stream',
    category: 'feeds',
    categoryLabel: 'Feeds & Logs',
    description:
      'CI/CD pipeline event notifications, git merge builds, Docker tag publications, and canary validations.',
    icon: 'GitCommit',
    widgetType: 'activity',
    domainBadge: 'CI/CD',
    tags: ['cicd', 'deploy', 'git', 'release', 'stream'],
    defaultProps: {
      title: 'Automated Deployment & Release Stream',
      filterSeverity: 'info'
    },
    defaultDirection: 'below'
  },
  {
    id: 'activity-support-tickets',
    title: 'Client Support Ticket Queue',
    category: 'feeds',
    categoryLabel: 'Feeds & Logs',
    description: 'Live inbound support inquiries with SLA countdown timers and priority tagging.',
    icon: 'LifeBuoy',
    widgetType: 'activity',
    domainBadge: 'SUPPORT',
    tags: ['tickets', 'support', 'sla', 'customers', 'queue'],
    defaultProps: {
      title: 'High-Priority Client Support Queue',
      filterSeverity: 'all'
    },
    defaultDirection: 'below'
  },
  {
    id: 'activity-payments-feed',
    title: 'Financial Settlement & Webhook Feed',
    category: 'feeds',
    categoryLabel: 'Feeds & Logs',
    description:
      'Real-time automated clearinghouse (ACH), Wire, and payment gateway webhook alerts.',
    icon: 'CreditCard',
    widgetType: 'activity',
    domainBadge: 'FINANCE',
    tags: ['payments', 'settlement', 'webhooks', 'finance'],
    defaultProps: {
      title: 'Real-time Settlement Stream',
      filterSeverity: 'success'
    },
    defaultDirection: 'below'
  },

  /* ============================================================
     5. DEV & INFRASTRUCTURE (4 Widgets)
     ============================================================ */
  {
    id: 'devops-interactive-terminal',
    title: 'Interactive Developer CLI & Terminal',
    category: 'devops',
    categoryLabel: 'Dev & Infrastructure',
    description:
      'Functional simulated terminal console supporting command entry, system logs, and script outputs.',
    icon: 'Terminal',
    widgetType: 'terminal',
    domainBadge: 'CLI',
    tags: ['terminal', 'cli', 'bash', 'console', 'developer'],
    defaultProps: {
      title: 'Production Cluster Console',
      welcomeMessage:
        'Connected to us-east-1 production cluster mesh (48 nodes)\nType "help" or "status" to inspect environment.'
    },
    defaultDirection: 'below'
  },
  {
    id: 'devops-cluster-topology',
    title: 'Kubernetes Cluster Pod Topology',
    category: 'devops',
    categoryLabel: 'Dev & Infrastructure',
    description:
      'Namespace pod health overview with CPU headroom, memory pressure, and restart telemetry.',
    icon: 'Cpu',
    widgetType: 'cluster',
    domainBadge: 'K8S',
    tags: ['kubernetes', 'cluster', 'pods', 'infra', 'topology'],
    defaultProps: {
      title: 'Kubernetes Multi-Cluster Topology',
      clusterName: 'prod-mesh-01',
      totalNodes: 48,
      healthyPods: 342,
      warningPods: 2
    },
    defaultDirection: 'below'
  },
  {
    id: 'devops-redis-cache',
    title: 'Redis Cache & Memory Monitor',
    category: 'devops',
    categoryLabel: 'Dev & Infrastructure',
    description:
      'Redis in-memory store metrics: hit-rate (99.2%), key count, memory fragmentation, and evictions.',
    icon: 'Zap',
    widgetType: 'kpi',
    domainBadge: 'CACHE',
    tags: ['redis', 'cache', 'memory', 'performance'],
    defaultProps: {
      items: [
        {
          label: 'Cache Hit Rate',
          value: '99.24%',
          delta: '+0.12%',
          deltaType: 'positive',
          subtext: 'Target > 98.5%'
        },
        {
          label: 'Active Keys',
          value: '4,892,104',
          delta: '+120K today',
          deltaType: 'neutral',
          subtext: 'TTL enforced'
        },
        {
          label: 'Memory Allocated',
          value: '18.4 GB',
          delta: '68% capacity',
          deltaType: 'positive',
          subtext: 'Max 28 GB quota'
        },
        {
          label: 'Key Evictions',
          value: '0',
          delta: 'Zero evictions',
          deltaType: 'positive',
          subtext: 'Healthy headroom'
        }
      ]
    },
    defaultDirection: 'below'
  },
  {
    id: 'devops-database-migrations',
    title: 'Database Migration Runner',
    category: 'devops',
    categoryLabel: 'Dev & Infrastructure',
    description:
      'Schema version control matrix showing applied migrations, SHA checksums, and rollback status.',
    icon: 'Database',
    widgetType: 'table',
    domainBadge: 'DBA',
    tags: ['database', 'migrations', 'schema', 'sql'],
    defaultProps: {
      title: 'Database Schema Version History',
      columns: [
        { key: 'version', header: 'Migration' },
        { key: 'description', header: 'Scope' },
        { key: 'applied', header: 'Applied At' },
        { key: 'duration', header: 'Execution' },
        { key: 'status', header: 'State' }
      ],
      rows: [
        {
          version: '20260918_01',
          description: 'Add composite index to transactions table',
          applied: '2026-09-18 04:12',
          duration: '142ms',
          status: 'Applied'
        },
        {
          version: '20260920_02',
          description: 'Partition audit_logs by monthly range',
          applied: '2026-09-20 03:00',
          duration: '2.1s',
          status: 'Applied'
        },
        {
          version: '20260922_03',
          description: 'Backfill tenant_id foreign keys',
          applied: '2026-09-22 02:45',
          duration: '840ms',
          status: 'Applied'
        }
      ]
    },
    defaultDirection: 'below'
  },

  /* ============================================================
     6. COMMAND PADS & QUICK ACTIONS (4 Widgets)
     ============================================================ */
  {
    id: 'actionpad-devops-ops',
    title: 'DevOps Operational Command Pad',
    category: 'actions',
    categoryLabel: 'Action Pads',
    description:
      'Quick-action buttons for common infrastructure operations: canary release, CDN purge, DB snapshot.',
    icon: 'Zap',
    widgetType: 'actionpad',
    domainBadge: 'OPS',
    tags: ['actions', 'buttons', 'devops', 'triggers', 'scripts'],
    defaultProps: {
      title: 'Rapid Cluster Commands',
      actions: [
        {
          id: 'act-1',
          label: 'Deploy Canary 10%',
          icon: 'Rocket',
          description: 'Route 10% traffic to candidate'
        },
        {
          id: 'act-2',
          label: 'Purge Cloudflare CDN',
          icon: 'RefreshCw',
          description: 'Invalidate global edge cache'
        },
        {
          id: 'act-3',
          label: 'Trigger RDS Snapshot',
          icon: 'Database',
          description: 'Create point-in-time backup'
        },
        {
          id: 'act-4',
          label: 'Scale Up Node Pool',
          icon: 'ArrowUpRight',
          description: 'Add +4 c6i.4xlarge workers'
        }
      ]
    },
    defaultDirection: 'right'
  },
  {
    id: 'actionpad-client-crm',
    title: 'Client Management Quick Actions',
    category: 'actions',
    categoryLabel: 'Action Pads',
    description:
      'Customer success workflows: generate invoice, upgrade subscription tier, trigger audit export.',
    icon: 'Sliders',
    widgetType: 'actionpad',
    domainBadge: 'CRM',
    tags: ['actions', 'client', 'crm', 'workflows'],
    defaultProps: {
      title: 'Account Management Actions',
      actions: [
        {
          id: 'crm-1',
          label: 'Generate Monthly Invoice',
          icon: 'Receipt',
          description: 'Assemble billing line items'
        },
        {
          id: 'crm-2',
          label: 'Upgrade to Enterprise',
          icon: 'Award',
          description: 'Enable custom SSO & SLA'
        },
        {
          id: 'crm-3',
          label: 'Export SOC2 Package',
          icon: 'Download',
          description: 'Compile encrypted compliance zip'
        },
        {
          id: 'crm-4',
          label: 'Send Executive Update',
          icon: 'Send',
          description: 'Deliver quarterly milestone digest'
        }
      ]
    },
    defaultDirection: 'right'
  },
  {
    id: 'actionpad-incident-killswitch',
    title: 'Incident Mitigation Killswitches',
    category: 'actions',
    categoryLabel: 'Action Pads',
    description: 'High-leverage safety triggers for SRE on-call engineers during active outages.',
    icon: 'AlertTriangle',
    widgetType: 'actionpad',
    domainBadge: 'SRE',
    tags: ['killswitch', 'safety', 'incident', 'emergency'],
    defaultProps: {
      title: 'Emergency Mitigation Controls',
      actions: [
        {
          id: 'kill-1',
          label: 'Engage Maintenance Mode',
          icon: 'ShieldAlert',
          description: 'Serve cached 503 fallback'
        },
        {
          id: 'kill-2',
          label: 'Enforce Strict Rate Limits',
          icon: 'Sliders',
          description: 'Throttle anonymous traffic'
        },
        {
          id: 'kill-3',
          label: 'Reroute to Secondary DC',
          icon: 'Shuffle',
          description: 'Shift DNS to eu-central-1'
        },
        {
          id: 'kill-4',
          label: 'Flush Ephemeral Cache',
          icon: 'Trash2',
          description: 'Clear corrupt memory pages'
        }
      ]
    },
    defaultDirection: 'right'
  },
  {
    id: 'actionpad-data-pipeline',
    title: 'Data Pipeline ETL Operations',
    category: 'actions',
    categoryLabel: 'Action Pads',
    description:
      'Warehouse synchronization controls: trigger Airflow DAG, sync Snowflake, rebuild vector embeddings.',
    icon: 'Cpu',
    widgetType: 'actionpad',
    domainBadge: 'DATA',
    tags: ['etl', 'pipeline', 'snowflake', 'data', 'vectors'],
    defaultProps: {
      title: 'Data Ingestion Orchestration',
      actions: [
        {
          id: 'etl-1',
          label: 'Trigger Hourly Airflow DAG',
          icon: 'Play',
          description: 'Run raw bronze-to-gold pipeline'
        },
        {
          id: 'etl-2',
          label: 'Sync Snowflake Data Lake',
          icon: 'RefreshCw',
          description: 'Incrementally sync partitions'
        },
        {
          id: 'etl-3',
          label: 'Re-index Vector Embeddings',
          icon: 'Layers',
          description: 'Update semantic search index'
        },
        {
          id: 'etl-4',
          label: 'Verify Data Checksums',
          icon: 'CheckCircle2',
          description: 'Audit record parity across sinks'
        }
      ]
    },
    defaultDirection: 'right'
  },

  /* ============================================================
     7. DOCUMENTATION, DIRECTIVES & RUNBOOKS (5 Widgets)
     ============================================================ */
  {
    id: 'docs-executive-directive',
    title: 'Executive Liquidity & Expansion Directive',
    category: 'docs',
    categoryLabel: 'Docs & Runbooks',
    description:
      'Executive memorandum outlining quarterly capital allocation targets, compliance deadlines, and rules.',
    icon: 'FileText',
    widgetType: 'notes',
    domainBadge: 'EXECUTIVE',
    tags: ['docs', 'notes', 'directive', 'executive', 'runbook'],
    defaultProps: {
      title: 'Directive & Runbook',
      content: `### Executive Liquidity & Expansion Directive (Q3)

* **Capital Allocation Target:** $50M AUM threshold projected for October 1st.
* **Key Deliverables:**
1. Complete automated compliance reporting across EU and North America entities.
2. Deploy high-frequency data pipelines for client portfolio visibility.
3. Harden internal access policies prior to SOC2 Type II audit.

> "Client deliverables should emphasize transparent risk metrics and single-click reporting without unnecessary developer chrome."`
    },
    defaultDirection: 'right'
  },
  {
    id: 'docs-sre-runbook',
    title: 'SRE Sev-1 Incident Response Runbook',
    category: 'docs',
    categoryLabel: 'Docs & Runbooks',
    description:
      'Structured emergency on-call response procedures, paging escalations, and mitigation checklists.',
    icon: 'BookOpen',
    widgetType: 'notes',
    domainBadge: 'SRE',
    tags: ['runbook', 'sre', 'oncall', 'incidents', 'sop'],
    defaultProps: {
      title: 'Sev-1 Incident Escalation Runbook',
      content: `### SRE Sev-1 Incident Response Protocol

* **Triage Phase (0-5 minutes):**
1. Acknowledge PagerDuty alert within 3 minutes of triggering.
2. Open incident command channel in Slack (#incident-war-room).
3. Designate Incident Commander (IC) and Communications Lead.

* **Mitigation Protocol:**
1. Check Canary deployment status. If deploy occurred < 30m ago, issue immediate rollback.
2. Verify Redis cache availability. If eviction spike observed, scale cluster.
3. Update public status page every 15 minutes.

> "Primary directive during active outages is customer mitigation first, root cause investigation second."`
    },
    defaultDirection: 'right'
  },
  {
    id: 'docs-api-contract',
    title: 'API Integration & Webhook Contract',
    category: 'docs',
    categoryLabel: 'Docs & Runbooks',
    description:
      'Client technical contract detailing REST endpoints, authentication headers, idempotency keys, and SLAs.',
    icon: 'Code2',
    widgetType: 'notes',
    domainBadge: 'API',
    tags: ['api', 'contract', 'specs', 'webhooks', 'developer'],
    defaultProps: {
      title: 'Client API Integration Contract',
      content: `### Enterprise API V2 Integration Specification

* **Authentication & Handshake:**
1. All client requests must include \`Authorization: Bearer <token>\` and \`X-Client-ID\`.
2. Idempotent mutations must supply \`Idempotency-Key: <uuid-v4>\`.

* **Rate Limits & Guarantees:**
1. 10,000 requests/minute per enterprise tenant with burst allowance.
2. Webhook delivery retries up to 5 times using exponential backoff with jitter.

> All payloads are signed using HMAC-SHA256 headers for cryptographically verified delivery.`
    },
    defaultDirection: 'right'
  },
  {
    id: 'docs-client-briefing',
    title: 'Client Deliverable Architecture Brief',
    category: 'docs',
    categoryLabel: 'Docs & Runbooks',
    description:
      'Overview document provided to clients explaining system architecture, security guarantees, and support.',
    icon: 'Briefcase',
    widgetType: 'notes',
    domainBadge: 'BRIEF',
    tags: ['client', 'brief', 'architecture', 'overview'],
    defaultProps: {
      title: 'Architecture & Security Briefing',
      content: `### Client Platform Architecture Briefing

* **Security Posture & Data Isolation:**
1. Multi-tenant database schemas with row-level tenant enforcement.
2. AES-256 encryption at rest and TLS 1.3 in transit.
3. Dedicated automated nightly backups retained across 3 geographic zones.

* **SLA & Escalation Contacts:**
1. 99.95% Guaranteed uptime SLA with financial credits.
2. 24/7/365 Dedicated Enterprise support channel with 15-minute response SLA.

> Delivered as a standalone, zero-dependency desktop cockpit tailored for your executive team.`
    },
    defaultDirection: 'right'
  },
  {
    id: 'docs-release-notes',
    title: 'Platform Release Notes & Milestones',
    category: 'docs',
    categoryLabel: 'Docs & Runbooks',
    description:
      'Changelog documenting latest capabilities, breaking change mitigations, and upcoming roadmap milestones.',
    icon: 'ClipboardList',
    widgetType: 'notes',
    domainBadge: 'RELEASE',
    tags: ['release', 'changelog', 'milestones', 'roadmap'],
    defaultProps: {
      title: 'Production Platform Release Notes',
      content: `### Version 4.2.0 Milestone Release

* **New Core Features:**
1. High-contrast WCAG-compliant desktop typography across all visual panels.
2. Seamless drag-to-resize sidebars with full-screen gesture isolation.
3. Expandable Dockview Widget Catalog featuring 42+ pre-configured client templates.

* **Deprecations & Security Patches:**
1. Replaced legacy animations with hardware-accelerated transitions.
2. Upgraded Node and Electron execution environments with strict fuses enabled.`
    },
    defaultDirection: 'right'
  }
]
