'use strict';

// @ts-check
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...require('../../jest.config.base.js'),
  modulePathIgnorePatterns: [
    'src/index.ts$',
    'src/configs/.*.ts$',
    'src/rules/index.ts$',
  ],
  // intentionally empty, to exclude node_modules from ignore (we need to transform ESM dependencies)
  transformIgnorePatterns: [],
};
