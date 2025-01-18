'use strict';
// @ts-check

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...require('../../jest.config.base.js'),
  testRegex: ['./tests/lib/.*\\.test\\.ts$'],
  testPathIgnorePatterns: process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE
    ? ['/node_modules/', 'project-true']
    : [],
};
