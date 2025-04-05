import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export const baseConfig = defineConfig({
  test: {
    globals: true,
    root: './',
    watch: false,
    environment: 'node',
    testTimeout: 20000,
    env: {
      NODE_ENV: 'test',
    },
  },

  plugins: [tsconfigPaths()],
});

export default baseConfig;
