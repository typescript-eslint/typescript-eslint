// @ts-check

/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

'use strict';

/** @type {import('@nrwl/jest/preset/jest-preset')} */
const nxPreset = require('@nrwl/jest/preset');

const { transform: _ignoredTsJestTransform, ...configToUse } = nxPreset;

module.exports = {
  ...configToUse,
};
