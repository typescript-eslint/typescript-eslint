import type { ViteUserConfig } from 'vitest/config';

import * as path from 'node:path';
import { coverageConfigDefaults } from 'vitest/config';

export const vitestBaseConfig = {
  test: {
    coverage: {
      exclude: [...coverageConfigDefaults.exclude, '**/fixtures/'],
      include: ['src/**/*.{ts,tsx,js,jsx}'],

      // v8 coverage slows down all code, including the TypeScript compiler the tests drive (~2-3x here).
      // Istanbul only instruments the included files, so the rest runs at full speed.
      provider: 'istanbul',

      reporter: process.env.GITHUB_ACTIONS
        ? [['lcov'], ['text'], ['text-summary']]
        : [['lcov']],
    },

    globals: true,
    include: ['**/*.test.?(c|m)ts?(x)'],
    isolate: false,

    reporters: process.env.GITHUB_ACTIONS
      ? [['default', { summary: false }], ['github-actions']]
      : [['default']],

    setupFiles: [path.join(import.meta.dirname, 'vitest.setup.base.mts')],

    testTimeout: 10_000,

    typecheck: {
      include: ['**/*.test-d.?(c|m)ts?(x)'],
    },

    watch: false,
  },
} as const satisfies ViteUserConfig;
