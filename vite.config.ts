import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  appType: 'spa',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Explicitly configure proxy to forward API requests to backend
    proxy: {
      '/create-payment-intent': {
        target: 'http://localhost:4242',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:4242',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});