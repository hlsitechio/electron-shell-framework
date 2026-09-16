import { FileText, Folder, FolderOpen, Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@renderer/lib/utils'
import type { TreeNode } from './tree'

export function extIcon(ext?: string) {
  switch (ext) {
    case 'png':
    case 'jpg':
    case 'svg':
      return <ImageIcon className="h-3.5 w-3.5" />
    default:
      return <FileText className="h-3.5 w-3.5" />
  }
}

export function TreeNodeView({
  node,
  depth,
  dense = false
}: {
  node: TreeNode
  depth: number
  dense?: boolean
}) {
  const [open, setOpen] = useState(depth < 2)
  const isFolder = node.type === 'folder'
  const size = dense ? 'h-5 text-[12px]' : 'h-6 text-[13px]'

  return (
    <div>
      <button
        onClick={() => isFolder && setOpen(!open)}
        className={cn(
          `flex ${size} w-full items-center gap-1.5 rounded px-1.5 transition-colors`,
          !isFolder && 'cursor-default text-muted-foreground hover:bg-accent hover:text-foreground'
        )}
        style={{ paddingLeft: depth * (dense ? 14 : 16) + 6 }}
      >
        {isFolder &&
          (open ? (
            <FolderOpen className="h-3.5 w-3.5 shrink-0" style={{ color: 'hsl(var(--warning))' }} />
          ) : (
            <Folder className="h-3.5 w-3.5 shrink-0" style={{ color: 'hsl(var(--warning))' }} />
          ))}
        {!isFolder && extIcon(node.ext)}
        <span className="truncate">{node.name}</span>
      </button>
      {isFolder && open && node.children && (
        <div className="relative">
          <div
            className="absolute bottom-0 top-0 w-px"
            style={{ left: depth * (dense ? 14 : 16) + 8, background: 'hsl(var(--border))' }}
          />
          {node.children.map((child) => (
            <div key={child.name} className="relative">
              <div
                className="absolute top-1/2 h-px w-3 -translate-y-1/2"
                style={{ left: depth * (dense ? 14 : 16) + 3, background: 'hsl(var(--border))' }}
              />
              <TreeNodeView node={child} depth={depth + 1} dense={dense} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
