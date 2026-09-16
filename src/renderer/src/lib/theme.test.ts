import { describe, expect, it, beforeEach } from 'vitest'
import { DEFAULT_THEME, applyTheme, getStoredTheme } from './theme'

describe('theme helpers', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('defaults to dark', () => {
    expect(DEFAULT_THEME).toBe('dark')
    expect(getStoredTheme()).toBe('dark')
  })

  it('reads a stored theme', () => {
    localStorage.setItem('shell:theme', 'light')
    expect(getStoredTheme()).toBe('light')
  })

  it('ignores garbage values', () => {
    localStorage.setItem('shell:theme', 'blue')
    expect(getStoredTheme()).toBe('dark')
  })

  it('applies the theme to the document root', () => {
    applyTheme('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })
})
