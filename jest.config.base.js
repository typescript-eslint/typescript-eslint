'use strict';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('node:path');

// @ts-check
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
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
  setupFilesAfterEnv: [
    path.join(__dirname, 'node_modules/console-fail-test/setup.cjs'),
  ],
  testRegex: ['./tests/.+\\.test\\.ts$', './tests/.+\\.spec\\.ts$'],
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
