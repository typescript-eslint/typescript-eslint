'use strict';

// @ts-check

const baseConfig = require('../../jest.config.base.js');

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...baseConfig,
  collectCoverage: false,
  setupFilesAfterEnv: [
    ...baseConfig.setupFilesAfterEnv,
    './tests/util/setupJest.ts',
  ],
};
