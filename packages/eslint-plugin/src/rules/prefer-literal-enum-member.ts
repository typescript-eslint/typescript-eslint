import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import { createRule } from '../util';

export default createRule({
  name: 'prefer-literal-enum-member',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require that all enum members be literal values to prevent unintended enum member name shadow issues',
      recommended: false,
      requiresTypeChecking: false,
    },
    messages: {
      notLiteral: `Explicit enum value must only be a literal value (string, boolean, etc) except number.`,
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
    const sourceCode = context.getSourceCode();

    return {
      TSEnumMember(node): void {
        // If there is no initializer, then this node is just the name of the member, so ignore.
        if (node.initializer == null) {
          return;
        }

        const token = sourceCode.getLastToken(node.initializer);
        // any old literal
        if (
          node.initializer.type === AST_NODE_TYPES.Literal &&
          (token === null || token.type !== AST_TOKEN_TYPES.Numeric)
        ) {
          return;
        }
        // TemplateLiteral without expressions
        if (
          node.initializer.type === AST_NODE_TYPES.TemplateLiteral &&
          node.initializer.expressions.length === 0
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
