import { build as viteBuild } from 'vite'
import chalk from 'chalk'

const TAG = chalk.bgBlue('[build.mjs]')

const viteConfigs = {
  main: './.vite/vite.main.ts',
  preload: './.vite/vite.preload.ts',
  renderer: './.vite/vite.renderer.ts',
}

async function buildElectron() {
  for (const [name, configPath] of Object.entries(viteConfigs)) {
    console.group(TAG, name)
    await viteBuild({
      configFile: configPath,
      mode: 'production',
    })
    console.groupEnd()
    console.log()
  }
}

// bootstrap
await buildElectron()
