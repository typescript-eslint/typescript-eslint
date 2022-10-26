'use strict';

// @ts-check
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...require('../../jest.config.base.js'),
  coveragePathIgnorePatterns: ['src/index.ts$', 'src/configs/.*.ts$'],
};
