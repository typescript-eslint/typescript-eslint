import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import { ESLintTypeUtils } from '@typescript-eslint/type-utils';

export * from './astUtils';
export * from './collectUnusedVariables';
export * from './createRule';
export * from './getFunctionHeadLoc';
export * from './getThisExpression';
export * from './getWrappingFixer';
export * from './misc';
export * from './objectIterators';
export * from './requiresQuoting';
export * from './types';

// this is done for convenience - saves migrating all of the old rules
const {
  applyDefault,
  deepMerge,
  isObjectNotArray,
  getParserServices,
  nullThrows,
  NullThrowsReasons,
} = ESLintUtils;
type InferMessageIdsTypeFromRule<T> =
  ESLintUtils.InferMessageIdsTypeFromRule<T>;
type InferOptionsTypeFromRule<T> = ESLintUtils.InferOptionsTypeFromRule<T>;

const {
  getTypeOfPropertyOfName,
  isTypeReadonly,
  readonlynessOptionsSchema,
  readonlynessOptionsDefaults,
} = ESLintTypeUtils;
type ReadonlynessOptions = ESLintTypeUtils.ReadonlynessOptions;

export {
  applyDefault,
  deepMerge,
  isObjectNotArray,
  getParserServices,
  getTypeOfPropertyOfName,
  isTypeReadonly,
  nullThrows,
  readonlynessOptionsDefaults,
  readonlynessOptionsSchema,
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
  NullThrowsReasons,
  ReadonlynessOptions,
};
