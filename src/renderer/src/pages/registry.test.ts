import { describe, expect, it } from 'vitest'
import { PAGES } from './registry'

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

  it('the dashboard is the default landing page', () => {
    expect(PAGES[0].id).toBe('dashboard')
  })

  it('settings is hidden from the sidebar but registered', () => {
    const settings = PAGES.find((p) => p.id === 'settings')
    expect(settings).toBeDefined()
    expect(settings?.showInSidebar).toBe(false)
  })
})
