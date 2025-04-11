'use strict';

// pack the packages ahead of time and create a mapping for use in the tests
require('tsx/cjs');
const { setup } = require('./tools/pack-packages');

// @ts-check
/** @type {() => Promise<import('@jest/types').Config.InitialOptions>} */
module.exports = async () => ({
  ...require('../../jest.config.base.js'),
  globals: {
    tseslintPackages: await setup(),
  },
  globalTeardown: './tools/pack-packages.ts',
  testRegex: ['/tests/[^/]+.test.ts$'],
  rootDir: __dirname,
});
