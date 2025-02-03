'use strict';

// @ts-check
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...require('../../jest.config.base.js'),
  modulePathIgnorePatterns: ['src/index.ts$', 'src/configs/.*.ts$'],
};
