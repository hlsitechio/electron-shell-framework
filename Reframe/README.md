# Reframe — Dynamic Visual Builder & Client Deliverable Platform

> **Reframe** is a visual layout, typography, and framing platform for Electron desktop apps powered by [Dockview](https://dockview.dev/).
> It separates the **visual builder platform** from the **final client deliverable product**.

---

## 🎯 The Core Concept

When building desktop software for clients, developers typically get trapped between two extremes:

1. **Hardcoded client layouts**: Any change requires developer intervention, code edits, and rebuilds.
2. **Exposing internal dev tools to clients**: Giving clients access to internal settings, debug panels, and clutter diminishes product value and invites breakage.

**Reframe solves this cleanly:**

- **Builder Mode (Internal Platform)**: You (or any non-technical operator) visually customize everything:
  - Drag, split, dock, and group tabs freely using Dockview.
  - Drop in widgets (KPI metrics, Area/Line charts, dynamic tables, markdown notes, live activity streams, webview embeds).
  - Control top header framing: editable title, subtitle, font family, font size, logo icons, branding, and action buttons.
  - Control bottom footer framing: status pills, sync indicators, center text, right metadata, and typography.
  - Test and preview layouts live with zero latency.
- **Client Deliverable Mode (Client View)**: With one switch or export, all builder drawers, tabs-management chrome, and property inspectors disappear. The app renders a clean, high-end desktop product running the exact configured layout and custom typography.

---

## 📁 Directory Structure

```
electron_app/
├── Reframe/                        # Root Reframe Workspace & Deliverable Assets
│   ├── README.md                   # Platform documentation & workflow guide
│   └── presets/                    # Pre-built client deliverable templates
│       ├── client-executive-dashboard.json
│       ├── client-operations-monitor.json
│       └── client-minimal-kpi.json
│
└── src/renderer/src/reframe/       # Core Engine & React Implementation
    ├── types/                      # TypeScript schemas (ReframeConfig, Framing, Widgets)
    ├── stores/                     # Zustand state store with JSON serialization & persistence
    ├── styles/                     # Dockview CSS bridge adapting theme tokens
    ├── widgets/                    # Reusable client widgets (KPIs, Charts, Tables, Notes)
    ├── components/                 # DockviewCanvas, ReframeHeader, ReframeFooter, Toolbox, Inspector
    └── ReframeApp.tsx              # Unified Reframe Workspace entry point
```

---

## 🚀 Key Features

1. **Dockview Split & Group Engine**:
   - Split panels left, right, up, or down.
   - Stack multiple tabs into groups.
   - Reorder tabs with drag-and-drop.
   - Floating panels and dock serialization (`api.toJSON()` / `api.fromJSON()`).

2. **Total Framing Control**:
   - **Header**: Inline title editing, font family selector (Inter, JetBrains Mono, Outfit, Geist, Fira Code, System), font sizes, brand logo, action buttons.
   - **Footer**: Custom live status pill (online/healthy/synced), editable status strings, customizable slots.
   - **Themes & Accents**: Emerald, Blue, Amber, Violet, Rose, or Neutral Gray accents.

3. **No-Code / Zero AI Widget Library**:
   - **KPI Tile**: Highlight key numbers with positive/negative delta trend indicators.
   - **Interactive Chart**: Area, Line, or Bar graphs powered by Recharts.
   - **Data Table**: Filterable and searchable data view with status pills.
   - **Markdown / Notes**: Client instructions, runbooks, or release announcements.
   - **Live Activity Stream**: Real-time event log with severity filtering.
   - **Webview Embed**: Embed SaaS portals, status pages, or internal URLs.
   - **Action Pad**: Custom one-click operational triggers.

4. **Deliverable Export & One-Click Mode Switching**:
   - Switch between **Builder** and **Client** mode with one click.
   - Export configuration as JSON to load directly in client installations.

---

## 🛠 Presets Included

- **Executive Dashboard**: High-level KPIs, revenue growth chart, quick actions, and strategic notes.
- **Operations Monitor**: Live activity stream, cluster health table, and real-time operational metrics.
- **Minimal KPI Hub**: Clean, distraction-free metrics overview for desktop monitoring.
