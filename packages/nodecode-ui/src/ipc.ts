import type { NodePackage } from '@/types/NodePackage'
import type { NodeProgram } from '@/types/NodeProgram'
import { ClientToServerEvents, ServerToClientEvents } from '@/types/server'
import {
  contextBridge as originalContextBridge,
  ipcMain as originalIpcMain,
  ipcRenderer as originalIpcRenderer,
  IpcRendererEvent,
  IpcMainInvokeEvent,
  BrowserWindow,
  IpcMainEvent,
} from 'electron'

// TODO: implement once and listenerCount
// TODO: use unknown instead of explicit any

// Define the IPC channels here
// WARN: The keys of the functions should match the channel names because they are used as
//       event names for generating the event handlers
// WARN: If one of the objects does not fit the type 'Api', an error will show in the
//       code below because then it is set to never below
const fromRenderer = {
  invoke: {
    getProgram: () => <Promise<NodeProgram>>originalIpcRenderer.invoke('getProgram'),
    getPackage: () => <Promise<NodePackage>>originalIpcRenderer.invoke('getPackage'),
    toBackend: (
      channel: keyof ServerToClientEvents,
      timeout: number,
      args: Parameters<ServerToClientEvents[keyof ServerToClientEvents]>
    ) => <Promise<any>>originalIpcRenderer.invoke('toBackend', channel, timeout, args),
  },
  send: {
    saveProgram: (program: NodeProgram) => originalIpcRenderer.send('saveProgram', program),
    toBackend: (
      channel: keyof ServerToClientEvents,
      args: Parameters<ServerToClientEvents[keyof ServerToClientEvents]>
    ) => originalIpcRenderer.send('toBackend', channel, args),
  },
}

const fromMain = {
  invoke: {
    // not supported by electron
    // https://www.electronjs.org/docs/latest/tutorial/ipc#optional-returning-a-reply
  },
  send: {
    fromBackend: (
      win: BrowserWindow,
      channel: keyof ClientToServerEvents,
      ...args: Parameters<ClientToServerEvents[keyof ClientToServerEvents]>
    ) => win.webContents.send('fromBackend', channel, ...args),
  },
}


// Base type for definition of IPC channels
type Api = {
  invoke: {
    [key: string]: (...args: any) => (Promise<any> | void)
  }
  send: {
    [key: string]: (...args: any) => void
  }
}
type FromMainTemplate = {
  send: {
    [key: string]: (win: BrowserWindow, ...args: any) => void
  }
}

// Set types to never if the IPC channel definition does not have the right type,
// so that an error is shown in the code below
type FromRenderer = (typeof fromRenderer) extends Api ? typeof fromRenderer : never
type FromMain = (typeof fromMain) extends FromMainTemplate ? typeof fromMain : never

// Helper that omits key value pairs of the from [key: string]: value
type NoStringIndex<T> = { [K in keyof T as string extends K ? never : K]: T[K] }
// Helper that matches all parameters of T but omits the first one that has to be a BrowserWindow
type OmitWinParameter<T extends (win: BrowserWindow, ...args: any) => any> = T extends (win: BrowserWindow, ...args: infer P) => any ? P : never

// Convert IPC channel type to IpcMain and IpcRenderer types
type ToListener<T extends Api[keyof Api], E> = NoStringIndex<{
  [K in keyof T]: (
    listener: (
      event: E,
      ...args: T extends FromMain['send'] ? OmitWinParameter<T[K]> : Parameters<T[K]>
    ) => ReturnType<T[K]>
  ) => void
}>

export const getIpcMain = (win: BrowserWindow) => ({
  // Bind the window object to all send-from-main channels
  ...Object
    .entries(fromMain['send'])
    .reduce((acc, [key, listener]) =>
      (acc[key as keyof FromMain['send']] = listener.bind(win), acc),
      {} as {
        [K in keyof FromMain['send']]: (
          ...args: Parameters<FromMain['send'][K]>
        ) => void
      }
    ),
  handle: Object
    .keys(fromRenderer.invoke)
    .reduce(
      (acc, key) => (acc[key as keyof (typeof fromRenderer)['invoke']] = listener => originalIpcMain.handle(key, listener), acc),
      {} as ToListener<FromRenderer['invoke'], IpcMainInvokeEvent>
    ),
  on: Object
    .keys(fromRenderer.send)
    .reduce(
      (acc, key) => (acc[key as keyof (typeof fromRenderer)['send']] = listener => originalIpcMain.on(key, listener), acc),
      {} as ToListener<FromRenderer['send'], IpcMainEvent>
    ),
  removeAllListeners: (channel: keyof (typeof fromRenderer)['send']) => originalIpcMain.removeAllListeners(channel),
  removeHandler: (channel: keyof (typeof fromRenderer)['invoke']) => originalIpcMain.removeHandler(channel),
})

export const ipcRenderer = {
  ...fromRenderer,
  on: Object
    .keys(fromMain.send)
    .reduce(
      (acc, key) => (acc[key as keyof (typeof fromMain)['send']] = listener => originalIpcRenderer.on(key, listener), acc),
      {} as ToListener<FromMain['send'], IpcRendererEvent>
    ),
  removeAllListeners: (channel: keyof (typeof fromMain)['send']) => originalIpcRenderer.removeAllListeners(channel),
}


export const contextBridge = {
  exposeInMainWorld: (
    ipcKey: string,
    ipc: (typeof ipcKey) extends 'ipc' ? typeof ipcRenderer : any,
  ) => originalContextBridge.exposeInMainWorld(ipcKey, ipc),
}