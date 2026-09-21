import { Film, Grid3x3, ListMusic, Play, Search } from 'lucide-react'
import { useState } from 'react'
import { GlassCard, FilterChips, StatTile, TerminalWidget } from '@renderer/widgets'
import type { AppTemplate } from './types'

/**
 * MEDIA LIBRARY — 95 shipped Electron apps combined
 * (53 photo/video editing + 42 music/audio players)
 *
 * Examples: LosslessCut, Kap, Streamlabs OBS, Eagle, Cider, Dopamine,
 * Museeks, Nuclear, TIDAL, Metro.
 *
 * Grid + inspector + queue. The player strip is the shell's bottom panel.
 */

const ITEMS = [
  { title: 'interview_cut_v3.mp4', meta: '1080p · 412 MB · 14:02', kind: 'video' },
  { title: 'session-2026-09-14.wav', meta: '48kHz · 88 MB · 32:10', kind: 'audio' },
  { title: 'hero_shot_final.png', meta: '4096x2160 · 12 MB', kind: 'image' },
  { title: 'b-roll_warehouse.mov', meta: '4K · 1.2 GB · 06:44', kind: 'video' },
  { title: 'outro_mix_v2.wav', meta: '48kHz · 24 MB · 01:12', kind: 'audio' },
  { title: 'product_macro_01.png', meta: '6000x4000 · 18 MB', kind: 'image' }
]

const ICON = { video: Film, audio: ListMusic, image: Grid3x3 }

function Library() {
  const [filter, setFilter] = useState('all')
  const shown = filter === 'all' ? ITEMS : ITEMS.filter((i) => i.kind === filter)
  return (
    <div className="space-y-4 p-6">
      <FilterChips
        options={['all', 'video', 'audio', 'image']}
        value={filter}
        onChange={setFilter}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((i) => {
          const Icon = ICON[i.kind as keyof typeof ICON]
          return (
            <div key={i.title} className="glass overflow-hidden p-0">
              <div className="hatched relative flex aspect-video items-center justify-center">
                <Icon className="h-6 w-6 text-muted-foreground" />
                <span
                  className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ background: 'hsl(var(--primary))' }}
                >
                  <Play className="h-3 w-3" style={{ color: 'hsl(var(--primary-foreground))' }} />
                </span>
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium">{i.title}</p>
                <p className="mono mt-0.5 truncate text-[10px] text-muted-foreground">{i.meta}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Inspector() {
  return (
    <div className="space-y-3 p-6">
      <GlassCard title="interview_cut_v3.mp4" subtitle="Properties">
        <div className="mono space-y-1 text-[11px] text-muted-foreground">
          <p>duration · 14:02</p>
          <p>codec · h264 / aac</p>
          <p>bitrate · 18.4 Mbps</p>
          <p>path · /media/2026/interviews</p>
        </div>
      </GlassCard>
      <GlassCard title="Queue" subtitle="3 items">
        <div className="space-y-1.5">
          {['hero_shot_final.png', 'outro_mix_v2.wav', 'b-roll_warehouse.mov'].map((q) => (
            <div key={q} className="truncate text-xs text-muted-foreground">
              {q}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

function Transcode() {
  return (
    <div className="space-y-4 p-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Queued" value="3" delta="+1" progress={30} />
        <StatTile label="Processing" value="1" delta="0" progress={12} />
        <StatTile label="Done today" value="41" delta="+8" progress={82} />
      </div>
      <TerminalWidget
        title="ffmpeg"
        lines={[
          { key: 'input', value: 'interview_cut_v3.mp4', tone: 'accent' },
          { key: 'preset', value: 'h264 · crf 20 · faststart', tone: 'muted' },
          { key: 'progress', value: '82% · eta 00:41', tone: 'success' }
        ]}
      />
    </div>
  )
}

export const mediaTemplate: AppTemplate = {
  id: 'media',
  name: 'Media Library',
  tagline: 'Browse, inspect and transcode media locally.',
  description:
    'Ninety-five shipped Electron apps are media players or editors — the largest technical moat in the ecosystem, because the alternative is a native build. Grid library, inspector panel, job queue and a transcode log.',
  icon: Film,
  home: 'library',
  preset: 'poiesis-purple',
  layout: { leftWidth: 220, rightOpen: true, rightWidth: 300, bottomOpen: false },
  pages: [
    {
      id: 'library',
      label: 'Library',
      description: 'Browse all media',
      icon: Grid3x3,
      component: Library
    },
    {
      id: 'transcode',
      label: 'Transcode',
      description: 'Job queue',
      icon: Film,
      component: Transcode
    },
    {
      id: 'inspector',
      label: 'Inspector',
      description: 'Metadata + queue',
      icon: Search,
      component: Inspector,
      rightPanel: Inspector
    }
  ],
  dataShape:
    'items: [{ id, title, kind, duration, sizeBytes, path }], jobs: [{ id, input, preset, progress, state }]',
  extendWith: [
    'ffmpeg worker over IPC',
    'thumbnail generation',
    'timeline trimming',
    'watch folders'
  ]
}
