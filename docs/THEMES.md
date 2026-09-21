# Themes — 10 ready-made app shells

Every preset defines a **dark and a light** token set. A preset is a layer on top
of the mode, not a replacement for it:

```html
<html data-theme="dark" data-preset="shadow-peonies"></html>
```

- base tokens → `src/renderer/src/styles/theme.css`
- presets → `src/renderer/src/styles/presets.css`
- metadata → `src/renderer/src/lib/presets.ts`

Presets are selectable at runtime from **Settings → Appearance** or the
**Themes** page, and the choice persists (encrypted config store, with a
`localStorage` mirror).

## The 10

| id                | Name            | Mood                    | Best for                                  |
| ----------------- | --------------- | ----------------------- | ----------------------------------------- |
| `muted-violet`    | Muted Violet    | calm, premium, violet   | AI chat, SaaS dashboards, general purpose |
| `noguchi`         | Noguchi         | neutral, editorial      | data dashboards, admin panels, documents  |
| `poiesis-purple`  | Poiesis Purple  | moody, artistic, plum   | creative tools, media galleries, music    |
| `midnight-purple` | Midnight Purple | dramatic, deep          | app heroes, launch screens, analytics     |
| `poiesis-blue`    | Poiesis Blue    | technical, cool         | monitoring, infra tools, logs             |
| `winter-woods`    | Winter Woods    | quiet, desaturated      | writing, reading, long-form, focus        |
| `shadow-peonies`  | Shadow Peonies  | soft, navy, atmospheric | chat, communities, AI agents              |
| `dark-indigo`     | Dark Indigo     | corporate, trustworthy  | B2B, finance, enterprise dashboards       |
| `frost`           | Frost           | airy, glass, daylight   | productivity, note apps, light-first UI   |
| `carbon`          | Carbon          | monochrome, tool        | terminal tools, code editors, utilities   |

Full descriptions, `mood`, `bestFor` and provenance (`source`) live in
`src/renderer/src/lib/presets.ts` — read that file, it is the machine-readable
version of this table.

## Provenance

The ramps are derived from Hubert's color stack (`COLORS.md`), which is the
source of truth for color decisions: Palette 00 Noguchi, 01 Poiesis Purple Rocks,
02 Midnight Purple, 03 Poiesis Blue Scales, 04 Winter Woods, 05 Shadow Peonies,
06 Pantone Dark Indigo — plus the approved muted violet accent ramp
(`#7d6bc9 → #5a4d9e → #3d4a85`) for the default, and the glass/gloss rules for
Frost and Carbon.

## Contrast

Every preset is contrast-checked in both modes at generation time. Measured
minimums across all 20 token sets:

| pair                         | target | worst measured |
| ---------------------------- | ------ | -------------- |
| text on page background      | 7.0    | 14.9           |
| secondary text on background | 4.5    | 5.5            |
| text on card                 | 7.0    | 9.7            |
| button label on primary      | 3.0    | 4.3            |
| sidebar text on sidebar      | 7.0    | 15.3           |

120 checks total, all passing. If you change a ramp, re-run the report — do not
eyeball a hex value.

## Adding a preset

1. Add an entry to the `THEMES` list in the generator (it holds the key roles:
   `bg`, `card`, `fg`, `muted`, `primary`, `accent`, `border`, status colors,
   5 chart colors, glass tint, glow).
2. Regenerate `presets.css` — the remaining ~35 tokens per mode are derived
   (secondary/muted/accent surfaces, borders, inputs, topbar, tab states,
   sidebar surfaces) so a preset stays internally consistent.
3. Add the matching metadata to `lib/presets.ts` (`PRESETS`).
4. `npm test` — `lib/presets.test.ts` asserts there are exactly ten and that
   every entry carries the full contract.
5. Check contrast. Every pair must clear its target before the preset ships.

## Token contract

A preset block overrides these tokens (HSL triplets — `hsl(var(--x))` at use site):

```
background foreground  card card-foreground  popover popover-foreground
primary primary-foreground  secondary secondary-foreground
muted muted-foreground  accent accent-foreground
destructive destructive-foreground  border input ring card-border
sidebar-bg sidebar-fg sidebar-muted sidebar-accent sidebar-border
topbar-bg tab-active-bg tab-active-fg tab-hover-bg
rightpanel-bg rightpanel-border content-bg
success warning info terra  chart-1 … chart-5
```

Plus four non-color variables that carry the visual treatment:

```
--glass-tint     translucent panel fill        (rgba)
--glass-border   hairline border for glass     (rgba)
--gloss          top gloss sweep gradient
--accent-grad    the accent gradient used by buttons, chips, bars, numbers
```

`--gloss` and `--accent-grad` are what separate a layered surface from a flat
fill — if a new component looks "plain", it is almost always missing them.

## Live inspector

The **Themes** page (`src/renderer/src/pages/themes/ThemesPage.tsx`) renders a
token inspector that reads `getComputedStyle` on `<html>` and subscribes to
`data-preset` / `data-theme` mutations. It shows the real resolved values for the
active preset, so you can verify what the cascade actually produced instead of
trusting the source file.
