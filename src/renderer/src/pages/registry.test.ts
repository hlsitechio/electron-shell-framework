import { describe, expect, it } from 'vitest'
import { PAGES } from './registry'
import { getPageLabel } from '@renderer/types/pages'

describe('page registry', () => {
  it('exposes at least the four framework pages', () => {
    expect(PAGES.length).toBeGreaterThanOrEqual(4)
  })

  it('has unique ids', () => {
    const ids = PAGES.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every page has the shell contract (id, label, icon, component)', () => {
    for (const p of PAGES) {
      expect(typeof p.id).toBe('string')
      expect(typeof p.label).toBe('string')
      // React component refs are objects (forwardRef/memo) or functions
      expect(p.icon !== null && (typeof p.icon === 'function' || typeof p.icon === 'object')).toBe(
        true
      )
      expect(typeof p.component).toBe('function')
    }
  })

  it('the first registered page is the default landing page', () => {
    // A consumer app replaces this array wholesale (see the registry doc
    // comment), so asserting a specific id like 'dashboard' would fail for
    // every app built on the framework. What actually has to hold is that the
    // array is non-empty and its head is a fully-formed page — the shell routes
    // an unknown active id to `pages[0]`.
    expect(PAGES.length).toBeGreaterThan(0)
    expect(typeof PAGES[0].id).toBe('string')
    expect(PAGES[0].id.length).toBeGreaterThan(0)
  })

  it('settings is hidden from the sidebar but registered', () => {
    const settings = PAGES.find((p) => p.id === 'settings')
    expect(settings).toBeDefined()
    expect(settings?.showInSidebar).toBe(false)
  })

  it('every page has a non-empty label for control accessible name (collapsed sidebar invariant)', () => {
    for (const p of PAGES) {
      const label = getPageLabel(p)
      expect(typeof label).toBe('string')
      expect(label.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('getPageLabel automatic derivation', () => {
  it('returns explicit label when provided', () => {
    expect(getPageLabel({ id: 'dash', label: 'Custom Dashboard' })).toBe('Custom Dashboard')
  })

  it('automatically derives capitalized label from single-word id when label is omitted or empty', () => {
    expect(getPageLabel({ id: 'analytics' })).toBe('Analytics')
    expect(getPageLabel({ id: 'billing', label: '' })).toBe('Billing')
    expect(getPageLabel({ id: 'settings', label: '   ' })).toBe('Settings')
  })

  it('automatically formats kebab-case and snake_case ids into human-readable words', () => {
    expect(getPageLabel({ id: 'user-profile' })).toBe('User Profile')
    expect(getPageLabel({ id: 'system_health_monitor' })).toBe('System Health Monitor')
  })
})
