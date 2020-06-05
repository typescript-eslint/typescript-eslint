import {
  AST_NODE_TYPES,
  TSESTree,
  TSESLint,
} from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';
import * as util from '../util';

interface ScopeInfo {
  hasAsync: boolean;
}

type FunctionNode =
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression;

export default util.createRule({
  name: 'return-await',
  meta: {
    docs: {
      description: 'Enforces consistent returning of awaited values',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
      extendsBaseRule: 'no-return-await',
    },
    fixable: 'code',
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
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const sourceCode = context.getSourceCode();

    let scopeInfo: ScopeInfo | null = null;

    function enterFunction(node: FunctionNode): void {
      scopeInfo = {
        hasAsync: node.async,
      };
    }

    function inTryCatch(node: ts.Node): boolean {
      let ancestor = node.parent;

      while (ancestor && !ts.isFunctionLike(ancestor)) {
        if (
          tsutils.isTryStatement(ancestor) ||
          tsutils.isCatchClause(ancestor)
        ) {
          return true;
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
    ): TSESLint.RuleFix | null {
      return fixer.insertTextBefore(node, 'await ');
    }

    function test(node: TSESTree.Expression, expression: ts.Node): void {
      let child: ts.Node;

      const isAwait = tsutils.isAwaitExpression(expression);

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
        context.report({
          messageId: 'nonPromiseAwait',
          node,
          fix: fixer => removeAwait(fixer, node),
        });
        return;
      }

      if (option === 'always') {
        if (!isAwait && isThenable) {
          context.report({
            messageId: 'requiredPromiseAwait',
            node,
            fix: fixer => insertAwait(fixer, node),
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
        const isInTryCatch = inTryCatch(expression);
        if (isAwait && !isInTryCatch) {
          context.report({
            messageId: 'disallowedPromiseAwait',
            node,
            fix: fixer => removeAwait(fixer, node),
          });
        } else if (!isAwait && isInTryCatch) {
          context.report({
            messageId: 'requiredPromiseAwait',
            node,
            fix: fixer => insertAwait(fixer, node),
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

      'ArrowFunctionExpression[async = true]:exit'(
        node: TSESTree.ArrowFunctionExpression,
      ): void {
        if (node.body.type !== AST_NODE_TYPES.BlockStatement) {
          findPossiblyReturnedNodes(node.body).forEach(node => {
            const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
            test(node, tsNode);
          });
        }
      },
      ReturnStatement(node): void {
        if (!scopeInfo || !scopeInfo.hasAsync || !node.argument) {
          return;
        }
        findPossiblyReturnedNodes(node.argument).forEach(node => {
          const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
          test(node, tsNode);
        });
      },
    };
  },
});
