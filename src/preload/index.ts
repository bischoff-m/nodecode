import { contextBridge, ipcRenderer } from 'electron'
import { domReady } from './utils'
import { useLoading } from './loading'

const { appendLoading, removeLoading } = useLoading();

(async () => {
  await domReady()

  appendLoading()
})()


const toMainChannels: string[] = [
  'requestPublicFile',
  'toBackend',
]

const fromMainChannels: string[] = [
  'fromBackend',
]


const channelExists = (channels: string[], channel: string) => {
  if (!channels.includes(channel))
    throw Error('IPC Channel does not exist.')
  return true
}
// https://www.electronjs.org/de/docs/latest/api/ipc-renderer
// wraps all needed ipcRenderer functions into a function that first checks if the channel exists
// use window.ipc... instead of ipcRenderer... for inter process communication
const ipc: Window['ipc'] = {
  invoke: (channel, ...args) => channelExists(toMainChannels, channel) ? ipcRenderer.invoke(channel, ...args) : new Promise(() => { }),
  send: (channel, ...args) => channelExists(toMainChannels, channel) && ipcRenderer.send(channel, ...args),
  on: (channel, func) => channelExists(fromMainChannels, channel) && ipcRenderer.on(channel, func),
  once: (channel, func) => channelExists(fromMainChannels, channel) && ipcRenderer.once(channel, func),
  removeAllListeners: channel => channelExists(fromMainChannels, channel) && ipcRenderer.removeAllListeners(channel),
  listenerCount: channel => channelExists(fromMainChannels, channel) ? (ipcRenderer.listenerCount(channel)) : 0,
}

const loading: Window['loading'] = {
  appendLoading,
  removeLoading,
}

contextBridge.exposeInMainWorld('ipc', ipc)
contextBridge.exposeInMainWorld('loading', loading)