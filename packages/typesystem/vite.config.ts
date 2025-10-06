import { defineConfig } from 'vite';

import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: './src/main.ts',
      name: 'TypeSystem',
      formats: ['es'],
      fileName: () => 'main.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['zod'],
    },
  },
  plugins: [dts()],
});
