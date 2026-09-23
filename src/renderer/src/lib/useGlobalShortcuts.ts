import { useEffect } from 'react'
import { useTabsStore } from '@renderer/stores/tabs-store'
import { useUiStore } from '@renderer/stores/ui-store'
import { useCockpitStore } from '@renderer/stores/cockpit-store'

interface UseGlobalShortcutsOptions {
  onTogglePalette: () => void
}

const TAB_SHORTCUTS: Record<string, string> = {
  Digit1: 'repos',
  Digit2: 'github',
  Digit3: 'worktrees',
  Digit4: 'builds',
  Digit5: 'pull-requests',
  Digit6: 'ci'
}

export function useGlobalShortcuts({ onTogglePalette }: UseGlobalShortcutsOptions): void {
  const { setActive } = useTabsStore()
  const { toggleBottom, toggleLeft } = useUiStore()
  const { refresh } = useCockpitStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey
      if (!isCtrlOrCmd) return

      const target = e.target as HTMLElement | null
      const isInput =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

      // 1. Ctrl+K -> Command Palette (always trigger)
      if (e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onTogglePalette()
        return
      }

      // 2. Ctrl+` -> Toggle Bottom Terminal (always trigger)
      if (e.key === '`' || e.code === 'Backquote') {
        e.preventDefault()
        toggleBottom()
        return
      }

      // 3. Ctrl+B -> Toggle Left Sidebar
      if (e.key.toLowerCase() === 'b' && !isInput) {
        e.preventDefault()
        toggleLeft()
        return
      }

      // 4. Ctrl+R -> Git Rescan Workspace
      if (e.key.toLowerCase() === 'r' && !isInput) {
        e.preventDefault()
        void refresh(false)
        return
      }

      // 5. Ctrl+1..6 -> Quick Tab Switching
      if (TAB_SHORTCUTS[e.code] && !isInput) {
        e.preventDefault()
        setActive(TAB_SHORTCUTS[e.code])
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onTogglePalette, setActive, toggleBottom, toggleLeft, refresh])
}
