import { app, BrowserWindow } from 'electron'
import isDev from 'electron-is-dev'
import fs from 'fs'
import { join } from 'path'
import type { NodePackage } from '@/types/NodePackage'
import type { NodeProgram } from '@/types/NodeProgram'
import pkg from '../../package.json'
import { getIpcMain } from '../ipc'
import { readJSON, usePackageValidate, useProgramValidate } from './schemaValidator'
import startServer from './server'

if (isDev)
  app.disableHardwareAcceleration()

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}


let win: BrowserWindow | null = null

async function createWindow() {
  win = new BrowserWindow({
    title: 'Nodecode',
    width: 1000 + 16,
    height: 600 + 59,
    icon: join(__dirname, 'icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs')
    },
    show: false,
  })

  if (!isDev) {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  } else {
    const url = `http://${pkg.env.HOST || '127.0.0.1'}:${pkg.env.PORT || 3000}`

    win.loadURL(url)
    win.webContents.openDevTools()
  }

  win.on('ready-to-show', async () => {
    win?.show()
    if (!isDev)
      win?.maximize()
  })

  if (!win) return

  startServer(win)

  const ipcMain = getIpcMain(win)
  const root = 'public/config'


  ipcMain.handle.getProgram(async () => {
    const program = readJSON<NodeProgram>(root, 'programs/example_program.json')
    const validate = await useProgramValidate()
    if (!validate(program))
      throw new Error(`The node program is invalid. ${JSON.stringify(validate.errors)}`)
    return program
  })

  ipcMain.handle.getPackage(async () => {
    const nodePackage = readJSON<NodePackage>(root, 'packages/basic_nodes.json')
    const validate = await usePackageValidate()
    if (!validate(nodePackage))
      throw new Error(`The node package is invalid. ${JSON.stringify(validate.errors)}`)
    return nodePackage
  })

  // TODO: ensure that only one listener is registered
  ipcMain.on.saveProgram(async (event, program) => {
    // Add $schema property to enable type validation
    program['$schema'] = '../schemas/NodeProgram.schema.json'

    // Sort keys
    const allKeys = new Set<string>()
    JSON.stringify(program, (key, value) => (allKeys.add(key), value))

    // Write to file
    const data = JSON.stringify(program, Array.from(allKeys).sort(), 4)
    fs.writeFileSync(join(root, 'programs/example_program.json'), data)
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  // TODO: check if app quits properly in production
  win = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('second-instance', () => {
  if (!win) return
  // Someone tried to run a second instance, we should focus our window.
  win.isMinimized() && win.restore()
  win.focus()
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})