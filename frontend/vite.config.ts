import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // string shorthand: /api -> http://localhost:8000/api
      '/api': {
        target: 'http://localhost:8000', // Backend server
        changeOrigin: true, // Needed for virtual hosted sites
        // Optional: rewrite path if backend doesn't expect /api prefix
        // rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
