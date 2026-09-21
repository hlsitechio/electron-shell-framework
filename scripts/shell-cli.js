#!/usr/bin/env node
/**
 * shell-cli — zero-dependency setup/run/package/create CLI for the framework.
 *
 *   node scripts/shell-cli.js create    # scaffold a STANDALONE app from a template
 *   node scripts/shell-cli.js login     # GitHub CLI auth + commit identity
 *   node scripts/shell-cli.js install   # IRM: full step-by-step install
 *   node scripts/shell-cli.js check     # environment preflight only
 *   node scripts/shell-cli.js dev       # run dev server (HMR)
 *   node scripts/shell-cli.js build     # production build (out/)
 *   node scripts/shell-cli.js run       # build + launch the app
 *   node scripts/shell-cli.js test      # unit + e2e tests
 *   node scripts/shell-cli.js package   # build + NSIS/portable installers
 *
 * Node-only stdlib — no dependencies.
 */
'use strict'

const { execSync, spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const has = (name) => {
  try {
    execSync(`${commandExists(name)}`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}
const commandExists = (name) => (os.platform() === 'win32' ? `where ${name}` : `command -v ${name}`)

/** Quote a shell arg when it contains characters outside a safe set. */
function shq(a) {
  return /^[A-Za-z0-9_./:=@-]+$/.test(a) ? a : `"${String(a).replace(/"/g, '\\"')}"`
}

// ---------------------------------------------------------------------------
// tiny UI helpers
// ---------------------------------------------------------------------------
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function banner() {
  console.log('')
  console.log(`  ${c.cyan}${c.bold}  ┌────────────────────────────────────────┐${c.reset}`)
  console.log(`  ${c.cyan}${c.bold}  │   electron shell framework — shell-cli   │${c.reset}`)
  console.log(`  ${c.cyan}${c.bold}  └────────────────────────────────────────┘${c.reset}`)
  console.log('')
}

function log(step, msg) {
  console.log(`  ${c.cyan}${String(step).padStart(2, '0')}${c.reset} ${msg}`)
}
function ok(msg) {
  console.log(`  ${c.green}✓${c.reset} ${msg}`)
}
function warn(msg) {
  console.log(`  ${c.yellow}!${c.reset} ${msg}`)
}
function fail(msg) {
  console.log(`  ${c.red}✗${c.reset} ${msg}`)
}
function section(msg) {
  console.log(`\n  ${c.bold}${msg}${c.reset}`)
}

function stepTitle(i, total, msg) {
  console.log(`\n  ${c.bold}${c.blue}— Step ${i}/${total}: ${msg}${c.reset}`)
}

function die(msg, code = 1) {
  fail(msg)
  process.exit(code)
}

function run(name, args = [], opts = {}) {
  const win = os.platform() === 'win32'
  // Windows: resolve .cmd shims via a shell, but pass ONE quoted string
  // (args+shell triggers DEP0190 and unescaped concatenation).
  const command = win ? `${name} ${args.map(shq).join(' ')}` : name
  const r = spawnSync(command, win ? [] : args, {
    cwd: ROOT,
    stdio: opts.quiet ? 'ignore' : 'inherit',
    shell: win,
    env: { ...process.env, ...(opts.env || {}) }
  })
  if (r.status !== 0 && !opts.allowFail) {
    die(`Command failed: ${name} ${args.join(' ')}`, r.status || 1)
  }
  return r
}

function nodeVersion() {
  const v = process.versions.node.split('.')[0]
  return Number(v)
}

/** Set a repo-local git config value (no-op if git is unavailable). */
function gitConfig(key, value) {
  // no shell: true — the value can contain characters (dots, @, +) that
  // would need escaping, and shell:true triggers DEP0190.
  const r = spawnSync('git', ['config', key, value], { cwd: ROOT, stdio: 'ignore' })
  return r.status === 0
}

/** Recursively copy a directory, skipping named entries. */
function copyTree(from, to, skip) {
  fs.mkdirSync(to, { recursive: true })
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue
    const src = path.join(from, entry.name)
    const dst = path.join(to, entry.name)
    if (entry.isDirectory()) copyTree(src, dst, skip)
    else if (entry.isFile()) fs.copyFileSync(src, dst)
  }
}

/**
 * The registry a scaffolded app starts with.
 *
 * The demo pages are gone, so the app owns this file outright. It keeps one
 * page wired to the shell contract so `npm start` shows something real — the
 * app's own screens come from the template in templates/<id>.tsx.
 */
const DEMO_REGISTRY_STUB = `import { LayoutDashboard } from 'lucide-react'
import { SettingsPage } from '@renderer/pages/settings/SettingsPage'
import type { PageDefinition } from '@renderer/types/pages'

/**
 * Your app's framework pages.
 *
 * The app's real screens come from the template set as DEFAULT_TEMPLATE_ID in
 * templates/default.ts — this registry only holds pages that should exist for
 * EVERY template (settings, and anything you add here).
 *
 * Adding a page: create the component, then add an entry below.
 */
export const PAGES: PageDefinition[] = [
  {
    id: 'home',
    label: 'Home',
    description: 'Your first page',
    icon: LayoutDashboard,
    component: () => null,
    showInSidebar: false
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'App preferences',
    icon: LayoutDashboard,
    component: SettingsPage,
    showInSidebar: false
  }
]
`

// ---------------------------------------------------------------------------
// preflight
// ---------------------------------------------------------------------------
function preflight() {
  section('Environment preflight')
  const checks = []
  const npm = has('npm')
  const git = has('git')

  checks.push({ name: `Node ${process.version}`, pass: nodeVersion() >= 20 })

  if (!npm) checks.push({ name: 'npm', pass: false })
  else checks.push({ name: `npm ${execSync('npm --version').toString().trim()}`, pass: true })
  checks.push({ name: 'git', pass: git })

  let okCount = 0
  for (const ck of checks) {
    if (ck.pass) {
      okCount++
      ok(`${ck.name}`)
    } else {
      fail(`${ck.name} — MISSING or too old (>= 20 required)`)
    }
  }

  if (okCount !== checks.length) {
    die('Preflight failed — fix the items above and re-run.')
  }
  ok('Environment is ready.')
  return true
}

// ---------------------------------------------------------------------------
// install (IRM — Install, Run, Manage: the full step-by-step flow)
// ---------------------------------------------------------------------------
function install() {
  const TOTAL = 6
  let step = 0
  const doPackage = process.argv.includes('--package')

  banner()
  stepTitle(++step, TOTAL, 'Preflight')
  preflight()

  stepTitle(++step, TOTAL, 'Install dependencies')
  log(step, 'Installing packages (npm install — may take a few minutes)…')
  run('npm', ['install'], { quiet: false })
  ok('Dependencies installed.')

  stepTitle(++step, TOTAL, 'Sanity checks')
  log(step, 'Type-checking…')
  run('npm', ['run', 'typecheck'])
  ok('Types OK.')
  log(step, 'Linting…')
  run('npm', ['run', 'lint'])
  ok('Lint OK.')
  log(step, 'Running unit tests…')
  run('npm', ['test'])
  ok('Tests OK.')

  stepTitle(++step, TOTAL, 'Build')
  log(step, 'Building production bundle into out/…')
  run('npm', ['run', 'build'])
  ok('Build OK.')

  stepTitle(++step, TOTAL, 'Run')
  log(step, 'Launching the app (close it to continue)…')
  run('npm', ['run', 'start'])
  ok('App launched.')

  stepTitle(++step, TOTAL, 'Package (optional)')
  if (doPackage) {
    log(step, 'Building installers with electron-builder…')
    run('npm', ['run', 'dist:win'])
    ok('Installers built — check release/ folder.')
  } else {
    warn('Packaging skipped (run `node scripts/shell-cli.js package` to build installers).')
  }

  section('Install complete 🎉')
  console.log('  Next steps:')
  console.log('    •  node scripts/shell-cli.js dev       – start HMR dev server')
  console.log('    •  node scripts/shell-cli.js package   – build installers')
  console.log('    •  add pages in src/renderer/src/pages/registry.tsx\n')
}

// ---------------------------------------------------------------------------
// commands
// ---------------------------------------------------------------------------
const commands = {
  install,

  check() {
    banner()
    preflight()
  },

  dev() {
    banner()
    section('Dev server (HMR)')
    run('npm', ['run', 'dev'])
  },

  build() {
    banner()
    section('Build')
    run('npm', ['run', 'build'])
    ok('Build complete — out/ ready.')
  },

  run() {
    banner()
    section('Build + run')
    run('npm', ['run', 'build'])
    run('npm', ['run', 'start'])
  },

  test() {
    banner()
    section('Unit tests')
    run('npm', ['test'])
    ok('Unit tests passed.')
    section('E2E tests (build + playwright)')
    run('npm', ['run', 'test:e2e'])
    ok('E2E tests passed.')
  },

  package() {
    banner()
    section('Package (win x64 → NSIS + portable)')
    run('npm', ['run', 'dist:win'])
    ok('Packaging complete — check release/ folder.')
  },

  /**
   * create — scaffold a STANDALONE app from a template.
   *
   *   node scripts/shell-cli.js create ../my-app --template finance --name "My Finance"
   *
   * Copies the framework, strips the demo pages, sets the default template and
   * rewrites the app identity. The result is a real project, not a fork you
   * have to hand-clean.
   */
  create() {
    banner()
    section('Create a standalone app')

    const args = process.argv.slice(3)
    const target = args.find((a) => !a.startsWith('--'))
    const flag = (name, fallback) => {
      const i = args.indexOf(`--${name}`)
      return i >= 0 && args[i + 1] ? args[i + 1] : fallback
    }
    const templateId = flag('template', null)
    const appName = flag('name', null)

    // Discover available templates without importing TypeScript: read the ids
    // straight out of the catalog's lazy-loader map.
    const catalogSrc = fs.readFileSync(
      path.join(ROOT, 'src/renderer/src/templates/catalog.ts'),
      'utf-8'
    )
    const ids = [...catalogSrc.matchAll(/^\s{2}([a-z0-9-]+):\s*\(\)\s*=>/gm)].map((m) => m[1])

    if (!target) {
      section('Usage')
      console.log(
        '  node scripts/shell-cli.js create <dir> [--template <id>] [--name "<App Name>"]\n'
      )
      console.log(`  ${c.bold}Available templates:${c.reset}`)
      for (const id of ids) console.log(`    ${c.green}${id}${c.reset}`)
      console.log('')
      die('Missing target directory.', 1)
    }
    if (!templateId || !ids.includes(templateId)) {
      if (templateId) fail(`Unknown template: ${templateId}`)
      section('Pick one of these templates (--template <id>)')
      for (const id of ids) console.log(`    ${c.green}${id}${c.reset}`)
      console.log('')
      die('A valid --template is required so the app has a home screen.', 1)
    }

    const dest = path.resolve(process.cwd(), target)
    if (fs.existsSync(dest) && fs.readdirSync(dest).length > 0) {
      die(`Target already exists and is not empty: ${dest}`, 1)
    }

    const SKIP = new Set([
      'node_modules',
      'out',
      'release',
      'dist',
      '.git',
      '.proof',
      'test-results',
      'playwright-report',
      'docs',
      '.github'
    ])

    log(1, `Copying framework → ${dest}`)
    fs.mkdirSync(dest, { recursive: true })
    copyTree(ROOT, dest, SKIP)
    ok('Framework copied.')

    log(2, `Setting the app's default template → ${templateId}`)
    const defaultFile = path.join(dest, 'src/renderer/src/templates/default.ts')
    const dsrc = fs.readFileSync(defaultFile, 'utf-8')
    fs.writeFileSync(
      defaultFile,
      dsrc.replace(
        /export const DEFAULT_TEMPLATE_ID = '[^']*'/,
        `export const DEFAULT_TEMPLATE_ID = '${templateId}'`
      ),
      'utf-8'
    )
    ok(`App boots into the "${templateId}" template.`)

    if (appName) {
      log(3, `Renaming the app → ${appName}`)
      // package.json
      const pkgFile = path.join(dest, 'package.json')
      const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'))
      const slug = appName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      pkg.name = slug
      pkg.productName = appName
      pkg.private = true
      delete pkg.description
      fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')

      // In-app branding — the sidebar + footer read this default, so renaming
      // package.json alone still shows "App Shell" in the running app.
      const brandFile = path.join(dest, 'src/renderer/src/lib/useBranding.ts')
      if (fs.existsSync(brandFile)) {
        let b = fs.readFileSync(brandFile, 'utf-8')
        b = b.replace(
          /const DEFAULT_BRANDING: Branding = \{ appName: '[^']*', logo: null \}/,
          `const DEFAULT_BRANDING: Branding = { appName: '${appName.replace(/'/g, "\\'")}', logo: null }`
        )
        fs.writeFileSync(brandFile, b, 'utf-8')
      }

      // electron-builder productName + appId.
      // NOTE: electron-builder.yml is JSON-with-quoted-keys here, so the
      // patterns must tolerate 'key': 'value' as well as key: value.
      const ebFile = path.join(dest, 'electron-builder.yml')
      if (fs.existsSync(ebFile)) {
        let eb = fs.readFileSync(ebFile, 'utf-8')
        const before = eb
        eb = eb.replace(/(['"]?productName['"]?\s*:\s*)(['"]?)[^,'"\n]+\2/, `$1'${appName}'`)
        eb = eb.replace(/(['"]?appId['"]?\s*:\s*)(['"]?)[^,'"\n]+\2/, `$1'com.example.${slug}'`)
        if (eb === before)
          warn('electron-builder.yml: no productName/appId pattern matched — check it by hand.')
        else fs.writeFileSync(ebFile, eb, 'utf-8')
      }
      ok(`package.json + useBranding.ts + electron-builder.yml → ${appName} (${slug})`)
    }

    log(4, 'Removing the framework demo pages')
    for (const d of ['pages/themes', 'pages/widgets']) {
      const p = path.join(dest, 'src/renderer/src', d)
      if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true })
    }
    // trim the demo registry to a single home page owned by the app
    const regFile = path.join(dest, 'src/renderer/src/pages/registry.tsx')
    fs.writeFileSync(regFile, DEMO_REGISTRY_STUB, 'utf-8')
    ok('Demo pages removed — registry is now yours.')

    log(5, 'Removing tests that covered the demo pages')
    for (const t of [
      'pages/registry.test.ts',
      'lib/presets.test.ts',
      'templates/templates.test.ts'
    ]) {
      const p = path.join(dest, 'src/renderer/src', t)
      if (fs.existsSync(p)) fs.rmSync(p, { force: true })
    }
    ok('Trimmed.')

    section(`App created: ${appName || path.basename(dest)}`)
    console.log('  Next steps:')
    console.log(`    cd ${target}`)
    console.log('    npm install')
    console.log('    npm start              – builds + launches YOUR app')
    console.log('')
    console.log(
      `  ${c.dim}Your screens live in src/renderer/src/templates/${templateId}.tsx${c.reset}`
    )
    console.log(`  ${c.dim}Read AGENTS.md before editing — it is the build contract.${c.reset}\n`)
  },

  login() {
    banner()
    section('GitHub login')
    const authed = has('gh')
    if (!authed) {
      fail('gh (GitHub CLI) not found — install it, then re-run.')
      console.log(`  ${c.dim}https://cli.github.com${c.reset}`)
      die('Login not possible without the GitHub CLI.')
    }

    const status = spawnSync('gh', ['auth', 'status'], { encoding: 'utf-8' })
    const loggedIn = status.status === 0

    if (!loggedIn) {
      warn('Not logged in to GitHub.')
      log('  ', 'Launching `gh auth login` (interactive)…')
      run('gh', ['auth', 'login', '--web', '--git-protocol', 'https'], { allowFail: true })
    } else {
      const line = (status.stdout || status.stderr || '')
        .split('\n')
        .map((l) => l.trim())
        .find((l) => l.includes('Logged in'))
      // gh's own output already starts with "✓" — don't double it
      if (line) console.log(`  ${c.green}✓${c.reset} ${line.replace(/^✓\s*/, '')}`)
      else ok('Logged in to github.com')
    }

    // git uses the gh credential helper → no token in config, no token on disk
    const setup = spawnSync('gh', ['auth', 'setup-git'], { stdio: 'ignore' })
    if (setup.status === 0) ok('git credential helper → gh')
    else warn('Could not wire the gh credential helper (git may still work via another helper).')

    // commit identity: the noreply address, so pushes are never blocked.
    // NOTE: no `shell: true` anywhere here — DEP0190, and it mangles --jq.
    const who = spawnSync('gh', ['api', 'user', '--jq', '.login + " " + (.id|tostring)'], {
      encoding: 'utf-8'
    })
    const whoOut = (who.stdout || '').trim()
    if (who.status === 0 && whoOut) {
      const [login, id] = whoOut.split(/\s+/)
      const email = `${id}+${login}@users.noreply.github.com`
      const nameOk = gitConfig('user.name', login)
      const mailOk = gitConfig('user.email', email)
      if (nameOk && mailOk) ok(`commit identity → ${login} <${email}>`)
      else warn('Could not write git config — set user.email manually before committing.')
    } else {
      warn('Could not read the account from gh — set user.email manually before committing.')
    }

    section('Login complete')
    console.log('  Next steps:')
    console.log('    •  node scripts/shell-cli.js install   – full install')
    console.log('    •  git push origin main                – publish (no email block)\n')
  },

  help() {
    banner()
    console.log(`  ${c.bold}Usage:${c.reset} node scripts/shell-cli.js <command>\n`)
    for (const [name, desc] of Object.entries({
      login: 'authenticate via the GitHub CLI + set the commit identity',
      install:
        'full step-by-step install (IRM) — preflight → deps → checks → build → run → package',
      check: 'environment preflight only',
      dev: 'start the dev server (HMR)',
      build: 'production build to out/',
      run: 'build then launch the app',
      test: 'unit tests + e2e tests',
      package: 'build NSIS installer + portable exe',
      help: 'this help'
    })) {
      console.log(`  ${c.green}${name.padEnd(9)}${c.reset}${desc}`)
    }
    console.log('')
  }
}

const cmd = process.argv[2] || 'help'
if (!commands[cmd]) {
  fail(`Unknown command: ${cmd}`)
  commands.help()
  process.exit(1)
}
commands[cmd]()
