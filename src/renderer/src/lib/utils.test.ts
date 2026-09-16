import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn (class merge)', () => {
  it('joins plain classes', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('merges tailwind conflicts — last wins', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('filters falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b')
  })

  it('handles conditional objects', () => {
    expect(cn('base', { 'is-active': true, 'is-gone': false })).toBe('base is-active')
  })
})
