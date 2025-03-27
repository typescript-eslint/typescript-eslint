'use strict';

// pack the packages ahead of time and create a mapping for use in the tests
require('tsx/cjs');
const { setup } = require('./tools/pack-packages');
const os = require('node:os');

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

  // TODO(Brad Zacher) - for some reason if we run more than 1 test at a time
  //                     yarn will error saying the tarballs are corrupt on just
  //                     the first test.
  maxWorkers: os.platform() === 'win32' ? 1 : os.cpus().length - 1,
});
