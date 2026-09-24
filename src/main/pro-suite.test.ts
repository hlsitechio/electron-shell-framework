import { describe, expect, it } from 'vitest'
import { parseDiffFiles, parseBranchList } from './cockpit-parsers'
import { detectInstalledIdes } from './cockpit/ide'

describe('parseDiffFiles', () => {
  it('parses empty status without files', () => {
    expect(parseDiffFiles('')).toEqual([])
  })

  it('parses unstaged and untracked files with line counts', () => {
    const statusZ = ['## main...origin/main', ' M src/App.tsx', '?? README.md', ''].join('\0')
    const diff = [
      'diff --git a/src/App.tsx b/src/App.tsx',
      '--- a/src/App.tsx',
      '+++ b/src/App.tsx',
      '@@ -1,3 +1,4 @@',
      ' export default function App() {',
      '+  console.log("hello");',
      '-  return null;',
      '+  return <div>App</div>;',
      ' }'
    ].join('\n')

    const result = parseDiffFiles(statusZ, diff, '')
    expect(result).toHaveLength(2)
    expect(result[0].path).toBe('src/App.tsx')
    expect(result[0].status).toBe('modified')
    expect(result[0].staged).toBe(false)
    expect(result[0].additions).toBe(2)
    expect(result[0].deletions).toBe(1)

    expect(result[1].path).toBe('README.md')
    expect(result[1].status).toBe('untracked')
    expect(result[1].staged).toBe(false)
  })
})

describe('parseBranchList', () => {
  it('parses local, current, and tracking branches', () => {
    const raw = [
      '* main                e85e7b1 [origin/main: ahead 1] feat: add update engine',
      '  feat/pro-suite      a1b2c3d [origin/feat/pro-suite: behind 2] wip: command palette',
      '  remotes/origin/HEAD -> origin/main',
      '  remotes/origin/main e85e7b1 feat: add update engine'
    ].join('\n')

    const result = parseBranchList(raw)
    expect(result.length).toBeGreaterThanOrEqual(2)

    const main = result.find((b) => b.name === 'main')
    expect(main).toBeDefined()
    expect(main?.current).toBe(true)
    expect(main?.remote).toBe(false)
    expect(main?.upstream).toBe('origin/main')
    expect(main?.ahead).toBe(1)
    expect(main?.behind).toBe(0)

    const feat = result.find((b) => b.name === 'feat/pro-suite')
    expect(feat).toBeDefined()
    expect(feat?.current).toBe(false)
    expect(feat?.behind).toBe(2)
  })
})

describe('detectInstalledIdes', () => {
  it('detects available IDEs without throwing', async () => {
    const result = await detectInstalledIdes()
    expect(result).toBeDefined()
    expect(typeof result.installed.explorer).toBe('boolean')
    expect(typeof result.installed.terminal).toBe('boolean')
    expect(typeof result.defaultIde).toBe('string')
  }, 15000)
})
