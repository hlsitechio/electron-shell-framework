---
name: electron-shell-template-authoring
description: Add a new app template to the shell framework catalog.
version: 1.0.0
author: hlsitechio, Hermes Agent
license: MIT
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [electron, templates, architecture, lazy-loading]
    related_skills: [electron-shell-framework, electron-shell-page-authoring]
---

# Template authoring

A **template** is an app shape: pages + layout + a default preset. Ten ship today.
Adding an 11th means respecting the lazy-loading architecture — the one place in
this repo where a casual import causes real damage.

## When to Use

- Adding a new app shape to the catalog
- Editing an existing template's pages or default preset
- Don't use for: one-off screens (that's a page) or palette work (that's theming)

## The architecture — and why it matters

```
templates/
  types.ts      AppTemplate — the contract (pages, layout, preset, dataShape)
  manifest.ts   the CATALOG: display metadata only
                → no page imports, no components, tiny
  store.ts      which template is live (holds the LOADED object)
  catalog.ts    id → () => import('./x')   ← lazy loaders
  notes.tsx … finance.tsx   one file per template
```

`manifest.ts` feeds the gallery, which renders all previews at once. If it
imported template components, booting the app would pull every template's code
into the main bundle. **That is the whole reason this split exists.** Keep
`manifest.ts` metadata-only.

## Procedure

1. Create `src/renderer/src/templates/<name>.tsx` exporting an `AppTemplate`.
   Completion: it satisfies the `AppTemplate` type (`tsc` agrees).
2. Register the lazy loader in `catalog.ts` as `id: () => import('./<name>')`.
   Completion: the id maps to a function, not an imported value.
3. Add display metadata to `manifest.ts` — name, icon, description, **no imports
   of the template component**. Completion: `manifest.ts` gains no new `import`
   line pointing at a template file.
4. Declare the **`dataShape`** honestly: what the template does _not_ provide and
   the client must wire. Completion: `buildRecipe()` prints a useful
   implementation brief.
5. Pick a default preset from the decision table in `AGENTS.md`. Completion: the
   preset id exists and the template runs under any other preset too.
6. Verify: `npm test` (there is a `templates.test.ts`), `npm run typecheck`,
   then `npm start` and apply the template from the Apps page.

## Pitfalls

- **The cardinal sin:** importing a template into `manifest.ts`. It silently
  destroys the lazy-loading design and no test catches it.
- `dataShape` is a promise to the next developer. Writing "data" instead of the
  actual shape wastes their afternoon. Be specific: entities, key fields,
  relationships.
- A template ships **no backend**. It ships UI and structure; the data source is
  the client's. Never claim otherwise.
- Templates must survive every preset — don't bake a palette assumption into the
  page code.
- A template that duplicates an existing shape should extend that one instead.
  Check `docs/APP-TEMPLATES.md` first; it lists the evidence for each.

## Verification

`templates.test.ts` must stay green. Then in the running app: the new template
appears in the Apps gallery, applies without error, and `buildRecipe()` prints a
recipe naming your `dataShape`.
