import { describe, it, expect, beforeEach } from 'vitest'
import { useCustomPagesStore } from './custom-pages-store'
import type { PageDefinition } from '@renderer/types/pages'

const MOCK_BASE_PAGES: PageDefinition[] = [
  {
    id: 'repos',
    label: 'Repos',
    description: 'Repos',
    category: 'Workspace',
    icon: () => null,
    component: () => null
  },
  {
    id: 'github',
    label: 'GitHub',
    description: 'GitHub',
    category: 'Workspace',
    icon: () => null,
    component: () => null
  },
  {
    id: 'reframe',
    label: 'Reframe',
    description: 'Reframe',
    category: 'Design',
    icon: () => null,
    component: () => null
  },
  {
    id: 'worktrees',
    label: 'Worktrees',
    description: 'Worktrees',
    category: 'Workspace',
    icon: () => null,
    component: () => null
  }
]

describe('Custom Pages & Movable Tabs Store', () => {
  beforeEach(() => {
    localStorage.clear()
    useCustomPagesStore.setState({
      customPages: [],
      pageOrder: [],
      isAddTabOpen: false
    })
  })

  it('reorders sidebar pages via drag-and-drop', () => {
    const { reorderPages, getOrderedPages } = useCustomPagesStore.getState()

    // Initial order should match base pages
    let ordered = getOrderedPages(MOCK_BASE_PAGES)
    expect(ordered.map((p) => p.id)).toEqual(['repos', 'github', 'reframe', 'worktrees'])

    // Move 'reframe' to the top before 'repos'
    reorderPages('reframe', 'repos')

    ordered = useCustomPagesStore.getState().getOrderedPages(MOCK_BASE_PAGES)
    expect(ordered.map((p) => p.id)).toEqual(['reframe', 'repos', 'github', 'worktrees'])

    // Move 'github' below 'worktrees'
    reorderPages('github', 'worktrees')
    ordered = useCustomPagesStore.getState().getOrderedPages(MOCK_BASE_PAGES)
    expect(ordered.map((p) => p.id)).toEqual(['reframe', 'repos', 'worktrees', 'github'])
  })

  it('adds custom tabs with dynamic components and categories', () => {
    const { addCustomPage, getOrderedPages } = useCustomPagesStore.getState()

    addCustomPage({
      id: 'custom-tab-1',
      label: 'SaaS Portal',
      iconName: 'Globe',
      category: 'Workspace',
      type: 'embed',
      props: { url: 'https://linear.app' }
    })

    const ordered = getOrderedPages(MOCK_BASE_PAGES)
    const customTab = ordered.find((p) => p.id === 'custom-tab-1')

    expect(customTab).toBeDefined()
    expect(customTab?.label).toBe('SaaS Portal')
    expect(customTab?.category).toBe('Workspace')
    expect(typeof customTab?.component).toBe('function')
  })

  it('removes custom tabs cleanly', () => {
    const { addCustomPage, removeCustomPage, getOrderedPages } = useCustomPagesStore.getState()

    addCustomPage({
      id: 'custom-tab-test',
      label: 'Temporary Notes',
      iconName: 'FileText',
      category: 'Design',
      type: 'notes',
      props: { notesContent: 'Hello world' }
    })

    let ordered = getOrderedPages(MOCK_BASE_PAGES)
    expect(ordered.some((p) => p.id === 'custom-tab-test')).toBe(true)

    removeCustomPage('custom-tab-test')
    ordered = getOrderedPages(MOCK_BASE_PAGES)
    expect(ordered.some((p) => p.id === 'custom-tab-test')).toBe(false)
  })

  it('toggles add tab modal state', () => {
    const { setIsAddTabOpen } = useCustomPagesStore.getState()
    expect(useCustomPagesStore.getState().isAddTabOpen).toBe(false)

    setIsAddTabOpen(true)
    expect(useCustomPagesStore.getState().isAddTabOpen).toBe(true)

    setIsAddTabOpen(false)
    expect(useCustomPagesStore.getState().isAddTabOpen).toBe(false)
  })
})
