/*
Interface between frontend and backend (via IPC)
*/

import { ipcMain } from "electron"

////////////////////////////////////////////////////////////////////////////////
// FROM BACKEND TO RENDERER
////////////////////////////////////////////////////////////////////////////////
const listeners: { [channel: string]: ((...args: any) => void)[] } = {}

window.api.removeAllListeners('fromBackend')
window.api.on('fromBackend', (_, channel, ...args) => {
  if (!listeners[channel])
    return
  for (const listener of listeners[channel])
    listener(...args)
})

function on(channel: string, callback: (...args: any) => void) {
  if (!listeners[channel])
    listeners[channel] = []
  listeners[channel].push(callback)
}

function listenerCount(channel: string) {
  return listeners[channel] ? listeners[channel].length : 0
}

////////////////////////////////////////////////////////////////////////////////
// FROM RENDERER TO BACKEND
////////////////////////////////////////////////////////////////////////////////
// TODO: check if backend is connected before sending by implementing an event from main to renderer on disconnect
// or check if handlers are registered before sending
function send(channel: string, ...args: any): void {
  // console.log(ipcMain.listenerCount(channel)) // TODO: check if backend is connected using this, but why not working
  window.api.send('toBackend', channel, ...args)
}

function invoke(channel: string, ...args: any): Promise<any> {
  return window.api.invoke('toBackend', channel, 0, ...args)
}
function invokeTimeout(channel: string, timeout: number, ...args: any): Promise<any> {
  return window.api.invoke('toBackend', channel, timeout, ...args)
}

const backend = {
  on,
  send,
  invoke,
  invokeTimeout,
  listenerCount,
}

export default backend