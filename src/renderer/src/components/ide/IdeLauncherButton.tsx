import { useEffect, useState } from 'react'
import { Code, Compass, ExternalLink, Folder, Sparkles, SquareTerminal, Zap } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import type { IdeDetectionResult, IdeTarget } from '../../../../shared/cockpit-types'

interface IdeLauncherButtonProps {
  repoPath: string
  size?: 'sm' | 'default' | 'icon'
  variant?: 'outline' | 'ghost' | 'default'
  className?: string
  showLabel?: boolean
}

let cachedIdes: IdeDetectionResult | null = null

export function IdeLauncherButton({
  repoPath,
  size = 'sm',
  variant = 'outline',
  className,
  showLabel = false
}: IdeLauncherButtonProps): React.JSX.Element {
  const [ides, setIdes] = useState<IdeDetectionResult | null>(cachedIdes)
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    if (cachedIdes) {
      setIdes(cachedIdes)
      return
    }
    const api = window.api?.cockpit
    if (!api?.detectIdes) return

    api
      .detectIdes()
      .then((res) => {
        cachedIdes = res
        setIdes(res)
      })
      .catch(() => {})
  }, [])

  const handleLaunch = async (target: IdeTarget) => {
    const api = window.api?.cockpit
    if (!api?.openInIde) return
    setOpening(true)
    try {
      await api.openInIde(repoPath, target)
    } finally {
      setTimeout(() => setOpening(false), 500)
    }
  }

  const defaultIde = ides?.defaultIde ?? 'antigravity'
  const isAntigravity = defaultIde === 'antigravity'

  const getIdeIcon = (target: IdeTarget) => {
    switch (target) {
      case 'antigravity':
        return <Sparkles className="h-3.5 w-3.5 text-primary" />
      case 'cursor':
        return <Zap className="h-3.5 w-3.5 text-sky-400" />
      case 'code':
        return <Code className="h-3.5 w-3.5 text-blue-500" />
      case 'windsurf':
        return <Compass className="h-3.5 w-3.5 text-teal-400" />
      case 'terminal':
        return <SquareTerminal className="h-3.5 w-3.5 text-muted-foreground" />
      case 'explorer':
        return <Folder className="h-3.5 w-3.5 text-amber-400" />
    }
  }

  const getIdeTitle = (target: IdeTarget) => {
    switch (target) {
      case 'antigravity':
        return 'Antigravity IDE'
      case 'cursor':
        return 'Cursor'
      case 'code':
        return 'VS Code'
      case 'windsurf':
        return 'Windsurf'
      case 'terminal':
        return 'Windows Terminal'
      case 'explorer':
        return 'File Explorer'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={size}
          variant={variant}
          className={className}
          disabled={opening}
          title={`Open in IDE (${getIdeTitle(defaultIde)})`}
          onClick={(e) => e.stopPropagation()}
        >
          {getIdeIcon(defaultIde)}
          {showLabel && (
            <span className="ml-1.5 text-xs font-medium">{getIdeTitle(defaultIde)}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Open In…
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Primary / Detected IDEs */}
        <DropdownMenuItem
          onClick={() => void handleLaunch('antigravity')}
          disabled={!ides?.installed.antigravity}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Antigravity</span>
          </div>
          {ides?.installed.antigravity && (
            <span className="text-[10px] mono text-primary font-semibold bg-primary/10 px-1.5 py-0.5 rounded">
              {isAntigravity ? 'Default' : 'Installed'}
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => void handleLaunch('cursor')}
          disabled={!ides?.installed.cursor}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-sky-400" />
            <span>Cursor</span>
          </div>
          {ides?.installed.cursor && (
            <span className="text-[10px] mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              Installed
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => void handleLaunch('code')}
          disabled={!ides?.installed.code}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Code className="h-3.5 w-3.5 text-blue-500" />
            <span>VS Code</span>
          </div>
          {ides?.installed.code && (
            <span className="text-[10px] mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              Installed
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => void handleLaunch('windsurf')}
          disabled={!ides?.installed.windsurf}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 text-teal-400" />
            <span>Windsurf</span>
          </div>
          {ides?.installed.windsurf && (
            <span className="text-[10px] mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              Installed
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* System tools: Terminal and Explorer */}
        <DropdownMenuItem onClick={() => void handleLaunch('terminal')}>
          <div className="flex items-center gap-2">
            <SquareTerminal className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Terminal</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => void handleLaunch('explorer')}>
          <div className="flex items-center gap-2">
            <Folder className="h-3.5 w-3.5 text-amber-400" />
            <span>File Explorer</span>
          </div>
          <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
