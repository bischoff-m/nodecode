import { contextBridge, ipcRenderer } from '../ipc'
import { useLoading } from './loading'
import { domReady } from './utils'

// eslint-disable-next-line react-hooks/rules-of-hooks
const { appendLoading, removeLoading } = useLoading()

domReady().then(appendLoading)

const loading: Window['loading'] = {
  appendLoading,
  removeLoading,
}

contextBridge.exposeInMainWorld('ipc', ipcRenderer)
contextBridge.exposeInMainWorld('loading', loading)