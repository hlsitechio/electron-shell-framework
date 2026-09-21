import { TooltipProvider } from '@renderer/components/ui/tooltip'
import { AppShell } from '@renderer/components/shell/AppShell'
import { ThemeProvider } from '@renderer/components/theme/ThemeProvider'
import { PAGES } from '@renderer/pages/registry'
import { TemplatesPage } from '@renderer/pages/templates/TemplatesPage'
import { useTemplateStore } from '@renderer/templates'
import { Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import type { PageDefinition } from '@renderer/types/pages'

/**
 * The "Apps" page is injected into EVERY page set. Without it, applying a
 * template would be a one-way door: you could never get back to the
 * catalog to switch apps.
 *
 * It stays out of the sidebar (the template owns that space) and lives in
 * the tab bar under its own category.
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

/**
 * Page set resolution:
 *
 *   active template loaded → that template's pages + the Apps switcher
 *   otherwise              → the framework demo registry
 *
 * Templates load lazily, so this reads the loaded object from the store
 * rather than importing every template up front.
 */
function useActivePages(): PageDefinition[] {
  const active = useTemplateStore((s) => s.active)
  return useMemo(() => [...(active ? active.pages : PAGES), APPS_PAGE], [active])
}

function Shell() {
  const pages = useActivePages()
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
