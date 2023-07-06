'use strict';
// @ts-check

const ts = require('typescript');
console.log('Running with TypeScript version:', ts.version);

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...require('../../jest.config.base.js'),
  testRegex: [
    './tests/lib/.*\\.ts$',
    './tests/ast-alignment/spec\\.ts$',
    './tests/[^/]+\\.test\\.ts$',
  ],
};
