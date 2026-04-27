import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/bags-api': {
        target: 'https://public-api-v2.bags.fm',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bags-api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-api-key', 'apibags_prod_RVtDOsGTte-0tgneYXJN7Sigw7dtSSxgkwaVeCHMYzs')
          })
        }
      }
    }
  }
})
