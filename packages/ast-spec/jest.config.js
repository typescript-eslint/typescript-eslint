'use strict';

// @ts-check

const baseConfig = require('../../jest.config.base.js');

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...baseConfig,
  setupFilesAfterEnv: [
    ...baseConfig.setupFilesAfterEnv,
    './tests/util/setupJest.ts',
  ],
  coveragePathIgnorePatterns: ['/fixtures/', '/node_modules/'],
};
