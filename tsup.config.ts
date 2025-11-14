import * as fs from 'fs';
import * as path from 'path';

import { defineConfig } from 'tsup';

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'),
);

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
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});
