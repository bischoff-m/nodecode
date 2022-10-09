export interface ServerToClientEvents {
  quit: () => void,
  // Socket.io automatically handles callbacks
  run: (program: unknown, callback: (data: unknown) => void) => void,
}

export interface ClientToServerEvents {
  output: (msg: unknown) => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  example: unknown
}