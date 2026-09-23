import React from 'react'
import { useReframeStore } from '../stores/reframe-store'
import { FONT_MAP } from '../types/reframe-types'

export const ReframeFooter: React.FC = () => {
  const { footerConfig } = useReframeStore()

  if (!footerConfig.visible) return null

  const fontStyle = { fontFamily: FONT_MAP[footerConfig.fontFamily] || FONT_MAP.inter }

  const statusColorClass =
    footerConfig.statusState === 'online'
      ? 'bg-emerald-400'
      : footerConfig.statusState === 'synced'
        ? 'bg-sky-400'
        : footerConfig.statusState === 'busy'
          ? 'bg-amber-400'
          : 'bg-zinc-400'

  const fontSizeClass =
    footerConfig.fontSize === 'base'
      ? 'text-sm'
      : footerConfig.fontSize === 'sm'
        ? 'text-xs'
        : 'text-[11px]'

  return (
    <footer
      className={`border-t border-zinc-800 bg-zinc-950/90 backdrop-blur px-4 py-1.5 flex items-center justify-between text-zinc-400 select-none shrink-0 z-20 ${fontSizeClass}`}
      style={fontStyle}
    >
      {/* Left Slot */}
      <div className="flex items-center gap-2 truncate">
        <span className="truncate">{footerConfig.leftText}</span>
      </div>

      {/* Center Slot */}
      <div className="hidden sm:flex items-center justify-center truncate text-zinc-500">
        <span className="truncate">{footerConfig.centerText}</span>
      </div>

      {/* Right Slot & Status Pill */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-zinc-500 hidden md:inline truncate">{footerConfig.rightText}</span>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium">
          <span className={`w-1.5 h-1.5 rounded-full ${statusColorClass} animate-pulse`} />
          <span className="text-[10px] uppercase tracking-wider">{footerConfig.statusLabel}</span>
        </div>
      </div>
    </footer>
  )
}
