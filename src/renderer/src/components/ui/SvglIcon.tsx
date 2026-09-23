import { useEffect, useState, type CSSProperties } from 'react'
import { cn } from '@renderer/lib/utils'
import { getBundledSvgl, fetchSvglSvg, type SvglTheme } from '@renderer/lib/svgl'
import { useTheme } from '@renderer/components/theme/ThemeProvider'

export interface SvglIconProps {
  name: string
  className?: string
  size?: number | string
  style?: CSSProperties
  'aria-hidden'?: boolean | 'true' | 'false'
}

/**
 * Native SVGL Icon component.
 * Renders SVG logos from svgl.app with offline pre-bundled support and dynamic live fetch.
 * Automatically selects dark/light variants according to the active theme.
 */
export function SvglIcon({
  name,
  className,
  size,
  style,
  'aria-hidden': ariaHidden = true
}: SvglIconProps) {
  let themeMode: SvglTheme = 'dark'
  try {
    const themeContext = useTheme()
    themeMode = themeContext.theme === 'light' ? 'light' : 'dark'
  } catch {
    /* If used outside ThemeProvider, default to dark */
  }

  const bundled = getBundledSvgl(name, themeMode)
  const [asyncContent, setAsyncContent] = useState<string | null>(null)

  useEffect(() => {
    if (bundled) return

    let active = true
    void fetchSvglSvg(name, themeMode).then((res) => {
      if (active && res) {
        setAsyncContent(res)
      }
    })

    return () => {
      active = false
    }
  }, [name, themeMode, bundled])

  const svgContent = bundled || asyncContent

  if (!svgContent) {
    return (
      <span
        aria-hidden={ariaHidden}
        className={cn('inline-block shrink-0 rounded bg-muted/30 animate-pulse', className)}
        style={{
          width: size ?? undefined,
          height: size ?? undefined,
          ...style
        }}
      />
    )
  }

  return (
    <span
      aria-hidden={ariaHidden}
      className={cn(
        'inline-flex items-center justify-center shrink-0 overflow-hidden [&>svg]:h-full [&>svg]:w-full [&>svg]:shrink-0',
        className
      )}
      style={{
        width: size ?? undefined,
        height: size ?? undefined,
        ...style
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}

/**
 * Factory that returns a React component rendering the requested SVGL logo natively.
 * Usable anywhere PageDefinition.icon, StatTile.icon, GlassCard.icon, etc. is accepted.
 *
 * Example:
 *   icon: svgl('electron')
 *   icon: svgl('github')
 */
export function svgl(name: string) {
  const Component = (props: Omit<SvglIconProps, 'name'>) => <SvglIcon name={name} {...props} />
  Component.displayName = `Svgl(${name})`
  return Component
}
