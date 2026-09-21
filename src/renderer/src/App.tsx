import { TooltipProvider } from '@renderer/components/ui/tooltip'
import { AppShell } from '@renderer/components/shell/AppShell'
import { ThemeProvider } from '@renderer/components/theme/ThemeProvider'
import { PAGES } from '@renderer/pages/registry'
import { TemplatesPage } from '@renderer/pages/templates/TemplatesPage'
import { useTemplateStore, FRAMEWORK_ID } from '@renderer/templates'
import { applyTemplate } from '@renderer/lib/apps'
import { useTheme } from '@renderer/components/theme/ThemeProvider'
import { Sparkles } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import type { PageDefinition } from '@renderer/types/pages'

/**
 * The "Apps" page is injected into EVERY page set. Without it, applying a
 * template would be a one-way door: you could never get back to the
 * catalog to switch apps.
 */
const APPS_PAGE: PageDefinition = {
  id: 'apps',
  label: 'Apps',
  description: 'Browse app templates',
  category: 'Templates',
  icon: Sparkles,
  component: TemplatesPage,
  showInSidebar: false
}

function Shell() {
  const activeId = useTemplateStore((s) => s.activeId)
  const active = useTemplateStore((s) => s.active)
  const { setPreset } = useTheme()

  /**
   * A scaffolded app sets DEFAULT_TEMPLATE_ID (templates/default.ts) to its own
   * template, so the app boots straight into its screen instead of the demo.
   * Templates load lazily, so fetch it on first mount when the store only has
   * an id but no loaded template.
   */
  useEffect(() => {
    if (activeId !== FRAMEWORK_ID && !active) {
      void applyTemplate(activeId, { setPreset })
    }
  }, [activeId, active, setPreset])

  const pages = useMemo(() => [...(active ? active.pages : PAGES), APPS_PAGE], [active])

  return <AppShell pages={pages} />
}

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <Shell />
      </TooltipProvider>
    </ThemeProvider>
  )
}
