import { contextBridge, ipcRenderer } from 'electron'
import { domReady } from './utils'
import { useLoading } from './loading'

const { appendLoading, removeLoading } = useLoading();

(async () => {
  await domReady()

  appendLoading()
})();


const toMainChannels: string[] = [
  'requestPublicFile',
  'quitBackend',
  'runBackend',
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
const api: Window['api'] = {
  invoke: (channel, ...args) => {
    channelExists(toMainChannels, channel)
    return ipcRenderer.invoke(channel, ...args)
  },
  send: (channel, ...args) => channelExists(toMainChannels, channel) && ipcRenderer.send(channel, ...args),
  on: (channel, func) => channelExists(fromMainChannels, channel) && ipcRenderer.on(channel, (event, ...args) => func(...args)),
  once: (channel, func) => channelExists(fromMainChannels, channel) && ipcRenderer.once(channel, (event, ...args) => func(...args)),
  appendLoading,
  removeLoading,
}

contextBridge.exposeInMainWorld('api', api)