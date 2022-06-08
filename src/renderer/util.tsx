

////////////////////////////////////////////////////////////////////////////////
// Interface between frontend and backend (via IPC)
////////////////////////////////////////////////////////////////////////////////

import { ipcMain } from "electron"

////////////////////////////////////////////////////////////////////////////////
// FROM BACKEND TO RENDERER
////////////////////////////////////////////////////////////////////////////////
const backendListeners: { [channel: string]: ((...args: any) => void)[] } = {}

window.api.removeAllListeners('fromBackend')
window.api.on('fromBackend', (_, channel, ...args) => {
  if (!backendListeners[channel])
    return
  for (const listener of backendListeners[channel])
    listener(...args)
})

export function onBackendEvent(channel: string, callback: (...args: any) => void) {
  if (!backendListeners[channel])
    backendListeners[channel] = []
  backendListeners[channel].push(callback)
}

export function listenerCount(channel: string) {
  return backendListeners[channel] ? backendListeners[channel].length : 0
}

////////////////////////////////////////////////////////////////////////////////
// FROM RENDERER TO BACKEND
////////////////////////////////////////////////////////////////////////////////
// TODO: check if backend is connected before sending by implementing an event from main to renderer on disconnect
// or check if handlers are registered before sending
export function sendBackend(channel: string, ...args: any): void {
  // console.log(ipcMain.listenerCount(channel)) // TODO: check if backend is connected using this, but why not working
  window.api.send('toBackend', channel, ...args)
}

export function invokeBackend(channel: string, ...args: any): Promise<any> {
  return window.api.invoke('toBackend', channel, 0, ...args)
}
export function invokeBackendTimeout(channel: string, timeout: number, ...args: any): Promise<any> {
  return window.api.invoke('toBackend', channel, timeout, ...args)
}



////////////////////////////////////////////////////////////////////////////////
// Helper functions
////////////////////////////////////////////////////////////////////////////////

export function removeColorTags(shades: {
  '50': string,
  '100': string,
  '200': string,
  '300': string,
  '400': string,
  '500': string,
  '600': string,
  '700': string,
  '800': string,
  '900': string
}): [string, string, string, string, string, string, string, string, string, string] {
  return [
    shades['50'],
    shades['100'],
    shades['200'],
    shades['300'],
    shades['400'],
    shades['500'],
    shades['600'],
    shades['700'],
    shades['800'],
    shades['900']
  ]
}