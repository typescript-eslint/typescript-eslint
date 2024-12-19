import type { TSESTree } from '@typescript-eslint/utils';
import type { AST, RuleFix } from '@typescript-eslint/utils/ts-eslint';
import type * as ts from 'typescript';

import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import {
  createRule,
  getFunctionHeadLoc,
  getFunctionNameWithKind,
  getParserServices,
  isStartOfExpressionStatement,
  needsPrecedingSemicolon,
  nullThrows,
  upperCaseFirst,
} from '../util';

interface ScopeInfo {
  hasAsync: boolean;
  hasAwait: boolean;
  isAsyncYield: boolean;
  isGen: boolean;
  upper: ScopeInfo | null;
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
      extendsBaseRule: true,
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      missingAwait: "{{name}} has no 'await' expression.",
      removeAsync: "Remove 'async'.",
    },
    schema: [],
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
        hasAsync: node.async,
        hasAwait: false,
        isAsyncYield: false,
        isGen: node.generator || false,
        upper: scopeInfo,
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

        const asyncToken = nullThrows(
          context.sourceCode.getFirstToken(
            nodeWithAsyncKeyword,
            token => token.value === 'async',
          ),
          'The node is an async function, so it must have an "async" token.',
        );

        const asyncRange: Readonly<AST.Range> = [
          asyncToken.range[0],
          nullThrows(
            context.sourceCode.getTokenAfter(asyncToken, {
              includeComments: true,
            }),
            'There will always be a token after the "async" keyword.',
          ).range[0],
        ] as const;

        // Removing the `async` keyword can cause parsing errors if the
        // current statement is relying on automatic semicolon insertion.
        // If ASI is currently being used, then we should replace the
        // `async` keyword with a semicolon.
        const nextToken = nullThrows(
          context.sourceCode.getTokenAfter(asyncToken),
          'There will always be a token after the "async" keyword.',
        );
        const addSemiColon =
          nextToken.type === AST_TOKEN_TYPES.Punctuator &&
          (nextToken.value === '[' || nextToken.value === '(') &&
          (nodeWithAsyncKeyword.type === AST_NODE_TYPES.MethodDefinition ||
            isStartOfExpressionStatement(nodeWithAsyncKeyword)) &&
          needsPrecedingSemicolon(context.sourceCode, nodeWithAsyncKeyword);

        const changes = [
          { range: asyncRange, replacement: addSemiColon ? ';' : undefined },
        ];

        // If there's a return type annotation and it's a
        // `Promise<T>`, we can also change the return type
        // annotation to just `T` as part of the suggestion.
        // Alternatively, if the function is a generator and
        // the return type annotation is `AsyncGenerator<T>`,
        // then we can change it to `Generator<T>`.
        if (
          node.returnType?.typeAnnotation.type ===
          AST_NODE_TYPES.TSTypeReference
        ) {
          if (scopeInfo.isGen) {
            if (hasTypeName(node.returnType.typeAnnotation, 'AsyncGenerator')) {
              changes.push({
                range: node.returnType.typeAnnotation.typeName.range,
                replacement: 'Generator',
              });
            }
          } else if (
            hasTypeName(node.returnType.typeAnnotation, 'Promise') &&
            node.returnType.typeAnnotation.typeArguments != null
          ) {
            const openAngle = nullThrows(
              context.sourceCode.getFirstToken(
                node.returnType.typeAnnotation,
                token =>
                  token.type === AST_TOKEN_TYPES.Punctuator &&
                  token.value === '<',
              ),
              'There are type arguments, so the angle bracket will exist.',
            );
            const closeAngle = nullThrows(
              context.sourceCode.getLastToken(
                node.returnType.typeAnnotation,
                token =>
                  token.type === AST_TOKEN_TYPES.Punctuator &&
                  token.value === '>',
              ),
              'There are type arguments, so the angle bracket will exist.',
            );
            changes.push(
              // Remove the closing angled bracket.
              { range: closeAngle.range, replacement: undefined },
              // Remove the "Promise" identifier
              // and the opening angled bracket.
              {
                range: [
                  node.returnType.typeAnnotation.typeName.range[0],
                  openAngle.range[1],
                ],
                replacement: undefined,
              },
            );
          }
        }

        context.report({
          loc: getFunctionHeadLoc(node, context.sourceCode),
          node,
          messageId: 'missingAwait',
          data: {
            name: upperCaseFirst(getFunctionNameWithKind(node)),
          },
          suggest: [
            {
              messageId: 'removeAsync',
              fix: (fixer): RuleFix[] =>
                changes.map(change =>
                  change.replacement != null
                    ? fixer.replaceTextRange(change.range, change.replacement)
                    : fixer.removeRange(change.range),
                ),
            },
          ],
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
        if (asyncIterator != null) {
          scopeInfo.isAsyncYield = true;
          break;
        }
      }
    }

    return {
      ArrowFunctionExpression: enterFunction,
      'ArrowFunctionExpression:exit': exitFunction,
      AwaitExpression: markAsHasAwait,
      'ForOfStatement[await = true]': markAsHasAwait,
      FunctionDeclaration: enterFunction,
      'FunctionDeclaration:exit': exitFunction,

      FunctionExpression: enterFunction,
      'FunctionExpression:exit': exitFunction,
      'VariableDeclaration[kind = "await using"]': markAsHasAwait,
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

function hasTypeName(
  typeReference: TSESTree.TSTypeReference,
  typeName: string,
): boolean {
  return (
    typeReference.typeName.type === AST_NODE_TYPES.Identifier &&
    typeReference.typeName.name === typeName
  );
}
