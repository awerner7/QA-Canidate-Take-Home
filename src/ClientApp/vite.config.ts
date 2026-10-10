import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: '../QaCandidateDemo.Api/wwwroot',
    emptyOutDir: true,
  },
  server: {
    port: 4200,
    proxy: {
      '/api': {
        target: 'http://localhost:5080',
        changeOrigin: true,
      },
    },
  },
});
