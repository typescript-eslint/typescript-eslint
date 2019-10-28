'use strict';

module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: './tests/.*\\.test\\.ts$',
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageReporters: ['text-summary', 'lcov'],
  globals: {
    'ts-jest': {
      diagnostics: {
        // ignore the diagnostic error for the invalidFileErrors fixtures
        ignoreCodes: [5056],
      },
    },
  },
  modulePaths: ['<rootDir>/tests/shared-fixtures'],
};
