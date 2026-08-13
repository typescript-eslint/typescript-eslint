import type { ViteUserConfig } from 'vitest/config';

import { coverageConfigDefaults } from 'vitest/config';

export const vitestBaseConfig = {
  test: {
    coverage: {
      exclude: [...coverageConfigDefaults.exclude, '**/fixtures/'],
      include: ['src/**/*.{ts,tsx,js,jsx}'],

      reporter: process.env.GITHUB_ACTIONS
        ? [['lcov'], ['text'], ['text-summary']]
        : [['lcov']],
    },

    globals: true,
    include: ['**/*.test.?(c|m)ts?(x)'],

    reporters: isWindowsCI()
      ? ['dot']
      : process.env.GITHUB_ACTIONS
        ? [['default', { summary: false }], ['github-actions']]
        : [['default']],

    setupFiles: ['console-fail-test/setup'],

    testTimeout: 10_000,

    typecheck: {
      include: ['**/*.test-d.?(c|m)ts?(x)'],
    },

    watch: false,
  },
} as const satisfies ViteUserConfig;

function isWindowsCI() {
  return process.platform === 'win32' && Boolean(process.env.CI);
}
