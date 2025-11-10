import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Configuration for PWA web build
export default defineConfig({
  plugins: [react()],
  root: 'webapp',
  build: {
    outDir: '../dist-web',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'webapp/index.html'),
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src-shared'),
      '@webapp': resolve(__dirname, './webapp/src'),
    }
  },
  server: {
    port: 3000,
    host: true
  },
  define: {
    __BUILD_TARGET__: JSON.stringify('web')
  }
})