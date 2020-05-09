import { ESLintUtils } from '@typescript-eslint/experimental-utils';

export * from './astUtils';
export * from './createRule';
export * from './isTypeReadonly';
export * from './misc';
export * from './nullThrows';
export * from './types';

// this is done for convenience - saves migrating all of the old rules
const {
  applyDefault,
  deepMerge,
  isObjectNotArray,
  getParserServices,
} = ESLintUtils;
export { applyDefault, deepMerge, isObjectNotArray, getParserServices };
