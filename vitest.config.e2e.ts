import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    globals: true,
    include: ['**/*.e2e-spec.ts'],
    root: './',
    setupFiles: ['./test/setup-e2e.ts'],
    hookTimeout: 20000,
  },
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
})
