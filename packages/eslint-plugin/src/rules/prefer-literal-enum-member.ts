import { createRule } from '../util';
import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import { TSEnumMember } from '../../../typescript-estree/dist/ts-estree/ts-estree';

export default createRule<[], 'notLiteral'>({
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
      notLiteral: `Enum member must be a ${AST_NODE_TYPES.Literal}.`,
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TSEnumMember(node: TSEnumMember): void {
        // If there is no initializer, then this node is just the name of the member, so ignore.
        if (
          node.initializer != null &&
          node.initializer.type !== AST_NODE_TYPES.Literal
        ) {
          context.report({
            node: node.id,
            messageId: 'notLiteral',
            data: {
              type: node.initializer.type,
            },
          });
        }
      },
    };
  },
});
