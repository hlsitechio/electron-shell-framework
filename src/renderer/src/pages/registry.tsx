import {
  BarChart3,
  FolderTree,
  LayoutGrid,
  MessageSquare,
  Palette,
  Settings as SettingsIcon,
  Sparkles
} from 'lucide-react'
import { ChatPage } from '@renderer/pages/chat/ChatPage'
import { DashboardPage } from '@renderer/pages/dashboard/DashboardPage'
import { DocumentsPage } from '@renderer/pages/documents/DocumentsPage'
import { SettingsPage } from '@renderer/pages/settings/SettingsPage'
import { ThemesPage } from '@renderer/pages/themes/ThemesPage'
import { TemplatesPage } from '@renderer/pages/templates/TemplatesPage'
import { WidgetsPage } from '@renderer/pages/widgets/WidgetsPage'
import type { PageDefinition } from '@renderer/types/pages'

/**
 * The framework's demo page set — what you see on a fresh clone.
 *
 * A consumer app replaces this array with its own pages (or applies one of
 * the 11 app templates). The shell renders sidebar items and tabs from it
 * automatically.
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
    id: 'templates',
    label: 'Apps',
    description: '11 app templates',
    category: 'Start',
    icon: Sparkles,
    component: TemplatesPage
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
    id: 'themes',
    label: 'Themes',
    description: '10 color presets',
    category: 'Design',
    icon: Palette,
    component: ThemesPage
  },
  {
    id: 'widgets',
    label: 'Widgets',
    description: 'The component kit',
    category: 'Design',
    icon: LayoutGrid,
    component: WidgetsPage,
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
