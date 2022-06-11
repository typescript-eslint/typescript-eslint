import { ESLintUtils } from '@typescript-eslint/utils';

export * from './astUtils';
export * from './collectUnusedVariables';
export * from './createRule';
export * from './getFunctionHeadLoc';
export * from './getOperatorPrecedence';
export * from './getThisExpression';
export * from './getWrappingFixer';
export * from './misc';
export * from './objectIterators';
export * from './isNullLiteral';
export * from './isUndefinedIdentifier';
export * from './isNodeEqual';

// this is done for convenience - saves migrating all of the old rules
export * from '@typescript-eslint/type-utils';
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

export {
  applyDefault,
  deepMerge,
  isObjectNotArray,
  getParserServices,
  nullThrows,
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
  NullThrowsReasons,
};
