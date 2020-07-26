'use strict';

module.exports = {
  testEnvironment: 'node',
  transform: {
    [/^.+\.tsx?$/.source]: 'ts-jest',
  },
  testRegex: [
    /.\/tests\/lib\/.*\.ts$/.source,
    /.\/tests\/ast-alignment\/spec\.ts$/.source,
    /.\/tests\/[^\/]+\.test\.ts$/.source,
  ],
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
