import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

export default createRule({
  name: 'prefer-literal-enum-member',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require all enum members to be literal values',
      recommended: 'strict',
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

        // Allow bitwise operators when both operands are literals or refer to another member on this enum
        if (
          allowBitwiseExpressions &&
          node.initializer.type === AST_NODE_TYPES.BinaryExpression &&
          ['|', '&', '^', '<<', '>>', '>>>'].includes(
            node.initializer.operator,
          ) &&
          node.parent.type === AST_NODE_TYPES.TSEnumDeclaration
        ) {
          const leftIsLiteral =
            node.initializer.left.type === AST_NODE_TYPES.Literal;
          const rightIsLiteral =
            node.initializer.right.type === AST_NODE_TYPES.Literal;

          // early branch, so gathering member identifiers only happens when needed
          if (leftIsLiteral && rightIsLiteral) {
            return;
          }

          const members = node.parent.members.reduce((names, member) => {
            if ('name' in member.id) names.push(member.id.name);
            return names;
          }, new Array<string>());

          const leftIsValidIdentifier =
            node.initializer.left.type === AST_NODE_TYPES.Identifier &&
            members.includes(node.initializer.left.name);

          const rightIsValidIdentifier =
            node.initializer.right.type === AST_NODE_TYPES.Identifier &&
            members.includes(node.initializer.right.name);

          if (
            (leftIsLiteral || leftIsValidIdentifier) &&
            (rightIsLiteral || rightIsValidIdentifier)
          ) {
            return;
          }
        }

        context.report({
          node: node.id,
          messageId: 'notLiteral',
        });
      },
    };
  },
});
