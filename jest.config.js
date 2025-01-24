'use strict';

// @ts-check
const { getJestProjectsAsync } = require('@nx/jest');

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = async () => ({
  projects: await getJestProjectsAsync(),
});
