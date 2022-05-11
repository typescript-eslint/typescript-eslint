'use strict';

// @ts-check
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...require('../../jest.config.base.js'),
  collectCoverage: false,
  setupFilesAfterEnv: ['./tests/util/setupJest.ts'],
};
