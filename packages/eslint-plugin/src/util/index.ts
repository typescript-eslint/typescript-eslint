import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { getConstrainedTypeAtLocation } from '@typescript-eslint/type-utils';
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
export * from './isArrayMethodCallWithPredicate';
export * from './isAssignee';
export * from './isNodeEqual';
export * from './isNullLiteral';
export * from './isStartOfExpressionStatement';
export * from './isUndefinedIdentifier';
export * from './misc';
export * from './needsPrecedingSemiColon';
export * from './objectIterators';
export * from './needsToBeAwaited';
export * from './scopeUtils';
export * from './types';

// this is done for convenience - saves migrating all of the old rules
export * from '@typescript-eslint/type-utils';

/**
 * This is a version of {@link getConstrainedTypeAtLocation} not marked with the
 * `@deprecated` JSDoc tag, in order to allow gradual migration away from it.
 * This is a workaround for https://github.com/typescript-eslint/typescript-eslint/issues/9899
 */
const DEPRECATED_getConstrainedTypeAtLocation: (
  services: ParserServicesWithTypeInformation,
  node: TSESTree.Node,
) => ts.Type =
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  getConstrainedTypeAtLocation;

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
  DEPRECATED_getConstrainedTypeAtLocation,
  applyDefault,
  deepMerge,
  getParserServices,
  type InferMessageIdsTypeFromRule,
  type InferOptionsTypeFromRule,
  isObjectNotArray,
  nullThrows,
  NullThrowsReasons,
};
