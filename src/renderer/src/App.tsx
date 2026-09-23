import { TooltipProvider } from '@renderer/components/ui/tooltip'
import { ThemeProvider } from '@renderer/components/theme/ThemeProvider'
import { ErrorBoundary } from '@renderer/components/ErrorBoundary'
import { ReframePlatform } from '@renderer/reframe/ReframePlatform'

/**
 * Universal Reframe Platform
 *
 * Boots directly into the dynamic layout playground:
 * - Nav Header with dynamic draggable tabs and + button
 * - Left Sidebar with draggable view tabs and + button
 * - Center Dockview Canvas (Builder) / Native Grid (Client Deliverable)
 * - Right Sidebar with Widget Library, Theme & CSS, and Framing Inspector
 * - Nav Footer with real-time status tabs and expandable detail console
 */
export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <ErrorBoundary label="reframe-platform">
          <ReframePlatform />
        </ErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  )
}
