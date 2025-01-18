import type { ViteUserConfig } from 'vitest/config';

import { configDefaults } from 'vitest/config';

export const vitestBaseConfig = {
  test: {
    coverage: {
      enabled: process.env.NO_COVERAGE ? false : true,
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      reporter: [['lcov']],
    },
    globals: true,
    reporters: process.env.GITHUB_ACTIONS
      ? [['github-actions']]
      : configDefaults.reporters,
    watch: false,
  },
} as const satisfies ViteUserConfig;
