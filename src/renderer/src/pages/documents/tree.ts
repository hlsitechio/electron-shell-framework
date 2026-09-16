/** Shared generic file-tree data — used by the Documents page and the sidebar section. */
export interface TreeNode {
  name: string
  type: 'folder' | 'file'
  ext?: string
  children?: TreeNode[]
}

export const TREE: TreeNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      {
        name: 'renderer',
        type: 'folder',
        children: [
          { name: 'App.tsx', type: 'file', ext: 'tsx' },
          { name: 'main.tsx', type: 'file', ext: 'tsx' },
          { name: 'theme.css', type: 'file', ext: 'css' }
        ]
      },
      {
        name: 'main',
        type: 'folder',
        children: [
          { name: 'index.ts', type: 'file', ext: 'ts' },
          { name: 'ipc.ts', type: 'file', ext: 'ts' }
        ]
      },
      { name: 'README.md', type: 'file', ext: 'md' }
    ]
  },
  {
    name: 'docs',
    type: 'folder',
    children: [
      { name: 'architecture.md', type: 'file', ext: 'md' },
      { name: 'theming.md', type: 'file', ext: 'md' }
    ]
  },
  { name: 'package.json', type: 'file', ext: 'json' },
  { name: 'electron.vite.config.ts', type: 'file', ext: 'ts' }
]
