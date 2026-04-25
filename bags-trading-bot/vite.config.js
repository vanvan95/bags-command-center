import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills()
  ],
  server: {
    proxy: {
      '/bags-api': {
        target: 'https://public-api-v2.bags.fm',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bags-api/, '')
      }
    }
  }
})