import type { ViteUserConfig } from 'vitest/config';

import { coverageConfigDefaults } from 'vitest/config';

export const vitestBaseConfig = {
  test: {
    coverage: {
      exclude: [...coverageConfigDefaults.exclude, '**/fixtures/'],
      extension: ['.ts', '.tsx', '.js', '.jsx'],
      include: ['src'],

      reporter: [
        ['lcov'],
        process.env.GITHUB_ACTIONS ? ['text-summary'] : ['none'],
      ],
    },

    globals: true,
    include: ['**/*.test.?(c|m)ts?(x)'],

    reporters: process.env.GITHUB_ACTIONS
      ? [['github-actions'], ['verbose']]
      : [['verbose']],

    setupFiles: ['console-fail-test/setup'],

    typecheck: {
      include: ['**/*.test-d.?(c|m)ts?(x)'],
    },

    watch: false,
  },
} as const satisfies ViteUserConfig;
