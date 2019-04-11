import { ESLintUtils } from '@typescript-eslint/util';

export * from './getParserServices';
export * from './misc';
export * from './types';

// this is done for convenience - saves migrating all of the old rules
const { applyDefault, createRule, deepMerge, isObjectNotArray } = ESLintUtils;
export { applyDefault, createRule, deepMerge, isObjectNotArray };
