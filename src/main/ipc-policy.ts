import { app, type BrowserWindow, type IpcMainEvent, type IpcMainInvokeEvent } from 'electron'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const ownedContents = new Set<number>()

export function ownWindow(win: BrowserWindow): void {
  const id = win.webContents.id
  ownedContents.add(id)
  win.webContents.once('destroyed', () => ownedContents.delete(id))
}

export function isOwnDocument(raw: string): boolean {
  try {
    const actual = new URL(raw)
    actual.hash = ''
    const renderer =
      !app.isPackaged && process.env['ELECTRON_RENDERER_URL']
        ? process.env['ELECTRON_RENDERER_URL']!
        : pathToFileURL(join(__dirname, '../renderer/index.html')).href
    const expected = new URL(renderer)
    expected.hash = ''
    return actual.href === expected.href
  } catch {
    return false
  }
}

export function isTrustedSender(event: IpcMainEvent | IpcMainInvokeEvent): boolean {
  return (
    ownedContents.has(event.sender.id) &&
    event.senderFrame !== null &&
    event.senderFrame === event.sender.mainFrame &&
    event.senderFrame.parent === null &&
    isOwnDocument(event.senderFrame.url)
  )
}
