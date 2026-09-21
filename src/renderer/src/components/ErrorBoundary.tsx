import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

/**
 * Renderer error boundary.
 *
 * Without one, a throw anywhere in the tree unmounts everything and leaves a
 * blank frameless window — no chrome, no menu, no console in a packaged build.
 * That is the single worst failure mode for an app a client has installed.
 *
 * This catches it, keeps the shell alive, shows what broke, and offers a
 * reload. The error is also logged to the main-process log file via the
 * console capture in src/main/logging.ts.
 */

interface Props {
  children: ReactNode
  /** shown in the fallback so a client can quote it in a ticket */
  label?: string
}

interface State {
  error: Error | null
  info: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ info })
    // Lands in the main-process log file (see attachRendererLogging).
    console.error('[ErrorBoundary]', this.props.label ?? 'app', error, info.componentStack)
  }

  private reset = (): void => {
    this.setState({ error: null, info: null })
  }

  render(): ReactNode {
    const { error, info } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="glass w-full max-w-lg p-5">
          <div className="flex items-start gap-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
              style={{
                background: 'hsl(var(--destructive) / 0.16)',
                color: 'hsl(var(--destructive))'
              }}
            >
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold">Something broke in this view</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                The rest of the app still works. The error was written to the log file.
              </p>
            </div>
          </div>

          <pre
            className="mono mt-4 max-h-40 overflow-auto rounded-md p-3 text-[10.5px] leading-relaxed"
            style={{
              background: 'hsl(var(--background) / 0.6)',
              color: 'hsl(var(--muted-foreground))'
            }}
          >
            {error.message}
            {info?.componentStack ? `\n\ncomponent stack:${info.componentStack}` : ''}
          </pre>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={this.reset}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors hover:bg-accent"
              style={{ border: '1px solid hsl(var(--border))' }}
            >
              <RefreshCw className="h-3 w-3" />
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md px-3 py-1.5 text-xs transition-colors hover:bg-accent"
              style={{ border: '1px solid hsl(var(--border))' }}
            >
              Reload the app
            </button>
          </div>
        </div>
      </div>
    )
  }
}
