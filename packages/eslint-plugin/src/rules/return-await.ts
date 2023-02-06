import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tools from 'ts-api-tools';
import * as ts from 'typescript';

import * as util from '../util';
import { getOperatorPrecedence } from '../util/getOperatorPrecedence';

type FunctionNode =
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression;

interface ScopeInfo {
  hasAsync: boolean;
  owningFunc: FunctionNode;
}

export default util.createRule({
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
    },
    schema: [
      {
        enum: ['in-try-catch', 'always', 'never'],
      },
    ],
  },
  defaultOptions: ['in-try-catch'],

  create(context, [option]) {
    const services = util.getParserServices(context);
    const checker = services.program.getTypeChecker();
    const sourceCode = context.getSourceCode();

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

    function inTry(node: ts.Node): boolean {
      let ancestor = node.parent;

      while (ancestor && !ts.isFunctionLike(ancestor)) {
        if (ts.isTryStatement(ancestor)) {
          return true;
        }

        ancestor = ancestor.parent;
      }

      return false;
    }

    function inCatch(node: ts.Node): boolean {
      let ancestor = node.parent;

      while (ancestor && !ts.isFunctionLike(ancestor)) {
        if (ts.isCatchClause(ancestor)) {
          return true;
        }

        ancestor = ancestor.parent;
      }

      return false;
    }

    function isReturnPromiseInFinally(node: ts.Node): boolean {
      let ancestor = node.parent;

      while (ancestor && !ts.isFunctionLike(ancestor)) {
        if (
          ts.isTryStatement(ancestor.parent) &&
          ts.isBlock(ancestor) &&
          ancestor.parent.end === ancestor.end
        ) {
          return true;
        }
        ancestor = ancestor.parent;
      }

      return false;
    }

    function hasFinallyBlock(node: ts.Node): boolean {
      let ancestor = node.parent;

      while (ancestor && !ts.isFunctionLike(ancestor)) {
        if (ts.isTryStatement(ancestor)) {
          return !!ancestor.finallyBlock;
        }
        ancestor = ancestor.parent;
      }
      return false;
    }

    // function findTokensToRemove()

    function removeAwait(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.Expression,
    ): TSESLint.RuleFix | null {
      // Should always be an await node; but let's be safe.
      /* istanbul ignore if */ if (!util.isAwaitExpression(node)) {
        return null;
      }

      const awaitToken = sourceCode.getFirstToken(node, util.isAwaitKeyword);
      // Should always be the case; but let's be safe.
      /* istanbul ignore if */ if (!awaitToken) {
        return null;
      }

      const startAt = awaitToken.range[0];
      let endAt = awaitToken.range[1];
      // Also remove any extraneous whitespace after `await`, if there is any.
      const nextToken = sourceCode.getTokenAfter(awaitToken, {
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
      } else {
        return [
          fixer.insertTextBefore(node, 'await ('),
          fixer.insertTextAfter(node, ')'),
        ];
      }
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
      const isThenable = tools.isThenableType(checker, expression, type);

      if (!isAwait && !isThenable) {
        return;
      }

      if (isAwait && !isThenable) {
        // any/unknown could be thenable; do not auto-fix
        const useAutoFix = !(
          util.isTypeAnyType(type) || util.isTypeUnknownType(type)
        );
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

      if (option === 'always') {
        if (!isAwait && isThenable) {
          context.report({
            messageId: 'requiredPromiseAwait',
            node,
            fix: fixer =>
              insertAwait(fixer, node, isHigherPrecedenceThanAwait(expression)),
          });
        }

        return;
      }

      if (option === 'never') {
        if (isAwait) {
          context.report({
            messageId: 'disallowedPromiseAwait',
            node,
            fix: fixer => removeAwait(fixer, node),
          });
        }

        return;
      }

      if (option === 'in-try-catch') {
        const isInTryCatch = inTry(expression) || inCatch(expression);
        if (isAwait && !isInTryCatch) {
          context.report({
            messageId: 'disallowedPromiseAwait',
            node,
            fix: fixer => removeAwait(fixer, node),
          });
        } else if (!isAwait && isInTryCatch) {
          if (inCatch(expression) && !hasFinallyBlock(expression)) {
            return;
          }

          if (isReturnPromiseInFinally(expression)) {
            return;
          }

          context.report({
            messageId: 'requiredPromiseAwait',
            node,
            fix: fixer =>
              insertAwait(fixer, node, isHigherPrecedenceThanAwait(expression)),
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
        const scopeInfo = scopeInfoStack[scopeInfoStack.length - 1];
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
