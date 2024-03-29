import { builtinModules } from 'module'
import { join } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  mode: process.env.NODE_ENV,
  root: join(__dirname, '../src/main'),
  build: {
    outDir: '../../dist/main',
    lib: {
      entry: 'index.ts',
      formats: ['cjs'],
    },
    minify: process.env.NODE_ENV === 'production',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        ...builtinModules,
        'electron',
        'express',
      ],
      output: {
        entryFileNames: '[name].cjs',
      },
    },
  },
  publicDir: '../../public',
})
