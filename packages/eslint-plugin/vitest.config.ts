/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    setupFiles: ['console-fail-test/setup.mjs'],
    globals: true,
  },
});
