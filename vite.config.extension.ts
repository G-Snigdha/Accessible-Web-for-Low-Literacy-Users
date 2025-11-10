import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Full manifest configuration for Chrome Built-in AI Challenge 2025
const manifest = {
  manifest_version: 3,
  name: "Accessible Web AI - Chrome Built-in AI Challenge 2025",
  version: "2.0.0",
  description: "Leverage Chrome's Built-in AI (Gemini Nano) for text simplification, proofreading, translation, rewriting, summarization & creative writing - all offline & private!",
  
  permissions: [
    "scripting",
    "activeTab", 
    "storage",
    "tabs",
    "contextMenus"
  ],
  
  host_permissions: [
    "http://*/*",
    "https://*/*"
  ],
  
  action: {
    default_popup: "popup.html",
    default_title: "Accessible Web AI",
    default_icon: {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  
  icons: {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  
  background: {
    service_worker: "src/background.ts",
    type: "module"
  },
  
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["src/content-script-ai.tsx"],
      run_at: "document_end"
    }
  ]
}

// Configuration for Chrome Extension build
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],
  root: 'extension',
  build: {
    outDir: '../dist-extension',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'extension/popup.html'),
        options: resolve(__dirname, 'extension/options.html'),
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src-shared'),
      '@extension': resolve(__dirname, './extension/src'),
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173
    }
  },
  define: {
    __BUILD_TARGET__: JSON.stringify('extension')
  }
})