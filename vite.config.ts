import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/

// Derive the base path automatically when building on GitHub Pages.
// Falls back to '/' for local development or standalone hosting.
const repository =
  process.env.BASE_PATH ||
  (process.env.GITHUB_REPOSITORY && `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`) ||
  '/';

export default defineConfig({
  plugins: [react()],
  base: repository,
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
