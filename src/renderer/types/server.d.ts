export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  test: (msg: any) => void
}

export interface ClientToServerEvents {
  test: (msg: any) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  example: any
}