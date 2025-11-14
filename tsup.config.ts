import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  sourcemap: true,
  format: ['cjs'],
  clean: true,
  shims: true,
  tsconfig: 'tsconfig.json',
  esbuildOptions(options) {
    options.alias = {
      '@': './src',
    };
  },
});
