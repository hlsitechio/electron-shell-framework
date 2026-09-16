import { BarChart3, FolderTree, MessageSquare, Settings as SettingsIcon } from 'lucide-react'
import { ChatPage } from '@renderer/pages/chat/ChatPage'
import { DashboardPage } from '@renderer/pages/dashboard/DashboardPage'
import { DocumentsPage } from '@renderer/pages/documents/DocumentsPage'
import { SettingsPage } from '@renderer/pages/settings/SettingsPage'
import type { PageDefinition } from '@renderer/types/pages'

/**
 * The framework's demo page set. A consumer app replaces this array
 * with its own pages — the shell renders sidebar items and tabs
 * from it automatically.
 */
export const PAGES: PageDefinition[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'KPI grid + activity',
    icon: BarChart3,
    component: DashboardPage
  },
  {
    id: 'chat',
    label: 'Chat',
    description: 'Message demo',
    category: 'Communication',
    icon: MessageSquare,
    component: ChatPage
  },
  {
    id: 'documents',
    label: 'Documents',
    description: 'File tree demo',
    category: 'Communication',
    icon: FolderTree,
    component: DocumentsPage,
    showInSidebar: false // reachable via the tabs only
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Framework preferences',
    icon: SettingsIcon,
    component: SettingsPage,
    showInSidebar: false // reached via the gear in the sidebar footer
  }
]
