import {
  Activity,
  FolderGit2,
  FolderTree,
  GitPullRequest,
  Hammer,
  LayoutGrid,
  Palette,
  Settings as SettingsIcon
} from 'lucide-react'
import { ReposPage } from '@renderer/pages/cockpit/ReposPage'
import { WorktreesPage } from '@renderer/pages/cockpit/WorktreesPage'
import { BuildsPage } from '@renderer/pages/cockpit/BuildsPage'
import { PullRequestsPage } from '@renderer/pages/cockpit/PullRequestsPage'
import { CiRunsPage } from '@renderer/pages/cockpit/CiRunsPage'
import { SettingsPage } from '@renderer/pages/settings/SettingsPage'
import { ThemesPage } from '@renderer/pages/themes/ThemesPage'
import { WidgetsPage } from '@renderer/pages/widgets/WidgetsPage'
import type { PageDefinition } from '@renderer/types/pages'

/**
 * Repo Cockpit — the app's page set.
 *
 * This is the ONLY file a page touches: each entry becomes a sidebar item AND
 * a tab segment automatically. The shell itself is never edited to add a page
 * (AGENTS.md §6).
 *
 * `category` groups the entries into sub-tab clusters in the top bar —
 * Workspace for reading state, Ship for work that leaves the machine.
 *
 * Themes and Widgets are the framework's own galleries, kept reachable by tab
 * (showInSidebar: false) so the boilerplate's preset system stays one click
 * away without crowding the workspace navigation.
 */
export const PAGES: PageDefinition[] = [
  {
    id: 'repos',
    label: 'Repos',
    description: 'Live git state for every repository',
    category: 'Workspace',
    icon: FolderGit2,
    component: ReposPage
  },
  {
    id: 'worktrees',
    label: 'Worktrees',
    description: 'Linked checkouts and their branches',
    category: 'Workspace',
    icon: FolderTree,
    component: WorktreesPage
  },
  {
    id: 'builds',
    label: 'Builds',
    description: 'Run npm scripts as supervised children',
    category: 'Ship',
    icon: Hammer,
    component: BuildsPage
  },
  {
    id: 'pull-requests',
    label: 'PR Queue',
    description: 'Open pull requests, live from gh',
    category: 'Ship',
    icon: GitPullRequest,
    component: PullRequestsPage
  },
  {
    id: 'ci',
    label: 'CI Runs',
    description: 'GitHub Actions workflow runs',
    category: 'Ship',
    icon: Activity,
    component: CiRunsPage
  },
  {
    id: 'themes',
    label: 'Themes',
    description: '10 color presets',
    category: 'Design',
    icon: Palette,
    component: ThemesPage,
    showInSidebar: false
  },
  {
    id: 'widgets',
    label: 'Widgets',
    description: 'The component kit',
    category: 'Design',
    icon: LayoutGrid,
    component: WidgetsPage,
    showInSidebar: false
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'App preferences and diagnostics',
    icon: SettingsIcon,
    component: SettingsPage,
    showInSidebar: false // reached via the gear in the sidebar footer
  }
]
