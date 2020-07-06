import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import { createRule } from '../util';

export default createRule({
  name: 'prefer-literal-enum-member',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require that all enum members be literal values to prevent unintended enum member name shadow issues',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: false,
    },
    messages: {
      notLiteral: `Explicit enum value must only be a literal value (string, number, boolean, etc).`,
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
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
        // -1 and +1
        if (
          node.initializer.type === AST_NODE_TYPES.UnaryExpression &&
          ['+', '-'].includes(node.initializer.operator) &&
          node.initializer.argument.type === AST_NODE_TYPES.Literal
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
