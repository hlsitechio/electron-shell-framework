import { describe, expect, it, beforeEach } from 'vitest'
import { useTabsStore } from './tabs-store'

describe('tabs-store', () => {
  beforeEach(() => {
    useTabsStore.setState({ activeId: 'dashboard' })
  })

  it('starts on the first page', () => {
    expect(useTabsStore.getState().activeId).toBe('dashboard')
  })

  it('switches the active page', () => {
    const s = useTabsStore.getState()
    s.setActive('chat')
    expect(useTabsStore.getState().activeId).toBe('chat')
  })

  it('setActive replaces even on same id', () => {
    const s = useTabsStore.getState()
    s.setActive('dashboard')
    expect(useTabsStore.getState().activeId).toBe('dashboard')
  })
})
