'use strict';

// @ts-check
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...require('../../jest.config.base.js'),
  setupFilesAfterEnv: ['./tests/util/serializers/index.ts'],
};
