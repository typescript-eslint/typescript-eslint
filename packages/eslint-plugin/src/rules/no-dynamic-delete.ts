import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
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
      recommended: false,
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
    function createFixer(
      member: TSESTree.MemberExpression,
    ): ReportFixFunction | undefined {
      if (
        member.property.type === AST_NODE_TYPES.Literal &&
        typeof member.property.value === 'string'
      ) {
        const { value } = member.property;
        return fixer =>
          fixer.replaceTextRange(
            [member.property.range[0] - 1, member.property.range[1] + 1],
            `.${value}`,
          );
      }

      if (member.property.type === AST_NODE_TYPES.Identifier) {
        const { name } = member.property;
        return fixer =>
          fixer.replaceTextRange(
            [member.property.range[0] - 1, member.property.range[1] + 1],
            `.${name}`,
          );
      }

      return undefined;
    }

    return {
      'UnaryExpression[operator=delete]'(node: TSESTree.UnaryExpression) {
        if (
          node.argument.type !== AST_NODE_TYPES.MemberExpression ||
          !node.argument.computed ||
          isNecessaryDynamicAccess(
            diveIntoWrapperExpressions(node.argument.property),
          )
        ) {
          return;
        }

        context.report({
          fix: createFixer(node.argument),
          messageId: 'dynamicDelete',
          node: node.argument.property,
        });
      },
    };
  },
});

function diveIntoWrapperExpressions(
  node: TSESTree.Expression,
): TSESTree.Expression {
  if (node.type === AST_NODE_TYPES.UnaryExpression) {
    return diveIntoWrapperExpressions(node.argument);
  }

  return node;
}

function isNecessaryDynamicAccess(property: TSESTree.Expression): boolean {
  if (property.type !== AST_NODE_TYPES.Literal) {
    return false;
  }

  if (typeof property.value === 'number') {
    return true;
  }

  return (
    typeof property.value === 'string' &&
    !tsutils.isValidPropertyAccess(property.value)
  );
}
