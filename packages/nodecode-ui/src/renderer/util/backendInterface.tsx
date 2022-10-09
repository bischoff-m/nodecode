/*
Interface between frontend and backend (via IPC)
*/

// TODO: Improve type safety for backend interface by providing an API that infers types
//       of arguments correctly (like IPC)
//       -> instead of using "backend.send('quit', 'arg1', 'arg2')",
//          use "backend.quit('arg1', 'arg2')"

import type { ServerToClientEvents } from '@/types/server'

////////////////////////////////////////////////////////////////////////////////
// FROM BACKEND TO RENDERER
////////////////////////////////////////////////////////////////////////////////
const listeners: { [channel: string]: ((...args: unknown[]) => void)[] } = {}

window.ipc.removeAllListeners('fromBackend')
window.ipc.on.fromBackend((event, channel, ...args) => {
  if (!listeners[channel])
    return
  for (const listener of listeners[channel])
    listener(...args)
})

function on(channel: string, callback: (...args: unknown[]) => void) {
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
function send(
  channel: keyof ServerToClientEvents,
  ...args: Parameters<ServerToClientEvents[keyof ServerToClientEvents]>
): void {
  window.ipc.send.toBackend(channel, args)
}

function invoke(
  channel: keyof ServerToClientEvents,
  ...args: Parameters<ServerToClientEvents[keyof ServerToClientEvents]>
): Promise<unknown> {
  return window.ipc.invoke.toBackend(channel, 0, args)
}
function invokeTimeout(
  channel: keyof ServerToClientEvents,
  timeout: number,
  ...args: Parameters<ServerToClientEvents[keyof ServerToClientEvents]>
): Promise<unknown> {
  return window.ipc.invoke.toBackend(channel, timeout, args)
}



const backend = {
  on,
  send,
  invoke,
  invokeTimeout,
  listenerCount,
}

export default backend