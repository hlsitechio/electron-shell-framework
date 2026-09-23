/* global window, document */
const { _electron: electron } = require('@playwright/test')
const path = require('path')
const fs = require('fs')

const PRESETS = [
  { id: 'muted-violet', theme: 'dark', name: 'Muted Violet' },
  { id: 'poiesis-blue', theme: 'dark', name: 'Poiesis Blue' },
  { id: 'midnight-purple', theme: 'dark', name: 'Midnight Purple' },
  { id: 'noguchi', theme: 'dark', name: 'Noguchi' },
  { id: 'dark-indigo', theme: 'dark', name: 'Dark Indigo' },
  { id: 'shadow-peonies', theme: 'dark', name: 'Shadow Peonies' },
  { id: 'poiesis-purple', theme: 'dark', name: 'Poiesis Purple' },
  { id: 'winter-woods', theme: 'dark', name: 'Winter Woods' },
  { id: 'carbon', theme: 'dark', name: 'Carbon' },
  { id: 'frost', theme: 'light', name: 'Frost' }
]

async function run() {
  const outDir = path.join(__dirname, '../docs/themes')
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  console.log('Launching Electron window...')
  const app = await electron.launch({
    args: ['.'],
    env: { ...process.env, NODE_ENV: 'production' }
  })

  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.waitForTimeout(1500)

  for (let i = 0; i < PRESETS.length; i++) {
    const p = PRESETS[i]
    console.log(`Capturing preset ${i + 1}/${PRESETS.length}: ${p.name} (${p.id})...`)

    await page.evaluate(
      ({ presetId, themeMode }) => {
        const win = window
        if (win.__shellSetPreset) {
          win.__shellSetPreset(presetId)
        } else {
          document.documentElement.setAttribute('data-preset', presetId)
        }
        if (win.__shellSetTheme) {
          win.__shellSetTheme(themeMode)
        } else {
          document.documentElement.setAttribute('data-theme', themeMode)
        }
        document.documentElement.setAttribute('data-preset', presetId)
        document.documentElement.setAttribute('data-theme', themeMode)
      },
      { presetId: p.id, themeMode: p.theme }
    )

    await page.waitForTimeout(800)

    const filename = `${String(i + 1).padStart(2, '0')}-${p.id}.png`
    const filepath = path.join(outDir, filename)
    await page.screenshot({ path: filepath })
    console.log(`Saved ${filename}`)
  }

  await app.close()
  console.log('All 10 theme screenshots captured!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
