import { describe, expect, it } from 'vitest'
import { BUNDLED_SVGL_NAMES, getBundledSvgl, normalizeSvglName, svgl } from './svgl'

describe('svgl (https://svgl.app) native integration', () => {
  it('normalizes icon names and slugs properly', () => {
    expect(normalizeSvglName('Electron')).toBe('electron')
    expect(normalizeSvglName('Tailwind CSS')).toBe('tailwindcss')
    expect(normalizeSvglName('svgl:github')).toBe('github')
    expect(normalizeSvglName('svgl/react')).toBe('react')
  })

  it('exposes bundled offline SVGL icons with non-empty SVG markup', () => {
    for (const name of BUNDLED_SVGL_NAMES) {
      const darkSvg = getBundledSvgl(name, 'dark')
      expect(typeof darkSvg).toBe('string')
      expect(darkSvg).toContain('<svg')
      expect(darkSvg).toContain('</svg>')

      const lightSvg = getBundledSvgl(name, 'light')
      expect(typeof lightSvg).toBe('string')
      expect(lightSvg).toContain('<svg')
    }
  })

  it('returns official Electron SVG from svgl.app for default framework brand', () => {
    const electronSvg = getBundledSvgl('electron')
    expect(electronSvg).not.toBeNull()
    expect(electronSvg).toContain('viewBox="0 0 128 128"')
  })

  it('provides theme-specific SVGL variants for dual-mode logos', () => {
    const ghDark = getBundledSvgl('github', 'dark')
    const ghLight = getBundledSvgl('github', 'light')
    expect(ghDark).not.toBeNull()
    expect(ghLight).not.toBeNull()
    // Light and dark variants differ in fill/color definition
    expect(ghDark).not.toBe(ghLight)
  })

  it('svgl() factory creates a React component with valid displayName', () => {
    const ElectronIcon = svgl('electron')
    expect(typeof ElectronIcon).toBe('function')
    expect(ElectronIcon.displayName).toBe('Svgl(electron)')
  })
})
