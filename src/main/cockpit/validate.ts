import { z } from 'zod'
import { existsSync } from 'node:fs'

/**
 * Input validation for every renderer-supplied value.
 *
 * The renderer is treated as untrusted: even though it is our own bundle, a
 * `branch` or `script` string flowing into a child process is exactly where a
 * command-injection bug would live. Each schema is an allowlist, not a
 * denylist, and each is applied in ipc.ts before the value is used.
 */

/** repoId is a truncated sha1 hex — see exec.hashId. */
export const repoIdSchema = z.string().regex(/^[a-f0-9]{16}$/)

export const buildIdSchema = z.string().regex(/^build_\d+_\d+$/)

/**
 * npm script names are taken from the repo's OWN package.json, so this regex
 * only has to be strict enough to reject shell metacharacters.
 */
export const scriptSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9:_-]+$/, 'Invalid script name')

/** A branch name git itself would accept — no leading dash, no '..', no shell chars. */
export const branchSchema = z
  .string()
  .min(1)
  .max(150)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9/_.-]*$/, 'Invalid branch name')
  .refine((v) => !v.includes('..'), 'Invalid branch name')
  .refine((v) => !v.endsWith('/'), 'Invalid branch name')
  .refine((v) => !v.endsWith('.lock'), 'Invalid branch name')
  .refine((v) => !/[\\~^:?*[\]]/.test(v), 'Invalid branch name')

export const colsSchema = z.number().int().min(2).max(500)
export const rowsSchema = z.number().int().min(1).max(300)

/** Terminal keystrokes are capped so a paste cannot exhaust main-process memory. */
export const terminalInputSchema = z.string().max(65536)

/**
 * Any path a renderer asks us to reveal or open must already belong to a repo
 * we inspected — this function is the check, called with the live repo list.
 */
export function isKnownPath(candidate: string, knownPaths: string[]): boolean {
  const norm = candidate.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()
  return knownPaths.some((p) => p.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase() === norm)
}

/** Directory picker result sanity check. */
export function isUsableDirectory(path: string): boolean {
  try {
    return existsSync(path)
  } catch {
    return false
  }
}

export function isGithubUrl(raw: string): boolean {
  try {
    const url = new URL(raw)
    return (
      url.protocol === 'https:' &&
      url.hostname === 'github.com' &&
      !url.port &&
      !url.username &&
      !url.password
    )
  } catch {
    return false
  }
}
