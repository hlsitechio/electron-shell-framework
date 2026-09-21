import { describe, expect, it, beforeEach } from 'vitest'
import {
  DEFAULT_PRESET,
  PRESETS,
  applyPreset,
  getActivePreset,
  getPreset,
  isPresetId
} from './presets'

describe('theme presets', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-preset')
  })

  it('ships exactly ten presets', () => {
    expect(PRESETS.length).toBe(10)
  })

  it('has unique ids', () => {
    const ids = PRESETS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every preset carries the full metadata contract', () => {
    for (const p of PRESETS) {
      expect(typeof p.id).toBe('string')
      expect(p.id).toMatch(/^[a-z][a-z0-9-]*$/)
      expect(typeof p.name).toBe('string')
      expect(p.tagline.length).toBeGreaterThan(0)
      expect(p.description.length).toBeGreaterThan(0)
      expect(p.bestFor.length).toBeGreaterThan(0)
      expect(typeof p.source).toBe('string')
    }
  })

  it('the default preset exists', () => {
    expect(isPresetId(DEFAULT_PRESET)).toBe(true)
  })

  it('applies a preset to the document root', () => {
    applyPreset('carbon')
    expect(document.documentElement.getAttribute('data-preset')).toBe('carbon')
    expect(getActivePreset()).toBe('carbon')
  })

  it('falls back to the default for unknown ids', () => {
    applyPreset('does-not-exist')
    expect(document.documentElement.getAttribute('data-preset')).toBe(DEFAULT_PRESET)
  })

  it('getPreset never returns undefined', () => {
    expect(getPreset('nope').id).toBe(DEFAULT_PRESET)
    expect(getPreset('noguchi').name).toBe('Noguchi')
  })
})
