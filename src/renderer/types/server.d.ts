export interface ServerToClientEvents {
  quit: () => void,
  run: (program: any) => void,
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