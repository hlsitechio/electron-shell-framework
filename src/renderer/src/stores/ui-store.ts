import { create } from 'zustand'

export type SidebarMode = 'expanded' | 'collapsed'

interface UiState {
  leftCollapsed: boolean
  rightOpen: boolean
  rightWidth: number
  leftWidth: number
  tabsCollapsed: boolean
  bottomOpen: boolean
  toggleLeft: () => void
  setLeftCollapsed: (v: boolean) => void
  toggleRight: () => void
  setRightOpen: (v: boolean) => void
  setLeftWidth: (w: number) => void
  setRightWidth: (w: number) => void
  toggleTabs: () => void
  setTabsCollapsed: (v: boolean) => void
  toggleBottom: () => void
}

export const useUiStore = create<UiState>((set) => ({
  leftCollapsed: false,
  rightOpen: true,
  rightWidth: 260,
  leftWidth: 220,
  tabsCollapsed: false,
  bottomOpen: true,
  toggleLeft: () => set((s) => ({ leftCollapsed: !s.leftCollapsed })),
  setLeftCollapsed: (v) => set({ leftCollapsed: v }),
  toggleRight: () => set((s) => ({ rightOpen: !s.rightOpen })),
  setRightOpen: (v) => set({ rightOpen: v }),
  setLeftWidth: (w) => set({ leftWidth: Math.min(320, Math.max(150, w)) }),
  setRightWidth: (w) => set({ rightWidth: Math.min(420, Math.max(240, w)) }),
  toggleTabs: () => set((s) => ({ tabsCollapsed: !s.tabsCollapsed })),
  setTabsCollapsed: (v) => set({ tabsCollapsed: v }),
  toggleBottom: () => set((s) => ({ bottomOpen: !s.bottomOpen }))
}))

/* --------------------------------------------------------------- persistence */

/**
 * Layout survives a restart.
 *
 * The app already persists window bounds, opacity, theme and preset through the
 * encrypted config — but layout was memory-only, so every launch reset the
 * workspace the user had arranged (which panel was open, how wide the sidebars
 * were). This is a storage adapter around the store, not a redesign: reads happen
 * once at boot, writes are debounced.
 */
const LAYOUT_KEY = 'settings:layout'
const WRITE_DEBOUNCE_MS = 400

interface PersistedLayout {
  leftCollapsed: boolean
  rightOpen: boolean
  rightWidth: number
  leftWidth: number
  tabsCollapsed: boolean
  bottomOpen: boolean
}

function snapshotLayout(state: UiState): PersistedLayout {
  return {
    leftCollapsed: state.leftCollapsed,
    rightOpen: state.rightOpen,
    rightWidth: state.rightWidth,
    leftWidth: state.leftWidth,
    tabsCollapsed: state.tabsCollapsed,
    bottomOpen: state.bottomOpen
  }
}

let layoutHydrated = false

/** Load the stored layout into the live store. Called once, before first paint. */
export async function hydrateLayout(): Promise<void> {
  if (layoutHydrated) return
  layoutHydrated = true
  try {
    const stored = await window.api?.config?.get?.(LAYOUT_KEY)
    if (!stored || typeof stored !== 'object') return
    const raw = stored as Partial<PersistedLayout>
    const patch: Partial<UiState> = {}
    // Only adopt values that are the right shape — a corrupt key must not blank
    // the UI or set a zero-width sidebar.
    if (typeof raw.leftCollapsed === 'boolean') patch.leftCollapsed = raw.leftCollapsed
    if (typeof raw.rightOpen === 'boolean') patch.rightOpen = raw.rightOpen
    if (typeof raw.tabsCollapsed === 'boolean') patch.tabsCollapsed = raw.tabsCollapsed
    if (typeof raw.bottomOpen === 'boolean') patch.bottomOpen = raw.bottomOpen
    if (typeof raw.leftWidth === 'number' && raw.leftWidth >= 150 && raw.leftWidth <= 320)
      patch.leftWidth = Math.round(raw.leftWidth)
    if (typeof raw.rightWidth === 'number' && raw.rightWidth >= 240 && raw.rightWidth <= 420)
      patch.rightWidth = Math.round(raw.rightWidth)
    useUiStore.setState(patch)
  } catch {
    /* no stored layout — framework defaults are fine */
  } finally {
    armLayoutPersistence()
  }
}

let writeTimer: ReturnType<typeof setTimeout> | null = null
/** Set once hydration has finished applying the stored layout. */
let layoutReady = false

useUiStore.subscribe((state) => {
  // Nothing may be written until the stored layout has been READ and applied.
  // Subscribing before that would persist whatever transient state the first
  // renders produced — which silently overwrote a stored value that the user
  // never changed (the terminal panel came back collapsed after a restart for
  // exactly this reason).
  if (!layoutReady) return
  if (writeTimer) clearTimeout(writeTimer)
  writeTimer = setTimeout(() => {
    try {
      void window.api?.config?.set?.(LAYOUT_KEY, snapshotLayout(state))
    } catch {
      /* storage unavailable — layout stays in memory */
    }
  }, WRITE_DEBOUNCE_MS)
})

/** Called by hydrateLayout once the stored values are applied. */
export function armLayoutPersistence(): void {
  layoutReady = true
}
