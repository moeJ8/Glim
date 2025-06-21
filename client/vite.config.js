import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        secure: false, // http
    },
  },
  watch: {
    usePolling: true, // Helps detect file changes on some systems
  },
},
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['flowbite-react'],
          editor: ['react-quill']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
