'use strict';

// @ts-check
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...require('../../jest.config.base.js'),
  testRegex: [
    './tests/lib/.*\\.test\\.ts$',
    './tests/ast-alignment/spec\\.ts$',
    './tests/[^/]+\\.test\\.ts$',
  ],
};
