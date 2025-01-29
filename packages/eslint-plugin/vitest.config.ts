/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts', 'console-fail-test/setup.mjs'],
    globals: true,
  },
});
