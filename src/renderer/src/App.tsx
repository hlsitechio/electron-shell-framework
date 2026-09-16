import { TooltipProvider } from '@renderer/components/ui/tooltip'
import { AppShell } from '@renderer/components/shell/AppShell'
import { ThemeProvider } from '@renderer/components/theme/ThemeProvider'
import { PAGES } from '@renderer/pages/registry'

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <AppShell pages={PAGES} />
      </TooltipProvider>
    </ThemeProvider>
  )
}
