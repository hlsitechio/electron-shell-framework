import React from 'react'
import { ReframeApp } from '@renderer/reframe/ReframeApp'
import type { CustomPageConfig } from '@renderer/stores/custom-pages-store'

export const CustomPageView: React.FC<{ config: CustomPageConfig }> = ({ config }) => {
  if (config.type === 'embed') {
    const url = config.props.url || 'https://dockview.dev'
    return (
      <div className="w-full h-full flex flex-col bg-zinc-950">
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/60 text-xs text-zinc-400">
          <span className="truncate">{url}</span>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Open External &rarr;
          </a>
        </div>
        <iframe src={url} className="w-full flex-1 border-0" title={config.label} />
      </div>
    )
  }

  if (config.type === 'notes') {
    return (
      <div className="w-full h-full p-6 bg-zinc-950 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-4 text-zinc-200">
          <h2 className="text-xl font-bold tracking-tight text-white border-b border-zinc-800 pb-2">
            {config.label}
          </h2>
          <div className="whitespace-pre-line text-sm leading-relaxed text-zinc-300 bg-zinc-900/40 p-4 rounded-lg border border-zinc-800">
            {config.props.notesContent || 'Start writing notes for this workspace...'}
          </div>
        </div>
      </div>
    )
  }

  return <ReframeApp />
}
