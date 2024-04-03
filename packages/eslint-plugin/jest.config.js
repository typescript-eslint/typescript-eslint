'use strict';

// @ts-check
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...require('../../jest.config.base.js'),
  coveragePathIgnorePatterns: ['src/index.ts$', 'src/configs/.*.ts$'],
  // intentionally empty, to unignore node_modules (we need to transform ESM dependencies)
  transformIgnorePatterns: [],
};
