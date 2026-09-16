import { describe, expect, it, beforeEach } from 'vitest'
import { useUiStore } from './ui-store'

describe('ui-store', () => {
  beforeEach(() => {
    useUiStore.setState({
      leftCollapsed: false,
      rightOpen: true,
      rightWidth: 260,
      leftWidth: 220,
      tabsCollapsed: false,
      bottomOpen: false
    })
  })

  it('toggles the left sidebar', () => {
    const s = useUiStore.getState()
    s.toggleLeft()
    expect(useUiStore.getState().leftCollapsed).toBe(true)
    s.toggleLeft()
    expect(useUiStore.getState().leftCollapsed).toBe(false)
  })

  it('toggles the right panel', () => {
    useUiStore.getState().toggleRight()
    expect(useUiStore.getState().rightOpen).toBe(false)
  })

  it('toggles tabs and bottom panel', () => {
    useUiStore.getState().toggleTabs()
    expect(useUiStore.getState().tabsCollapsed).toBe(true)
    useUiStore.getState().toggleBottom()
    expect(useUiStore.getState().bottomOpen).toBe(true)
  })

  it('clamps widths to the allowed range', () => {
    useUiStore.getState().setLeftWidth(10)
    expect(useUiStore.getState().leftWidth).toBe(150)

    useUiStore.getState().setLeftWidth(999)
    expect(useUiStore.getState().leftWidth).toBe(320)

    useUiStore.getState().setRightWidth(50)
    expect(useUiStore.getState().rightWidth).toBe(240)

    useUiStore.getState().setRightWidth(5000)
    expect(useUiStore.getState().rightWidth).toBe(420)
  })
})
