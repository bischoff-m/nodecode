import { contextBridge, ipcRenderer } from '../ipc'
import { domReady } from './utils'
import { useLoading } from './loading'

const { appendLoading, removeLoading } = useLoading();

domReady().then(appendLoading)

const loading: Window['loading'] = {
  appendLoading,
  removeLoading,
}

contextBridge.exposeInMainWorld('ipc', ipcRenderer)
contextBridge.exposeInMainWorld('loading', loading)