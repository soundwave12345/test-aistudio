import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      // vconsole is loaded via importmap in index.html, so we exclude it from the bundle
      external: ['vconsole'],
      output: {
        globals: {
          vconsole: 'VConsole'
        }
      }
    }
  }
});