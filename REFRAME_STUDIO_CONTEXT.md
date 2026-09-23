# Reframe Studio & Native MCP Server — Comprehensive Context & Handover

> **Date**: September 23, 2026  
> **Branch**: `feat/reframe-studio-native-mcp`  
> **Status**: Production Build Passing | 13/13 Vitest Test Suites Passing (106/106 Tests) | End-to-End Live MCP Verified  
> **Target Platform**: Windows (Frameless Electron Desktop Shell)

---

## 1. Executive Summary

Today we transformed the **Reframe Electron Desktop Application** into an **Agentic Workspace Studio** with an embedded **Native Model Context Protocol (MCP) Server**. External AI agents (Claude Desktop, Cursor, Antigravity, Cline, Windsurf, or custom autonomous agent scripts) can connect directly to the running desktop application via standard MCP protocols to programmatically inspect, query, mutate, customize, and publish workspace dashboards in real time.

Additionally, we addressed critical user experience requirements:

- **Empty Playground State**: The application can start completely blank (no preloaded tabs or widgets, just a `+` tab and a central canvas `+` trigger) while preserving frameless window controls (`-`, `□`, `✕`).
- **Mode Persistence**: Switching between Builder Mode and Client Mode preserves empty or populated states without resetting.
- **Dual-Layer Window Dragging**: Seamless window dragging across all empty header space, including instant unmaximize dragging when the window is maximized.
- **Professional Rebranding**: Rebranded colloquial "Baking" to **"Publish App"** with zero-runtime deliverable generation.
- **Multi-Tab Workspace & Layout Persistence Engine**: Fully resolved the bug where switching between tabs wiped out widgets and Dockview grid layouts. Each tab now maintains an isolated workspace snapshot with automatic layout geometry serialization.

---

## 2. Key Capabilities Implemented

### 2.1 Native Embedded MCP Server in Electron (`src/main/mcp/`)

- **Embedded Loopback Server**: Listens on `http://127.0.0.1:3920` (with automatic fallback to ports 3921–3930).
- **Transport Endpoints**:
  - `GET /status`: Server health check, uptime, client connection counter, total invocation metrics.
  - `GET /sse`: Server-Sent Events stream for real-time agent notifications and responses.
  - `POST /message`: Standard JSON-RPC 2.0 message handler complying with the MCP specification.
- **Universal Stdio Proxy Bridge (`scripts/mcp-stdio-bridge.js`)**:
  - A zero-dependency Node.js CLI script proxying standard `stdin`/`stdout` directly to the local Electron HTTP server.
  - Enables direct one-line integration with Claude Desktop and other stdio-only MCP clients.
- **Two-Way IPC Dispatcher**:
  - Electron Main process dispatches tool calls (`mcp:invoke-action`) to the React renderer and caches live state snapshots (`mcp:push-state`).
  - Native window screenshot capture via `webContents.capturePage()`.
- **In-App AI Agent Inspector Panel (`src/renderer/src/reframe/components/McpAgentInspector.tsx`)**:
  - Integrated into the Right Sidebar under the `Bot` icon.
  - Displays live server port, active client count, real-time tool invocation log stream, and 1-click clipboard configuration copiers for Claude Desktop and Cursor.

### 2.2 17 Native MCP Tools Catalog

| Category                | Tool Name                  | Description                                                                                            |
| :---------------------- | :------------------------- | :----------------------------------------------------------------------------------------------------- |
| **State & Diagnostics** | `reframe_get_state`        | Retrieve full JSON snapshot of open tabs, Dockview panels, theme settings, and workspace mode.         |
|                         | `reframe_take_screenshot`  | Native window screenshot capture via `webContents.capturePage()`, returning high-res base64 PNG data.  |
| **Workspace Modes**     | `reframe_set_mode`         | Programmatically switch between `"builder"` (layout editor) and `"client"` (zero-runtime deliverable). |
|                         | `reframe_load_template`    | Load enterprise templates (`executive`, `operations`, `analytics`, `devforge`, `minimal`, `blank`).    |
|                         | `reframe_clear_all`        | Reset workspace to a clean, empty playground with zero tabs or widgets.                                |
| **Tab Management**      | `reframe_list_tabs`        | List dynamic tabs across Header, Left Sidebar, and Footer.                                             |
|                         | `reframe_create_tab`       | Create new tab in any zone (`header`, `left`, `footer`) with custom view types and optional custom ID. |
|                         | `reframe_remove_tab`       | Delete tab from any framing zone by ID (auto-detects zone if omitted).                                 |
|                         | `reframe_select_tab`       | Switch the active view tab (auto-detects zone if omitted).                                             |
| **Dockview Layout**     | `reframe_list_widgets`     | List all currently active Dockview panel tiles and their properties.                                   |
|                         | `reframe_add_widget`       | Mount new widget tiles (`kpi`/`metric`, `chart`, `table`, `notes`, `activity`, `actionpad`).           |
|                         | `reframe_remove_widget`    | Remove a widget from the Dockview canvas by panel ID.                                                  |
|                         | `reframe_update_widget`    | Update widget title or property schema in real time.                                                   |
| **Styling & Framing**   | `reframe_update_theme`     | Adjust border thickness (1-8px), sidebar widths, theme presets, font sizes, and accent colors.         |
|                         | `reframe_update_framing`   | Modify Header brand title/subtitle and Footer status telemetry labels.                                 |
| **Deliverables**        | `reframe_publish_app`      | Trigger standalone deliverable compiler, returning pure React `.tsx` with zero Dockview runtime.       |
|                         | `reframe_bake_deliverable` | Backward-compatibility alias for `reframe_publish_app`.                                                |

### 2.3 MCP Resources & Prompts

- **Resources**:
  - `reframe://state/current`: Live state snapshot of the active desktop platform.
  - `reframe://layout/dockview`: Active grid layout manifest and panel configuration.
  - `reframe://code/standalone-tsx`: Generated deliverable React component code.
  - `reframe://telemetry/footer`: Diagnostic telemetry channels.
  - `reframe://logs/app`: Desktop main process execution log stream.
- **Prompts**:
  - `design_executive_dashboard`: Guides AI agents to assemble an executive KPI suite.
  - `audit_platform_layout`: Prompts an agent to inspect contrast, borders, and layout density.
  - `convert_notes_to_widgets`: Guides an agent to parse executive directives into live Dockview widgets.

### 2.4 Per-Tab Workspace & Layout Persistence Engine

- **The Problem Solved**:
  - Previously, when a user created "Tab 1", added widgets, created "Tab 2", and clicked back to "Tab 1", all of Tab 1's widgets were lost.
  - **Root Cause**: `dockviewApi.clear()` fired `onDidRemovePanel` for each panel during tab transitions, which erased panels from the store. Additionally, Dockview split layout geometry (`dockviewApi.toJSON()`) was never saved per tab.
- **The Architecture**:
  1. `tabWorkspaces: Record<string, TabWorkspaceState>` added to store.
  2. Each tab independently stores:
     - `panels: Record<string, PanelConfig>` (all widget tiles, titles, properties).
     - `layoutJson: any` (the complete Dockview split layout tree).
     - `templateId?: TemplateId`.
  3. `isRestoringLayout` guard suppresses `onDidRemovePanel` deletions during canvas clearing.
  4. Tab navigation (`setActiveHeaderTab` and `addHeaderTab`) automatically snapshots the outgoing tab before clearing and restores the incoming tab via `dockviewApi.fromJSON(targetLayout)` (or reconstructed from panels if no layout JSON exists).
  5. Tested and verified end-to-end with live tests and automated Vitest suites.

### 2.5 Dual-Layer Frameless Window Dragging Engine

- **State-Aware Maximized & Restored Handling**:
  - When window is maximized, `-webkit-app-region: drag` is bypassed in favor of a pointer drag handler. Moving the pointer >2px unmaximizes the window smoothly, offsets the cursor proportionally, and tracks mouse movement across multi-monitor setups.
  - When window is restored, native `-webkit-app-region: drag` provides hardware-accelerated 0ms OS dragging.
- **Double-Click Maximize/Restore Toggle**:
  - Double-clicking any empty black space in the top navigation bar toggles maximize/restore.
- **Protected Interactive Zones (`app-no-drag`)**:
  - All interactive elements (tab buttons, close `✕` buttons, template selector, Publish App button, mode switcher, sidebar toggles, window controls) are shielded with `closest()` guards and `app-no-drag` to guarantee click responsiveness.

### 2.6 Professional Rebranding: "Publish App"

- Replaced all colloquial references to "Baking" with **"Publish App"** throughout:
  - Top Navigation Header button (`ReframeNavHeader.tsx`) with Lucide `Rocket` icon and violet gradient.
  - Right Sidebar callout and export trigger (`ReframeRightSidebar.tsx`).
  - Floating Client View control pill (`ReframePlatform.tsx` & `ReframeApp.tsx`).
  - Export Modal (`BakeExportModal.tsx` -> "Publish Standalone App" with `Zero Dockview` badge).
  - MCP Server Tools (`reframe_publish_app` alongside backward-compatible `reframe_bake_deliverable`).

---

## 3. Repository Architecture & File Map

```
electron_app/
├── scripts/
│   └── mcp-stdio-bridge.js          # Universal Stdio-to-HTTP proxy for Claude Desktop & agents
├── src/
│   ├── main/
│   │   ├── index.ts                 # Main process entry, window creation, MCP lifecycle
│   │   ├── ipc.ts                   # IPC handlers (frameless window drag, MCP channels)
│   │   └── mcp/                     # Native MCP Server implementation
│   │       ├── mcp-server.ts        # HTTP + SSE loopback server & JSON-RPC dispatcher
│   │       ├── mcp-tools.ts         # 17 MCP tool schemas & definitions
│   │       ├── mcp-resources.ts     # MCP resources registry & URI handlers
│   │       ├── mcp-prompts.ts       # MCP prompt templates for AI workflows
│   │       └── mcp-server.test.ts   # 8 automated unit tests for MCP server
│   ├── preload/
│   │   └── index.ts                 # Preload bridge exposing window.api.mcp & window controls
│   ├── shared/
│   │   └── mcp-types.ts             # Shared TypeScript types for MCP messages & actions
│   └── renderer/src/
│       ├── App.tsx                  # Root renderer routing
│       └── reframe/                 # Reframe Studio & Agentic Workspace Suite
│           ├── components/
│           │   ├── DockviewCanvas.tsx      # Dockview layout canvas with empty state & guards
│           │   ├── ReframeNavHeader.tsx    # Draggable top header, dynamic tabs, Publish App
│           │   ├── ReframeLeftSidebar.tsx  # Resizable left sidebar with canvas views
│           │   ├── ReframeRightSidebar.tsx # Resizable inspector, theme sliders, MCP feed
│           │   ├── ReframeFooter.tsx       # Status bar with dynamic telemetry chips
│           │   ├── McpAgentInspector.tsx   # Live tool execution stream & config copy buttons
│           │   ├── BakeExportModal.tsx     # "Publish Standalone App" modal dialog
│           │   └── ...
│           ├── stores/
│           │   └── reframe-store.ts        # Zustand store: multi-tab workspaces, framing, theme
│           ├── mcp/
│           │   └── reframe-mcp-bridge.ts   # Renderer-side MCP action dispatcher & state sync
│           ├── export/
│           │   └── deliverable-compiler.ts # Standalone React TSX compiler (Zero Dockview)
│           ├── widgets/
│           │   └── reframe-widgets.tsx     # 7 interactive Dockview widgets + aliases
│           └── reframe.test.ts             # 20 automated tests for store, persistence, & export
```

---

## 4. How to Resume Work on Your Main PC

### Step 1: Fetch and Checkout the Branch

```bash
git fetch origin
git checkout feat/reframe-studio-native-mcp
```

### Step 2: Install Dependencies & Verify Build

```bash
npm install
npm run test         # Verifies all 106 tests pass
npm run typecheck    # Verifies TypeScript has 0 errors
npm run build        # Compiles out/main, out/preload, out/renderer
```

### Step 3: Run the Application

```bash
# In development mode with hot-reload:
npm run dev

# Or run the production bundle:
npx electron .
```

### Step 4: Verify MCP Server Connection

Once the Electron app is running, the MCP server automatically starts on port `3920`:

```bash
# Check server health:
curl http://127.0.0.1:3920/status

# Expected response:
# {"running":true,"port":3920,"sseUrl":"http://127.0.0.1:3920/sse","clientCount":0,"uptimeSeconds":...}
```

### Step 5: Connect External AI Agents

#### Option A: Claude Desktop (`claude_desktop_config.json`)

Add the following configuration block:

```json
{
  "mcpServers": {
    "reframe-desktop": {
      "command": "node",
      "args": ["<PATH_TO_REPO>/scripts/mcp-stdio-bridge.js"]
    }
  }
}
```

#### Option B: Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "reframe-desktop": {
      "url": "http://127.0.0.1:3920/sse"
    }
  }
}
```

---

## 5. Automated Verification Summary

```
 Test Files  13 passed (13)
      Tests  106 passed (106)
   Duration  ~11s
```

- `src/main/mcp/mcp-server.test.ts`: **8/8 passed** (Server boot, HTTP RPC, tools/list, resources/list, prompts/list, port fallback).
- `src/renderer/src/reframe/reframe.test.ts`: **20/20 passed** (Store state, multi-tab layout persistence, standalone deliverable compiler, tab switching).
- `src/renderer/src/templates/templates.test.ts`: **25/25 passed**.
- `src/main/cockpit-git-update.test.ts`: **9/9 passed**.
- All remaining unit test suites: **44/44 passed**.
