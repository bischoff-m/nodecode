import { builtinModules } from 'module'
import { join } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  mode: process.env.NODE_ENV,
  root: join(__dirname, '../src/preload'),
  build: {
    outDir: '../../dist/preload',
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
      ],
      output: {
        entryFileNames: '[name].cjs',
      },
    },
  },
})
