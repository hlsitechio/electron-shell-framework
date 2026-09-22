# App templates — the fast path from clone to client app

The pitch this repo exists for:

> **"I have a client asking for a financial dashboard. I clone the repo, tell my
> agent 'build the financial dashboard using the template inside', and ship."**

That sentence is the product. Everything here serves it.

---

## Why templates and not just a shell

A bare Electron shell still leaves a day of work: lay out pages, wire a sidebar,
build a table, style a chart, add an empty state. Those are solved problems.

Eleven templates solve the _shape_, and they are not invented — each one matches a
shape that hundreds of shipped apps already use (source: `electron/electron-apps`,
613 apps, plus public GitHub topic counts):

| Template    | Shape                                | Evidence                                           |
| ----------- | ------------------------------------ | -------------------------------------------------- |
| `editor`    | Code editor / IDE                    | 83 shipped apps — the largest category             |
| `media`     | Media library / player               | 95 shipped apps (53 photo/video + 42 audio)        |
| `notes`     | Notes / knowledge base               | 47 shipped apps (Obsidian, Joplin, Standard Notes) |
| `devtools`  | Database GUI + API client + terminal | 52 shipped apps                                    |
| `chat`      | Chat / messaging client              | 37 shipped apps (Discord, Slack, Signal)           |
| `dashboard` | Admin dashboard                      | 45,544 GitHub repos tagged `dashboard`             |
| `tasks`     | Kanban / task manager                | 23 shipped apps + 7,141 PM repos                   |
| `workspace` | All-in-one web wrapper               | 11 shipped pure wrappers (Franz, Rambox, Station)  |
| `reader`    | RSS / ebook reader                   | 24 shipped apps                                    |
| `finance`   | Finance / budget / portfolio         | 21 shipped apps                                    |
| `writer`    | AI Writing Studio / document review  | 41 shipped apps (Lex, Notion AI, Hemingway)        |

## The architecture: lean core, lazy templates

The framework core must boot without any template's page code, or the shell
becomes a monolith as the catalog grows. So:

```
templates/
  types.ts      AppTemplate — the contract (pages, layout, preset, dataShape)
  manifest.ts   the CATALOG: display metadata only (icons, names, evidence)
                → no page imports, no components, tiny
  store.ts      which template is live (holds the LOADED object)
  catalog.ts    id → () => import('./x')   ← lazy loaders
  notes.tsx     47-app notes template
  editor.tsx    83-app editor template
  ...           one file per template
```

Verified in the build output — each template is its own chunk:

```
notes-6gHWCLve.js        5.4 kB
editor-nBtsNYXz.js       5.8 kB
finance-D8QRw9NV.js      6.4 kB
workspace-BIhL80QM.js    5.5 kB
...
```

The gallery renders all ten template previews from `manifest.ts` alone. A
template's code downloads the first time someone applies it.

## The agent contract

When a user names an app, **do not pick silently.** Match their words, offer the
two or three nearest, let them choose.

```ts
import { resolveTemplateId, loadTemplate } from '@renderer/templates'

resolveTemplateId('I need a financial dashboard for a client')
// → 'finance'

resolveTemplateId('kanban board for the team')
// → 'tasks'
```

Then apply it and read the recipe:

```ts
import { applyTemplate, buildRecipe } from '@renderer/lib/apps'

const t = await applyTemplate('finance', { setPreset })
console.log(buildRecipe(t)) // the exact build order for this app
```

`buildRecipe()` prints template id, paired preset, home page, layout numbers, the
data shape the app expects, the pages to edit, the rules (replace demo arrays, keep
widget props, never restyle a widget, never edit the shell), rebrand steps, ship
steps, and the ranked list of what to extend next.

## The human path

1. `npm start`
2. **Apps** tab — the catalog, with a live preview per template
3. Click the template → shell swaps (pages + layout + color preset)
4. **Copy** the build recipe → paste to your agent
5. Agent wires real data into the page props
6. `npm run dist:win` → NSIS installer + portable exe

## Adding an 11th template

1. `templates/<id>.tsx` — export an `AppTemplate` (copy the nearest existing one)
2. `templates/manifest.ts` — add the catalog entry (name, tagline, `ask`, icon,
   preset, pageCount, evidence)
3. `templates/catalog.ts` — add the lazy loader line
4. `npm test` — the suite asserts catalog and code agree on `id`, `preset` and
   `pageCount`, that every catalog entry has code behind it, and that the catalog
   itself imports no template code

If a catalog entry has no loader, `loadableCatalog()` drops it and the test fails —
so a half-added template never ships.

## What a template is NOT

`finance` has no live price feed. `devtools` has no SQL drivers. `workspace` has no
webview host yet.

That is deliberate — the layout is the deliverable, the data source is the client's
— but be honest with a client about it: templates deliver the **UI and structure**
fast, not the integration. The `dataShape` field on every template tells you exactly
what to feed it once the integration exists.
