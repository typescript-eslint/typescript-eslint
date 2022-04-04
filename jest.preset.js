// @ts-check

/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const nxPreset = require('@nrwl/jest/preset');

const { transform: _ignoredTsJestTransform, ...configToUse } = nxPreset;

module.exports = {
  ...configToUse,
};
