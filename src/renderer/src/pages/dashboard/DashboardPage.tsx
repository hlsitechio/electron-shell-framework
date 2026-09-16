import { ExampleChart } from '@renderer/blocks/ExampleChart'
import { ExampleForm } from '@renderer/blocks/ExampleForm'
import {
  LayoutGrid,
  Moon,
  PanelLeft,
  PanelRight,
  PanelTop,
  Plus,
  Settings,
  Sun
} from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Card } from '@renderer/components/ui/card'
import { useTheme } from '@renderer/components/theme/ThemeProvider'
import { useTabsStore } from '@renderer/stores/tabs-store'
import { useUiStore } from '@renderer/stores/ui-store'

/**
 * Framework empty-stage. Consumer apps replace this with their real
 * dashboard — the shell ships neutral so nothing personal leaks.
 * Includes a quick-actions card so the framework controls live
 * INSIDE the dashboard content, not only in the outer frame.
 */
export function DashboardPage() {
  const { theme, toggleTheme } = useTheme()
  const { setActive } = useTabsStore()
  const {
    leftCollapsed,
    toggleLeft,
    rightOpen,
    toggleRight,
    tabsCollapsed,
    toggleTabs,
    bottomOpen,
    toggleBottom
  } = useUiStore()

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      {/* Quick actions — framework controls inside the dashboard */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Quick actions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Framework controls — wired to the same stores as the shell frame.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Button
            variant={theme === 'dark' ? 'secondary' : 'outline'}
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActive('settings')}
            className="w-full justify-start"
          >
            <Settings className="h-4 w-4" /> Settings
          </Button>
          <Button variant="outline" size="sm" onClick={toggleLeft} className="w-full justify-start">
            <PanelLeft className="h-4 w-4" /> {leftCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleRight}
            className="w-full justify-start"
          >
            <PanelRight className="h-4 w-4" /> {rightOpen ? 'Hide panel' : 'Show panel'}
          </Button>
          <Button variant="outline" size="sm" onClick={toggleTabs} className="w-full justify-start">
            <PanelTop className="h-4 w-4" /> {tabsCollapsed ? 'Expand tabs' : 'Collapse tabs'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleBottom}
            className="w-full justify-start"
          >
            <LayoutGrid className="h-4 w-4" /> {bottomOpen ? 'Close terminal' : 'Open terminal'}
          </Button>
        </div>
      </Card>

      {/* Framework blocks — copy & point at real data (recharts / zod+react-hook-form) */}
      <div className="grid gap-6">
        <Card className="p-5">
          <h2 className="text-sm font-semibold">Example chart</h2>
          <p className="mt-0.5 mb-3 text-xs text-muted-foreground">
            Recharts demo — follows the theme tokens (see src/renderer/src/blocks).
          </p>
          <ExampleChart />
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold">Example form</h2>
          <p className="mt-0.5 mb-3 text-xs text-muted-foreground">
            Zod + React Hook Form demo — typed validation out of the box.
          </p>
          <ExampleForm />
        </Card>
      </div>

      {/* Placeholder module */}
      <Card className="p-10 text-center">
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
          style={{ background: 'hsl(var(--accent) / 0.5)', color: 'hsl(var(--accent-foreground))' }}
        >
          <LayoutGrid className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold">Your module here</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This is the framework shell. Register your own page in{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            src/renderer/src/pages/registry.tsx
          </code>{' '}
          and it renders here — dashboard, chat, tools, anything.
        </p>
        <Button size="sm" className="mt-6" variant="outline">
          <Plus className="h-4 w-4" /> Add a page
        </Button>
      </Card>
    </div>
  )
}
