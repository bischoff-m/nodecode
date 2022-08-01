/// <reference types="vite/client" />

import { ipcRenderer } from './ipc'

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
    readonly HOST: string
    readonly PORT: number
  }
}

// Extends global Window type
declare global {
  interface Window {
    ipc: typeof ipcRenderer
    loading: {
      appendLoading: () => void
      removeLoading: () => void
    }
  }
}