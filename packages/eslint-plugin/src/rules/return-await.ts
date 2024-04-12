import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  isAwaitExpression,
  isAwaitKeyword,
  isTypeAnyType,
  isTypeUnknownType,
} from '../util';
import { getOperatorPrecedence } from '../util/getOperatorPrecedence';

type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;

interface ScopeInfo {
  hasAsync: boolean;
  owningFunc: FunctionNode;
}

export default createRule({
  name: 'return-await',
  meta: {
    docs: {
      description: 'Enforce consistent returning of awaited values',
      requiresTypeChecking: true,
      extendsBaseRule: 'no-return-await',
    },
    fixable: 'code',
    hasSuggestions: true,
    type: 'problem',
    messages: {
      nonPromiseAwait:
        'Returning an awaited value that is not a promise is not allowed.',
      disallowedPromiseAwait:
        'Returning an awaited promise is not allowed in this context.',
      requiredPromiseAwait:
        'Returning an awaited promise is required in this context.',
      requiredPromiseAwaitSuggestion:
        'Add `await` before the expression. Use caution as this may impact control flow.',
      disallowedPromiseAwaitSuggestion:
        'Remove `await` before the expression. Use caution as this may impact control flow.',
    },
    schema: [
      {
        type: 'string',
        enum: ['in-try-catch', 'always', 'never'],
      },
    ],
  },
  defaultOptions: ['in-try-catch'],

  create(context, [option]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    const scopeInfoStack: ScopeInfo[] = [];

    function enterFunction(node: FunctionNode): void {
      scopeInfoStack.push({
        hasAsync: node.async,
        owningFunc: node,
      });
    }

    function exitFunction(): void {
      scopeInfoStack.pop();
    }

    /**
     * Tests whether a node is inside of an explicit error handling context
     * (try/catch/finally) in a way that throwing an exception will have an
     * impact on the program's control flow.
     */
    function affectsExplicitErrorHandling(node: ts.Node): boolean {
      // If an error-handling block is followed by another error-handling block,
      // control flow is affected by whether promises in it are awaited or not.
      // Otherwise, we need to check recursively for nested try statements until
      // we get to the top level of a function or the program. If by then,
      // there's no offending error-handling blocks, it doesn't affect control
      // flow.
      const tryAncestorResult = findContainingTryStatement(node);
      if (tryAncestorResult == null) {
        return false;
      }

      const { tryStatement, block } = tryAncestorResult;

      switch (block) {
        case 'try':
          // Try blocks are always followed by either a catch or finally,
          // so exceptions thrown here always affect control flow.
          return true;
        case 'catch':
          // Exceptions thrown in catch blocks followed by a finally block affect
          // control flow.
          if (tryStatement.finallyBlock != null) {
            return true;
          }

          // Otherwise recurse.
          return affectsExplicitErrorHandling(tryStatement);
        case 'finally':
          return affectsExplicitErrorHandling(tryStatement);
        default: {
          const __never: never = block;
          throw new Error(`Unexpected block type: ${String(__never)}`);
        }
      }
    }

    interface FindContainingTryStatementResult {
      tryStatement: ts.TryStatement;
      block: 'try' | 'catch' | 'finally';
    }

    /**
     * A try _statement_ is the whole thing that encompasses try block,
     * catch clause, and finally block. This function finds the nearest
     * enclosing try statement (if present) for a given node, and reports which
     * part of the try statement the node is in.
     */
    function findContainingTryStatement(
      node: ts.Node,
    ): FindContainingTryStatementResult | undefined {
      let child = node;
      let ancestor = node.parent as ts.Node | undefined;

      while (ancestor && !ts.isFunctionLike(ancestor)) {
        if (ts.isTryStatement(ancestor)) {
          let block: 'try' | 'catch' | 'finally';
          if (child === ancestor.tryBlock) {
            block = 'try';
          } else if (child === ancestor.catchClause) {
            block = 'catch';
          } else if (child === ancestor.finallyBlock) {
            block = 'finally';
          } else {
            throw new Error(
              'Child of a try statement must be a try block, catch clause, or finally block',
            );
          }

          return { tryStatement: ancestor, block };
        }
        child = ancestor;
        ancestor = ancestor.parent;
      }

      return undefined;
    }

    function removeAwait(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.Expression,
    ): TSESLint.RuleFix | null {
      // Should always be an await node; but let's be safe.
      /* istanbul ignore if */ if (!isAwaitExpression(node)) {
        return null;
      }

      const awaitToken = context.sourceCode.getFirstToken(node, isAwaitKeyword);
      // Should always be the case; but let's be safe.
      /* istanbul ignore if */ if (!awaitToken) {
        return null;
      }

      const startAt = awaitToken.range[0];
      let endAt = awaitToken.range[1];
      // Also remove any extraneous whitespace after `await`, if there is any.
      const nextToken = context.sourceCode.getTokenAfter(awaitToken, {
        includeComments: true,
      });
      if (nextToken) {
        endAt = nextToken.range[0];
      }

      return fixer.removeRange([startAt, endAt]);
    }

    function insertAwait(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.Expression,
      isHighPrecendence: boolean,
    ): TSESLint.RuleFix | TSESLint.RuleFix[] {
      if (isHighPrecendence) {
        return fixer.insertTextBefore(node, 'await ');
      }
      return [
        fixer.insertTextBefore(node, 'await ('),
        fixer.insertTextAfter(node, ')'),
      ];
    }

    function isHigherPrecedenceThanAwait(node: ts.Node): boolean {
      const operator = ts.isBinaryExpression(node)
        ? node.operatorToken.kind
        : ts.SyntaxKind.Unknown;
      const nodePrecedence = getOperatorPrecedence(node.kind, operator);
      const awaitPrecedence = getOperatorPrecedence(
        ts.SyntaxKind.AwaitExpression,
        ts.SyntaxKind.Unknown,
      );
      return nodePrecedence > awaitPrecedence;
    }

    function test(node: TSESTree.Expression, expression: ts.Node): void {
      let child: ts.Node;

      const isAwait = ts.isAwaitExpression(expression);

      if (isAwait) {
        child = expression.getChildAt(1);
      } else {
        child = expression;
      }

      const type = checker.getTypeAtLocation(child);
      const isThenable = tsutils.isThenableType(checker, expression, type);

      if (!isAwait && !isThenable) {
        return;
      }

      if (isAwait && !isThenable) {
        // any/unknown could be thenable; do not auto-fix
        const useAutoFix = !(isTypeAnyType(type) || isTypeUnknownType(type));
        const fix = (fixer: TSESLint.RuleFixer): TSESLint.RuleFix | null =>
          removeAwait(fixer, node);

        context.report({
          messageId: 'nonPromiseAwait',
          node,
          ...(useAutoFix
            ? { fix }
            : {
                suggest: [
                  {
                    messageId: 'nonPromiseAwait',
                    fix,
                  },
                ],
              }),
        });
        return;
      }

      const affectsErrorHandling = affectsExplicitErrorHandling(expression);
      const useAutoFix = !affectsErrorHandling;

      if (option === 'always') {
        if (!isAwait && isThenable) {
          const fix = (
            fixer: TSESLint.RuleFixer,
          ): TSESLint.RuleFix | TSESLint.RuleFix[] =>
            insertAwait(fixer, node, isHigherPrecedenceThanAwait(expression));

          context.report({
            messageId: 'requiredPromiseAwait',
            node,
            ...(useAutoFix
              ? { fix }
              : {
                  suggest: [
                    {
                      messageId: 'requiredPromiseAwaitSuggestion',
                      fix,
                    },
                  ],
                }),
          });
        }

        return;
      }

      if (option === 'never') {
        if (isAwait) {
          const fix = (fixer: TSESLint.RuleFixer): TSESLint.RuleFix | null =>
            removeAwait(fixer, node);
          context.report({
            messageId: 'disallowedPromiseAwait',
            node,
            ...(useAutoFix
              ? { fix }
              : {
                  suggest: [
                    {
                      messageId: 'disallowedPromiseAwaitSuggestion',
                      fix,
                    },
                  ],
                }),
          });
        }

        return;
      }

      if (option === 'in-try-catch') {
        if (isAwait && !affectsErrorHandling) {
          const fix = (fixer: TSESLint.RuleFixer): TSESLint.RuleFix | null =>
            removeAwait(fixer, node);
          context.report({
            messageId: 'disallowedPromiseAwait',
            node,
            ...(useAutoFix
              ? { fix }
              : {
                  suggest: [
                    {
                      messageId: 'disallowedPromiseAwaitSuggestion',
                      fix,
                    },
                  ],
                }),
          });
        } else if (!isAwait && affectsErrorHandling) {
          const fix = (
            fixer: TSESLint.RuleFixer,
          ): TSESLint.RuleFix | TSESLint.RuleFix[] =>
            insertAwait(fixer, node, isHigherPrecedenceThanAwait(expression));
          context.report({
            messageId: 'requiredPromiseAwait',
            node,
            ...(useAutoFix
              ? { fix }
              : {
                  suggest: [
                    {
                      messageId: 'requiredPromiseAwaitSuggestion',
                      fix,
                    },
                  ],
                }),
          });
        }

        return;
      }
    }

    function findPossiblyReturnedNodes(
      node: TSESTree.Expression,
    ): TSESTree.Expression[] {
      if (node.type === AST_NODE_TYPES.ConditionalExpression) {
        return [
          ...findPossiblyReturnedNodes(node.alternate),
          ...findPossiblyReturnedNodes(node.consequent),
        ];
      }
      return [node];
    }

    return {
      FunctionDeclaration: enterFunction,
      FunctionExpression: enterFunction,
      ArrowFunctionExpression: enterFunction,

      'FunctionDeclaration:exit': exitFunction,
      'FunctionExpression:exit': exitFunction,
      'ArrowFunctionExpression:exit': exitFunction,

      // executes after less specific handler, so exitFunction is called
      'ArrowFunctionExpression[async = true]:exit'(
        node: TSESTree.ArrowFunctionExpression,
      ): void {
        if (node.body.type !== AST_NODE_TYPES.BlockStatement) {
          findPossiblyReturnedNodes(node.body).forEach(node => {
            const tsNode = services.esTreeNodeToTSNodeMap.get(node);
            test(node, tsNode);
          });
        }
      },
      ReturnStatement(node): void {
        const scopeInfo = scopeInfoStack.at(-1);
        if (!scopeInfo?.hasAsync || !node.argument) {
          return;
        }
        findPossiblyReturnedNodes(node.argument).forEach(node => {
          const tsNode = services.esTreeNodeToTSNodeMap.get(node);
          test(node, tsNode);
        });
      },
    };
  },
});
