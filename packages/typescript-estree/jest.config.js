'use strict';

// @ts-check
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...require('../../jest.config.base.js'),
  testPathIgnorePatterns: process.version.startsWith('14')
    ? ['/node_modules/', '/parse.moduleResolver/']
    : ['/node_modules/'],
  testRegex: [
    './tests/lib/.*\\.ts$',
    './tests/ast-alignment/spec\\.ts$',
    './tests/[^/]+\\.test\\.ts$',
  ],
};
