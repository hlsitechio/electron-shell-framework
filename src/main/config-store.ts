import { app, safeStorage } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

/**
 * Encrypted JSON config store.
 *
 * Values are serialized then encrypted with Electron safeStorage (DPAPI on
 * Windows, Keychain on macOS). Where safeStorage is unavailable (headless
 * Linux without a keyring) it falls back to plaintext JSON behind a flag.
 *
 * File layout:
 *   userData/config.json  →  { "encrypted": true, "theme": "base64..." , "window": "base64..." }
 */
type ConfigValue = string | number | boolean | null | object | unknown[]

interface ConfigFile {
  encrypted: boolean
  values: Record<string, string>
}

const FILE = 'config.json'

export class ConfigStore {
  private readonly filePath: string
  private cache: ConfigFile | null = null

  constructor() {
    this.filePath = join(app.getPath('userData'), FILE)
  }

  private load(): ConfigFile {
    if (this.cache) return this.cache
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8')
        this.cache = JSON.parse(raw) as ConfigFile
        return this.cache
      }
    } catch (err) {
      console.error('[config] failed to read config file:', err)
    }
    this.cache = { encrypted: safeStorage.isEncryptionAvailable(), values: {} }
    return this.cache
  }

  private persist(): void {
    if (!this.cache) return
    try {
      mkdirSync(dirname(this.filePath), { recursive: true })
      writeFileSync(this.filePath, JSON.stringify(this.cache, null, 2), 'utf-8')
    } catch (err) {
      console.error('[config] failed to write config file:', err)
    }
  }

  private encode(value: ConfigValue): string {
    const serialized = JSON.stringify(value)
    if (this.load().encrypted && safeStorage.isEncryptionAvailable()) {
      return `enc:${safeStorage.encryptString(serialized).toString('base64')}`
    }
    return `raw:${Buffer.from(serialized, 'utf-8').toString('base64')}`
  }

  private decode(entry: string): ConfigValue | null {
    try {
      if (entry.startsWith('enc:')) {
        const decrypted = safeStorage.decryptString(Buffer.from(entry.slice(4), 'base64'))
        return JSON.parse(decrypted) as ConfigValue
      }
      if (entry.startsWith('raw:')) {
        return JSON.parse(Buffer.from(entry.slice(4), 'base64').toString('utf-8')) as ConfigValue
      }
    } catch (err) {
      console.error('[config] failed to decode entry:', err)
    }
    return null
  }

  get<T extends ConfigValue>(key: string, fallback: T): T {
    const file = this.load()
    const entry = file.values[key]
    if (entry === undefined) return fallback
    const decoded = this.decode(entry)
    return (decoded === null ? fallback : decoded) as T
  }

  set(key: string, value: ConfigValue): void {
    const file = this.load()
    file.values[key] = this.encode(value)
    file.encrypted = safeStorage.isEncryptionAvailable()
    this.persist()
  }

  has(key: string): boolean {
    return key in this.load().values
  }
}

export const configStore = new ConfigStore()
