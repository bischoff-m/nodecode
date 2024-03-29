import react from '@vitejs/plugin-react'
import { join } from 'path'
import { defineConfig } from 'vite'
import pkg from '../package.json'

// https://vitejs.dev/config/
export default defineConfig({
  mode: process.env.NODE_ENV,
  root: join(__dirname, '../src/renderer'),
  plugins: [
    react(),
  ],
  base: './',
  build: {
    emptyOutDir: true,
    outDir: '../../dist/renderer',
  },
  server: {
    host: pkg.env.HOST,
    port: pkg.env.PORT,
  },
  resolve: {
    alias: {
      '@': join(__dirname, '../src/renderer'),
      'public': join(__dirname, '../public'),
    },
  },
})
