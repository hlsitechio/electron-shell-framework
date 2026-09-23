import React from 'react'
import { create } from 'zustand'
import type { PageDefinition } from '@renderer/types/pages'
import * as LucideIcons from 'lucide-react'
import { CustomPageView } from '@renderer/components/shell/CustomPageView'
import { useReframeStore, TemplateId } from '@renderer/reframe/stores/reframe-store'

export interface CustomPageConfig {
  id: string
  label: string
  iconName: string
  category: 'Workspace' | 'Ship' | 'Design' | 'Custom'
  type: 'reframe' | 'embed' | 'notes' | 'table'
  props: {
    templateId?: TemplateId
    url?: string
    notesContent?: string
  }
}

export interface CustomPagesState {
  customPages: CustomPageConfig[]
  pageOrder: string[]
  isAddTabOpen: boolean

  setIsAddTabOpen: (open: boolean) => void
  addCustomPage: (config: CustomPageConfig) => void
  removeCustomPage: (id: string) => void
  reorderPages: (sourceId: string, targetId: string) => void
  getOrderedPages: (basePages: PageDefinition[]) => PageDefinition[]
}

const STORAGE_KEY_PAGES = 'reframe:custom-pages'
const STORAGE_KEY_ORDER = 'reframe:page-order'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage quota or disabled errors
  }
}

export const useCustomPagesStore = create<CustomPagesState>((set, get) => ({
  customPages: loadFromStorage<CustomPageConfig[]>(STORAGE_KEY_PAGES, []),
  pageOrder: loadFromStorage<string[]>(STORAGE_KEY_ORDER, []),
  isAddTabOpen: false,

  setIsAddTabOpen: (isAddTabOpen) => set({ isAddTabOpen }),

  addCustomPage: (config) => {
    const { customPages, pageOrder } = get()
    const nextPages = [...customPages, config]
    const nextOrder = [...pageOrder, config.id]

    set({ customPages: nextPages, pageOrder: nextOrder })
    saveToStorage(STORAGE_KEY_PAGES, nextPages)
    saveToStorage(STORAGE_KEY_ORDER, nextOrder)

    // If it's a reframe preset, load the template
    if (config.type === 'reframe' && config.props.templateId) {
      useReframeStore.getState().loadTemplate(config.props.templateId)
    }
  },

  removeCustomPage: (id) => {
    const { customPages, pageOrder } = get()
    const nextPages = customPages.filter((p) => p.id !== id)
    const nextOrder = pageOrder.filter((pId) => pId !== id)

    set({ customPages: nextPages, pageOrder: nextOrder })
    saveToStorage(STORAGE_KEY_PAGES, nextPages)
    saveToStorage(STORAGE_KEY_ORDER, nextOrder)
  },

  reorderPages: (sourceId, targetId) => {
    if (sourceId === targetId) return
    const { pageOrder, customPages } = get()
    const baseIds = [
      'repos',
      'github',
      'reframe',
      'worktrees',
      'builds',
      'pull-requests',
      'ci',
      'templates',
      'themes',
      'widgets',
      'settings'
    ]
    const combined = Array.from(
      new Set([...pageOrder, ...baseIds, ...customPages.map((c) => c.id)])
    )
    if (!combined.includes(sourceId)) combined.push(sourceId)
    if (!combined.includes(targetId)) combined.push(targetId)

    const sourceIdx = combined.indexOf(sourceId)
    const targetIdx = combined.indexOf(targetId)

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const [moved] = combined.splice(sourceIdx, 1)
      combined.splice(targetIdx, 0, moved)
      set({ pageOrder: combined })
      saveToStorage(STORAGE_KEY_ORDER, combined)
    }
  },

  getOrderedPages: (basePages) => {
    const { customPages, pageOrder } = get()

    // Map custom pages into PageDefinition using React.createElement
    const dynamicDefinitions: PageDefinition[] = customPages.map((cp) => {
      const IconComponent = (LucideIcons as any)[cp.iconName] || LucideIcons.LayoutTemplate
      return {
        id: cp.id,
        label: cp.label,
        description: `Custom ${cp.type} view`,
        category: cp.category,
        icon: IconComponent,
        component: () => React.createElement(CustomPageView, { config: cp }),
        showInSidebar: true
      }
    })

    const allPagesMap = new Map<string, PageDefinition>()
    basePages.forEach((p) => allPagesMap.set(p.id, p))
    dynamicDefinitions.forEach((p) => allPagesMap.set(p.id, p))

    // Initialize pageOrder if empty or missing items
    const allIds = Array.from(allPagesMap.keys())
    let effectiveOrder = pageOrder.filter((id) => allPagesMap.has(id))
    for (const id of allIds) {
      if (!effectiveOrder.includes(id)) {
        effectiveOrder.push(id)
      }
    }

    // Return pages in the exact order requested
    return effectiveOrder.map((id) => allPagesMap.get(id)!)
  }
}))
