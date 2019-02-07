'use strict';

const version = require('../package.json').version;

exports.tslintRule = name => `\`${name}\` from TSLint`;

exports.metaDocsUrl = name =>
  `https://github.com/typescript-eslint/typescript-eslint/blob/v${version}/packages/eslint-plugin/docs/rules/${name}.md`;

/**
 * Check if the context file name is *.ts or *.tsx
 * @param {string} fileName The context file name
 * @returns {boolean} `true` if the file name ends in *.ts or *.tsx
 * @private
 */
exports.isTypescript = fileName => /\.tsx?$/i.test(fileName || '');

/**
 * Check if the context file name is *.d.ts or *.d.ts
 * @param {string} fileName The context file name
 * @returns {boolean} `true` if the file name ends in *.d.ts or *.d.ts
 * @private
 */
exports.isDefinitionFile = fileName => /\.d\.tsx?$/i.test(fileName || '');

/**
 * Check if the variable contains an object stricly rejecting arrays
 * @param {any} obj an object
 * @returns {boolean} `true` if obj is an object
 */
function isObjectNotArray(obj) {
  return typeof obj === 'object' && !Array.isArray(obj);
}

/**
 * Pure function - doesn't mutate either parameter!
 * Merges two objects together deeply, overwriting the properties in first with the properties in second
 * @template TFirst,TSecond
 * @param {TFirst} first The first object
 * @param {TSecond} second The second object
 * @returns {Record<string, any>} a new object
 */
function deepMerge(first = {}, second = {}) {
  // get the unique set of keys across both objects
  const keys = new Set(Object.keys(first).concat(Object.keys(second)));

  return Array.from(keys).reduce((acc, key) => {
    const firstHasKey = key in first;
    const secondHasKey = key in second;

    if (firstHasKey && secondHasKey) {
      if (isObjectNotArray(first[key]) && isObjectNotArray(second[key])) {
        // object type
        acc[key] = deepMerge(first[key], second[key]);
      } else {
        // value type
        acc[key] = second[key];
      }
    } else if (firstHasKey) {
      acc[key] = first[key];
    } else {
      acc[key] = second[key];
    }

    return acc;
  }, {});
}
exports.deepMerge = deepMerge;

/**
 * Pure function - doesn't mutate either parameter!
 * Uses the default options and overrides with the options provided by the user
 * @template TOptions
 * @param {TOptions} defaultOptions the defaults
 * @param {any[]} userOptions the user opts
 * @returns {TOptions} the options with defaults
 */
exports.applyDefault = (defaultOptions, userOptions) => {
  // clone defaults
  const options = JSON.parse(JSON.stringify(defaultOptions));

  // eslint-disable-next-line eqeqeq
  if (userOptions == null) {
    return options;
  }

  options.forEach((opt, i) => {
    if (userOptions[i]) {
      const userOpt = userOptions[i];

      if (isObjectNotArray(userOpt) && isObjectNotArray(opt)) {
        options[i] = deepMerge(opt, userOpt);
      } else {
        options[i] = userOpt;
      }
    }
  });

  return options;
};

/**
 * Upper cases the first character or the string
 * @param {string} str a string
 * @returns {string} upper case first
 */
exports.upperCaseFirst = str => str[0].toUpperCase() + str.slice(1);

/**
 * Try to retrieve typescript parser service from context
 * @param {RuleContext} context Rule context
 * @returns {{esTreeNodeToTSNodeMap}|{program}|Object|*} parserServices
 */
exports.getParserServices = context => {
  if (
    !context.parserServices ||
    !context.parserServices.program ||
    !context.parserServices.esTreeNodeToTSNodeMap
  ) {
    /**
     * The user needs to have configured "project" in their parserOptions
     * for @typescript-eslint/parser
     */
    throw new Error(
      `You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.`
    );
  }
  return context.parserServices;
};

/**
 * @template T
 * @param {ReadonlyArray<T> | undefined} a An array
 * @param {ReadonlyArray<T> | undefined} b Another array
 * @param {function(T, T): boolean} eq Comparison function
 * @returns {boolean} Returns true iff the arrays are equal
 */
exports.arraysAreEqual = (a, b, eq) =>
  a === b ||
  (typeof a !== 'undefined' &&
    typeof b !== 'undefined' &&
    a.length === b.length &&
    a.every((x, idx) => eq(x, b[idx])));
