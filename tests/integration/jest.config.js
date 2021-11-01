'use strict';

// pack the packages ahead of time and create a mapping for use in the tests
require('ts-node').register({
  transpileOnly: true,
  files: ['./pack-packages.ts'],
});
const { tseslintPackages } = require('./pack-packages');

module.exports = {
  testEnvironment: 'node',
  transform: {
    ['^.+\\.tsx?$']: 'ts-jest',
  },
  testRegex: ['/tests/[^/]+.test.ts$'],
  collectCoverage: false,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
      diagnostics: {
        // ignore the diagnostic error for the invalidFileErrors fixtures
        ignoreCodes: [5056],
      },
    },
    tseslintPackages,
  },
  rootDir: __dirname,

  // TODO(Brad Zacher) - for some reason if we run more than 1 test at a time
  //                     yarn will error saying the tarballs are corrupt on just
  //                     the first test.
  maxWorkers: 1,
};
