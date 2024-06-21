// @ts-check

// TODO - https://github.com/nrwl/nx/issues/22576

/** @type {import('@typescript-eslint/utils/ts-eslint').FlatConfig.ConfigPromise} */
const config = (async () => (await import('./eslint.config.mjs')).default)();
module.exports = config;
