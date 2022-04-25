export interface ServerToClientEvents {
  quit: () => void,
  run: (program: any, callback: (data: any) => void) => void,
}

export interface ClientToServerEvents {
  output: (msg: any) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  example: any
}