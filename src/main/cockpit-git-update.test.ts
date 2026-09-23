import { describe, expect, it } from 'vitest'
import {
  parseIncomingCommits,
  detectDependencyChanges,
  parseUpstreamBranch
} from './cockpit-parsers'

describe('parseIncomingCommits', () => {
  it('returns empty array for empty or whitespace string', () => {
    expect(parseIncomingCommits('')).toEqual([])
    expect(parseIncomingCommits('   \n  \t  ')).toEqual([])
  })

  it('parses single incoming commit correctly', () => {
    const raw =
      'abc1234def567890\u001ffeat: add git update support\u001fAlice\u001f2026-09-22T12:00:00Z'
    const result = parseIncomingCommits(raw)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      hash: 'abc1234def567890',
      shortHash: 'abc1234',
      subject: 'feat: add git update support',
      author: 'Alice',
      date: '2026-09-22T12:00:00Z'
    })
  })

  it('parses multiple incoming commits and ignores blank lines', () => {
    const raw = [
      '1111111aaaaabbbb\u001ffix(ui): improve layout padding\u001fBob\u001f2026-09-22T10:00:00Z',
      '',
      '2222222cccccdddd\u001fchore: bump dependencies\u001fCharlie\u001f2026-09-22T11:00:00Z'
    ].join('\n')

    const result = parseIncomingCommits(raw)
    expect(result).toHaveLength(2)
    expect(result[0].shortHash).toBe('1111111')
    expect(result[0].subject).toBe('fix(ui): improve layout padding')
    expect(result[0].author).toBe('Bob')
    expect(result[1].shortHash).toBe('2222222')
    expect(result[1].subject).toBe('chore: bump dependencies')
    expect(result[1].author).toBe('Charlie')
  })
})

describe('detectDependencyChanges', () => {
  it('returns false when no dependency files are modified', () => {
    const files = 'src/main/index.ts\nREADME.md\ndocs/guide.png'
    const result = detectDependencyChanges(files)
    expect(result.dependenciesChanged).toBe(false)
    expect(result.files).toHaveLength(0)
  })

  it('detects root package.json and package-lock.json', () => {
    const files = 'package.json\nsrc/App.tsx'
    const result = detectDependencyChanges(files)
    expect(result.dependenciesChanged).toBe(true)
    expect(result.files).toEqual(['package.json'])
  })

  it('detects lockfiles and nested package manifests', () => {
    const files = ['packages/client/package.json', 'yarn.lock', 'pnpm-lock.yaml']
    const result = detectDependencyChanges(files)
    expect(result.dependenciesChanged).toBe(true)
    expect(result.files).toEqual(['packages/client/package.json', 'yarn.lock', 'pnpm-lock.yaml'])
  })
})

describe('parseUpstreamBranch', () => {
  it('returns null for empty or fatal error output', () => {
    expect(parseUpstreamBranch('')).toBeNull()
    expect(parseUpstreamBranch('fatal: no upstream configured for branch')).toBeNull()
    expect(parseUpstreamBranch('@{u}')).toBeNull()
  })

  it('parses valid upstream branch', () => {
    expect(parseUpstreamBranch('origin/main\n')).toBe('origin/main')
    expect(parseUpstreamBranch('upstream/feat-branch')).toBe('upstream/feat-branch')
  })
})

describe('gitCheckUpdate live inspection', () => {
  it('inspects current repository without throwing', async () => {
    const { gitCheckUpdate } = await import('./cockpit/git')
    const res = await gitCheckUpdate(process.cwd())
    expect(res.ok).toBe(true)
    expect(res.repoName).toBe('electron_app')
    expect(res.branch).toBe('main')
    expect(typeof res.behind).toBe('number')
    expect(typeof res.ahead).toBe('number')
    expect(Array.isArray(res.incomingCommits)).toBe(true)
    expect(Array.isArray(res.changedFiles)).toBe(true)
  })
})
