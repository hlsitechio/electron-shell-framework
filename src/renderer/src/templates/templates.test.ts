import { describe, expect, it } from 'vitest'
import {
  CATALOG,
  getMeta,
  isLoadable,
  loadableCatalog,
  loadTemplate,
  resolveTemplateId
} from './catalog'
import { PRESETS, isPresetId } from '@renderer/lib/presets'
import { getPageLabel } from '@renderer/types/pages'

describe('template catalog', () => {
  it('lists exactly eleven templates', () => {
    expect(CATALOG.length).toBe(11)
  })

  it('has unique ids', () => {
    const ids = CATALOG.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every catalog entry carries the full display contract', () => {
    for (const t of CATALOG) {
      expect(t.id).toMatch(/^[a-z][a-z0-9-]*$/)
      expect(t.name.length).toBeGreaterThan(0)
      expect(t.tagline.length).toBeGreaterThan(0)
      expect(t.ask.length).toBeGreaterThan(0)
      expect(t.evidence.length).toBeGreaterThan(0)
      expect(t.pageCount).toBeGreaterThanOrEqual(2)
      expect(t.icon !== null && (typeof t.icon === 'function' || typeof t.icon === 'object')).toBe(
        true
      )
    }
  })

  it('every catalog entry pairs with a real color preset', () => {
    for (const t of CATALOG) {
      expect(isPresetId(t.preset)).toBe(true)
      expect(PRESETS.some((p) => p.id === t.preset)).toBe(true)
    }
  })

  it('every catalog entry has code behind it (no stale entries)', () => {
    expect(loadableCatalog().length).toBe(CATALOG.length)
    for (const t of CATALOG) expect(isLoadable(t.id)).toBe(true)
  })

  it('the catalog does NOT import template code', async () => {
    // display metadata must stay lightweight — loading it must not pull pages in
    const mod = await import('./manifest')
    expect(Object.keys(mod)).toContain('CATALOG')
    expect(Object.keys(mod)).not.toContain('notesTemplate')
  })

  it('getMeta resolves by id and returns null otherwise', () => {
    expect(getMeta('notes')?.name).toBe('Notes')
    expect(getMeta('nope')).toBeNull()
  })
})

describe('free-text resolution (the client sentence)', () => {
  const cases: Array<[string, string]> = [
    ['build me a financial dashboard', 'finance'],
    ['I need a financial dashboard for a client', 'finance'],
    ['a budget tracker', 'finance'],
    ['an admin dashboard with KPIs', 'dashboard'],
    ['a chat app', 'chat'],
    ['kanban board for the team', 'tasks'],
    ['code editor', 'editor'],
    ['database gui', 'devtools'],
    ['rss reader', 'reader'],
    ['notes app with markdown', 'notes'],
    ['all-in-one wrapper for gmail', 'workspace'],
    ['media player', 'media'],
    ['ai writing studio', 'writer'],
    ['manuscript editor', 'writer']
  ]

  it.each(cases)('"%s" → %s', (query, expected) => {
    expect(resolveTemplateId(query)).toBe(expected)
  })

  it('returns null for nonsense', () => {
    expect(resolveTemplateId('qwertyuiop')).toBeNull()
  })
})

describe('lazy loading', () => {
  it('loads a template on demand and caches it', async () => {
    const a = await loadTemplate('notes')
    expect(a?.id).toBe('notes')
    expect(a?.pages.length).toBeGreaterThanOrEqual(2)

    const b = await loadTemplate('notes')
    expect(b).toBe(a) // cached — same object reference
  }, 20000)

  it('every loadable template loads with a valid app contract', async () => {
    for (const meta of CATALOG) {
      const t = await loadTemplate(meta.id)
      expect(t).not.toBeNull()
      expect(t!.id).toBe(meta.id)
      expect(t!.preset).toBe(meta.preset) // catalog and code agree
      expect(t!.pages.length).toBe(meta.pageCount) // and on the page count
      expect(t!.pages.some((p) => p.id === t!.home)).toBe(true)
      expect(t!.dataShape.length).toBeGreaterThan(0)
      expect(t!.extendWith.length).toBeGreaterThan(0)
      for (const page of t!.pages) {
        const label = getPageLabel(page)
        expect(typeof label).toBe('string')
        expect(label.trim().length).toBeGreaterThan(0)
        expect(
          page.icon !== null && (typeof page.icon === 'function' || typeof page.icon === 'object')
        ).toBe(true)
      }
    }
  })

  it('unknown ids resolve to null instead of throwing', async () => {
    expect(await loadTemplate('does-not-exist')).toBeNull()
  })
})
