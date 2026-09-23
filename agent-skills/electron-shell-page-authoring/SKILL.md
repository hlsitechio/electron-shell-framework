---
name: electron-shell-page-authoring
description: Add or change a page in the Electron shell framework.
version: 1.0.0
author: hlsitechio, Hermes Agent
license: MIT
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [electron, react, pages, registry, ui]
    related_skills: [electron-shell-framework, electron-shell-theming]
---

# Page authoring

A **page** is one screen in the sidebar/tab bar. Adding one is registration, never
surgery on the shell. If you find yourself editing `AppShell`, `Sidebar`,
`TabBar`, or `RightPanel`, stop — the contract already covers your case.

## When to Use

- Adding a new screen to the framework or to a template
- Changing an existing page's content, inspector, or sidebar presence
- Don't use for: adding a whole app shape (that's a template), or styling work
  (that's theming)

## The contract

`PageDefinition` lives in `src/renderer/src/types/pages.ts`:

```tsx
{
  id: 'my-tool',                 // stable, kebab-case, unique
  label: 'My Tool',              // sidebar + tab text
  description: 'One line',       // tooltip / gallery subtitle
  category: 'Tools',             // groups pages into a sub-tab cluster
  icon: WrenchIcon,              // from lucide-react
  component: MyToolPage,         // the screen
  rightPanel: MyToolInspector,   // optional per-page right panel
  showInSidebar: true            // false = reachable but not listed
}
```

## Procedure

1. Create `src/renderer/src/pages/<name>/<Name>Page.tsx`.
   Completion: the file exists and default-exports a React component.

2. Register it in `src/renderer/src/pages/registry.tsx` (framework demo) **or** in
   a template's `pages[]` array when building an app.
   Completion: the entry has a unique `id` and a real `component`.

3. Build the screen from the widget kit — `import { GlassCard, StatTile, ... }
from '@renderer/widgets'`. Completion: no new card/table/chart component was
   written where one already existed.

4. Style only with tokens (`hsl(var(--card))`, `bg-card`, `text-muted-foreground`).
   Completion: zero hex literals in the new file.

5. Verify: `npm run typecheck && npm run lint && npm test`, then `npm start` and
   confirm the page renders in the sidebar and opens.

## Adding a right panel

`rightPanel` gets its own inspector pane. It is optional per page; omit it and
the shell handles the layout correctly. Never force a panel open globally.

## Pitfalls

- `category` is what clusters pages into a sub-tab group. An invented category
  per page produces a sidebar full of one-item groups — reuse existing ones
  unless the grouping is real.
- `showInSidebar: false` is for pages reachable from another page (a detail view).
  Don't hide a page the user needs to find.
- Page components are lazily reached through the registry; don't import a page
  into `main.tsx` or another page and create a cycle.
- If the page needs to persist state across tab switches, use zustand
  (`src/renderer/src/stores/`) — not component state that dies on unmount.

## Verification

The page must appear in the sidebar (when `showInSidebar`), open on click, and
render real content with the active preset applied — check it under both
`data-theme="dark"` and `data-theme="light"` before calling it done.
