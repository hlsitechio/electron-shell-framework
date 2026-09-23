# Shell Layout Modes — Dashboard, Studio, and Compact

The framework provides **three distinct layout engines** to fit any desktop application shape. Rather than forcing every app into a dashboard grid or requiring you to fork the shell, `AppShell` natively switches compositions based on the `mode` prop or template definition.

```tsx
<AppShell mode="dashboard" | "studio" | "compact" slots={{ ... }} />
```

---

## 1. The Three Layout Modes

| Mode                      | Best For                                        | Navigation                                            | Top Bar                                  | Right Dock             |
| :------------------------ | :---------------------------------------------- | :---------------------------------------------------- | :--------------------------------------- | :--------------------- |
| **`dashboard`** (Default) | Operations, admin, multi-page apps, metrics     | Collapsible icon/labeled sidebar + dynamic tabs       | Merged top bar (tabs + controls)         | Per-page inspector     |
| **`studio`**              | Writing, documents, code editors, canvas tools  | Hierarchical tree (workspace $\to$ project $\to$ doc) | Document action bar (breadcrumb + tools) | Contextual review dock |
| **`compact`**             | Single-purpose utilities, focus tools, terminal | Folded horizontal segmented control                   | Unified slim bar with dropdown menu      | Optional utility dock  |

---

## 2. Mode Architectures

### Dashboard Mode (`mode="dashboard"`)

The default house composition. The tab bar is the primary navigation; pages register in `registry.tsx` or in an app template's `pages[]` array.

- **Merged Top Bar**: Tabs, search/actions, and native window controls share one unified 40px bar.
- **Responsive Tab Bar**: Automatically collapses into centered icon-only mode with floating tooltips when container width is constrained.
- **Collapsible Sidebar**: Switches between a 250px expanded rail and a 64px icon rail.
- **Right Inspector Panel**: Supports per-page inspectors or full custom dock via `slots.rightDock` (takes precedence over demo notices).
- **Collapsible Bottom Panel**: Collapsible terminal/drawer; custom terminals or logs dock cleanly via `slots.bottomDock` without placeholder text.
- **Footer Bar**: Persistent status frame showing system health, app version, and engine status.

### Studio Mode (`mode="studio"`)

Content-first composition designed for document and writing workflows (Lex, Notion AI, Hemingway, VS Code).

- **Navigation Tree**: The sidebar renders a hierarchical tree (`slots.sidebarTree`) instead of flat page tabs.
- **Document Action Bar**: The top bar displays a breadcrumb path (`slots.breadcrumb`) and document tools (`slots.topBarActions`, e.g., word count, revisions, export).
- **Full-Height Canvas**: Eliminates the footer bar to maximize vertical canvas space.
- **Contextual Review Dock**: Right panel appears only when remarks or inspection data exist.

```tsx
<AppShell
  mode="studio"
  slots={{
    sidebarHeader: <WorkspaceSwitcher />,
    sidebarTree: <DocumentTree />,
    sidebarFooter: <UserProfileCard />,
    breadcrumb: <span>Projects / Q4 Report / Draft</span>,
    topBarActions: <WordCounter />,
    rightDock: <ReviewRemarks />
  }}
/>
```

### Compact Mode (`mode="compact"`)

Streamlined utility layout designed for single-purpose tools, floating assistants, or distraction-free focus modes.

- **Folded Navigation**: Sidebar is removed completely; navigation moves into a sleek segmented control in the top bar.
- **Full-Bleed Workspace**: Active page takes 100% of the interior dimensions.
- **Menu Drawer**: An optional menu toggle (`slots.sidebarHeader`) opens extended options.

---

## 3. Template Mode Declaration

Templates declare their preferred layout engine in their metadata:

```ts
export const writerTemplate: AppTemplate = {
  id: 'writer',
  name: 'AI Writing Studio',
  mode: 'studio',
  preset: 'dark-indigo'
  // ...
}
```

When an app template is loaded, `App.tsx` reads `active?.mode ?? 'dashboard'` and applies the composition automatically with zero boilerplate.
