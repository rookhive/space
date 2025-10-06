import { defineConfig } from '@solidjs/start/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  middleware: 'src/middleware',
  ssr: false,
  vite: {
    plugins: [tailwindcss()],
    build: {
      target: 'es2022',
      assetsInlineLimit: 0,
    },
  },
  server: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },
});
