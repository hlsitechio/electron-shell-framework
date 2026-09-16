import {
  test,
  expect,
  _electron as electron,
  type ElectronApplication,
  type Page
} from '@playwright/test'

/**
 * Shell smoke e2e — launches the REAL packaged renderer via Electron
 * (out/ build) and asserts the framework chrome exists and works:
 * single top bar, tabs, window controls, both sidebars, footer.
 */

let app: ElectronApplication
let page: Page

test.beforeAll(async () => {
  app = await electron.launch({ args: ['.'] })
  page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
})

test.afterAll(async () => {
  await app?.close()
})

test('framework chrome renders', async () => {
  // Top bar: collapse toggle + tabs + window controls in ONE strip
  await expect(page.getByLabel('Collapse tabs')).toBeVisible()
  await expect(page.getByLabel('Minimize')).toBeVisible()
  await expect(page.getByLabel('Maximize')).toBeVisible()
  await expect(page.getByLabel('Close', { exact: true })).toBeVisible()

  // Tabs from the registry: Dashboard, Settings, Chat, Documents
  await expect(page.getByRole('button', { name: 'Dashboard', exact: true }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Chat', exact: true }).first()).toBeVisible()

  // Left sidebar: nav + profile + collapse toggle (expanded state)
  await expect(page.getByLabel('Profile')).toBeVisible()
  await expect(page.getByLabel('Collapse sidebar')).toBeVisible()

  // Right panel: notifications/log header
  await expect(page.getByLabel('Notifications')).toBeVisible()
  await expect(page.getByLabel('Activity log')).toBeVisible()

  // Footer
  await expect(page.getByText('All systems operational')).toBeVisible()
})

test('collapsing tabs hides the strip entirely', async () => {
  await expect(page.getByLabel('Collapse tabs')).toBeVisible()

  await page.getByLabel('Collapse tabs').click()

  // …strip is gone: the toggle now reads "Expand tabs"
  await expect(page.getByLabel('Expand tabs')).toBeVisible()
  await expect(page.getByLabel('Collapse tabs')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Dashboard', exact: true }).first()).toBeVisible()

  // restore
  await page.getByLabel('Expand tabs').click()
  await expect(page.getByLabel('Collapse tabs')).toBeVisible()
})

test('window controls are pinned to the right edge', async () => {
  const closeBox = await page.getByLabel('Close', { exact: true }).boundingBox()
  // Electron windows have no browser viewport — measure content width via innerWidth
  const innerWidth: number = await page.evaluate(() => window.innerWidth)
  expect(closeBox).not.toBeNull()
  // close button's right edge == window right edge (within 2px, no trailing space)
  expect(Math.abs(closeBox!.x + closeBox!.width - innerWidth)).toBeLessThanOrEqual(2)
})
