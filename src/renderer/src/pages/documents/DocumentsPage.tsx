import { TreeNodeView } from './TreeView'
import { TREE } from './tree'

export function DocumentsPage() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-lg">
        <h2 className="text-sm font-semibold text-muted-foreground">DOCUMENTS</h2>
        <div className="mt-3">
          {TREE.map((node) => (
            <TreeNodeView key={node.name} node={node} depth={0} />
          ))}
        </div>
      </div>
    </div>
  )
}
