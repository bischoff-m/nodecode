import { join } from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'
import isDev from 'electron-is-dev';
import fs from 'fs';
import path from 'path';

if (isDev)
  app.disableHardwareAcceleration();

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null

async function createWindow() {
  win = new BrowserWindow({
    title: 'KnotFlow',
    icon: join(__dirname, 'icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs')
    },
  })

  if (!isDev) {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  } else {
    const pkg = await import('../../package.json')
    const url = `http://${pkg.env.HOST || '127.0.0.1'}:${pkg.env.PORT || 3000}`

    win.loadURL(url)
    win.webContents.openDevTools()
  }

  win.on('ready-to-show', async () => {
    win?.show();
    if (!isDev)
      win?.maximize();
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

ipcMain.handle('requestPublicFile', (event, filePath, fsOptions) => {
  const relative = path.relative('/public', filePath);
  // check if path exists and if it is a subdir of /public
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative))
    throw Error('Path has to refer to a file in the /public directory: ' + filePath)

  // check if path refers to file
  const fullPath = path.join('public', relative)
  if (!fs.lstatSync(fullPath).isFile())
    throw Error('Path does not refer to a file: ' + fullPath)

  const options = fsOptions ? { flag: 'r', ...fsOptions } : { flag: 'r' }
  const data = fs.readFileSync(fullPath, options)
  return data
})