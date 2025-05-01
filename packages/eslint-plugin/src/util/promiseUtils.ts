import type { TSESTree } from '@typescript-eslint/utils';
import type { RuleContext } from '@typescript-eslint/utils/ts-eslint';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { getStaticMemberAccessValue } from './misc';

/**
 * Parses a syntactically possible `Promise.then()` call. Does not check the
 * type of the callee.
 */
export function parseThenCall(
  node: TSESTree.CallExpression,
  context: RuleContext<string, unknown[]>,
):
  | {
      onFulfilled?: TSESTree.Expression | undefined;
      onRejected?: TSESTree.Expression | undefined;
      object: TSESTree.Expression;
    }
  | undefined {
  if (node.callee.type === AST_NODE_TYPES.MemberExpression) {
    const methodName = getStaticMemberAccessValue(node.callee, context);
    if (methodName === 'then') {
      if (node.arguments.length >= 1) {
        if (node.arguments[0].type === AST_NODE_TYPES.SpreadElement) {
          return {
            object: node.callee.object,
          };
        }

        if (node.arguments.length >= 2) {
          if (node.arguments[1].type === AST_NODE_TYPES.SpreadElement) {
            return {
              object: node.callee.object,
              onFulfilled: node.arguments[0],
            };
          }

          return {
            object: node.callee.object,
            onFulfilled: node.arguments[0],
            onRejected: node.arguments[1],
          };
        }
        return {
          object: node.callee.object,
          onFulfilled: node.arguments[0],
        };
      }
      return {
        object: node.callee.object,
      };
    }
  }

  return undefined;
}

/**
 * Parses a syntactically possible `Promise.catch()` call. Does not check the
 * type of the callee.
 */
export function parseCatchCall(
  node: TSESTree.CallExpression,
  context: RuleContext<string, unknown[]>,
):
  | {
      onRejected?: TSESTree.Expression | undefined;
      object: TSESTree.Expression;
    }
  | undefined {
  if (node.callee.type === AST_NODE_TYPES.MemberExpression) {
    const methodName = getStaticMemberAccessValue(node.callee, context);
    if (methodName === 'catch') {
      if (node.arguments.length >= 1) {
        if (node.arguments[0].type === AST_NODE_TYPES.SpreadElement) {
          return {
            object: node.callee.object,
          };
        }

        return {
          object: node.callee.object,
          onRejected: node.arguments[0],
        };
      }
      return {
        object: node.callee.object,
      };
    }
  }

  return undefined;
}

/**
 * Parses a syntactically possible `Promise.finally()` call. Does not check the
 * type of the callee.
 */
export function parseFinallyCall(
  node: TSESTree.CallExpression,
  context: RuleContext<string, unknown[]>,
):
  | {
      object: TSESTree.Expression;
      onFinally?: TSESTree.Expression | undefined;
    }
  | undefined {
  if (node.callee.type === AST_NODE_TYPES.MemberExpression) {
    const methodName = getStaticMemberAccessValue(node.callee, context);
    if (methodName === 'finally') {
      if (node.arguments.length >= 1) {
        if (node.arguments[0].type === AST_NODE_TYPES.SpreadElement) {
          return {
            object: node.callee.object,
          };
        }
        return {
          object: node.callee.object,
          onFinally: node.arguments[0],
        };
      }
      return {
        object: node.callee.object,
      };
    }
  }

  return undefined;
}
