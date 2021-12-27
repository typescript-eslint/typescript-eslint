#!/usr/bin/env node

// @ts-check

if (process.env.USE_TS_ESLINT_SRC == null) {
  // to use V8's code cache to speed up instantiation time
  require('v8-compile-cache');
}

/**
 * @param {unknown} thing
 * @returns {thing is Record<string, unknown>}
 */
function isObject(thing) {
  return typeof thing === 'object' && thing != null;
}

/**
 * Get the error message of a given value.
 * @param {unknown} error The value to get.
 * @returns {string} The error message.
 */
function getErrorMessage(error) {
  // Lazy loading because this is used only if an error happened.
  const util = require('util');

  if (!isObject(error)) {
    return String(error);
  }

  // Use the stacktrace if it's an error object.
  if (typeof error.stack === 'string') {
    return error.stack;
  }

  // Otherwise, dump the object.
  return util.format('%o', error);
}

/**
 * Catch and report unexpected error.
 * @param {unknown} error The thrown error object.
 * @returns {void}
 */
function onFatalError(error) {
  process.exitCode = 2;
  const message = getErrorMessage(error);
  console.error(`
An unhandled exception occurred!
${message}`);
}

(async function main() {
  process.on('uncaughtException', onFatalError);
  process.on('unhandledRejection', onFatalError);

  /** @type {import('../src/index')} */
  const cli = (() => {
    if (process.env.USE_TS_ESLINT_SRC == null) {
      // using an ignore because after a build a ts-expect-error will no longer error because TS will follow the
      // build maps to the source files...
      // @ts-ignore - have to reference the built file, not the src file
      return require('../dist/index');
    }

    // ensure ts-node is registered correctly
    // eslint-disable-next-line import/no-extraneous-dependencies
    require('ts-node').register({
      transpileOnly: true,
      project: require('path').resolve(__dirname, '..', 'tsconfig.json'),
    });
    return require('../src/index');
  })();

  await cli.execute();
})().catch(onFatalError);
