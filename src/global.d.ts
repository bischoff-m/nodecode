/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
    readonly HOST: string
    readonly PORT: number
  }
}

// Extends global Window type
interface Window {
  /** Expose some Api through preload script */
  api: {
    send: (channel: string, ...args: any[]) => void
    invoke: (channel: string, ...args: any[]) => Promise<any>
    on: (channel: string, func: (...args: any[]) => void) => void
    once: (channel: string, func: (...args: any[]) => void) => void
    appendLoading: () => void
    removeLoading: () => void
  }
}