'use strict';

module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: './tests/(lib/.*\\.(jsx?|tsx?)|ast-alignment/spec\\.ts)$',
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageReporters: ['text-summary', 'lcov'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
      diagnostics: {
        // ignore the diagnostic error for the invalidFileErrors fixtures
        ignoreCodes: [5056],
      },
    },
  },
};
