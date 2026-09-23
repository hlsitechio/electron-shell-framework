import { Check, Copy, Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { GlassCard } from '@renderer/widgets'
import { PresetPreview } from '@renderer/components/theme/PresetSwitcher'
import { useTemplateStore, type TemplateMeta, CATALOG } from '@renderer/templates'
import { applyTemplate, buildRecipe, exitToFramework } from '@renderer/lib/apps'
import { useTheme } from '@renderer/components/theme/ThemeProvider'
import { getPageLabel } from '@renderer/types/pages'

/**
 * Apps page — the template CATALOG.
 *
 * Reads display metadata only (templates/manifest.ts), so this page renders
 * all eleven template UIs without loading a single template's code. Clicking
 * one lazily imports it and applies it.
 *
 * Every preview is a real miniature rendered with the target preset's own
 * tokens (see PresetPreview) — no screenshots, no duplicated colors.
 */
export function TemplatesPage() {
  const { activeId, active } = useTemplateStore()
  const { setPreset } = useTheme()
  const [pending, setPending] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const apply = async (meta: TemplateMeta) => {
    setPending(meta.id)
    try {
      await applyTemplate(meta.id, { setPreset })
    } finally {
      setPending(null)
    }
  }

  const inApp = activeId !== 'framework' && active

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Apps</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Eleven app templates, ordered by how common the shape is among shipped Electron apps. Pick
          one to reshape the shell — pages, layout and colors together.
        </p>
      </div>

      <GlassCard
        title={inApp ? active!.name : 'Framework shell'}
        subtitle={
          inApp
            ? active!.tagline
            : 'Running the framework demo — pick a template below to reshape the shell'
        }
        icon={Sparkles}
        action={
          inApp ? (
            <div className="flex items-center gap-2">
              <span className="mono rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {active!.home}
              </span>
              <button
                type="button"
                onClick={exitToFramework}
                className="rounded-md px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-accent"
                style={{ border: '1px solid hsl(var(--border))' }}
              >
                exit app
              </button>
            </div>
          ) : null
        }
      >
        {inApp ? (
          <>
            <p className="text-xs leading-relaxed text-muted-foreground">{active!.description}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  pages
                </p>
                <p className="mt-1 text-xs">
                  {active!.pages.map((p) => getPageLabel(p)).join(' · ')}
                </p>
              </div>
              <div>
                <p className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  preset
                </p>
                <p className="mt-1 text-xs">{active!.preset}</p>
              </div>
              <div>
                <p className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  data shape
                </p>
                <p className="mono mt-1 break-words text-[10px]">{active!.dataShape}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <p className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  build recipe — paste this to your agent
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(buildRecipe(active!))
                    setCopied(true)
                    window.setTimeout(() => setCopied(false), 1600)
                  }}
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-accent"
                  style={{ border: '1px solid hsl(var(--border))' }}
                >
                  <Copy className="h-3 w-3" />
                  {copied ? 'copied' : 'copy'}
                </button>
              </div>
              <pre
                className="mono mt-2 max-h-56 overflow-auto rounded-md p-3 text-[10.5px] leading-relaxed text-muted-foreground"
                style={{ background: 'hsl(var(--background) / 0.6)' }}
              >
                {buildRecipe(active!)}
              </pre>
            </div>
          </>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            This is the framework itself — shell, widgets and presets, with no app in it. Pick a
            template and the same shell becomes that app: pages, layout and color preset all swap.
          </p>
        )}
      </GlassCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATALOG.map((meta) => {
          const Icon = meta.icon
          const isActive = meta.id === activeId
          const isPending = pending === meta.id
          return (
            <button
              key={meta.id}
              type="button"
              onClick={() => void apply(meta)}
              aria-pressed={isActive}
              className="rounded-lg p-3 text-left transition-colors"
              style={{
                background: isActive ? 'hsl(var(--accent))' : 'transparent',
                border: `1px solid ${isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`
              }}
            >
              <span className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                  style={{ background: 'hsl(var(--primary) / 0.16)', color: 'hsl(var(--primary))' }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{meta.name}</span>
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
                ) : (
                  isActive && (
                    <Check
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: 'hsl(var(--primary))' }}
                    />
                  )
                )}
              </span>
              <span className="mt-1.5 block text-[11px] leading-snug text-muted-foreground">
                {meta.tagline}
              </span>
              <PresetPreview preset={meta.preset} className="mt-2.5 h-16 w-full" />
              <span className="mt-2 flex items-center justify-between gap-2">
                <span className="mono truncate text-[10px] text-muted-foreground">
                  {meta.preset} · {meta.pageCount} pages
                </span>
                <span className="mono shrink-0 text-[10px] text-muted-foreground/70">
                  {meta.evidence}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <GlassCard title="How an agent should use this" subtitle="The contract">
        <p className="text-xs leading-relaxed text-muted-foreground">
          When the client asks for something, match their words to the closest template with{' '}
          <code className="mono rounded bg-muted px-1">
            resolveTemplateId(&quot;financial dashboard&quot;)
          </code>{' '}
          → <span className="mono">finance</span>. Name the two or three nearest templates and let
          the human choose — do not pick silently. Then apply it, read the build recipe, and wire
          real data into the page props. Full guide in <span className="mono">AGENTS.md</span>.
        </p>
      </GlassCard>
    </div>
  )
}
