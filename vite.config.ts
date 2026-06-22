/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base はビルド時のみ GitHub Pages のリポジトリ名にする（dev はルート）
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/task-manager/' : '/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    include: ['tests/**/*.test.ts'],
    css: false,
  },
}))
