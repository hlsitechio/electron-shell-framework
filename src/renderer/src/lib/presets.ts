/**
 * Theme presets — the 10 ready-made app shells.
 *
 * A preset is a layer ON TOP of the light/dark mode, not a replacement
 * for it: every preset defines BOTH a dark and a light token set in
 * `styles/presets.css`. Both attributes are always applied together:
 *
 *   <html data-theme="dark" data-preset="muted-violet">
 *
 * This file is metadata only — zero runtime cost, no React import, so it
 * is safe to import from anywhere (including tests). Colors live in CSS.
 */

export interface ThemePreset {
  id: string
  name: string
  /** one-line summary (used in the picker) */
  tagline: string
  /** 2-3 sentences for the AI agent contract and the docs */
  description: string
  mood: string
  bestFor: string[]
  /** where the ramp comes from — provenance, not marketing */
  source: string
}

export const PRESETS: ThemePreset[] = [
  {
    id: 'muted-violet',
    name: 'Muted Violet',
    tagline: 'Default. Muted deep violet-blue, zero neon.',
    description:
      'The house default: muted deep violet-blue accents over near-black violet surfaces. No neon, no flat fills \u2014 glass surfaces with layered gloss. Use it when you want the shell to feel premium and calm.',
    mood: 'calm, premium, violet',
    bestFor: ['AI chat apps', 'SaaS dashboards', 'client work', 'general purpose'],
    source: 'Hubert approved accent ramp #7d6bc9 -> #5a4d9e -> #3d4a85'
  },
  {
    id: 'noguchi',
    name: 'Noguchi',
    tagline: 'Instead-of-black neutrals with a violet-gray cast.',
    description:
      "Built on the Noguchi 'instead of black' ramp: Mirage background, Oxford Blue surfaces, violet-gray hairlines. Neutral enough for data-dense interiors, warm enough to avoid the default-gray look.",
    mood: 'neutral, editorial, restrained',
    bestFor: ['data dashboards', 'admin panels', 'documents', 'internal tools'],
    source: 'COLORS.md Palette 00 \u2014 Noguchi instead-of-black'
  },
  {
    id: 'poiesis-purple',
    name: 'Poiesis Purple',
    tagline: 'Dark violet rocks \u2014 deepest background in the set.',
    description:
      'Sampled from the Poiesis purple-rocks palette: a near-black violet floor, plum surfaces and a muted violet accent. The moodiest preset \u2014 best for creative and media app shells.',
    mood: 'moody, artistic, plum',
    bestFor: ['creative tools', 'media galleries', 'music apps', 'portfolios'],
    source: 'COLORS.md Palette 01 \u2014 Poiesis Purple Rocks'
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    tagline: 'Deep purple hero surfaces, high drama.',
    description:
      'Anchored on Midnight Purple #2E1A47: purple hero panels over a black-plum page. Punchier than Muted Violet without ever going neon \u2014 good for landing-style in-app heroes and marketing-adjacent screens.',
    mood: 'dramatic, deep, luxurious',
    bestFor: ['app heroes', 'launch screens', 'analytics', 'chat'],
    source: 'COLORS.md Palette 02 \u2014 Midnight Purple #2E1A47'
  },
  {
    id: 'poiesis-blue',
    name: 'Poiesis Blue',
    tagline: 'Metallic blue scales, cold and precise.',
    description:
      "From the Poiesis blue-scales palette: blue-black floor, steel-blue surfaces, light blue-gray highlights. The most 'instrument panel' of the presets \u2014 reads as technical without being sterile.",
    mood: 'technical, cool, precise',
    bestFor: ['monitoring', 'infrastructure tools', 'logs', 'developer apps'],
    source: 'COLORS.md Palette 03 \u2014 Poiesis Blue Scales'
  },
  {
    id: 'winter-woods',
    name: 'Winter Woods',
    tagline: 'Snowy night forest \u2014 desaturated steel blue.',
    description:
      'The Winter Woods ramp: deepest blue-black page, layered blue surfaces, a single steel-blue highlight. Extremely low chroma \u2014 ideal when the content is the color and the shell should disappear.',
    mood: 'quiet, cold, desaturated',
    bestFor: ['writing apps', 'reading', 'long-form', 'focus tools'],
    source: 'COLORS.md Palette 04 \u2014 Winter Woods'
  },
  {
    id: 'shadow-peonies',
    name: 'Shadow Peonies',
    tagline: 'Navy-to-blue-violet floral ramp.',
    description:
      'The Shadow Peonies ramp: near-black navy, mid navy surfaces, blue-violet highlights. Sits between Poiesis Blue and Muted Violet \u2014 the most balanced blue-violet preset.',
    mood: 'soft, navy, atmospheric',
    bestFor: ['chat', 'communities', 'dashboards', 'AI agents'],
    source: 'COLORS.md Palette 05 \u2014 Shadow Peonies'
  },
  {
    id: 'dark-indigo',
    name: 'Dark Indigo',
    tagline: 'Pantone 19-3922 \u2014 institutional indigo.',
    description:
      "Centred on Pantone Dark Indigo #111837. Indigo is the most 'corporate-trust' hue in the set: enterprise-safe, still clearly in the violet-blue family. Good default for B2B shells.",
    mood: 'corporate, trustworthy, indigo',
    bestFor: ['B2B apps', 'finance', 'enterprise dashboards', 'reports'],
    source: 'COLORS.md Palette 06 \u2014 Pantone 19-3922 TCX'
  },
  {
    id: 'frost',
    name: 'Frost',
    tagline: 'Light-first glass \u2014 high transparency, layered gloss.',
    description:
      'The only light-first preset: a cool near-white page, translucent white glass panels and violet-blue accents. Built for the layered-gloss treatment \u2014 surfaces stack translucently instead of sitting flat.',
    mood: 'airy, glass, daylight',
    bestFor: ['productivity apps', 'note apps', 'dashboards in daylight', 'premium light UI'],
    source: 'Hubert glass/gloss rules \u2014 translucent stacking, light-first'
  },
  {
    id: 'carbon',
    name: 'Carbon',
    tagline: 'Monochrome neutral \u2014 the shell disappears.',
    description:
      'Pure neutral ramp (Cod Gray floor, Mine Shaft surfaces) with a single subtle accent. No hue at all: for terminal-style tools, code editors and anything where the app supplies its own color.',
    mood: 'monochrome, tool, terminal',
    bestFor: ['terminal tools', 'code editors', 'logs', 'utilities'],
    source: 'COLORS.md Palette 00 \u2014 Cod Gray / Mine Shaft neutrals'
  }
]

export const DEFAULT_PRESET = 'muted-violet'

const BY_ID = new Map(PRESETS.map((p) => [p.id, p]))

export function isPresetId(value: unknown): value is string {
  return typeof value === 'string' && BY_ID.has(value)
}

export function getPreset(id: string): ThemePreset {
  return BY_ID.get(id) ?? BY_ID.get(DEFAULT_PRESET)!
}

/** Applies a preset to <html>. Ignores unknown ids (never blanks the UI). */
export function applyPreset(id: string): void {
  const safe = isPresetId(id) ? id : DEFAULT_PRESET
  document.documentElement.setAttribute('data-preset', safe)
}

/** Reads the current preset from the DOM (attribute is the source of truth). */
export function getActivePreset(): string {
  const attr = document.documentElement.getAttribute('data-preset')
  return isPresetId(attr) ? attr : DEFAULT_PRESET
}
