import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Rendered README.
 *
 * `react-markdown` + `remark-gfm` instead of `dangerouslySetInnerHTML`: the
 * content is remote, so it is parsed into React elements and never injected as
 * HTML. There is no raw-HTML plugin here on purpose — a README cannot introduce
 * a script tag, an iframe or an event handler.
 *
 * Styling is applied through component overrides rather than a CSS file, so
 * every element resolves the active theme tokens and the README re-skins with
 * the preset like the rest of the app.
 */
export const MarkdownView = memo(function MarkdownView({
  text,
  className
}: {
  text: string
  className?: string
}): React.JSX.Element {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // No rehype-raw: remote markdown must not be able to inject markup.
        components={{
          h1: ({ children }) => (
            <h1
              className="mb-2 mt-1 border-b pb-1.5 text-[15px] font-semibold"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className="mb-2 mt-4 border-b pb-1 text-[13.5px] font-semibold"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-1.5 mt-3 text-[12.5px] font-semibold">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-1 mt-2 text-[12px] font-semibold text-muted-foreground">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-2 text-[11.5px] leading-relaxed text-muted-foreground">{children}</p>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="underline decoration-dotted underline-offset-2"
              style={{ color: 'hsl(var(--primary))' }}
              // Links open in the OS browser via the same validated path the
              // rest of the app uses; the renderer never navigates itself.
              onClick={(e) => {
                e.preventDefault()
                if (href) void window.api.cockpit.openPath(href)
              }}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="my-2 list-disc space-y-1 pl-4 text-[11.5px] text-muted-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 list-decimal space-y-1 pl-4 text-[11.5px] text-muted-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote
              className="my-2 border-l-2 pl-3 text-[11.5px] italic text-muted-foreground"
              style={{ borderColor: 'hsl(var(--primary) / 0.5)' }}
            >
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-3 border-0" style={{ borderTop: '1px solid hsl(var(--border))' }} />
          ),
          strong: ({ children }) => (
            <strong className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              {children}
            </strong>
          ),
          /* GitHub-flavoured tables — the single biggest readability win in a README. */
          table: ({ children }) => (
            <div
              className="my-3 overflow-x-auto rounded-md"
              style={{ border: '1px solid hsl(var(--border))' }}
            >
              <table className="w-full border-collapse text-[11px]">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead style={{ background: 'hsl(var(--muted) / 0.5)' }}>{children}</thead>
          ),
          th: ({ children }) => (
            <th
              className="px-2 py-1.5 text-left font-semibold"
              style={{
                borderBottom: '1px solid hsl(var(--border))',
                borderRight: '1px solid hsl(var(--border))'
              }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              className="px-2 py-1.5 align-top text-muted-foreground"
              style={{
                borderTop: '1px solid hsl(var(--border) / 0.6)',
                borderRight: '1px solid hsl(var(--border) / 0.6)'
              }}
            >
              {children}
            </td>
          ),
          /* Inline code vs fenced blocks: both mono, blocks get a surface. */
          code: ({ className, children }) => {
            const isBlock = typeof className === 'string' && className.includes('language-')
            if (isBlock) {
              return (
                <code className="mono block whitespace-pre text-[10.5px] leading-[1.55]">
                  {children}
                </code>
              )
            }
            return (
              <code
                className="mono rounded px-1 py-0.5 text-[10.5px]"
                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground) / 0.9)' }}
              >
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre
              className="my-2 overflow-x-auto rounded-md p-2"
              style={{
                background: 'hsl(var(--background) / 0.6)',
                border: '1px solid hsl(var(--border))'
              }}
            >
              {children}
            </pre>
          ),
          img: ({ src, alt }) =>
            typeof src === 'string' && src.startsWith('http') ? (
              // Remote images are shown as a labelled chip rather than fetched
              // and rendered — a README should not be able to trigger arbitrary
              // network loads inside the app frame.
              <span
                className="mono my-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px]"
                style={{
                  background: 'hsl(var(--muted) / 0.6)',
                  color: 'hsl(var(--muted-foreground))'
                }}
                title={src}
              >
                image: {alt || src.split('/').pop()}
              </span>
            ) : null,
          input: ({ checked, type }) =>
            type === 'checkbox' ? (
              <span className="mono mr-1 text-[10px]" style={{ color: 'hsl(var(--primary))' }}>
                {checked ? '☑' : '☐'}
              </span>
            ) : null
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
})
