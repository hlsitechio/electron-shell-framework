---
name: electron-shell-theming
description: Work with presets, tokens, and light/dark in the shell.
version: 1.0.0
author: hlsitechio, Hermes Agent
license: MIT
platforms: [windows]
metadata:
  hermes:
    tags: [electron, theming, css, tokens, presets, design-system]
    related_skills: [electron-shell-framework, electron-shell-page-authoring]
---

# Theming

Two independent layers, applied as HTML attributes:

```
<html data-theme="dark" data-preset="shadow-peonies">
      └── mode          └── one of 10 app shells
```

- `data-theme` → `light | dark`, base tokens in `styles/theme.css`
- `data-preset` → one of 10 ids, overrides in `styles/presets.css`
- **Both attributes are always present.** Selectors are written
  `[data-theme='dark'][data-preset='x']` so specificity never depends on source order.
- **A preset defines both light and dark token sets. A preset is not a mode.**

## When to Use

- The user says "make it look like X" or asks for a different palette
- You are adding or adjusting a preset
- You are styling a component and need to know which token to use
- Don't use for: layout or structure work (that's page authoring)

## Choosing a preset — by job, not by color

| Building…                          | Preset            |
| ---------------------------------- | ----------------- |
| AI chat / agent UI                 | `shadow-peonies`  |
| SaaS dashboard, client work        | `muted-violet`    |
| Data-dense admin / internal tool   | `noguchi`         |
| Monitoring, logs, infrastructure   | `poiesis-blue`    |
| B2B / finance / enterprise         | `dark-indigo`     |
| Creative work, media, galleries    | `poiesis-purple`  |
| Writing, reading, long-form, focus | `winter-woods`    |
| Hero screen / launch / analytics   | `midnight-purple` |
| Daytime productivity, light-first  | `frost`           |
| Terminal, code editor, utility     | `carbon`          |

If "make it look like X" isn't in the table, read `lib/presets.ts` — every preset
carries `mood`, `bestFor`, and `source`.

## Using it

```tsx
import { useTheme } from '@renderer/components/theme/ThemeProvider'
const { theme, setTheme, toggleTheme, preset, presetMeta, setPreset } = useTheme()
```

```tsx
// tokens only — never a hex literal
style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--card-border))' }}
```

Tailwind utilities already map to tokens: `bg-card`, `text-muted-foreground`,
`border-input`, `ring-ring`, `bg-sidebar-bg`, `bg-topbar-bg`.

## Procedure — adding a preset

1. Add the id to `lib/presets.ts` with `mood`, `bestFor`, `source`.
   Completion: the entry exists with all three descriptive fields.
2. Add **both** light and dark token blocks to `styles/presets.css`, written as
   `[data-theme='dark'][data-preset='<id>']` and the light equivalent.
   Completion: both selectors exist.
3. Verify by switching to it in the app: `npm start` → Themes page → pick it.
   Completion: no unthemed surface in either mode.

## Pitfalls

- **Never hardcode a hex color.** Ten presets must keep working; a literal breaks
  nine of them silently.
- A preset that only defines dark tokens looks broken in light mode — always
  write both blocks.
- Don't write a single-attribute selector (`[data-preset='x']`). The house form
  is both attributes, in both files.
- Don't add a second token file or a CSS-in-JS theme. One system.
- The Themes page has a live token inspector — use it instead of guessing which
  variable is missing.

## Verification

Switch presets in the running app and check **both** `data-theme` values. The
Themes page gallery renders all ten previews; a preset missing from the gallery
is a preset that isn't registered.
