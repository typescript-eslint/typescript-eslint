// @ts-check

// TODO - https://github.com/eslint/eslint/pull/17909
// either it gets back-ported (https://github.com/eslint/eslint/issues/17966) or we wait till v9

/** @type {import('@typescript-eslint/utils/ts-eslint').FlatConfig.ConfigPromise} */
const config = (async () => (await import('./eslint.config.mjs')).default)();
module.exports = config;
