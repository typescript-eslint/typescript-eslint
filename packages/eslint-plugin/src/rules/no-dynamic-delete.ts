import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import ts from 'typescript';
import * as tsutils from 'tsutils';
import * as util from '../util';
import { ReportFixFunction } from '@typescript-eslint/experimental-utils/dist/ts-eslint';

export default util.createRule({
  name: 'no-dynamic-delete',
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Bans usage of the delete operator with computed key expressions',
    },
    fixable: 'code',
    messages: {
      dynamicDelete: 'Do not delete dynamically computed property keys.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);

    function checkDeleteAccessExpression(
      esNode: TSESTree.Node,
      tsNode: ts.Node,
    ): void {
      if (!ts.isElementAccessExpression(tsNode)) {
        return;
      }

      const { argumentExpression } = tsNode;
      if (isNecessaryDynamicAccess(argumentExpression)) {
        return;
      }

      context.report({
        fix: createFixer(argumentExpression),
        messageId: 'dynamicDelete',
        node: esNode,
      });
    }

    function createFixer(
      argumentExpression: ts.Expression,
    ): ReportFixFunction | undefined {
      const start = argumentExpression.getStart() - 1;
      const width = argumentExpression.getWidth() + 2;

      if (ts.isPrefixUnaryExpression(argumentExpression)) {
        if (!ts.isNumericLiteral(argumentExpression.operand)) {
          return undefined;
        }

        const convertedOperand = argumentExpression.operand.text;
        return fixer =>
          fixer.replaceTextRange(
            [start, start + width],
            `[${convertedOperand}]`,
          );
      }

      if (ts.isStringLiteral(argumentExpression)) {
        return fixer =>
          fixer.replaceTextRange(
            [start, start + width],
            `.${argumentExpression.text}`,
          );
      }

      return undefined;
    }

    return {
      'UnaryExpression[operator=delete]'(node: TSESTree.UnaryExpression) {
        if (node.argument.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        checkDeleteAccessExpression(
          node.argument.property,
          parserServices.esTreeNodeToTSNodeMap.get(node.argument),
        );
      },
    };
  },
});

function isNecessaryDynamicAccess(argumentExpression: ts.Expression): boolean {
  if (isNumberLike(argumentExpression)) {
    return true;
  }

  return (
    ts.isStringLiteral(argumentExpression) &&
    !tsutils.isValidPropertyAccess(argumentExpression.text)
  );
}

function isNumberLike(node: ts.Node): boolean {
  if (ts.isPrefixUnaryExpression(node)) {
    return (
      ts.isNumericLiteral(node.operand) &&
      node.operator === ts.SyntaxKind.MinusToken
    );
  }

  return ts.isNumericLiteral(node);
}
