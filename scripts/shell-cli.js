#!/usr/bin/env node
/**
 * shell-cli — zero-dependency setup/run/package CLI for the framework.
 *
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

  help() {
    banner()
    console.log(`  ${c.bold}Usage:${c.reset} node scripts/shell-cli.js <command>\n`)
    for (const [name, desc] of Object.entries({
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
