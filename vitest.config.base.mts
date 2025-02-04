import type { ViteUserConfig } from 'vitest/config';

export const vitestBaseConfig = {
  test: {
    coverage: {
      extension: ['.ts', '.tsx', '.js', '.jsx'],
      include: ['src'],
      reporter: [
        ['lcov'],
        process.env.GITHUB_ACTIONS ? ['text-summary'] : ['none'],
      ],
    },
    globals: true,
    reporters: process.env.GITHUB_ACTIONS
      ? [['github-actions'], ['verbose']]
      : [['verbose']],
    setupFiles: ['console-fail-test/setup'],
    watch: false,
  },
} as const satisfies ViteUserConfig;
