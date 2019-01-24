import { Rule } from 'eslint';
import { ParserServices } from '@typescript-eslint/typescript-estree';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
const version = require('../../package.json').version;

export type ObjectLike<T = any> = Record<string, T>;

export function tslintRule(name: string) {
  return `\`${name}\` from TSLint`;
}

export function metaDocsUrl(name: string) {
  return `https://github.com/typescript-eslint/typescript-eslint/blob/${version}/packages/eslint-plugin/docs/rules/${name}.md`;
}

/**
 * Check if the context file name is *.ts or *.tsx
 * @param fileName The context file name
 * @returns `true` if the file name ends in *.ts or *.tsx
 * @private
 */
export function isTypescript(fileName: string) {
  return /\.tsx?$/i.test(fileName || '');
}

/**
 * Check if the context file name is *.d.ts or *.d.ts
 * @param fileName The context file name
 * @returns `true` if the file name ends in *.d.ts or *.d.ts
 * @private
 */
export function isDefinitionFile(fileName: string) {
  return /\.d\.tsx?$/i.test(fileName || '');
}

/**
 * Check if the variable contains an object stricly rejecting arrays
 * @param obj an object
 * @returns `true` if obj is an object
 */
function isObjectNotArray<T extends object>(obj: T | any[]): obj is T {
  return typeof obj === 'object' && !Array.isArray(obj);
}

/**
 * Pure function - doesn't mutate either parameter!
 * Merges two objects together deeply, overwriting the properties in first with the properties in second
 * @param first The first object
 * @param second The second object
 * @returns a new object
 */
export function deepMerge<T extends ObjectLike = ObjectLike>(
  first: ObjectLike = {},
  second: ObjectLike = {}
): T {
  // get the unique set of keys across both objects
  const keys = new Set(Object.keys(first).concat(Object.keys(second)));

  return Array.from(keys).reduce<T>(
    (acc, key) => {
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
    },
    {} as T
  );
}

/**
 * Pure function - doesn't mutate either parameter!
 * Uses the default options and overrides with the options provided by the user
 * @param defaultOptions the defaults
 * @param userOptions the user opts
 * @returns the options with defaults
 */
export function applyDefault<T extends any[]>(
  defaultOptions: T,
  userOptions: T | null
): T {
  // clone defaults
  const options: T = JSON.parse(JSON.stringify(defaultOptions));

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
}

/**
 * Upper cases the first character or the string
 * @param str a string
 * @returns upper case first
 */
export function upperCaseFirst(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

/**
 * Try to retrieve typescript parser service from context
 * @param {RuleContext} context Rule context
 * @returns {{esTreeNodeToTSNodeMap}|{program}|Object|*} parserServices
 */
export function getParserServices(context: Rule.RuleContext): ParserServices {
  if (
    !context.parserServices ||
    !context.parserServices.program ||
    !context.parserServices.esTreeNodeToTSNodeMap
  ) {
    throw new Error(
      'You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.'
    );
  }
  return context.parserServices;
}
