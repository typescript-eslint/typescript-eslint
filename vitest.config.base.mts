import type { ViteUserConfig } from 'vitest/config';

import { coverageConfigDefaults } from 'vitest/config';

export const vitestBaseConfig = {
  test: {
    coverage: {
      exclude: [...coverageConfigDefaults.exclude, '**/fixtures/'],
      extension: ['.ts', '.tsx', '.js', '.jsx'],
      include: ['src'],

      reporter: process.env.GITHUB_ACTIONS
        ? [['lcov'], ['text'], ['text-summary']]
        : [['lcov']],
    },

    globals: true,
    include: ['**/*.test.?(c|m)ts?(x)'],

    reporters: process.env.GITHUB_ACTIONS
      ? [['verbose'], ['github-actions']]
      : [['verbose']],

    setupFiles: ['console-fail-test/setup'],

    typecheck: {
      include: ['**/*.test-d.?(c|m)ts?(x)'],
    },

    watch: false,
  },
} as const satisfies ViteUserConfig;
