'use strict';

// @ts-check

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  displayName: 'scope-manager',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      { jsc: { transform: { react: { runtime: 'automatic' } } } },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '<rootDir>/coverage',
  setupFilesAfterEnv: ['./tests/util/serializers/index.ts'],
};
