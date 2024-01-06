'use strict';

// @ts-check
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  coverageReporters: ['lcov'],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'mts',
    'mtsx',
    'cjs',
    'js',
    'jsx',
    'mjs',
    'mjsx',
    'json',
    'node',
  ],
  setupFilesAfterEnv: ['console-fail-test/setup.js'],
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          target: 'es2019',
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
  workerIdleMemoryLimit: '300MB',
};
