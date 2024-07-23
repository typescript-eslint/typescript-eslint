import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import type {
  AST,
  ReportFixFunction,
  RuleFix,
} from '@typescript-eslint/utils/ts-eslint';
import * as tsutils from 'ts-api-utils';
import type * as ts from 'typescript';

import {
  createRule,
  getFunctionHeadLoc,
  getFunctionNameWithKind,
  getParserServices,
  isStartOfExpressionStatement,
  needsPrecedingSemicolon,
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
      description:
        'Disallow async functions which do not return promises and have no `await` expression',
      recommended: 'recommended',
      requiresTypeChecking: true,
      extendsBaseRule: true,
    },
    schema: [],
    messages: {
      missingAwait: "{{name}} has no 'await' expression.",
      removeAsync: "Remove 'async'.",
    },
    hasSuggestions: true,
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
        let fix: ReportFixFunction | undefined;

        // Only include a suggestion if the function's return type is
        // inferred. If it has an explicit return type, then removing
        // the `async` keyword will cause a compilation error.
        if (!node.returnType) {
          // If the function belongs to a method definition or
          // property, then the function's range may not include the
          // `async` keyword and we should look at the parent instead.
          const nodeWithAsyncKeyword =
            (node.parent.type === AST_NODE_TYPES.MethodDefinition &&
              node.parent.value === node) ||
            (node.parent.type === AST_NODE_TYPES.Property &&
              node.parent.method &&
              node.parent.value === node)
              ? node.parent
              : node;

          const asyncToken = context.sourceCode.getFirstToken(
            nodeWithAsyncKeyword,
            token => token.value === 'async',
          );

          let asyncRange: Readonly<AST.Range>;
          if (asyncToken) {
            const nextTokenWithComments = context.sourceCode.getTokenAfter(
              asyncToken,
              { includeComments: true },
            );
            if (nextTokenWithComments) {
              asyncRange = [
                asyncToken.range[0],
                nextTokenWithComments.range[0],
              ] as const;
            }
          }

          // Removing the `async` keyword can cause parsing errors if the current
          // statement is relying on automatic semicolon insertion. If ASI is currently
          // being used, then we should replace the `async` keyword with a semicolon.
          let addSemiColon = false;
          if (asyncToken) {
            const nextToken = context.sourceCode.getTokenAfter(asyncToken);
            addSemiColon =
              nextToken?.type === AST_TOKEN_TYPES.Punctuator &&
              (nextToken.value === '[' || nextToken.value === '(') &&
              (nodeWithAsyncKeyword.type === AST_NODE_TYPES.MethodDefinition ||
                isStartOfExpressionStatement(nodeWithAsyncKeyword)) &&
              needsPrecedingSemicolon(context.sourceCode, nodeWithAsyncKeyword);

            fix = (fixer): RuleFix =>
              fixer.replaceTextRange(asyncRange, addSemiColon ? ';' : '');
          }
        }

        context.report({
          node,
          loc: getFunctionHeadLoc(node, context.sourceCode),
          messageId: 'missingAwait',
          data: {
            name: upperCaseFirst(getFunctionNameWithKind(node)),
          },
          suggest: fix ? [{ messageId: 'removeAsync', fix }] : [],
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
