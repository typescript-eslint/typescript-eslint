import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { createRule } from '../util';

export default createRule({
  name: 'prefer-literal-enum-member',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require all enum members to be literal values',
      recommended: false,
      requiresTypeChecking: false,
    },
    messages: {
      notLiteral: `Explicit enum value must only be a literal value (string, number, boolean, etc).`,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowBitwiseExpressions: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      allowBitwiseExpressions: false,
    },
  ],
  create(context, [{ allowBitwiseExpressions }]) {
    return {
      TSEnumMember(node): void {
        // If there is no initializer, then this node is just the name of the member, so ignore.
        if (node.initializer == null) {
          return;
        }
        // any old literal
        if (node.initializer.type === AST_NODE_TYPES.Literal) {
          return;
        }
        // TemplateLiteral without expressions
        if (
          node.initializer.type === AST_NODE_TYPES.TemplateLiteral &&
          node.initializer.expressions.length === 0
        ) {
          return;
        }
        // -1 and +1
        if (
          node.initializer.type === AST_NODE_TYPES.UnaryExpression &&
          node.initializer.argument.type === AST_NODE_TYPES.Literal &&
          (['+', '-'].includes(node.initializer.operator) ||
            (allowBitwiseExpressions && node.initializer.operator === '~'))
        ) {
          return;
        }

        if (
          allowBitwiseExpressions &&
          node.initializer.type === AST_NODE_TYPES.BinaryExpression &&
          ['|', '&', '^', '<<', '>>', '>>>'].includes(
            node.initializer.operator,
          ) &&
          node.initializer.left.type === AST_NODE_TYPES.Literal &&
          node.initializer.right.type === AST_NODE_TYPES.Literal
        ) {
          return;
        }

        context.report({
          node: node.id,
          messageId: 'notLiteral',
        });
      },
    };
  },
});
