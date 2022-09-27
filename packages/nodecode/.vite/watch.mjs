import { readFileSync } from 'fs'
import { join } from 'path'
import electron from 'electron'
import { spawn } from 'child_process'
import { createServer, build as viteBuild } from 'vite'

const pkg = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf8')
)

/**
 * @param {{ name: string; configFile: string; writeBundle: import('rollup').OutputPlugin['writeBundle'] }} param0
 * @returns {import('rollup').RollupWatcher}
 */
function getWatcher({ name, configFile, writeBundle }) {
  return viteBuild({
    // Options here precedence over configFile
    mode: 'development',
    build: {
      watch: {},
    },
    configFile,
    plugins: [{ name, writeBundle }],
  })
}

/**
 * @returns {Promise<import('rollup').RollupWatcher>}
 */
async function watchMain() {
  let electronProcess = null
  return getWatcher({
    name: 'electron-main-watcher',
    configFile: './.vite/vite.main.ts',
    writeBundle() {
      electronProcess && electronProcess.kill()
      electronProcess = spawn(electron, ['.'], {
        stdio: 'inherit',
        env: Object.assign(process.env, pkg.env),
      })
    },
  })
}

/**
 * @param {import('vite').ViteDevServer} viteDevServer
 * @returns {Promise<import('rollup').RollupWatcher>}
 */
async function watchPreload(viteDevServer) {
  return getWatcher({
    name: 'electron-preload-watcher',
    configFile: './.vite/vite.preload.ts',
    writeBundle() {
      viteDevServer.ws.send({
        type: 'full-reload',
      })
    },
  })
}

// bootstrap
import './prebuild.mjs'
const viteDevServer = await createServer({
  configFile: './.vite/vite.renderer.ts',
})
await viteDevServer.listen()
await watchPreload(viteDevServer)
await watchMain()
