import type { McpToolDefinition } from '../../shared/mcp-types'

export const REFRAME_MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'reframe_get_state',
    description:
      'Retrieve the current live state of the Reframe platform, including active mode, templates, open tabs, Dockview widgets, sidebar dimensions, and theme settings.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'reframe_set_mode',
    description:
      'Switch the workspace mode between "builder" (full visual editor with dockview layout and inspector controls) and "client" (clean, distraction-free client deliverable view with zero dockview runtime).',
    inputSchema: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['builder', 'client'],
          description: 'The target mode to switch into'
        }
      },
      required: ['mode']
    }
  },
  {
    name: 'reframe_load_template',
    description:
      'Load a pre-configured enterprise dashboard template into the workspace, or switch to the blank playground.',
    inputSchema: {
      type: 'object',
      properties: {
        templateId: {
          type: 'string',
          enum: ['blank', 'executive', 'operations', 'analytics', 'engineering', 'minimal'],
          description: 'Template identifier to load'
        }
      },
      required: ['templateId']
    }
  },
  {
    name: 'reframe_clear_all',
    description:
      'Completely reset the workspace into a totally empty playground with zero tabs, zero panels, and zero status monitors, ready to build from scratch.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'reframe_list_tabs',
    description:
      'List all dynamic tabs configured across the 3 framing zones (nav header workspace tabs, left sidebar view tabs, and nav footer telemetry monitors).',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'reframe_create_tab',
    description: 'Create a new tab in the Nav Header, Left Sidebar, or Nav Footer.',
    inputSchema: {
      type: 'object',
      properties: {
        zone: {
          type: 'string',
          enum: ['header', 'left', 'footer'],
          description: 'Framing zone to add the tab to'
        },
        id: {
          type: 'string',
          description: 'Optional unique tab ID. If omitted, an ID will be generated.'
        },
        label: {
          type: 'string',
          description: 'Display label of the tab'
        },
        viewType: {
          type: 'string',
          enum: ['canvas', 'notes', 'embed'],
          description: 'View type (required for left sidebar tabs)'
        },
        url: {
          type: 'string',
          description: 'Optional URL for embed view tabs'
        },
        value: {
          type: 'string',
          description: 'Status badge value (used for footer tabs, e.g. "🟢 Healthy" or "⚡ 12ms")'
        }
      },
      required: ['zone', 'label']
    }
  },
  {
    name: 'reframe_remove_tab',
    description: 'Remove an existing tab from any framing zone by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        zone: {
          type: 'string',
          enum: ['header', 'left', 'footer'],
          description: 'Zone containing the tab (optional, auto-detected if omitted)'
        },
        tabId: {
          type: 'string',
          description: 'Unique identifier of the tab to remove'
        }
      },
      required: ['tabId']
    }
  },
  {
    name: 'reframe_select_tab',
    description: 'Switch the active tab in the Nav Header or Left Sidebar.',
    inputSchema: {
      type: 'object',
      properties: {
        zone: {
          type: 'string',
          enum: ['header', 'left', 'footer'],
          description: 'Zone to switch tab in (optional, auto-detected if omitted)'
        },
        tabId: {
          type: 'string',
          description: 'ID of the tab to make active'
        }
      },
      required: ['tabId']
    }
  },
  {
    name: 'reframe_list_widgets',
    description: 'List all currently active widgets mounted in the Dockview layout canvas.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'reframe_add_widget',
    description:
      'Add a new widget tile into the Dockview layout canvas. Supports KPI metrics, real-time charts, data tables, runbooks, activity logs, and action pad command triggers.',
    inputSchema: {
      type: 'object',
      properties: {
        widgetType: {
          type: 'string',
          enum: ['kpi', 'chart', 'table', 'notes', 'activity', 'actionpad'],
          description: 'Type of widget to mount'
        },
        title: {
          type: 'string',
          description: 'Panel title displayed in tab header and client card header'
        },
        props: {
          type: 'object',
          description:
            'Custom configuration props for the widget (e.g. metric items for KPI, chart dataKey/timeRange, notes content)'
        },
        direction: {
          type: 'string',
          enum: ['right', 'below', 'stack'],
          description:
            'Placement direction relative to existing layout. Defaults to right or below.'
        }
      },
      required: ['widgetType', 'title']
    }
  },
  {
    name: 'reframe_remove_widget',
    description: 'Remove a widget from the Dockview canvas layout by its panel ID.',
    inputSchema: {
      type: 'object',
      properties: {
        panelId: {
          type: 'string',
          description: 'ID of the panel to remove'
        }
      },
      required: ['panelId']
    }
  },
  {
    name: 'reframe_update_widget',
    description: 'Update the title or properties of an existing Dockview panel widget.',
    inputSchema: {
      type: 'object',
      properties: {
        panelId: {
          type: 'string',
          description: 'ID of the panel to update'
        },
        title: {
          type: 'string',
          description: 'New title for the panel'
        },
        props: {
          type: 'object',
          description: 'Updated widget configuration properties'
        }
      },
      required: ['panelId']
    }
  },
  {
    name: 'reframe_update_theme',
    description:
      'Adjust visual theme settings, including border thickness (1-8px), Left Sidebar width (160-480px), Right Sidebar width (260-640px), Dockview theme, accent colors, and padding.',
    inputSchema: {
      type: 'object',
      properties: {
        borderThickness: {
          type: 'number',
          minimum: 1,
          maximum: 8,
          description: 'Border divider thickness in pixels across all framing zones'
        },
        leftSidebarWidth: {
          type: 'number',
          minimum: 160,
          maximum: 480,
          description: 'Left sidebar width in pixels'
        },
        rightSidebarWidth: {
          type: 'number',
          minimum: 260,
          maximum: 640,
          description: 'Right sidebar inspector width in pixels'
        },
        selectedThemeKey: {
          type: 'string',
          description:
            'Dockview theme key (e.g. "dockview-theme-abyss", "dockview-theme-catppuccin-mocha", "dockview-theme-dracula", etc.)'
        },
        tabBarHeight: {
          type: 'number',
          description: 'Height of tab bars in pixels'
        },
        fontSize: {
          type: 'number',
          description: 'Font size in pixels'
        },
        borderRadius: {
          type: 'number',
          description: 'Corner border radius in pixels'
        }
      }
    }
  },
  {
    name: 'reframe_update_framing',
    description:
      'Update Header or Footer framing text and brand styling (e.g. title, subtitle, status labels).',
    inputSchema: {
      type: 'object',
      properties: {
        headerTitle: {
          type: 'string',
          description: 'Header brand title'
        },
        headerSubtitle: {
          type: 'string',
          description: 'Header subtitle description'
        },
        footerLeftText: {
          type: 'string',
          description: 'Left text in footer'
        },
        footerStatusLabel: {
          type: 'string',
          description: 'Footer system status label (e.g. "Operating Normally")'
        }
      }
    }
  },
  {
    name: 'reframe_bake_deliverable',
    description:
      'Trigger the standalone application publisher (legacy name). Returns pure, zero-runtime React .tsx code and JSON manifest representing the current workspace layout.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'reframe_publish_app',
    description:
      'Trigger the standalone application publisher. Returns pure, zero-runtime React .tsx code and JSON manifest representing the current workspace layout.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'reframe_take_screenshot',
    description:
      'Capture a high-resolution screenshot of the live Electron window or workspace canvas and return base64 PNG image data for visual inspection.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
]
