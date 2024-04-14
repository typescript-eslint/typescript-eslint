import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import type * as ts from 'typescript';

import {
  createRule,
  getFunctionHeadLoc,
  getFunctionNameWithKind,
  getParserServices,
  upperCaseFirst,
} from '../util';

interface ScopeInfo {
  upper: ScopeInfo | null;
  hasAwait: boolean;
  hasAsync: boolean;
  isGen: boolean;
  isAsyncYield: boolean;
}
type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;

export default createRule({
  name: 'require-await',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow async functions which have no `await` expression',
      recommended: 'recommended',
      requiresTypeChecking: true,
      extendsBaseRule: true,
    },
    schema: [],
    messages: {
      missingAwait: "{{name}} has no 'await' expression.",
    },
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    let scopeInfo: ScopeInfo | null = null;

    /**
     * Push the scope info object to the stack.
     */
    function enterFunction(node: FunctionNode): void {
      scopeInfo = {
        upper: scopeInfo,
        hasAwait: false,
        hasAsync: node.async,
        isGen: node.generator || false,
        isAsyncYield: false,
      };
    }

    /**
     * Pop the top scope info object from the stack.
     * Also, it reports the function if needed.
     */
    function exitFunction(node: FunctionNode): void {
      /* istanbul ignore if */ if (!scopeInfo) {
        // this shouldn't ever happen, as we have to exit a function after we enter it
        return;
      }

      if (
        node.async &&
        !scopeInfo.hasAwait &&
        !isEmptyFunction(node) &&
        !(scopeInfo.isGen && scopeInfo.isAsyncYield)
      ) {
        context.report({
          node,
          loc: getFunctionHeadLoc(node, context.sourceCode),
          messageId: 'missingAwait',
          data: {
            name: upperCaseFirst(getFunctionNameWithKind(node)),
          },
        });
      }

      scopeInfo = scopeInfo.upper;
    }

    /**
     * Checks if the node returns a thenable type
     */
    function isThenableType(node: ts.Node): boolean {
      const type = checker.getTypeAtLocation(node);

      return tsutils.isThenableType(checker, node, type);
    }

    /**
     * Marks the current scope as having an await
     */
    function markAsHasAwait(): void {
      if (!scopeInfo) {
        return;
      }
      scopeInfo.hasAwait = true;
    }

    /**
     * Mark `scopeInfo.isAsyncYield` to `true` if it
     *  1) delegates async generator function
     *    or
     *  2) yields thenable type
     */
    function visitYieldExpression(node: TSESTree.YieldExpression): void {
      if (!scopeInfo?.isGen || !node.argument) {
        return;
      }

      if (node.argument.type === AST_NODE_TYPES.Literal) {
        // ignoring this as for literals we don't need to check the definition
        // eg : async function* run() { yield* 1 }
        return;
      }

      if (!node.delegate) {
        if (isThenableType(services.esTreeNodeToTSNodeMap.get(node.argument))) {
          scopeInfo.isAsyncYield = true;
        }
        return;
      }

      const type = services.getTypeAtLocation(node.argument);
      const typesToCheck = expandUnionOrIntersectionType(type);
      for (const type of typesToCheck) {
        const asyncIterator = tsutils.getWellKnownSymbolPropertyOfType(
          type,
          'asyncIterator',
          checker,
        );
        if (asyncIterator !== undefined) {
          scopeInfo.isAsyncYield = true;
          break;
        }
      }
    }

    return {
      FunctionDeclaration: enterFunction,
      FunctionExpression: enterFunction,
      ArrowFunctionExpression: enterFunction,
      'FunctionDeclaration:exit': exitFunction,
      'FunctionExpression:exit': exitFunction,
      'ArrowFunctionExpression:exit': exitFunction,

      AwaitExpression: markAsHasAwait,
      'VariableDeclaration[kind = "await using"]': markAsHasAwait,
      'ForOfStatement[await = true]': markAsHasAwait,
      YieldExpression: visitYieldExpression,

      // check body-less async arrow function.
      // ignore `async () => await foo` because it's obviously correct
      'ArrowFunctionExpression[async = true] > :not(BlockStatement, AwaitExpression)'(
        node: Exclude<
          TSESTree.Node,
          TSESTree.AwaitExpression | TSESTree.BlockStatement
        >,
      ): void {
        const expression = services.esTreeNodeToTSNodeMap.get(node);
        if (isThenableType(expression)) {
          markAsHasAwait();
        }
      },
      ReturnStatement(node): void {
        // short circuit early to avoid unnecessary type checks
        if (!scopeInfo || scopeInfo.hasAwait || !scopeInfo.hasAsync) {
          return;
        }

        const { expression } = services.esTreeNodeToTSNodeMap.get(node);
        if (expression && isThenableType(expression)) {
          markAsHasAwait();
        }
      },
    };
  },
});

function isEmptyFunction(node: FunctionNode): boolean {
  return (
    node.body.type === AST_NODE_TYPES.BlockStatement &&
    node.body.body.length === 0
  );
}

function expandUnionOrIntersectionType(type: ts.Type): ts.Type[] {
  if (type.isUnionOrIntersection()) {
    return type.types.flatMap(expandUnionOrIntersectionType);
  }
  return [type];
}
