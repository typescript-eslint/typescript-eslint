'use strict';

// pack the packages ahead of time and create a mapping for use in the tests
require('ts-node').register({
  transpileOnly: true,
  files: ['./pack-packages.ts'],
});
const { tseslintPackages } = require('./tests/pack-packages');

// @ts-check
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...require('../../jest.config.base.js'),
  collectCoverage: false,
  globals: {
    tseslintPackages,
  },
  testRegex: ['/tests/[^/]+.test.ts$'],
  rootDir: __dirname,

  // TODO(Brad Zacher) - for some reason if we run more than 1 test at a time
  //                     yarn will error saying the tarballs are corrupt on just
  //                     the first test.
  maxWorkers: 1,
};
