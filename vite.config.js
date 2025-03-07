import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port: 5173,
    proxy: {
      '/%PUBLIC_URL%/manifest.json': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/%PUBLIC_URL%/, '')
      }
    }
  }
});
