import { TooltipProvider } from '@renderer/components/ui/tooltip'
import { AppShell } from '@renderer/components/shell/AppShell'
import { ThemeProvider, useTheme } from '@renderer/components/theme/ThemeProvider'
import { PAGES } from '@renderer/pages/registry'
import { ErrorBoundary } from '@renderer/components/ErrorBoundary'
import { CockpitTerminal } from '@renderer/pages/cockpit/CockpitTerminal'
import { CockpitLogRail } from '@renderer/pages/cockpit/CockpitLogRail'
import { useCockpitStore } from '@renderer/stores/cockpit-store'
import { useEffect } from 'react'

/**
 * Repo Cockpit.
 *
 * The shell is used exactly as the framework intends: pages come from the
 * registry, and the two dock regions are filled through `AppShell` slots —
 *  - `bottomDock` → the real PTY terminal (one shell per repo)
 *  - `rightDock`  → the activity/notify rail fed by main-process events
 *
 * Nothing under components/shell was rewritten to make this app work; the only
 * shell edits are the two optional slot props, which default to the previous
 * behaviour when an app does not pass them.
 */

function Cockpit() {
  const init = useCockpitStore((s) => s.init)
  const refresh = useCockpitStore((s) => s.refresh)

  // Subscribe to main, then pull the first snapshot. `init` returns its own
  // unsubscribe, so a strict-mode double-mount cannot double-subscribe.
  useEffect(() => {
    const unsubscribe = init()
    void refresh(false)
    return unsubscribe
  }, [init, refresh])

  return (
    <ErrorBoundary label="cockpit">
      <AppShell
        pages={PAGES}
        title="Repo Cockpit"
        slots={{
          bottomDock: <CockpitTerminal />,
          rightDock: <CockpitLogRail />
        }}
      />
    </ErrorBoundary>
  )
}

/**
 * Preset chosen for an instrument-panel feel: `poiesis-blue` (cold steel-blue,
 * the framework's own preset for monitoring and developer tools). It is a
 * stored preference, so switching presets in Themes sticks across launches.
 */
const COCKPIT_PRESET = 'poiesis-blue'

function Boot() {
  const { setPreset, setTheme } = useTheme()

  // Adopt the app's preset and dark mode only when the user has no stored
  // choice — `localStorage` is written by ThemeProvider on every change, so a
  // real preference always wins. Also applied from the encrypted config on
  // boot, which is what the ThemeProvider reads first.
  useEffect(() => {
    const api = window.api
    void Promise.all([
      api?.config?.get?.('theme') ?? Promise.resolve(null),
      api?.config?.get?.('theme:preset') ?? Promise.resolve(null)
    ])
      .then(([storedTheme, storedPreset]) => {
        if (!storedTheme) setTheme('dark')
        if (!storedPreset) setPreset(COCKPIT_PRESET)
      })
      .catch(() => {
        /* config unavailable — framework defaults are fine */
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Cockpit />
}

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <Boot />
      </TooltipProvider>
    </ThemeProvider>
  )
}
