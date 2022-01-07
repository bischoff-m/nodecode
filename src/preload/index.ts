import { contextBridge, ipcRenderer } from 'electron'
import { domReady } from './utils'
import { useLoading } from './loading'

const { appendLoading, removeLoading } = useLoading();

(async () => {
  await domReady()

  appendLoading()
})();


const toMainChannels: string[] = [
  'requestPublicFile'
]

const fromMainChannels: string[] = [
  'responsePublicFile'
]

// https://www.electronjs.org/de/docs/latest/api/ipc-renderer
const api: Window['api'] = {
  send: (channel, ...args) => {
    if (toMainChannels.includes(channel))
      ipcRenderer.send(channel, ...args);
    else
      throw Error('IPC Channel does not exist.');
  },
  invoke: (channel, ...args) => {
    if (toMainChannels.includes(channel))
      return ipcRenderer.invoke(channel, ...args);
    else
      throw Error('IPC Channel does not exist.');
  },
  on: (channel, func) => {
    if (fromMainChannels.includes(channel))
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    else
      throw Error('IPC Channel does not exist.');
  },
  once: (channel, func) => {
    if (fromMainChannels.includes(channel))
      ipcRenderer.once(channel, (event, ...args) => func(...args));
    else
      throw Error('IPC Channel does not exist.');
  },
  appendLoading,
  removeLoading,
}

contextBridge.exposeInMainWorld('api', api)