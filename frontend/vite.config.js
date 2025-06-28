import { defineConfig } from 'vite'

export default defineConfig({
  // Base public path when served in production
  base: '/',
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        manualChunks: {
          vendor: ['leaflet']
        }
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: true
  },
  
  // Environment variables
  define: {
    // Make environment variables available to the client
    __VITE_API_URL__: JSON.stringify(process.env.VITE_API_URL)
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['leaflet']
  }
}) 