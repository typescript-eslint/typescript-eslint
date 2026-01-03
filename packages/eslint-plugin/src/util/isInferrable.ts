/* eslint-disable @typescript-eslint/internal/prefer-ast-types-enum */
import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { skipChainExpression } from './skipChainExpression';

function hasUnaryPrefix(
  init: TSESTree.Expression,
  ...operators: string[]
): init is TSESTree.UnaryExpression {
  return (
    init.type === AST_NODE_TYPES.UnaryExpression &&
    operators.includes(init.operator)
  );
}

function isFunctionCall(init: TSESTree.Expression, callName: string): boolean {
  const node = skipChainExpression(init);

  return (
    node.type === AST_NODE_TYPES.CallExpression &&
    node.callee.type === AST_NODE_TYPES.Identifier &&
    node.callee.name === callName
  );
}
function isLiteral(init: TSESTree.Expression, typeName: string): boolean {
  return init.type === AST_NODE_TYPES.Literal && typeof init.value === typeName;
}
function isIdentifier(init: TSESTree.Expression, ...names: string[]): boolean {
  return init.type === AST_NODE_TYPES.Identifier && names.includes(init.name);
}

type Keywords =
  | TSESTree.TSBigIntKeyword
  | TSESTree.TSBooleanKeyword
  | TSESTree.TSNullKeyword
  | TSESTree.TSNumberKeyword
  | TSESTree.TSStringKeyword
  | TSESTree.TSSymbolKeyword
  | TSESTree.TSTypeReference
  | TSESTree.TSUndefinedKeyword;

/**
 * Returns whether a node has an inferrable value or not
 */
export function isInferrable(
  annotation: TSESTree.TypeNode,
  init: TSESTree.Expression,
): annotation is Keywords {
  switch (annotation.type) {
    case AST_NODE_TYPES.TSBigIntKeyword: {
      // note that bigint cannot have + prefixed to it
      const unwrappedInit = hasUnaryPrefix(init, '-') ? init.argument : init;

      return (
        isFunctionCall(unwrappedInit, 'BigInt') ||
        unwrappedInit.type === AST_NODE_TYPES.Literal
      );
    }

    case AST_NODE_TYPES.TSBooleanKeyword:
      return (
        hasUnaryPrefix(init, '!') ||
        isFunctionCall(init, 'Boolean') ||
        isLiteral(init, 'boolean')
      );

    case AST_NODE_TYPES.TSNumberKeyword: {
      const unwrappedInit = hasUnaryPrefix(init, '+', '-')
        ? init.argument
        : init;

      return (
        isIdentifier(unwrappedInit, 'Infinity', 'NaN') ||
        isFunctionCall(unwrappedInit, 'Number') ||
        isLiteral(unwrappedInit, 'number')
      );
    }

    case AST_NODE_TYPES.TSNullKeyword:
      return init.type === AST_NODE_TYPES.Literal && init.value == null;

    case AST_NODE_TYPES.TSStringKeyword:
      return (
        isFunctionCall(init, 'String') ||
        isLiteral(init, 'string') ||
        init.type === AST_NODE_TYPES.TemplateLiteral
      );

    case AST_NODE_TYPES.TSSymbolKeyword:
      return isFunctionCall(init, 'Symbol');

    case AST_NODE_TYPES.TSTypeReference: {
      if (
        annotation.typeName.type === AST_NODE_TYPES.Identifier &&
        annotation.typeName.name === 'RegExp'
      ) {
        const isRegExpLiteral =
          init.type === AST_NODE_TYPES.Literal && init.value instanceof RegExp;
        const isRegExpNewCall =
          init.type === AST_NODE_TYPES.NewExpression &&
          init.callee.type === AST_NODE_TYPES.Identifier &&
          init.callee.name === 'RegExp';
        const isRegExpCall = isFunctionCall(init, 'RegExp');

        return isRegExpLiteral || isRegExpCall || isRegExpNewCall;
      }

      return false;
    }

    case AST_NODE_TYPES.TSUndefinedKeyword:
      return hasUnaryPrefix(init, 'void') || isIdentifier(init, 'undefined');
  }

  return false;
}
