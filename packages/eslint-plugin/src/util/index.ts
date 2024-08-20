import { ESLintUtils } from '@typescript-eslint/utils';

export * from './astUtils';
export * from './collectUnusedVariables';
export * from './createRule';
export * from './getFixOrSuggest';
export * from './getFunctionHeadLoc';
export * from './getOperatorPrecedence';
export * from './getStaticStringValue';
export * from './getStringLength';
export * from './getTextWithParentheses';
export * from './getThisExpression';
export * from './getWrappingFixer';
export * from './isAssignee';
export * from './isNodeEqual';
export * from './isNullLiteral';
export * from './isStartOfExpressionStatement';
export * from './isUndefinedIdentifier';
export * from './misc';
export * from './needsPrecedingSemiColon';
export * from './objectIterators';
export * from './scopeUtils';
export * from './types';

// this is done for convenience - saves migrating all of the old rules
export * from '@typescript-eslint/type-utils';
const {
  applyDefault,
  deepMerge,
  getParserServices,
  isObjectNotArray,
  nullThrows,
  NullThrowsReasons,
} = ESLintUtils;
type InferMessageIdsTypeFromRule<T> =
  ESLintUtils.InferMessageIdsTypeFromRule<T>;
type InferOptionsTypeFromRule<T> = ESLintUtils.InferOptionsTypeFromRule<T>;

export {
  applyDefault,
  deepMerge,
  getParserServices,
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
  isObjectNotArray,
  nullThrows,
  NullThrowsReasons,
};
