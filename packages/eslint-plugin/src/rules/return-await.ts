import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';
import * as util from '../util';

export default util.createRule({
  name: 'return-await',
  meta: {
    docs: {
      description: 'Rules for awaiting returned promises',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    type: 'problem',
    messages: {
      nonPromiseAwait:
        'returning an awaited value that is not a promise is not allowed',
      disallowedPromiseAwait:
        'returning an awaited promise is not allowed in this context',
      requiredPromiseAwait:
        'returning an awaited promise is required in this context',
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

    function test(
      node: TSESTree.ReturnStatement | TSESTree.ArrowFunctionExpression,
      expression: ts.Node,
    ): void {
      let child: ts.Node;

      const isAwait = expression.kind === ts.SyntaxKind.AwaitExpression;

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
        });
        return;
      }

      if (option === 'always') {
        if (!isAwait && isThenable) {
          context.report({
            messageId: 'requiredPromiseAwait',
            node,
          });
        }

        return;
      }

      if (option === 'never') {
        if (isAwait) {
          context.report({
            messageId: 'disallowedPromiseAwait',
            node,
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
          });
        } else if (!isAwait && isInTryCatch) {
          context.report({
            messageId: 'requiredPromiseAwait',
            node,
          });
        }

        return;
      }
    }

    return {
      'ArrowFunctionExpression[async = true]:exit'(
        node: TSESTree.ArrowFunctionExpression,
      ): void {
        if (node.body.type !== AST_NODE_TYPES.BlockStatement) {
          const expression = parserServices.esTreeNodeToTSNodeMap.get(
            node.body,
          );

          test(node, expression);
        }
      },
      ReturnStatement(node): void {
        const originalNode = parserServices.esTreeNodeToTSNodeMap.get<
          ts.ReturnStatement
        >(node);

        const { expression } = originalNode;

        if (!expression) {
          return;
        }

        test(node, expression);
      },
    };
  },
});
