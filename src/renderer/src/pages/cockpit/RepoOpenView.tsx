import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileCode2,
  FileText,
  Files,
  Folder,
  GitBranch,
  GitCommitHorizontal,
  History,
  Loader2,
  Lock,
  RefreshCw,
  Star,
  Binary
} from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { cn } from '@renderer/lib/utils'
import type {
  RemoteFile,
  RemoteRepo,
  RemoteTreeEntry,
  RepoDetail
} from '../../../../shared/cockpit-types'

/**
 * "Open mode" — read a repository in full WITHOUT cloning it.
 *
 * Five GitHub API requests render the whole repo (metadata, root tree, README,
 * recent commits, branches), and individual files are pulled on click. Nothing
 * touches the local disk, so opening `chromium` (62 GB) costs exactly what
 * opening a 70 KB repo costs.
 *
 * The panel is a reader, not an editor: it shows what is on GitHub, and offers
 * Clone when you decide you want it locally.
 */

type Tab = 'overview' | 'files' | 'history'

function relative(iso: string): string {
  if (!iso) return '—'
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '—'
  const mins = Math.round((Date.now() - t) / 60000)
  if (mins < 60) return `${Math.max(mins, 0)}m ago`
  const h = Math.round(mins / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 30) return `${d}d ago`
  return `${Math.round(d / 30)}mo ago`
}

function bytes(n: number): string {
  if (!n) return '0 B'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

/** Guess a language from the extension — only used to pick a mono tint. */
function isMarkdown(path: string): boolean {
  return /\.(md|markdown|mdx)$/i.test(path)
}

interface Props {
  slug: string
  onClose: () => void
  onClone: (slug: string, full: boolean) => void
  cloning: string | undefined
}

export function RepoOpenView({ slug, onClose, onClone, cloning }: Props): React.JSX.Element {
  const [tab, setTab] = useState<Tab>('overview')
  const [detail, setDetail] = useState<RepoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailError, setDetailError] = useState<string | null>(null)

  const [openFile, setOpenFile] = useState<{
    path: string
    file: RemoteFile | null
    busy: boolean
  } | null>(null)

  /** Load the repo's detail the first time (and on slug change). */
  useEffect(() => {
    let cancelled = false
    // Deferred a tick: React flags synchronous setState inside an effect body as
    // a cascading render.
    const start = setTimeout(() => {
      if (cancelled) return
      setLoading(true)
      setDetailError(null)
      setOpenFile(null)
      setTab('overview')
    }, 0)

    void window.api.cockpit
      .repoDetail(slug)
      .then((d) => {
        if (cancelled) return
        setDetail(d)
        if (d.error) setDetailError(d.error)
      })
      .catch((err: unknown) => {
        if (!cancelled) setDetailError(String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      clearTimeout(start)
    }
  }, [slug])

  const readFile = async (entry: RemoteTreeEntry): Promise<void> => {
    setOpenFile({ path: entry.path, file: null, busy: true })
    try {
      const file = await window.api.cockpit.repoFile(
        slug,
        entry.path,
        detail?.defaultBranch ?? null
      )
      setOpenFile({ path: entry.path, file, busy: false })
    } catch (err) {
      setOpenFile({
        path: entry.path,
        file: {
          path: entry.path,
          size: 0,
          text: null,
          truncated: false,
          binary: false,
          error: String(err)
        },
        busy: false
      })
    }
  }

  const dirs = useMemo(() => (detail?.tree ?? []).filter((t) => t.type === 'dir'), [detail])
  const files = useMemo(() => (detail?.tree ?? []).filter((t) => t.type !== 'dir'), [detail])

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* header */}
      <div
        className="flex h-9 shrink-0 items-center gap-2 px-2"
        style={{ borderBottom: '1px solid hsl(var(--border))' }}
      >
        {openFile ? (
          <button
            onClick={() => setOpenFile(null)}
            className="mono flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            title="Back to the repository"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{openFile.path}</span>
          </button>
        ) : (
          <>
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
              style={{ background: 'hsl(var(--primary) / 0.16)', color: 'hsl(var(--primary))' }}
            >
              <FileCode2 className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">
              {detail?.slug ?? slug}
            </span>
          </>
        )}

        <div className="flex-1" />

        {openFile && openFile.file?.text != null && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-1.5 text-[10.5px]"
            onClick={() => void window.api.cockpit.writeClipboard(openFile.file?.text ?? '')}
            title="Copy this file's text"
          >
            Copy
          </Button>
        )}

        {cloning !== undefined ? (
          <span
            className="mono flex max-w-[150px] items-center gap-1 truncate text-[10px]"
            style={{ color: 'hsl(var(--warning))' }}
            title={cloning}
          >
            <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
            cloning…
          </span>
        ) : (
          <Button
            size="sm"
            className="h-6 px-2 text-[10.5px]"
            title="Blobless partial clone at depth 1 — metadata only, blobs on demand"
            onClick={() => onClone(slug, false)}
          >
            <Download className="h-3 w-3" />
            Clone
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 shrink-0 p-0"
          title="Close"
          onClick={onClose}
        >
          <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
        </Button>
      </div>

      {/* tab strip */}
      {!openFile && (
        <div
          className="flex h-8 shrink-0 items-center gap-1 px-2"
          style={{ borderBottom: '1px solid hsl(var(--border))' }}
        >
          {(
            [
              ['overview', 'Overview', FileText],
              ['files', `Files${detail ? ` ${detail.tree.length}` : ''}`, Files],
              ['history', `History${detail ? ` ${detail.commits.length}` : ''}`, History]
            ] as Array<[Tab, string, typeof FileText]>
          ).map(([id, label, Icon]) => (
            <Button
              key={id}
              size="sm"
              variant={tab === id ? 'secondary' : 'ghost'}
              className="h-6 gap-1.5 px-2 text-[11px]"
              onClick={() => setTab(id)}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Button>
          ))}
        </div>
      )}

      {/* body */}
      <div className="min-h-0 flex-1 overflow-auto p-2">
        {loading ? (
          <div className="flex h-full items-center justify-center gap-2 text-[11.5px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Reading from GitHub — no clone…
          </div>
        ) : detailError ? (
          <div
            className="rounded-md p-3"
            style={{
              background: 'hsl(var(--destructive) / 0.08)',
              border: '1px solid hsl(var(--destructive) / 0.25)'
            }}
          >
            <div className="flex items-start gap-2">
              <AlertCircle
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                style={{ color: 'hsl(var(--destructive))' }}
              />
              <div className="min-w-0 text-[11.5px]">
                <p className="font-medium">Could not read this repository</p>
                <p className="mono mt-0.5 break-words text-muted-foreground">{detailError}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 h-6 text-[10.5px]"
              onClick={() => setTab('overview')}
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          </div>
        ) : openFile ? (
          /* ---------------------------------------------------------- file view */
          openFile.busy ? (
            <div className="flex h-full items-center justify-center gap-2 text-[11.5px] text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading {openFile.path}…
            </div>
          ) : openFile.file?.error ? (
            <p className="mono text-[11px]" style={{ color: 'hsl(var(--destructive))' }}>
              {openFile.file.error}
            </p>
          ) : openFile.file?.binary ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <Binary className="h-5 w-5" />
              <p className="text-[11.5px]">Binary file — {bytes(openFile.file.size)}</p>
              <p className="mono text-[10.5px]">not renderable as text</p>
            </div>
          ) : (
            <>
              <div className="mono mb-1.5 flex items-center gap-2 px-1 text-[10px] text-muted-foreground">
                <span>{bytes(openFile.file?.size ?? 0)}</span>
                {openFile.file?.truncated && (
                  <span style={{ color: 'hsl(var(--warning))' }}>· truncated for display</span>
                )}
              </div>
              <pre
                className="mono overflow-auto rounded-md p-2 text-[10.5px] leading-[1.55]"
                style={{
                  background: 'hsl(var(--background) / 0.6)',
                  border: '1px solid hsl(var(--border))',
                  whiteSpace: 'pre',
                  tabSize: 2
                }}
              >
                {openFile.file?.text ?? ''}
              </pre>
            </>
          )
        ) : tab === 'overview' ? (
          /* ------------------------------------------------------- overview tab */
          <div className="space-y-2">
            {detail?.description && (
              <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                {detail.description}
              </p>
            )}

            <div className="mono flex flex-wrap items-center gap-2 text-[10.5px] text-muted-foreground">
              {detail?.stars ? (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {detail.stars}
                </span>
              ) : null}
              {detail?.license && <span>{detail.license}</span>}
              {detail?.defaultBranch && (
                <span className="inline-flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  {detail.defaultBranch}
                </span>
              )}
              {detail?.branches && detail.branches.length > 1 && (
                <span>{detail.branches.length} branches</span>
              )}
            </div>

            {detail?.topics?.length ? (
              <div className="flex flex-wrap gap-1">
                {detail.topics.map((t) => (
                  <span
                    key={t}
                    className="mono rounded px-1.5 py-0.5 text-[9.5px]"
                    style={{
                      background: 'hsl(var(--primary) / 0.12)',
                      color: 'hsl(var(--primary))'
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            {detail?.readme ? (
              <div className="glass p-3">
                <div className="mono mb-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  {detail.readme.name}
                </div>
                <pre
                  className="mono text-[10.5px] leading-[1.6] whitespace-pre-wrap break-words"
                  style={{ color: 'hsl(var(--foreground) / 0.88)' }}
                >
                  {detail.readme.text}
                </pre>
              </div>
            ) : (
              <p className="text-[11.5px] text-muted-foreground">
                No README — open the Files tab to browse the tree.
              </p>
            )}

            <p className="mono pt-1 text-[9.5px] text-muted-foreground/70">
              {detail?.requests} GitHub requests · nothing written to disk
            </p>
          </div>
        ) : tab === 'files' ? (
          /* ---------------------------------------------------------- files tab */
          <div>
            {(detail?.tree.length ?? 0) === 0 ? (
              <p className="text-[11.5px] text-muted-foreground">
                Empty repository — no files on {detail?.defaultBranch || 'the default branch'}.
              </p>
            ) : (
              <>
                {dirs.length > 0 && (
                  <>
                    <p className="mono mb-1 px-1 text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
                      Folders
                    </p>
                    {dirs.map((d) => (
                      <div
                        key={d.sha}
                        className="mono flex items-center gap-1.5 rounded px-1.5 py-1 text-[11px] text-muted-foreground opacity-60"
                        title="Folder contents are not listed in this view"
                      >
                        <Folder className="h-3.5 w-3.5 shrink-0" />
                        {d.path}
                      </div>
                    ))}
                    <div className="my-1.5 h-px" style={{ background: 'hsl(var(--border))' }} />
                  </>
                )}
                {files.map((f) => (
                  <button
                    key={f.sha}
                    onClick={() => void readFile(f)}
                    className="mono flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-[11px] transition-colors hover:bg-accent/40"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{f.path}</span>
                    {isMarkdown(f.path) && (
                      <span className="shrink-0 text-[9px] text-muted-foreground">md</span>
                    )}
                    <span className="shrink-0 text-[9.5px] text-muted-foreground/70">
                      {bytes(f.size)}
                    </span>
                    <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </>
            )}
          </div>
        ) : (
          /* -------------------------------------------------------- history tab */
          <div className="space-y-1.5">
            {detail?.commits.length === 0 ? (
              <p className="text-[11.5px] text-muted-foreground">No commits on this branch.</p>
            ) : (
              detail?.commits.map((c) => (
                <div key={c.sha} className="rounded px-1.5 py-1 hover:bg-accent/25">
                  <div className="flex items-start gap-1.5">
                    <GitCommitHorizontal className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] leading-snug">{c.message}</p>
                      <p className="mono mt-0.5 flex items-center gap-1.5 text-[9.5px] text-muted-foreground">
                        <span>{c.sha.slice(0, 7)}</span>
                        <span className="opacity-60">·</span>
                        <span className="truncate">{c.author}</span>
                        <span className="opacity-60">·</span>
                        <span>{relative(c.date)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* footer — the repo's own state, plus a way out to GitHub */}
      <div
        className="mono flex shrink-0 items-center gap-2 px-2 py-1.5 text-[9.5px] text-muted-foreground"
        style={{ borderTop: '1px solid hsl(var(--border))' }}
      >
        <Lock className="h-2.5 w-2.5 shrink-0" />
        <span>read-only view</span>
        <div className="flex-1" />
        <Button
          size="sm"
          variant="ghost"
          className="h-5 px-1.5 text-[9.5px]"
          onClick={() =>
            void window.api.cockpit.openPath(`https://github.com/${detail?.slug ?? slug}`)
          }
        >
          <ExternalLink className="h-3 w-3" />
          GitHub
        </Button>
      </div>
    </div>
  )
}

/** Compact row used by the list to advertise that a repo can be opened. */
export function OpenHint({ repo }: { repo: RemoteRepo }): React.JSX.Element {
  return (
    <span className={cn('mono text-[10px] text-muted-foreground')}>
      {repo.description ? repo.description.slice(0, 60) : 'click to open'}
    </span>
  )
}
