import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    dts({
      include: ['src/**/*'],
      exclude: ['**/*.test.*'],
    }),
  ],
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'PhysicsEngine',
      fileName: 'main',
      formats: ['es'],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    target: 'esnext',
  },
  optimizeDeps: {
    exclude: ['@dimforge/rapier3d'],
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
});
