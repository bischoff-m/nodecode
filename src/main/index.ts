import { join } from 'path'
import { app, BrowserWindow } from 'electron'
import isDev from 'electron-is-dev'
import fs from 'fs'
import path from 'path'
import startServer from './server'
import pkg from '../../package.json'
import { getIpcMain } from '../ipc'
import type { NodePackage } from '@/types/NodePackage'
import type { JSONSchema7 } from 'json-schema'
import { NodeProgram } from '@/types/NodeProgram'

if (isDev)
  app.disableHardwareAcceleration()

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}


let win: BrowserWindow | null = null

async function createWindow() {
  win = new BrowserWindow({
    title: 'NodeCode',
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
  const fsOptions: Parameters<(typeof fs.readFileSync)>[1] = { flag: 'r', encoding: 'utf-8' }


  const loadSchema = <T extends object>(...subpath: string[]): T =>
    JSON.parse(fs.readFileSync(path.join(...subpath), fsOptions).toString())

  ipcMain.handle.getProgram(async (event) => {
    const root = 'public/config/programs'
    const data = fs.readFileSync(path.join(root, 'example_program.json'), fsOptions)
    return JSON.parse(data.toString()) as NodeProgram
  })

  ipcMain.handle.getProgramSchema(async (event) => {
    const root = 'public/config/schemas'
    return loadSchema<JSONSchema7>(root, 'NodeProgram.schema.json')
  })

  ipcMain.handle.getPackage(async (event) => {
    const root = 'public/config/packages'
    return loadSchema<NodePackage>(root, 'basic_nodes.json')
  })

  ipcMain.handle.getPackageSchema(async (event) => {
    const root = 'public/config/schemas'

    const baseSchemaFile = loadSchema<JSONSchema7>(root, 'NodePackage.schema.json')

    const dependencies = fs
      .readdirSync(path.join(root, 'fields'))
      .map(file => loadSchema<JSONSchema7>(root, 'fields', file))

    return {
      schema: baseSchemaFile,
      dependencies: dependencies,
    }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('second-instance', () => {
  if (win) {
    // Someone tried to run a second instance, we should focus our window.
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})